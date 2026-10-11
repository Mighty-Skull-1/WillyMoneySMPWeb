import React, { useState } from 'react';
import { Ban, Compass, Gift, Target, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

export const RulesGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'banned' | 'events' | 'currencies'>('currencies');

  return (
    <div className="mt-12 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> TOURNAMENT HANDBOOK & MECHANICS
          </h2>
          <p className="text-xs text-slate-400">Essential rules, currencies, and events for Willy Money SMP</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab('currencies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'currencies'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Currencies & Revives
          </button>
          <button
            onClick={() => setActiveTab('banned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'banned'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Banned Items
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'events'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Events
          </button>
        </div>
      </div>

      {/* Tab 1: Currencies */}
      {activeTab === 'currencies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-amber-400 text-sm">🪙 Draft Credits</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">Phase 1 Only</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Given to Team Captains at the start (default 400). Captains spend these during 30-second live auctions to bid on players and build their team rosters.
            </p>
            <div className="text-[11px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800">
              Command: /bid &lt;amount&gt;
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-emerald-400 text-sm">💰 Game Credits</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">Primary Economy</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Earned from Player Kills (+10 to +25), winning KOTH (+50), opening Airdrops, and completing Bingo lines (+150). Captains can spend 150 Credits to <strong>revive eliminated teammates</strong> back to life!
            </p>
            <div className="text-[11px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800">
              Command: /team revive &lt;player&gt; (150 Credits)
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Banned Items */}
      {activeTab === 'banned' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="w-4 h-4 text-rose-400" />
              <h4 className="font-bold text-rose-300 text-sm">Ender Pearls</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Strictly Disabled:</strong> Instant teleportation allows cheesy escapes from combat. Throwing or right-clicking is cancelled immediately and the pearl is deleted.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="w-4 h-4 text-rose-400" />
              <h4 className="font-bold text-rose-300 text-sm">Wind Charges</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Strictly Disabled:</strong> Burst jumping disrupts fair melee combat and terrain positioning. Projectiles are automatically cleared upon firing.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Events */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-rose-400" />
              <h4 className="font-bold text-white text-sm">King of the Hill (KOTH)</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              A 5-block particle beacon zone appears for 180s. Holding the zone grants <strong>+50 Game Credits</strong> to the captain!
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-white text-sm">Proximity Airdrops</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Common, Rare, and Legendary care packages drop near active players with smoke flares, containing netherite scraps, totems, and credit tokens.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-blue-400" />
              <h4 className="font-bold text-white text-sm">5x5 Lockout Bingo</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              25 survival challenges. First squad to complete an objective claims it. Finishing any 5-in-a-row line awards <strong>+150 Credits</strong>!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
