export type SMPPhase = 'DRAFT' | 'GRACE' | 'PVP' | 'FINALE';

export type PlayerTier = 'CAPTAIN' | 'A' | 'B' | 'C' | 'UNRANKED';

export interface PlayerData {
  uuid: string;
  name: string;
  tier: PlayerTier;
  gameCredits: number;
  draftCredits: number;
  isCaptain: boolean;
  isEliminated: boolean;
  kills?: number;
  deaths?: number;
}

export interface TeamData {
  id: string;
  name: string;
  colorCode: string;
  hexColor?: string;
  captain: string; // UUID
  captainName: string;
  members: PlayerData[];
  totalCredits: number;
  aliveCount: number;
  eliminatedCount: number;
  bingoClaims?: number;
}

export interface TournamentStatus {
  serverName: string;
  onlinePlayers: number;
  maxPlayers: number;
  phase: SMPPhase;
  phaseName: string;
  kothActive: boolean;
  bingoActive: boolean;
  totalTeams: number;
  totalParticipants: number;
  eliminatedCount: number;
  lastUpdated: string;
}

/** The auction currently running in game (/bid nominate). */
export interface DraftAuction {
  nominee: string;
  tier: PlayerTier;
  bid: number;
  bidder: string | null;
  team: string | null;
  /** Server time (ms) the auction closes. */
  endsAt: number;
  /** Auction length in seconds. */
  length: number;
  /** Every bid is exactly this much higher than the last. */
  increment: number;
}

export interface DraftPick {
  player: string;
  team: string;
  price: number;
}

export interface PoolPlayer {
  name: string;
  tier: PlayerTier;
}

export interface LeaderboardResponse {
  status: TournamentStatus;
  teams: TeamData[];
  draft?: DraftAuction | null;
  pool?: PoolPlayer[];
  history?: DraftPick[];
  /** Minecraft server address set in game with /smp setip (falls back to MC_SERVER_HOST). */
  serverAddress?: string;
  /** Items banned on the server (/banneditems). Undefined = server hasn't sent the list. */
  banned?: BannedItem[];
}

export interface BannedItem {
  name: string;
  reason: string;
  alternative: string;
}
