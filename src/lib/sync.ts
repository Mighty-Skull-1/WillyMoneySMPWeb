// Live sync with the Minecraft plugin through the ntfy.sh relay.
//
// The plugin posts messages shaped like:  v2.<base64url ECDSA signature>.<compact JSON>
// We only accept messages whose signature checks out against SIGNING_PUBLIC_KEY,
// and we always keep the newest one (by the timestamp inside the signed payload),
// so old or fake messages posted to the public topic are ignored.

import { NTFY_SERVER, NTFY_TOPIC, SIGNING_PUBLIC_KEY } from '../config';
import type {
  DraftAuction,
  DraftPick,
  LeaderboardResponse,
  PlayerData,
  PlayerTier,
  PoolPlayer,
  SMPPhase,
  TeamData,
} from '../types/tournament';

export interface SignedUpdate {
  data: LeaderboardResponse;
  /** Server clock (ms) when the plugin built this update. */
  sentAt: number;
}

export const PHASE_NAMES: Record<SMPPhase, string> = {
  DRAFT: 'Draft Auction',
  GRACE: 'Grace Period',
  PVP: 'Combat & Eliminations',
  FINALE: 'Finale Showdown',
};

const topicUrl = () => `${NTFY_SERVER.replace(/\/$/, '')}/${NTFY_TOPIC}`;

// ---------------------------------------------------------------- signature

