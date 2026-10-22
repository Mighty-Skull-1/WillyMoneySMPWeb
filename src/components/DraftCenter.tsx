import React, { useEffect, useState } from 'react';
import { Gavel, Timer, Users, History, Wallet } from 'lucide-react';
import type { DraftAuction, DraftPick, PlayerTier, PoolPlayer, TeamData } from '../types/tournament';

interface DraftCenterProps {
  draft: DraftAuction | null;
  pool: PoolPlayer[];
  history: DraftPick[];
  teams: TeamData[];
  /** Local clock minus server clock, so the countdown is right even if this device's clock is off. */
  clockSkewMs: number;
}

export const tierStyle: Record<PlayerTier, string> = {
  CAPTAIN: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  A: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  B: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  C: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  UNRANKED: 'bg-slate-800 text-slate-400 border-slate-700',
};

export const tierLabel = (tier: PlayerTier) =>
  tier === 'CAPTAIN' ? 'CAPTAIN' : tier === 'UNRANKED' ? 'UNRANKED' : `TIER ${tier}`;

const Head: React.FC<{ name: string; size: number; className?: string }> = ({ name, size, className }) => (
  <img
    src={`https://mc-heads.net/avatar/${encodeURIComponent(name)}/${size}`}
    alt=""
    width={size}
    height={size}
    className={`bg-slate-800 ${className ?? ''}`}
    onError={(e) => {
      (e.target as HTMLImageElement).src = `https://mc-heads.net/avatar/MHF_Steve/${size}`;
    }}
  />
);

function useServerNow(skewMs: number, active: boolean) {
  const [now, setNow] = useState(() => Date.now() - skewMs);
  useEffect(() => {
    if (!active) return;
    setNow(Date.now() - skewMs);
    const id = setInterval(() => setNow(Date.now() - skewMs), 250);
    return () => clearInterval(id);
  }, [skewMs, active]);
  return now;
}

