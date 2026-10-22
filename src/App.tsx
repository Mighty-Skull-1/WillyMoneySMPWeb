import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navbar, type FeedState } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { Podium } from './components/Podium';
import { LeaderboardTable } from './components/LeaderboardTable';
import { TeamModal } from './components/TeamModal';
import { ServerInfoModal, timeAgo } from './components/ServerInfoModal';
import { DraftCenter } from './components/DraftCenter';
import { RulesGuide } from './components/RulesGuide';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { isAdminUnlocked } from './lib/admin';
import type { LeaderboardResponse } from './types/tournament';
import { mockLeaderboardData } from './data/mockData';
import { MC_PING_ENABLED, MC_SERVER_HOST, NTFY_TOPIC, STALE_AFTER_MS } from './config';
import {
  fetchLatest,
  pingServer,
  sortTeams,
  subscribe,
  PHASE_NAMES,
  type McStatus,
  type SignedUpdate,
} from './lib/sync';
import { Search, Trophy } from 'lucide-react';

const CACHE_KEY = 'wmsmp_leaderboard_v2';

const emptyState: LeaderboardResponse = {
  status: {
    serverName: 'Willy Money SMP',
    onlinePlayers: 0,
    maxPlayers: 0,
    phase: 'DRAFT',
    phaseName: PHASE_NAMES.DRAFT,
    kothActive: false,
    bingoActive: false,
    totalTeams: 0,
    totalParticipants: 0,
    eliminatedCount: 0,
    lastUpdated: new Date(0).toISOString(),
  },
  teams: [],
  draft: null,
  pool: [],
  history: [],
};

function loadCache(): SignedUpdate | null {
  try {
    // Clear what the old version of the site stored (it wasn't signature-checked).
    localStorage.removeItem('smp_last_leaderboard_data');
    localStorage.removeItem('smp_api_url');
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.sentAt === 'number' && Array.isArray(parsed.data?.teams)) return parsed;
  } catch {
    // ignore
  }
  return null;
}

function saveCache(update: SignedUpdate) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(update));
  } catch {
    // ignore (private mode etc.)
  }
}

