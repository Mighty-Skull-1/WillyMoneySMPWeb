import React from 'react';
import { TeamData } from '../types/tournament';
import { Trophy, Crown, ShieldAlert } from 'lucide-react';

interface PodiumProps {
  teams: TeamData[];
  onSelectTeam: (team: TeamData) => void;
}

export const Podium: React.FC<PodiumProps> = ({ teams, onSelectTeam }) => {
  if (teams.length < 3) return null;

  const first = teams[0];
  const second = teams[1];
  const third = teams[2];

  const renderCard = (
    team: TeamData,
    place: number,
    podiumHeight: string,
    colorClasses: {
      badge: string;
      glow: string;
      border: string;
      icon: string;
      bg: string;
    }
  ) => {
    return (
      <div
        onClick={() => onSelectTeam(team)}
        className={`flex-1 flex flex-col justify-end cursor-pointer group transition-all duration-300 hover:-translate-y-1`}
      >
        {/* Team Card Info */}
        <div className={`p-5 rounded-2xl ${colorClasses.bg} border ${colorClasses.border} shadow-xl relative overflow-hidden backdrop-blur-md`}>
          {/* Subtle Glow */}
          <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full ${colorClasses.glow} blur-2xl opacity-40`} />

          {/* Place Badge & Crown */}
          <div className="flex items-center justify-between mb-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider ${colorClasses.badge}`}>
              #{place} PLACE
            </span>
            {place === 1 ? (
              <Crown className="w-5 h-5 text-amber-400 drop-shadow-md animate-bounce" />
            ) : (
              <Trophy className={`w-4 h-4 ${colorClasses.icon}`} />
            )}
          </div>

          {/* Captain Skin Head */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <img
                src={`https://mc-heads.net/avatar/${encodeURIComponent(team.captainName)}/56`}
                alt={team.captainName}
                className="w-14 h-14 rounded-xl border-2 border-slate-700 bg-slate-800 shadow-md transition-transform group-hover:scale-105"
                onError={(e) => {
                  // Fallback if offline
                  (e.target as HTMLImageElement).src = `https://mc-heads.net/avatar/MHF_Steve/56`;
                }}
              />
              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-amber-500 text-[10px] font-black text-slate-950 rounded shadow">
                CPT
              </div>
            </div>
            <div className="overflow-hidden">
              <h3 className="text-lg font-black text-white truncate group-hover:text-amber-400 transition-colors">
                {team.name}
              </h3>
              <p className="text-xs text-slate-400">
                Captain: <span className="text-slate-200 font-semibold">{team.captainName}</span>
              </p>
            </div>
          </div>

          {/* Credits Balance */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Team Balance</span>
            <div className="text-right">
              <span className="text-xl font-black text-amber-400 tracking-tight">
                {team.totalCredits.toLocaleString()}
              </span>
              <span className="text-xs text-amber-500/80 ml-1 font-bold">Credits</span>
            </div>
          </div>

          {/* Roster Pill */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Roster: {team.members.length} players</span>
            {team.eliminatedCount > 0 ? (
              <span className="font-medium text-rose-400">{team.aliveCount} alive · {team.eliminatedCount} out</span>
            ) : (
              <span className="font-medium text-emerald-400">All alive</span>
            )}
          </div>
        </div>

        {/* Podium Step Bar */}
        <div
          className={`w-full ${podiumHeight} mt-3 rounded-t-xl bg-slate-900/80 border-t-2 ${colorClasses.border} flex items-center justify-center font-black text-2xl text-slate-700 select-none`}
        >
          {place}
        </div>
      </div>
    );
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> TOP CONTENDERS
          </h2>
          <p className="text-xs text-slate-400">Leaderboard leaders battling for tournament supremacy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-6">
        {/* #2 Silver */}
        <div className="order-2 md:order-1">
          {renderCard(second, 2, 'h-16', {
            badge: 'bg-slate-300 text-slate-950',
            glow: 'bg-slate-300',
            border: 'border-slate-500/50',
            icon: 'text-slate-300',
            bg: 'bg-gradient-to-b from-slate-900/90 to-slate-950/90',
          })}
        </div>

        {/* #1 Gold (Taller & Central) */}
        <div className="order-1 md:order-2">
          {renderCard(first, 1, 'h-24', {
            badge: 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black',
            glow: 'bg-amber-400',
            border: 'border-amber-400/60 shadow-amber-500/10',
            icon: 'text-amber-400',
            bg: 'bg-gradient-to-b from-amber-950/30 via-slate-900/90 to-slate-950/90',
          })}
        </div>

        {/* #3 Bronze */}
        <div className="order-3 md:order-3">
          {renderCard(third, 3, 'h-10', {
            badge: 'bg-amber-700/80 text-amber-100',
            glow: 'bg-amber-700',
            border: 'border-amber-700/50',
            icon: 'text-amber-600',
            bg: 'bg-gradient-to-b from-slate-900/90 to-slate-950/90',
          })}
        </div>
      </div>
    </div>
  );
};
