import React, { useState } from 'react';
import type { BannedItem } from '../types/tournament';
import { Ban, Compass, Gift, Target, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

// Shown until the server sends its live list (matches the plugin's default banned-items.yml).
const DEFAULT_BANNED: BannedItem[] = [
  { name: 'Ender Pearl', reason: 'Ender Pearls are disabled for competitive tournament balance', alternative: 'None / Standard Movement' },
  { name: 'Wind Charge', reason: 'Wind Charges are disabled for competitive tournament balance', alternative: 'None / Standard Movement' },
];

interface ServerRule {
  title: string;
  detail?: string;
  /** Green "allowed" card: something players might assume is banned but isn't. */
  allowed?: boolean;
}

// Keep in sync with the "Server Rules" list in public/guide.html.
const SERVER_RULES: ServerRule[] = [
  { title: 'No unfair advantages', detail: 'No mods or clients that give you an edge — health indicators, player trackers, minimaps and similar are all banned.' },
  { title: 'No stream sniping', detail: "Do not use anyone's stream to find or track them. Even being suspected of stream sniping can get your team fined, so take this seriously." },
  { title: 'No TNT traps or TNT in PvP', detail: 'TNT cannot be used to trap players or as a weapon in fights.' },
  { title: 'Use common sense', detail: "No loopholes and no exploits. If it feels like it breaks the spirit of the game, don't do it." },
  { title: 'No cross-team cheating', detail: 'Teams working together unfairly or helping another team cheat will be fined.' },
  { title: 'FFA: no focusing one team', detail: 'In the Free For All you can fight whoever you want, but you cannot target one team for the whole FFA. Doing it gets a fine.' },
  { title: 'No draining' },
  { title: 'No ice or sponges', detail: 'Ice and sponges cannot be used.' },
  { title: 'No debuffs', detail: 'Do not use debuff potions or effects on other players.' },
  { title: 'No spectral arrows' },
  { title: 'No Thorns', detail: 'The Thorns enchantment is not allowed.' },
  { title: 'Naked kills: once only', detail: "You can kill someone with no gear, but after that you can't kill them again until they're geared up. Don't try to loophole this rule." },
  { title: '50-minute grace period', detail: 'You get 50 minutes of grace from the first time you log on, and again every time you die.' },
  { title: 'Lava is allowed', allowed: true },
  { title: 'AFK killing is allowed', allowed: true },
  { title: 'Base griefing and stealing are allowed', detail: "You can grief other people's bases and steal from them.", allowed: true },
];

interface RulesGuideProps {
  /** Live list from the server (/banneditems). Undefined until the server sends it. */
  banned?: BannedItem[];
}

export const RulesGuide: React.FC<RulesGuideProps> = ({ banned }) => {
  const bannedList = banned ?? DEFAULT_BANNED;
  const [activeTab, setActiveTab] = useState<'rules' | 'banned' | 'events' | 'currencies'>('rules');

  return (
    <div className="mt-12 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> TOURNAMENT HANDBOOK & MECHANICS
          </h2>
          <p className="text-xs text-slate-400">
            Essential rules, currencies, and events for Willy Money SMP ·{' '}
            <a href="./guide.html" className="text-amber-400 hover:text-amber-300 font-semibold">
              Read the full tournament guide →
            </a>
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rules'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Server Rules
          </button>
          <button
            onClick={() => setActiveTab('currencies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'currencies'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Currencies & Economy
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

      {/* Server rules */}
      {activeTab === 'rules' && (
        <div>
          <div className="mb-4 p-4 rounded-xl bg-rose-950/30 border border-rose-900/50 text-sm text-rose-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-none text-rose-400" />
            <span><strong>Breaking a rule = a fine.</strong> Fines take a portion of your team&apos;s money, so one person breaking the rules costs the whole team.</span>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SERVER_RULES.map((rule, i) => (
              <li
                key={rule.title}
                className={`flex gap-3 p-4 rounded-xl border ${
                  rule.allowed ? 'bg-emerald-950/20 border-emerald-900/40' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <span
                  className={`flex-none w-7 h-7 rounded-lg text-sm font-black flex items-center justify-center ${
                    rule.allowed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                  }`}
                >
                  {i + 1}
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    {rule.title}
                    {rule.allowed && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">ALLOWED</span>
                    )}
                  </h4>
                  {rule.detail && <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{rule.detail}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Tab 1: Currencies */}
      {activeTab === 'currencies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-amber-400 text-sm">🪙 Draft Credits</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">Phase 1 Only</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Given to Team Captains at the start (default 300). Captains spend these in live 30-second auctions to build their rosters. Bids go up 5 at a time (5, 10, 15...) and the highest bid when the clock runs out wins.
            </p>
            <div className="text-[11px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800">
              Command: /bid (raises the top bid by 5)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-emerald-400 text-sm">💰 Game Credits</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">Primary Economy</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Earned from Player Kills (+10 to +25), placing in KOTH (up to +125), placing in the FFA (up to +125), opening Airdrops, and placing in Bingo (up to +150). Determines final team standings on the leaderboard!
            </p>
            <div className="text-[11px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800">
              Command: /leaderboard (Ranks squads by Game Credits)
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Banned Items (live from the server: /banneditems) */}
      {activeTab === 'banned' && (
        bannedList.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-sm text-emerald-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> No items are banned right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bannedList.map((item) => (
              <div key={item.name} className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40">
                <div className="flex items-center gap-2 mb-2">
                  <Ban className="w-4 h-4 text-rose-400" />
                  <h4 className="font-bold text-rose-300 text-sm">{item.name}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Banned:</strong> {item.reason || 'Not allowed in the tournament.'}
                </p>
                {item.alternative && (
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    <span className="font-semibold text-slate-300">Use instead:</span> {item.alternative}
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Tab 3: Events */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-rose-400" />
              <h4 className="font-bold text-white text-sm">King of the Hill (KOTH)</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              A 5-block flame ring appears for 5 minutes and everyone gets a Knockback II wooden sword (breaks after about 5 hits). Teams that hold it longest win: <strong>1st +125</strong>, <strong>2nd +100</strong>, <strong>3rd +75</strong>, <strong>4th +50</strong>, <strong>5th +25</strong> Game Credits.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <h4 className="font-bold text-white text-sm">Free For All (FFA)</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              A PvP event where every team fights. Die and you are out of the FFA (you spectate until it ends, then you are back in the game). When everyone on your team is out, your team is out: the first team out finishes 5th, the next 4th, and the last team standing wins. <strong>1st +125</strong>, <strong>2nd +100</strong>, <strong>3rd +75</strong>, <strong>4th +50</strong>, <strong>5th +25</strong> Game Credits. Fight whoever you want, but <strong>no focusing one team the whole FFA</strong> (fine). Logging out counts as being knocked out.
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
              25 survival challenges, first team to finish one claims it. When bingo ends, most squares wins: <strong>+150 / +120 / +100 / +50 / +25</strong> for 1st to 5th.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h4 className="font-bold text-white text-sm">Free Fall (Finale Showdown)</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The world border closes in, forcing every team into the middle. Permadeath: die and you are out for good. When it ends, the team on top of the leaderboard wins!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
