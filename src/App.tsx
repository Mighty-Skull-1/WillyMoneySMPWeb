import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { Podium } from './components/Podium';
import { LeaderboardTable } from './components/LeaderboardTable';
import { TeamModal } from './components/TeamModal';
import { SettingsModal } from './components/SettingsModal';
import { RulesGuide } from './components/RulesGuide';
import { LeaderboardResponse, TeamData } from './types/tournament';
import { mockLeaderboardData } from './data/mockData';
import { Search, Trophy } from 'lucide-react';

const initialDraftState: LeaderboardResponse = {
  status: {
    serverName: "Willy Money SMP",
    onlinePlayers: 0,
    maxPlayers: 10,
    phase: "DRAFT",
    phaseName: "Draft Phase",
    kothActive: false,
    bingoActive: false,
    totalTeams: 0,
    totalParticipants: 0,
    eliminatedCount: 0,
    lastUpdated: new Date().toISOString(),
  },
  teams: [],
};

export function App() {
  const [data, setData] = useState<LeaderboardResponse>(() => {
    try {
      const cached = localStorage.getItem('smp_last_leaderboard_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.teams)) return parsed;
      }
    } catch (e) {}
    return initialDraftState;
  });

  const [apiUrl, setApiUrl] = useState<string>(() => {
    return localStorage.getItem('smp_api_url') || 'https://ntfy.sh/willymoneysmp_leaderboard_live';
  });

  const [isLive, setIsLive] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch from server API or Cloud Relay with direct live Minecraft ping
  const fetchLiveLeaderboard = async (urlToUse?: string) => {
    const base = urlToUse || apiUrl;

    // 1. Live server ping directly via Minecraft protocol query
    let mcOnline: number | null = null;
    let mcMax: number | null = null;
    let mcServerOnline = false;

    try {
      const mcPing = await fetch('https://api.mcstatus.io/v2/status/java/willymoneysmp.minefort.com', { cache: 'no-store' });
      if (mcPing.ok) {
        const mcData = await mcPing.json();
        if (mcData) {
          mcServerOnline = !!mcData.online;
          if (mcData.players) {
            mcOnline = mcData.players.online ?? 0;
            mcMax = mcData.players.max ?? 10;
          }
        }
      }
    } catch (e) {
      console.warn("Could not reach mcstatus.io:", e);
    }

    // 2. Poll tournament endpoint as fallback
    try {
      let json: any = null;
      if (base) {
        let endpoint = base;
        if (base.includes('ntfy.sh')) {
          endpoint = base.endsWith('/json?poll=1') ? base : `${base.replace(/\/$/, '')}/json?poll=1`;
        } else if (!base.includes('/api/leaderboard')) {
          endpoint = base.endsWith('/') ? `${base}api/leaderboard` : `${base}/api/leaderboard`;
        }

        const res = await fetch(endpoint, { cache: 'no-store' });
        if (res.ok) {
          if (base.includes('ntfy.sh')) {
            const text = await res.text();
            const lines = text.trim().split('\n').filter(Boolean);
            for (let i = lines.length - 1; i >= 0; i--) {
              try {
                const item = JSON.parse(lines[i]);
                if (item.message) {
                  const parsed = typeof item.message === 'string' ? JSON.parse(item.message) : item.message;
                  if (parsed && (parsed.teams || Array.isArray(parsed))) {
                    json = parsed;
                    break;
                  }
                }
              } catch (err) {
                // skip non-json
              }
            }
          } else {
            json = await res.json();
          }
        }
      }

      if (json && Array.isArray(json.teams)) {
        if (mcOnline !== null) {
          json.status.onlinePlayers = mcOnline;
          if (mcMax !== null) json.status.maxPlayers = mcMax;
        }
        setData(json);
        try {
          localStorage.setItem('smp_last_leaderboard_data', JSON.stringify(json));
        } catch (e) {}
        setIsLive(true);
      } else {
        // Retain squads but update online player counts
        setData((prev) => {
          const updated = {
            ...prev,
            status: {
              ...prev.status,
              onlinePlayers: mcOnline !== null ? mcOnline : prev.status.onlinePlayers,
              maxPlayers: mcMax !== null ? mcMax : prev.status.maxPlayers,
              lastUpdated: new Date().toISOString(),
            },
          };
          try {
            localStorage.setItem('smp_last_leaderboard_data', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
        if (mcServerOnline) {
          setIsLive(true);
        }
      }
    } catch (e) {
      console.warn("Live API fetch notice:", e);
      if (mcOnline !== null) {
        setData((prev) => ({
          ...prev,
          status: {
            ...prev.status,
            onlinePlayers: mcOnline!,
            maxPlayers: mcMax ?? prev.status.maxPlayers,
            lastUpdated: new Date().toISOString(),
          },
        }));
      }
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchLiveLeaderboard();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Broadcast team changes to the cloud relay (ntfy) so all viewers receive it in real-time
  const handleBroadcastTeams = async (newTeams: TeamData[], phase?: string) => {
    const updated: LeaderboardResponse = {
      status: {
        ...data.status,
        phase: (phase as any) || data.status.phase || 'DRAFT',
        totalTeams: newTeams.length,
        totalParticipants: newTeams.reduce((acc, t) => acc + (t.members?.length || 0), 0),
        lastUpdated: new Date().toISOString(),
      },
      teams: newTeams,
    };

    setData(updated);
    try {
      localStorage.setItem('smp_last_leaderboard_data', JSON.stringify(updated));
    } catch (e) {}

    // Post to cloud relay
    if (apiUrl.includes('ntfy.sh')) {
      try {
        const postUrl = apiUrl.replace(/\/json.*$/, '').replace(/\/sse.*$/, '').replace(/\/$/, '');
        await fetch(postUrl, {
          method: 'POST',
          body: JSON.stringify(updated),
        });
      } catch (err) {
        console.warn('Could not post to ntfy relay:', err);
      }
    }
  };

  useEffect(() => {
    // 1. Initial live Minecraft ping
    fetchLiveLeaderboard();

    // 2. Real-time Server-Sent Events (SSE) stream from ntfy
    // Sub-second push notifications without 429 rate limit errors
    let es: EventSource | null = null;
    if (apiUrl.includes('ntfy.sh')) {
      const sseEndpoint = `${apiUrl.replace(/\/$/, '').replace(/\/json.*$/, '').replace(/\/sse.*$/, '')}/sse?since=1h`;
      try {
        es = new EventSource(sseEndpoint);
        es.onmessage = (event) => {
          try {
            const item = JSON.parse(event.data);
            if (item && item.message) {
              const parsed = typeof item.message === 'string' ? JSON.parse(item.message) : item.message;
              if (parsed && Array.isArray(parsed.teams)) {
                setData((prev) => {
                  const updated: LeaderboardResponse = {
                    ...parsed,
                    status: {
                      ...parsed.status,
                      onlinePlayers: prev.status.onlinePlayers,
                      maxPlayers: prev.status.maxPlayers,
                    },
                  };
                  try {
                    localStorage.setItem('smp_last_leaderboard_data', JSON.stringify(updated));
                  } catch (e) {}
                  return updated;
                });
                setIsLive(true);
              }
            }
          } catch (err) {}
        };
      } catch (err) {
        console.warn("EventSource error:", err);
      }
    }

    // 3. Keep online player count fresh every 15 seconds
    const interval = setInterval(() => {
      fetchLiveLeaderboard();
    }, 15000);

    return () => {
      clearInterval(interval);
      if (es) es.close();
    };
  }, [apiUrl]);

  const handleSaveApiUrl = (newUrl: string) => {
    setApiUrl(newUrl);
    localStorage.setItem('smp_api_url', newUrl);
    fetchLiveLeaderboard(newUrl);
  };

  const handleLoadDemo = () => {
    setData(mockLeaderboardData);
    setIsLive(false);
  };

  const handleResetToDraft = () => {
    setData(initialDraftState);
    try {
      localStorage.removeItem('smp_last_leaderboard_data');
    } catch (e) {}
    handleBroadcastTeams([], 'DRAFT');
  };

  // Filter teams by search
  const teamsList = Array.isArray(data?.teams) ? data.teams : [];
  const filteredTeams = teamsList.filter((team) => {
    const matchesTeam = (team.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCaptain = (team.captainName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMember = (team.members || []).some((m) =>
      (m.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesTeam || matchesCaptain || matchesMember;
  });

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Navigation */}
      <Navbar
        status={data?.status || initialDraftState.status}
        apiUrl={apiUrl}
        isLive={isLive}
        isRefreshing={isRefreshing}
        onRefresh={handleManualRefresh}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top Summary Badges */}
        <StatsOverview status={data?.status || initialDraftState.status} />

        {/* Podium for Top 3 */}
        {!searchQuery && teamsList.length >= 3 && (
          <Podium teams={teamsList} onSelectTeam={(team) => setSelectedTeam(team)} />
        )}

        {/* Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team or player name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80 transition-colors"
            />
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Showing {filteredTeams.length} of {data.teams.length} teams</span>
          </div>
        </div>

        {/* Squad Standings Table */}
        <LeaderboardTable
          teams={filteredTeams}
          onSelectTeam={(team) => setSelectedTeam(team)}
          selectedTeamId={selectedTeam?.id}
        />

        {/* Rules & Tournament Mechanics Guide */}
        <RulesGuide />
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-300">Willy Money SMP</span>
            <span>— High-Stakes Minecraft Tournament Engine</span>
          </div>
          <div>
            Powered by Paper 1.21+ • Real-Time Web Bridge
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TeamModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiUrl={apiUrl}
        onSaveApiUrl={handleSaveApiUrl}
        isLive={isLive}
        onLoadDemo={handleLoadDemo}
        onResetDraft={handleResetToDraft}
        currentTeams={data.teams}
        onBroadcastTeams={handleBroadcastTeams}
      />
    </div>
  );
}

export default App;
