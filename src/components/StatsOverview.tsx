import React from 'react';
import { TournamentStatus } from '../types/tournament';
import { Users, Skull, Trophy, Flame, Coins, ShieldCheck } from 'lucide-react';

interface StatsOverviewProps {
  status: TournamentStatus;
  totalPrizePool?: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ status }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {/* Total Active Teams */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Teams</span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black text-white">{status.totalTeams}</span>
          <span className="text-xs text-slate-400">Squads</span>
        </div>
        <div className="mt-1 text-xs text-emerald-400 font-medium flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Fully Drafted
        </div>
      </div>

      {/* Online Players */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Online Players</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black text-emerald-400">
            {status.onlinePlayers}
          </span>
          <span className="text-xs text-slate-400">/ {status.maxPlayers}</span>
        </div>
        <div className="mt-1 text-xs text-slate-400 font-medium">
          Online Right Now
        </div>
      </div>

      {/* Total Tournament Players */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Players</span>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black text-white">{status.totalParticipants}</span>
          <span className="text-xs text-slate-400">Combatants</span>
        </div>
        <div className="mt-1 text-xs text-blue-400 font-medium flex items-center gap-1">
          Standard Respawns
        </div>
      </div>

      {/* Active Phase Status */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Phase</span>
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-300 uppercase tracking-wide">
            {status.phase}
          </span>
        </div>
        <div className="mt-1 text-xs text-slate-400 font-medium truncate">
          {status.phaseName}
        </div>
      </div>
    </div>
  );
};