export const DraftCenter: React.FC<DraftCenterProps> = ({ draft, pool, history, teams, clockSkewMs }) => {
  const serverNow = useServerNow(clockSkewMs, !!draft);
  const remainingMs = draft ? Math.max(0, draft.endsAt - serverNow) : 0;
  const seconds = Math.ceil(remainingMs / 1000);
  const progress = draft ? Math.min(1, remainingMs / (draft.length * 1000)) : 0;
  const urgent = draft && seconds <= 5;

  const tiers: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C'];

  return (
    <section className="mb-10" aria-labelledby="draft-heading">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 id="draft-heading" className="text-xl font-black text-white flex items-center gap-2">
            <Gavel className="w-5 h-5 text-amber-400" /> LIVE DRAFT
          </h2>
          <p className="text-xs text-slate-400">
            Captains type <code className="font-mono text-amber-400">/bid</code> to raise by {draft?.increment ?? 5}. Top bid when the clock hits 0 wins. One player per tier, per team.
          </p>
        </div>
        {draft ? (
          <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" /> Auction live
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {pool.length > 0 ? `${pool.length} players left to draft` : 'Waiting for nominations'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Auction block */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-slate-950/90 shadow-xl">
          {draft ? (
            <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
              <Head name={draft.nominee} size={96} className="w-24 h-24 rounded-2xl border-2 border-amber-400/60 shadow-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80">Now on the block</div>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <h3 className="text-2xl sm:text-3xl font-black text-white truncate">{draft.nominee}</h3>
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-black ${tierStyle[draft.tier]}`}>
                    {tierLabel(draft.tier)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Top bid</div>
                    <div className="text-4xl font-black text-amber-400 tabular-nums leading-none mt-1">
                      {draft.bid}
                      <span className="text-sm text-amber-500/80 font-bold ml-1">credits</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Next bid</div>
                    <div className="text-xl font-black text-white tabular-nums leading-none mt-1.5">
                      {draft.bid + draft.increment}
                      <span className="text-xs text-slate-400 font-semibold ml-1.5">
                        type <code className="font-mono text-amber-400">/bid</code>
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Leading</div>
                    {draft.bidder ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Head name={draft.bidder} size={24} className="w-6 h-6 rounded" />
                        <span className="font-bold text-white truncate">{draft.bidder}</span>
                        {draft.team && <span className="text-xs text-slate-400 truncate">({draft.team})</span>}
                      </div>
                    ) : (
                      <div className="mt-1 text-slate-400 text-sm">No bids yet</div>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Timer className="w-3.5 h-3.5" /> Time left
                    </span>
                    <span className={`font-black tabular-nums ${urgent ? 'text-rose-400' : 'text-white'}`}>
                      {remainingMs > 0 ? `${seconds}s` : 'Closing…'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden" role="progressbar" aria-valuenow={seconds} aria-valuemin={0} aria-valuemax={draft.length}>
                    <div
                      className={`h-full rounded-full transition-[width] duration-200 ${urgent ? 'bg-rose-500' : 'bg-amber-400'}`}
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Gavel className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Waiting for the next nomination</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                When an admin runs <code className="text-amber-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded">/bid nominate &lt;player&gt;</code>,
                the auction shows up here live with the countdown and every bid.
              </p>
            </div>
          )}
        </div>

        {/* Captain purses */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-amber-400" /> Captain purses
          </h3>
          {teams.length === 0 ? (
            <p className="text-xs text-slate-500">No teams yet. Admins create them with <code className="font-mono text-amber-400">/team create</code>.</p>
          ) : (
            <ul className="space-y-2.5">
              {teams.map((team) => {
                const captain = team.members.find((m) => m.isCaptain) ?? team.members[0];
                const filled = new Set(team.members.map((m) => m.tier));
                return (
                  <li key={team.id} className="flex items-center gap-3">
                    <Head name={team.captainName} size={32} className="w-8 h-8 rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{team.name}</div>
                      <div className="flex gap-1 mt-0.5">
                        {tiers.map((t) => (
                          <span
                            key={t}
                            title={filled.has(t) ? `Tier ${t} filled` : `Tier ${t} open`}
                            className={`text-[9px] font-black px-1.5 rounded border ${
                              filled.has(t) ? tierStyle[t] : 'border-dashed border-slate-700 text-slate-600'
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-amber-400 tabular-nums">{captain?.draftCredits ?? 0}</div>
                      <div className="text-[10px] text-slate-500">left</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Available players */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-amber-400" /> Still available ({pool.length})
          </h3>
          {pool.length === 0 ? (
            <p className="text-xs text-slate-500">
              {teams.length > 0 ? 'Everyone with a tier has been drafted.' : 'Players appear here once an admin gives them a tier with /tier.'}
            </p>
          ) : (
            <div className="space-y-3">
              {tiers.map((tier) => {
                const players = pool.filter((p) => p.tier === tier);
                if (players.length === 0) return null;
                return (
                  <div key={tier}>
                    <div className={`inline-block text-[10px] font-black px-2 py-0.5 rounded border mb-2 ${tierStyle[tier]}`}>
                      TIER {tier}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {players.map((p) => (
                        <span
                          key={p.name}
                          className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg border text-xs font-semibold ${
                            draft?.nominee === p.name
                              ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                              : 'border-slate-800 bg-slate-950/60 text-slate-200'
                          }`}
                        >
                          <Head name={p.name} size={20} className="w-5 h-5 rounded" />
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent picks */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-amber-400" /> Recent picks
          </h3>
          {history.length === 0 ? (
            <p className="text-xs text-slate-500">No players sold yet.</p>
          ) : (
            <ol className="space-y-2">
              {history.map((pick, i) => (
                <li key={`${pick.player}-${i}`} className="flex items-center gap-2.5 text-sm">
                  <Head name={pick.player} size={24} className="w-6 h-6 rounded" />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-white">{pick.player}</span>
                    <span className="text-slate-500"> → </span>
                    <span className="text-slate-300 truncate">{pick.team}</span>
                  </div>
                  <span className="text-xs font-black text-amber-400 tabular-nums">{pick.price}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
};