let keyPromise: Promise<CryptoKey> | null = null;

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const normal = b64.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normal + '='.repeat((4 - (normal.length % 4)) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function getKey(): Promise<CryptoKey> {
  if (!keyPromise) {
    keyPromise = crypto.subtle.importKey(
      'spki',
      base64ToBytes(SIGNING_PUBLIC_KEY),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify'],
    );
  }
  return keyPromise;
}

/** Returns the decoded update, or null if the message isn't a valid signed update. */
export async function verifyAndDecode(text: string): Promise<SignedUpdate | null> {
  if (typeof text !== 'string' || !text.startsWith('v2.')) return null;
  const dot = text.indexOf('.', 3);
  if (dot < 0) return null;
  const signature = text.slice(3, dot);
  const payload = text.slice(dot + 1);

  try {
    const ok = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      await getKey(),
      base64ToBytes(signature),
      new TextEncoder().encode(payload),
    );
    if (!ok) return null;
    const raw = JSON.parse(payload);
    if (!raw || raw.v !== 2 || typeof raw.t !== 'number') return null;
    return { data: decodePayload(raw), sentAt: raw.t };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- compact payload -> app data

const asTier = (t: unknown): PlayerTier =>
  t === 'CAPTAIN' || t === 'A' || t === 'B' || t === 'C' ? t : 'UNRANKED';

const asPhase = (p: unknown): SMPPhase =>
  p === 'DRAFT' || p === 'GRACE' || p === 'PVP' || p === 'FINALE' ? p : 'DRAFT';

export const teamId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

export function decodePayload(raw: any): LeaderboardResponse {
  const teams: TeamData[] = (Array.isArray(raw.T) ? raw.T : []).map((t: unknown[]) => {
    const [name, hex, bingo, rawMembers] = t as [string, string, number, unknown[][]];
    const members: PlayerData[] = (Array.isArray(rawMembers) ? rawMembers : []).map((m, i) => {
      const [mName, tier, game, draft, elim, kills, deaths] = m as [string, string, number, number, number, number, number];
      return {
        uuid: `${name}:${mName}`,
        name: String(mName),
        tier: i === 0 ? 'CAPTAIN' : asTier(tier),
        gameCredits: Number(game) || 0,
        draftCredits: Number(draft) || 0,
        isCaptain: i === 0,
        isEliminated: elim === 1,
        kills: Number(kills) || 0,
        deaths: Number(deaths) || 0,
      };
    });
    const eliminated = members.filter((m) => m.isEliminated).length;
    return {
      id: teamId(String(name)),
      name: String(name),
      colorCode: '',
      hexColor: typeof hex === 'string' ? hex : undefined,
      captain: members[0]?.uuid ?? '',
      captainName: members[0]?.name ?? 'Unknown',
      members,
      totalCredits: members.reduce((sum, m) => sum + m.gameCredits, 0),
      aliveCount: members.length - eliminated,
      eliminatedCount: eliminated,
      bingoClaims: Number(bingo) || 0,
    };
  });

  const pool: PoolPlayer[] = (Array.isArray(raw.pool) ? raw.pool : []).map((p: unknown[]) => ({
    name: String(p[0]),
    tier: asTier(p[1]),
  }));

  const history: DraftPick[] = (Array.isArray(raw.h) ? raw.h : []).map((h: unknown[]) => ({
    player: String(h[0]),
    team: String(h[1]),
    price: Number(h[2]) || 0,
  }));

  const draft: DraftAuction | null =
    raw.d && typeof raw.d === 'object'
      ? {
          nominee: String(raw.d.n),
          tier: asTier(raw.d.tr),
          bid: Number(raw.d.bid) || 0,
          bidder: raw.d.by ?? null,
          team: raw.d.tm ?? null,
          endsAt: Number(raw.d.end) || 0,
          length: Number(raw.d.len) || 15,
          increment: Number(raw.d.inc) || 5,
        }
      : null;

  const phase = asPhase(raw.p);
  const participants = teams.reduce((sum, t) => sum + t.members.length, 0);

  return {
    status: {
      serverName: 'Willy Money SMP',
      onlinePlayers: Number(raw.on) || 0,
      maxPlayers: Number(raw.max) || 0,
      phase,
      phaseName: PHASE_NAMES[phase],
      kothActive: raw.k === 1,
      bingoActive: raw.b === 1,
      totalTeams: teams.length,
      totalParticipants: participants,
      eliminatedCount: teams.reduce((sum, t) => sum + t.eliminatedCount, 0),
      lastUpdated: new Date(raw.t).toISOString(),
    },
    teams: sortTeams(teams),
    draft,
    pool,
    history,
  };
}

/** Highest combined credits first (same order as /leaderboard in game). */
export function sortTeams(teams: TeamData[]): TeamData[] {
  return [...teams].sort((a, b) => b.totalCredits - a.totalCredits || a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------- ntfy transport

interface NtfyItem {
  event?: string;
  message?: string;
  attachment?: { url?: string; size?: number };
}

/** Big updates (over ntfy's 4 KB message limit) arrive as a file attachment instead of text. */
async function messageText(item: NtfyItem): Promise<string | null> {
  if (item.event && item.event !== 'message') return null;
  if (item.message?.startsWith('v2.')) return item.message;
  if (item.attachment?.url && (item.attachment.size ?? 0) < 256_000) {
    try {
      const res = await fetch(item.attachment.url, { cache: 'no-store' });
      if (res.ok) return await res.text();
    } catch {
      // ignore
    }
  }
  return item.message ?? null;
}

export interface FetchResult {
  update: SignedUpdate | null;
  rejected: number;
}

/** Reads the topic's recent history (ntfy keeps ~12h) and returns the newest valid update. */
export async function fetchLatest(): Promise<FetchResult> {
  const res = await fetch(`${topicUrl()}/json?poll=1&since=all`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Relay returned HTTP ${res.status}`);
  const lines = (await res.text()).split('\n').filter(Boolean);

  let best: SignedUpdate | null = null;
  let rejected = 0;
  // Check everything (not just the last line): someone could re-post an old signed update,
  // so we pick the one with the newest signed timestamp rather than the newest arrival.
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 3000); i--) {
    let item: NtfyItem;
    try {
      item = JSON.parse(lines[i]);
    } catch {
      continue;
    }
    const text = await messageText(item);
    if (!text) continue;
    const update = await verifyAndDecode(text);
    if (!update) {
      rejected++;
      continue;
    }
    if (!best || update.sentAt > best.sentAt) best = update;
  }
  return { update: best, rejected };
}

/** Live stream of new updates. Returns a function that closes the connection. */
export function subscribe(onUpdate: (u: SignedUpdate) => void, onRejected: () => void): () => void {
  const es = new EventSource(`${topicUrl()}/sse?since=1m`);
  es.onmessage = async (event) => {
    let item: NtfyItem;
    try {
      item = JSON.parse(event.data);
    } catch {
      return;
    }
    const text = await messageText(item);
    if (!text) return;
    const update = await verifyAndDecode(text);
    if (update) onUpdate(update);
    else onRejected();
  };
  return () => es.close();
}

// ---------------------------------------------------------------- Minecraft server ping

export interface McStatus {
  online: boolean;
  players: number;
  max: number;
}

export async function pingServer(host: string): Promise<McStatus | null> {
  try {
    const res = await fetch(`https://api.mcstatus.io/v2/status/java/${host}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return {
      online: !!json?.online,
      players: json?.players?.online ?? 0,
      max: json?.players?.max ?? 0,
    };
  } catch {
    return null;
  }
}
