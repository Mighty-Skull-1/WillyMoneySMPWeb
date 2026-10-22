import React from 'react';
import { TournamentStatus } from '../types/tournament';
import { Shield, Swords, Flame, Trophy, Radio, RefreshCw, Clock, Gavel } from 'lucide-react';

export type FeedState = 'live' | 'stale' | 'offline' | 'connecting' | 'demo';

interface NavbarProps {
  status: TournamentStatus | null;
  feed: FeedState;
  draftLive?: boolean;
  isRefreshing?: boolean;
  onRefresh: () => void;
  onOpenInfo: () => void;
}

const FEED_LABEL: Record<FeedState, { text: string; className: string }> = {
  live: { text: 'Live', className: 'text-emerald-400 animate-pulse' },
  stale: { text: 'Not updating', className: 'text-amber-400' },
  offline: { text: 'Server offline', className: 'text-rose-400' },
  connecting: { text: 'Connecting', className: 'text-slate-400 animate-pulse' },
  demo: { text: 'Demo data', className: 'text-sky-400' },
};

export const Navbar: React.FC<NavbarProps> = ({
  status,
  feed,
  draftLive,
  isRefreshing,
  onRefresh,
  onOpenInfo,
}) => {
  const feedLabel = FEED_LABEL[feed];
  const getPhaseBadge = () => {
    if (!status) return null;
    switch (status.phase) {
      case 'DRAFT':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Shield className="w-3.5 h-3.5" /> Draft Phase
          </span>
        );
      case 'GRACE':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Clock className="w-3.5 h-3.5" /> Grace Period
          </span>
        );
      case 'PVP':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
            <Swords className="w-3.5 h-3.5" /> PvP Enabled
          </span>
        );
      case 'FINALE':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/20">
            <Trophy className="w-3.5 h-3.5" /> Finale Showdown
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0c1017]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/25 border border-amber-300/30">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950 font-black" />
              {feed === 'live' && (
                <>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                </>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-2xl font-black tracking-tight text-white whitespace-nowrap">
                  WILLY MONEY <span className="text-amber-400">SMP</span>
                </h1>
                <span className="hidden md:inline-flex text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  PAPER 1.21+
                </span>
              </div>
              <p className="hidden sm:flex text-xs text-slate-400 items-center gap-2">
                Official Tournament Standings
              </p>
            </div>
          </div>

          {/* Center: Phase Badge & Active Events */}
          <div className="hidden lg:flex items-center gap-3">
            {getPhaseBadge()}

            {draftLive && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-500/40 animate-pulse">
                <Gavel className="w-3.5 h-3.5 text-amber-400" /> Auction live
              </span>
            )}

            {status?.kothActive && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-rose-400" /> KOTH Active
              </span>
            )}

            {status?.bingoActive && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                🎯 Bingo Live
              </span>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Indicator */}
            <button
              onClick={onOpenInfo}
              title={feedLabel.text}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700"
            >
              <Radio className={`w-4 h-4 ${feedLabel.className}`} />
              <span className="hidden sm:inline text-xs font-medium text-slate-300">{feedLabel.text}</span>
            </button>

            {/* Quick Refresh */}
            <button
              onClick={() => {
                onRefresh();
              }}
              disabled={isRefreshing}
              title="Refresh"
              aria-label="Refresh"
              className="hidden sm:block p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/60 active:scale-90 disabled:opacity-60 duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : 'group-hover:rotate-180 transition-transform'}`} />
            </button>

            {/* Join / server info */}
            <button
              onClick={onOpenInfo}
              className="px-3 sm:px-3.5 py-2 sm:py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20 whitespace-nowrap"
            >
              Join Server
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
