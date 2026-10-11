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

export interface LeaderboardResponse {
  status: TournamentStatus;
  teams: TeamData[];
}
