import React from 'react';
import { TeamData } from '../types/tournament';
import { ChevronRight, Award } from 'lucide-react';

interface LeaderboardTableProps {
  teams: TeamData[];
  /** Overall rank by team id, so searching doesn't renumber teams. */
  ranks: Record<string, number>;
  totalTeams: number;
  isSearching: boolean;
  onSelectTeam: (team: TeamData) => void;
  selectedTeamId?: string;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  teams,
  ranks,
  totalTeams,
  isSearching,
  onSelectTeam,
  selectedTeamId,
}) => {
  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> FULL SQUAD STANDINGS
          </h2>
          <p className="text-xs text-slate-400">Ranked by combined Team Game Credits</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-800 text-slate-300 rounded-full w-fit">
          {totalTeams} {totalTeams === 1 ? 'Team' : 'Teams'}
        </span>
      </div>

      <div className="overflow-x-auto">
        {teams.length === 0 && isSearching ? (
          <div className="py-12 px-4 text-center text-sm text-slate-400">No team or player matches that search.</div>
        ) : teams.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No teams yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Teams appear here live once an admin creates them in game with{' '}
              <code className="text-amber-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded">/team create &lt;name&gt; &lt;captain&gt;</code>.
            </p>
          </div>
        ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-black uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-4 text-center w-16">Rank</th>
              <th className="py-3.5 px-4">Team & Captain</th>
              <th className="py-3.5 px-4 text-center">Roster</th>
              <th className="py-3.5 px-4 text-center hidden sm:table-cell">Bingo</th>
              <th className="py-3.5 px-4 text-right">Game Balance</th>
              <th className="py-3.5 px-4 text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {teams.map((team, index) => {
              const rank = ranks[team.id] ?? index + 1;
              const isSelected = selectedTeamId === team.id;

              return (
                <tr
                  key={team.id}
                  onClick={() => onSelectTeam(team)}
                  className={`cursor-pointer transition-colors group ${
                    isSelected
                      ? 'bg-amber-500/10 hover:bg-amber-500/15'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Rank */}
                  <td className="py-4 px-4 text-center font-black">
                    {rank === 1 && <span className="text-amber-400 text-base">#1</span>}
                    {rank === 2 && <span className="text-slate-300 text-base">#2</span>}
                    {rank === 3 && <span className="text-amber-700 text-base">#3</span>}
                    {rank > 3 && <span className="text-slate-500 text-sm">#{rank}</span>}
                  </td>

                  {/* Team & Captain */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://mc-heads.net/avatar/${encodeURIComponent(team.captainName)}/40`}
                        alt={team.captainName}
                        className="w-10 h-10 rounded-lg border border-slate-700 bg-slate-800 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://mc-heads.net/avatar/MHF_Steve/40`;
                        }}
                      />
                      <div>
                        <div className="font-black text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                          {team.hexColor && (
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: team.hexColor }} />
                          )}
                          {team.name}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>Capt: <strong className="text-slate-300">{team.captainName}</strong></span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Roster Status */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/60 border border-slate-800 text-xs font-semibold whitespace-nowrap">
                      <span className="text-emerald-400 font-bold">{team.aliveCount} alive</span>
                      {team.eliminatedCount > 0 && <span className="text-rose-400">· {team.eliminatedCount} out</span>}
                    </div>
                  </td>

                  {/* Bingo Claims */}
                  <td className="py-4 px-4 text-center hidden sm:table-cell">
                    <span className="text-xs font-bold text-slate-300 px-2 py-0.5 rounded bg-slate-800/80 whitespace-nowrap">
                      {team.bingoClaims || 0} / 25
                    </span>
                  </td>

                  {/* Balance */}
                  <td className="py-4 px-4 text-right">
                    <div className="font-black text-amber-400 text-base">
                      {team.totalCredits.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Credits</div>
                  </td>

                  {/* View Action */}
                  <td className="py-4 px-4 text-center">
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
};
