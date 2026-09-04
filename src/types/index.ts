import type {
  User,
  Player,
  Team,
  TeamPlayer,
  Season,
  Competition,
  Match,
  MatchEvent,
  MatchLineup,
  Event,
  News,
  NewsCategory,
  Media,
  AuditLog,
  SiteSetting,
  UserRole,
  Venue,
} from "@prisma/client";

// ============================================================================
// Re-export Prisma types for convenience
// ============================================================================
export type {
  User,
  Player,
  Team,
  TeamPlayer,
  Season,
  Competition,
  Match,
  MatchEvent,
  MatchLineup,
  Event,
  News,
  NewsCategory,
  Media,
  AuditLog,
  SiteSetting,
  UserRole,
  Venue,
};

// ============================================================================
// Extended Types with Relations
// ============================================================================

export type PlayerWithTeams = Player & {
  teamPlayers: (TeamPlayer & {
    team: Team;
  })[];
};

export type TeamWithPlayers = Team & {
  teamPlayers: (TeamPlayer & {
    player: Player;
  })[];
};

export type MatchWithDetails = Match & {
  homeTeam: Team;
  awayTeam: Team;
  competition?: Competition | null;
  season?: Season | null;
  playerOfMatch?: Player | null;
  matchEvents: (MatchEvent & {
    player: Player;
    relatedPlayer?: Player | null;
  })[];
  lineups: (MatchLineup & {
    player: Player;
  })[];
  matchPhotos: { id: string; url: string; caption: string | null }[];
};

export type NewsWithDetails = News & {
  category?: NewsCategory | null;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

export type EventWithGallery = Event & {
  gallery: { id: string; url: string; caption: string | null }[];
};

export type CompetitionWithDetails = Competition & {
  season: Season;
  matches: Match[];
  competitionTeams: {
    team: Team;
  }[];
};

export type AuditLogWithUser = AuditLog & {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

// ============================================================================
// API Response Types
// ============================================================================

export type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ============================================================================
// Dashboard Types
// ============================================================================

export type DashboardStats = {
  totalPlayers: number;
  activePlayers: number;
  totalTeams: number;
  upcomingMatches: number;
  completedMatches: number;
  upcomingEvents: number;
  publishedNews: number;
  totalUsers: number;
};

// ============================================================================
// League Table Types
// ============================================================================

export type LeagueTableEntry = {
  teamId: string;
  teamName: string;
  teamLogo: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
};

// ============================================================================
// Player Statistics Types
// ============================================================================

export type PlayerStats = {
  playerId: string;
  playerName: string;
  playerPhoto: string | null;
  position: string;
  teamName: string | null;
  matchesPlayed: number;
  starts: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  playerOfMatchAwards: number;
  minutesPlayed: number;
};

// ============================================================================
// Navigation / Sidebar Types
// ============================================================================

export type SidebarItem = {
  title: string;
  href: string;
  icon: string;
  permission?: string;
  children?: SidebarItem[];
};

// ============================================================================
// Site Settings Map
// ============================================================================

export type SiteSettingsMap = {
  clubName: string;
  clubMotto: string;
  clubLogo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  aboutText: string;
  footerText: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  clubHistory: string;
  mission: string;
  vision: string;
  clubValues: string;
  [key: string]: string;
};
