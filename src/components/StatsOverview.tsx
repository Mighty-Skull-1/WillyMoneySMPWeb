import React from 'react';
import { TournamentStatus } from '../types/tournament';
import { Users, Trophy, Flame, ShieldCheck, Gavel, Hourglass, Skull, Heart } from 'lucide-react';

interface StatsOverviewProps {
  status: TournamentStatus;
  /** Tiered players not on a team yet. */
  poolCount: number;
  draftLive: boolean;
  /** false = the Minecraft server reports offline, null = unknown. */
  serverOnline: boolean | null;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ status, poolCount, draftLive, serverOnline }) => {
  const draftNote = (() => {
    if (status.totalTeams === 0)
      return { icon: <Hourglass className="w-3 h-3" />, text: 'Waiting for captains', className: 'text-slate-400' };
    if (draftLive) return { icon: <Gavel className="w-3 h-3" />, text: 'Auction live', className: 'text-amber-400' };
    if (status.phase === 'DRAFT' && poolCount > 0)
      return { icon: <Gavel className="w-3 h-3" />, text: `Drafting · ${poolCount} left`, className: 'text-amber-400' };
    return { icon: <ShieldCheck className="w-3 h-3" />, text: 'Rosters set', className: 'text-emerald-400' };
  })();

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
        <div className={`mt-1 text-xs font-medium flex items-center gap-1 ${draftNote.className}`}>
          {draftNote.icon} {draftNote.text}
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
          <span className={`text-3xl font-black ${serverOnline === false ? 'text-slate-500' : 'text-emerald-400'}`}>
            {serverOnline === false ? 0 : status.onlinePlayers}
          </span>
          {status.maxPlayers > 0 && <span className="text-xs text-slate-400">/ {status.maxPlayers}</span>}
        </div>
        <div className={`mt-1 text-xs font-medium ${serverOnline === false ? 'text-rose-400' : 'text-slate-400'}`}>
          {serverOnline === false ? 'Server offline' : 'Online right now'}
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
        {status.eliminatedCount > 0 ? (
          <div className="mt-1 text-xs text-rose-400 font-medium flex items-center gap-1">
            <Skull className="w-3 h-3" /> {status.eliminatedCount} eliminated
          </div>
        ) : (
          <div className="mt-1 text-xs text-blue-400 font-medium flex items-center gap-1">
            <Heart className="w-3 h-3" /> {status.totalParticipants > 0 ? 'Everyone still in' : 'On teams'}
          </div>
        )}
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
