import React from 'react';
import { TeamData, PlayerTier } from '../types/tournament';
import { X, Crown, Skull, Heart, Shield, Swords, Coins } from 'lucide-react';

interface TeamModalProps {
  team: TeamData | null;
  onClose: () => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({ team, onClose }) => {
  if (!team) return null;

  const getTierBadge = (tier: PlayerTier) => {
    switch (tier) {
      case 'CAPTAIN':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">CAPTAIN</span>;
      case 'A':
        return <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black">TIER A</span>;
      case 'B':
        return <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-black">TIER B</span>;
      case 'C':
        return <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-300 border border-slate-500/40 text-[10px] font-black">TIER C</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">UNRANKED</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={`https://mc-heads.net/avatar/${team.captainName}/64`}
              alt={team.captainName}
              className="w-16 h-16 rounded-xl border-2 border-amber-400/50 bg-slate-800 shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://mc-heads.net/avatar/MHF_Steve/64`;
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-white">{team.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {team.totalCredits.toLocaleString()} Credits
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Captain: <strong className="text-white">{team.captainName}</strong></span>
                <span>•</span>
                <span>{team.aliveCount} Alive / {team.eliminatedCount} Dead</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Roster List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" /> Team Roster ({team.members.length} Players)
          </h4>

          {team.members.map((member) => (
            <div
              key={member.uuid}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                member.isEliminated
                  ? 'bg-rose-950/20 border-rose-900/40 opacity-70'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={`https://mc-heads.net/avatar/${member.name}/44`}
                    alt={member.name}
                    className="w-11 h-11 rounded-lg border border-slate-700 bg-slate-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://mc-heads.net/avatar/MHF_Steve/44`;
                    }}
                  />
                  {member.isCaptain && (
                    <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow">
                      <Crown className="w-3 h-3 font-bold" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{member.name}</span>
                    {getTierBadge(member.tier)}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    {member.isEliminated ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <Skull className="w-3 h-3" /> Eliminated (Spectator)
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <Heart className="w-3 h-3" /> Active Survivor
                      </span>
                    )}
                    {member.kills !== undefined && (
                      <>
                        <span>•</span>
                        <span className="text-slate-300 font-medium">{member.kills} Kills</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Individual Balance & Status */}
              <div className="text-right">
                <div className="font-black text-amber-400 text-sm flex items-center justify-end gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  {member.gameCredits}
                </div>
                {member.draftCredits > 0 && (
                  <div className="text-[11px] text-amber-500/80">
                    {member.draftCredits} Draft
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer / Quick Info */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Captain Revive Cost: <strong className="text-amber-400">150 Game Credits</strong></span>
          <span className="text-slate-500">Auto-syncs with server</span>
        </div>
      </div>
    </div>
  );
};
