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

export function App() {
  const [data, setData] = useState<LeaderboardResponse>(mockLeaderboardData);
  const [apiUrl, setApiUrl] = useState<string>(() => {
    return localStorage.getItem('smp_api_url') || 'http://willymoney.feathermc.gg:8080';
  });
  const [isLive, setIsLive] = useState<boolean>(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch from server API
  const fetchLiveLeaderboard = async (urlToUse?: string) => {
    const base = urlToUse || apiUrl;
    if (!base) return;

    try {
      const endpoint = base.endsWith('/') ? `${base}api/leaderboard` : `${base}/api/leaderboard`;
      const res = await fetch(endpoint, { cache: 'no-store' });
      if (res.ok) {
        const json: any = await res.json();
        if (json && Array.isArray(json.teams)) {
          setData(json);
          setIsLive(true);
        } else if (Array.isArray(json)) {
          // If server returned raw teams array, wrap in standard LeaderboardResponse
          setData((prev) => ({
            status: {
              ...prev.status,
              totalTeams: json.length,
              lastUpdated: new Date().toISOString(),
            },
            teams: json.map((t: any, idx: number) => ({
              id: t.id || `team_${idx}`,
              name: t.name || `Team ${idx + 1}`,
              colorCode: t.color || t.colorCode || '§e',
              hexColor: t.hexColor || '#eab308',
              captain: t.captain || '',
              captainName: t.captain || 'Captain',
              totalCredits: t.credits || t.totalCredits || 0,
              aliveCount: t.members?.filter((m: any) => !m.eliminated)?.length || 0,
              eliminatedCount: t.members?.filter((m: any) => m.eliminated)?.length || 0,
              members: (t.members || []).map((m: any, mIdx: number) => ({
                uuid: m.uuid || `p_${mIdx}`,
                name: m.name || 'Player',
                tier: m.tier || 'C',
                gameCredits: m.gameCredits || 0,
                draftCredits: m.draftCredits || 0,
                isCaptain: m.name === t.captain,
                isEliminated: !!m.eliminated,
              })),
            })),
          }));
          setIsLive(true);
        }
      }
    } catch (e) {
      console.warn("Could not fetch live API, maintaining current data view:", e);
    }
  };

  useEffect(() => {
    // Attempt background sync if configured
    if (apiUrl && apiUrl !== 'http://localhost:8080') {
      fetchLiveLeaderboard();
      const interval = setInterval(() => {
        fetchLiveLeaderboard();
      }, 10000); // 10s auto refresh
      return () => clearInterval(interval);
    }
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
        status={data?.status || mockLeaderboardData.status}
        apiUrl={apiUrl}
        isLive={isLive}
        onRefresh={() => fetchLiveLeaderboard()}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top Summary Badges */}
        <StatsOverview status={data?.status || mockLeaderboardData.status} />

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
      />
    </div>
  );
}

export default App;