export function App() {
  const [live, setLive] = useState<SignedUpdate | null>(() => loadCache());
  const [isDemo, setIsDemo] = useState(false);
  const [mcStatus, setMcStatus] = useState<McStatus | null>(null);
  const [mcChecked, setMcChecked] = useState(false);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [clockSkewMs, setClockSkewMs] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  /** The server panel is admin-only: ask for the password unless this browser is already unlocked. */
  const openInfo = () => {
    if (isAdminUnlocked()) setIsInfoOpen(true);
    else setIsPasswordOpen(true);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [, setTick] = useState(0);

  const latestSentAt = useRef<number>(live?.sentAt ?? 0);

  /** Only ever move forward in time, so replayed old messages can't roll the board back. */
  const applyUpdate = useCallback((update: SignedUpdate, arrivedLive: boolean) => {
    if (update.sentAt <= latestSentAt.current) return;
    latestSentAt.current = update.sentAt;
    if (arrivedLive) {
      const skew = Date.now() - update.sentAt;
      // Network delay is small; a big gap means this device's clock is off.
      setClockSkewMs(Math.abs(skew) < 10 * 60_000 ? skew : 0);
    }
    setLive(update);
    saveCache(update);
  }, []);

  const loadLatest = useCallback(async () => {
    try {
      const { update, rejected } = await fetchLatest();
      setRejectedCount((n) => Math.max(n, rejected));
      if (update) applyUpdate(update, Date.now() - update.sentAt < 5_000);
      setSyncError(null);
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : String(e));
    } finally {
      setConnecting(false);
    }
  }, [applyUpdate]);

  // The address comes from the server (/smp setip); config.ts only has the fallback.
  const serverAddress = live?.data.serverAddress || MC_SERVER_HOST;
  const serverAddressRef = useRef(serverAddress);
  serverAddressRef.current = serverAddress;

  const refreshServerPing = useCallback(async () => {
    if (!MC_PING_ENABLED) {
      setMcChecked(true);
      return;
    }
    const status = await pingServer(serverAddressRef.current);
    if (status) setMcStatus(status);
    setMcChecked(true);
  }, []);

  useEffect(() => {
    if (serverAddress !== MC_SERVER_HOST) refreshServerPing();
  }, [serverAddress, refreshServerPing]);

  useEffect(() => {
    loadLatest();
    refreshServerPing();
    const unsubscribe = subscribe(
      (u) => applyUpdate(u, true),
      () => setRejectedCount((n) => n + 1),
    );
    const pingTimer = setInterval(refreshServerPing, 30_000);
    // Re-check the relay now and then in case the live stream dropped silently.
    const pollTimer = setInterval(loadLatest, 120_000);
    // Re-render every 15s so "updated x ago" and stale detection stay current.
    const clockTimer = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => {
      unsubscribe();
      clearInterval(pingTimer);
      clearInterval(pollTimer);
      clearInterval(clockTimer);
    };
  }, [applyUpdate, loadLatest, refreshServerPing]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadLatest(), refreshServerPing()]);
    setIsRefreshing(false);
  };

  // ------------------------------------------------------------ derived view data

  const data: LeaderboardResponse = useMemo(() => {
    if (isDemo) return { ...mockLeaderboardData, teams: sortTeams(mockLeaderboardData.teams) };
    const base = live?.data ?? emptyState;
    if (!mcStatus) return base;
    // The direct server ping is fresher than the last pushed snapshot for player counts.
    return {
      ...base,
      status: {
        ...base.status,
        onlinePlayers: mcStatus.online ? mcStatus.players : 0,
        maxPlayers: mcStatus.max || base.status.maxPlayers,
      },
    };
  }, [isDemo, live, mcStatus]);

  const lastUpdateAt = live?.sentAt ?? null;
  const isStale = !lastUpdateAt || Date.now() - clockSkewMs - lastUpdateAt > STALE_AFTER_MS;

  const feed: FeedState = isDemo
    ? 'demo'
    : connecting && !live
      ? 'connecting'
      : mcStatus && !mcStatus.online
        ? 'offline'
        : isStale
          ? 'stale'
          : 'live';

  const teams = data.teams;
  const ranks = useMemo(() => Object.fromEntries(teams.map((t, i) => [t.id, i + 1])), [teams]);
  const pool = data.pool ?? [];
  const history = data.history ?? [];
  const draft = data.draft ?? null;
  const showDraft = !isDemo && (data.status.phase === 'DRAFT' || !!draft);

  const q = searchQuery.trim().toLowerCase();
  const filteredTeams = q
    ? teams.filter(
        (team) =>
          team.name.toLowerCase().includes(q) ||
          team.captainName.toLowerCase().includes(q) ||
          team.members.some((m) => m.name.toLowerCase().includes(q)),
      )
    : teams;

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? null;

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Navbar
        status={data.status}
        feed={feed}
        draftLive={!!draft && !isDemo}
        isRefreshing={isRefreshing}
        onRefresh={handleManualRefresh}
        onOpenInfo={openInfo}
      />

      {import.meta.env.DEV && (
        <div className="bg-fuchsia-500/10 border-b border-fuchsia-500/30 text-fuchsia-200 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
            Local test build · listening on <code className="font-mono">{NTFY_TOPIC}</code>
          </div>
        </div>
      )}

      {isDemo && (
        <div className="bg-sky-500/10 border-b border-sky-500/30 text-sky-200 text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
            <span>You&apos;re looking at made-up demo data, not the real standings.</span>
            <button
              onClick={() => setIsDemo(false)}
              className="shrink-0 px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 font-bold"
            >
              Show live
            </button>
          </div>
        </div>
      )}

      {!isDemo && feed === 'stale' && lastUpdateAt && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            Standings last updated {timeAgo(lastUpdateAt + clockSkewMs)}. They&apos;ll refresh automatically when the server sends new data.
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        <StatsOverview
          status={data.status}
          poolCount={pool.length}
          draftLive={!!draft}
          serverOnline={isDemo ? true : mcStatus ? mcStatus.online : null}
        />

        {showDraft && (
          <DraftCenter draft={draft} pool={pool} history={history} teams={teams} clockSkewMs={clockSkewMs} />
        )}

        {/* During the draft everyone has the same credits, so the podium only means something afterwards. */}
        {!q && teams.length >= 3 && data.status.phase !== 'DRAFT' && <Podium teams={teams} onSelectTeam={(team) => setSelectedTeamId(team.id)} />}

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search team or player name..."
              aria-label="Search team or player name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80 transition-colors"
            />
          </div>
          <div className="text-xs text-slate-400">
            Showing {filteredTeams.length} of {teams.length} teams
          </div>
        </div>

        <LeaderboardTable
          teams={filteredTeams}
          ranks={ranks}
          totalTeams={teams.length}
          isSearching={!!q}
          onSelectTeam={(team) => setSelectedTeamId(team.id)}
          selectedTeamId={selectedTeamId ?? undefined}
        />

        <RulesGuide banned={isDemo ? undefined : data.banned} />
      </main>

      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-300">Willy Money SMP</span>
            <span>— High-Stakes Minecraft Tournament</span>
          </div>
          <div>{lastUpdateAt && !isDemo ? `Last update ${timeAgo(lastUpdateAt + clockSkewMs)}` : 'Paper 1.21+'}</div>
        </div>
      </footer>

      <TeamModal team={selectedTeam} onClose={() => setSelectedTeamId(null)} />
      <AdminPasswordModal
        isOpen={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
        onUnlocked={() => {
          setIsPasswordOpen(false);
          setIsInfoOpen(true);
        }}
      />
      <ServerInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        mcStatus={mcStatus}
        mcChecked={mcChecked}
        serverAddress={serverAddress}
        lastUpdateAt={lastUpdateAt ? lastUpdateAt + clockSkewMs : null}
        isStale={isStale}
        rejectedCount={rejectedCount}
        syncError={syncError}
        isDemo={isDemo}
        onToggleDemo={() => setIsDemo((d) => !d)}
      />
    </div>
  );
}

export default App;
