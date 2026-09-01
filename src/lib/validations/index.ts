import { z } from "zod";

// ============================================================================
// AUTH
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ============================================================================
// USERS
// ============================================================================

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"]),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
});

// ============================================================================
// PLAYERS
// ============================================================================

export const createPlayerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  jerseyNumber: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || Number.isNaN(Number(val)) ? null : Number(val)),
    z.number().int().min(1, "Jersey number must be between 1 and 99").max(99, "Jersey number must be between 1 and 99").nullable().optional()
  ),
  position: z.enum(["GOALKEEPER", "DEFENDER", "MIDFIELDER", "FORWARD"]),
  secondaryPosition: z
    .enum(["GOALKEEPER", "DEFENDER", "MIDFIELDER", "FORWARD"])
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null))
    .or(z.literal("NONE").transform(() => null)),
  currentCity: z.string().optional().nullable().or(z.literal("").transform(() => null)),
  dateOfBirth: z.string().optional().nullable().or(z.literal("").transform(() => null)),
  nationality: z.string().optional().nullable().or(z.literal("").transform(() => null)),
  height: z.string().optional().nullable().or(z.literal("").transform(() => null)),
  weight: z.string().optional().nullable().or(z.literal("").transform(() => null)),
  preferredFoot: z.string().optional().nullable().or(z.literal("").transform(() => null)),
  dateJoined: z.string().optional().nullable().or(z.literal("").transform(() => null)),
  bio: z.string().optional().nullable().or(z.literal("").transform(() => null)),
  photoUrl: z.string().optional().nullable().or(z.literal("").transform(() => null)),
  status: z
    .enum(["ACTIVE", "INJURED", "SUSPENDED", "INACTIVE", "TRANSFERRED"])
    .default("ACTIVE"),
  isFeatured: z.boolean().default(false),
  teamId: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null))
    .or(z.literal("NONE").transform(() => null)),
  isCaptain: z.boolean().default(false),
  isViceCaptain: z.boolean().default(false),
});

export const updatePlayerSchema = createPlayerSchema.partial();

// ============================================================================
// TEAMS
// ============================================================================

export const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  manager: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateTeamSchema = createTeamSchema.partial();

export const teamPlayerSchema = z.object({
  playerId: z.string().uuid("Invalid player ID"),
  isCaptain: z.boolean().default(false),
  isViceCaptain: z.boolean().default(false),
});

// ============================================================================
// SEASONS
// ============================================================================

export const createSeasonSchema = z.object({
  name: z.string().min(1, "Season name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isCurrent: z.boolean().default(false),
});

export const updateSeasonSchema = createSeasonSchema.partial();

// ============================================================================
// COMPETITIONS
// ============================================================================

export const createCompetitionSchema = z.object({
  name: z.string().min(1, "Competition name is required"),
  description: z.string().optional().nullable(),
  seasonId: z.string().uuid("Invalid season ID"),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED"]).default("UPCOMING"),
  pointsForWin: z.coerce.number().int().default(3),
  pointsForDraw: z.coerce.number().int().default(1),
  pointsForLoss: z.coerce.number().int().default(0),
});

export const updateCompetitionSchema = createCompetitionSchema.partial();

// ============================================================================
// MATCHES
// ============================================================================

export const createMatchSchema = z.object({
  competitionId: z
    .string()
    .uuid()
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null))
    .or(z.literal("NONE").transform(() => null)),
  seasonId: z
    .string()
    .uuid()
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null))
    .or(z.literal("NONE").transform(() => null)),
  homeTeamId: z.string().uuid("Home team is required"),
  awayTeamId: z.string().uuid("Away team is required"),
  matchDate: z.string().min(1, "Match date is required"),
  venue: z.string().optional().nullable(),
  matchDay: z.coerce.number().int().optional().nullable(),
  referee: z.string().optional().nullable(),
  assistantReferee1: z.string().optional().nullable(),
  assistantReferee2: z.string().optional().nullable(),
  fourthOfficial: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z
    .enum(["SCHEDULED", "LIVE", "COMPLETED", "POSTPONED", "CANCELLED"])
    .default("SCHEDULED"),
});

export const updateMatchSchema = createMatchSchema.partial();

export const matchResultSchema = z.object({
  homeScore: z.coerce.number().int().min(0, "Score cannot be negative"),
  awayScore: z.coerce.number().int().min(0, "Score cannot be negative"),
  playerOfMatchId: z
    .string()
    .uuid()
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null))
    .or(z.literal("NONE").transform(() => null)),
  matchReport: z.string().optional().nullable(),
  status: z.enum(["COMPLETED", "LIVE"]).default("COMPLETED"),
});

export const matchEventSchema = z.object({
  playerId: z.string().uuid("Player is required"),
  relatedPlayerId: z
    .string()
    .uuid()
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null))
    .or(z.literal("NONE").transform(() => null)),
  eventType: z.enum([
    "GOAL",
    "ASSIST",
    "YELLOW_CARD",
    "RED_CARD",
    "SUBSTITUTION",
    "OWN_GOAL",
    "PENALTY",
    "PENALTY_MISSED",
  ]),
  minute: z.coerce.number().int().min(0).max(120),
  description: z.string().optional().nullable(),
});

// ============================================================================
// EVENTS
// ============================================================================

export const createEventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional().nullable(),
  eventType: z
    .enum([
      "CLUB_MEETING",
      "TOURNAMENT",
      "TRAINING",
      "CELEBRATION",
      "AGM",
      "FRIENDLY_MATCH",
      "AWARD_CEREMONY",
      "FUNDRAISER",
      "COMMUNITY",
      "OTHER",
    ])
    .default("OTHER"),
  eventDate: z.string().min(1, "Event date is required"),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  registrationUrl: z.string().url().optional().nullable().or(z.literal("")),
  organizer: z.string().optional().nullable(),
  status: z
    .enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED", "POSTPONED"])
    .default("UPCOMING"),
  isPublished: z.boolean().default(false),
});

export const updateEventSchema = createEventSchema.partial();

// ============================================================================
// NEWS
// ============================================================================

export const createNewsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1, "Content is required"),
  featuredImageUrl: z.string().optional().nullable(),
  categoryId: z
    .string()
    .uuid()
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null))
    .or(z.literal("NONE").transform(() => null)),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
});

export const updateNewsSchema = createNewsSchema.partial();

export const newsCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

// ============================================================================
// SITE SETTINGS
// ============================================================================

export const siteSettingsSchema = z.object({
  clubName: z.string().min(1, "Club name is required"),
  clubMotto: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  aboutText: z.string().optional(),
  footerText: z.string().optional(),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
  clubHistory: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  clubValues: z.string().optional(),
});

// ============================================================================
// SEARCH & PAGINATION
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
