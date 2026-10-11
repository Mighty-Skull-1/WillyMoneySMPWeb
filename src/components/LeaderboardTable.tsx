import React from 'react';
import { TeamData } from '../types/tournament';
import { Users, ChevronRight, Skull, Swords, Award } from 'lucide-react';

interface LeaderboardTableProps {
  teams: TeamData[];
  onSelectTeam: (team: TeamData) => void;
  selectedTeamId?: string;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  teams,
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
          {teams.length} Registered Teams
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-black uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-4 text-center w-16">Rank</th>
              <th className="py-3.5 px-4">Team & Captain</th>
              <th className="py-3.5 px-4 text-center">Roster Status</th>
              <th className="py-3.5 px-4 text-center">Bingo Claims</th>
              <th className="py-3.5 px-4 text-right">Game Balance</th>
              <th className="py-3.5 px-4 text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {teams.map((team, index) => {
              const rank = index + 1;
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
                        src={`https://mc-heads.net/avatar/${team.captainName}/40`}
                        alt={team.captainName}
                        className="w-10 h-10 rounded-lg border border-slate-700 bg-slate-800 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://mc-heads.net/avatar/MHF_Steve/40`;
                        }}
                      />
                      <div>
                        <div className="font-black text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
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
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/60 border border-slate-800 text-xs font-semibold">
                      <span className="text-emerald-400 font-bold">{team.members.length} Members</span>
                    </div>
                  </td>

                  {/* Bingo Claims */}
                  <td className="py-4 px-4 text-center">
                    <span className="text-xs font-bold text-slate-300 px-2 py-0.5 rounded bg-slate-800/80">
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
      </div>
    </div>
  );
};
