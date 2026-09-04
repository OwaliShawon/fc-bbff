"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import {
  createMatchSchema,
  updateMatchSchema,
  matchResultSchema,
  matchEventSchema,
} from "@/lib/validations";
import { createAuditLog } from "@/services/audit-log";
import { slugify } from "@/lib/utils";
import type { ActionResponse, PaginatedResponse, Match } from "@/types";

async function requirePermission(permission: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!hasPermission(session.user.role, permission as never))
    throw new Error("Insufficient permissions");
  return session;
}

export async function getMatches(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  competitionId?: string;
  seasonId?: string;
  teamId?: string;
}): Promise<PaginatedResponse<Match>> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (params?.status) {
    where.status = params.status;
  }
  if (params?.competitionId) {
    if (params.competitionId === "INDEPENDENT" || params.competitionId === "FRIENDLY") {
      where.competitionId = null;
    } else {
      where.competitionId = params.competitionId;
    }
  }
  if (params?.seasonId) {
    where.seasonId = params.seasonId;
  }
  if (params?.teamId) {
    where.OR = [
      { homeTeamId: params.teamId },
      { awayTeamId: params.teamId },
    ];
  }
  if (params?.search) {
    where.OR = [
      { homeTeam: { name: { contains: params.search, mode: "insensitive" } } },
      { awayTeam: { name: { contains: params.search, mode: "insensitive" } } },
      { venue: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [matches, total] = await Promise.all([
    db.match.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { matchDate: "desc" },
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true,
        season: true,
        playerOfMatch: true,
        _count: { select: { matchEvents: true } },
      },
    }),
    db.match.count({ where }),
  ]);

  return {
    data: matches,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getMatchById(id: string) {
  return db.match.findUnique({
    where: { id },
    include: {
      homeTeam: { include: { teamPlayers: { include: { player: true } } } },
      awayTeam: { include: { teamPlayers: { include: { player: true } } } },
      competition: true,
      season: true,
      playerOfMatch: true,
      matchEvents: {
        include: {
          player: true,
          relatedPlayer: true,
        },
        orderBy: { minute: "asc" },
      },
      lineups: {
        include: { player: true },
        orderBy: { type: "asc" },
      },
      matchPhotos: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function createMatch(data: unknown): Promise<ActionResponse<Match>> {
  try {
    await requirePermission(PERMISSIONS.MATCHES_CREATE);
    const validated = createMatchSchema.parse(data);

    if (validated.homeTeamId === validated.awayTeamId) {
      return { success: false, error: "Home and away teams must be different" };
    }

    if (validated.competitionId) {
      const [homeTeam, awayTeam] = await Promise.all([
        db.team.findUnique({ where: { id: validated.homeTeamId } }),
        db.team.findUnique({ where: { id: validated.awayTeamId } }),
      ]);
      if (homeTeam?.isExternal || awayTeam?.isExternal) {
        return {
          success: false,
          error: "Competitions are strictly for internal FC BBFF teams. External teams cannot participate in competition matches.",
        };
      }
    }

    const match = await db.match.create({
      data: {
        ...validated,
        matchDate: new Date(validated.matchDate),
      },
    });

    await createAuditLog({
      action: "CREATE",
      module: "matches",
      recordId: match.id,
      description: `Created match fixture`,
      newValue: validated,
    });

    revalidatePath("/admin/matches");
    revalidatePath("/matches");
    return { success: true, data: match };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create match",
    };
  }
}

export async function createMatchWithOutsider(data: {
  fcBbffTeamId: string;
  outsiderTeamName: string;
  outsiderContactPersonName?: string | null;
  outsiderContactNumber?: string | null;
  outsiderFacebookUrl?: string | null;
  outsiderLogoUrl?: string | null;
  isFcBbffHome?: boolean;
  matchDate: string;
  venue?: string | null;
  competitionId?: string | null;
  seasonId?: string | null;
  matchDay?: number | null;
  referee?: string | null;
  notes?: string | null;
  status?: "SCHEDULED" | "LIVE" | "COMPLETED" | "POSTPONED" | "CANCELLED";
  selectedPlayerIds?: string[];
}): Promise<ActionResponse<Match>> {
  try {
    await requirePermission(PERMISSIONS.MATCHES_CREATE);

    const trimmedName = data.outsiderTeamName.trim();
    if (!trimmedName) {
      return { success: false, error: "Outsider team name is required" };
    }

    // Find or create outsider team
    let outsiderTeam = await db.team.findFirst({
      where: {
        name: { equals: trimmedName, mode: "insensitive" },
        deletedAt: null,
      },
    });

    if (!outsiderTeam) {
      const baseSlug = slugify(trimmedName);
      let slug = baseSlug;
      let counter = 1;
      while (await db.team.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      outsiderTeam = await db.team.create({
        data: {
          name: trimmedName,
          slug,
          logoUrl: data.outsiderLogoUrl || null,
          contactPersonName: data.outsiderContactPersonName || null,
          contactNumber: data.outsiderContactNumber || null,
          facebookUrl: data.outsiderFacebookUrl || null,
          isExternal: true,
          status: "ACTIVE",
        },
      });
    } else {
      // Update outsider contact details if provided
      await db.team.update({
        where: { id: outsiderTeam.id },
        data: {
          isExternal: true,
          ...(data.outsiderLogoUrl ? { logoUrl: data.outsiderLogoUrl } : {}),
          ...(data.outsiderContactPersonName ? { contactPersonName: data.outsiderContactPersonName } : {}),
          ...(data.outsiderContactNumber ? { contactNumber: data.outsiderContactNumber } : {}),
          ...(data.outsiderFacebookUrl ? { facebookUrl: data.outsiderFacebookUrl } : {}),
        },
      });
    }

    const isHome = data.isFcBbffHome !== false;
    const homeTeamId = isHome ? data.fcBbffTeamId : outsiderTeam.id;
    const awayTeamId = isHome ? outsiderTeam.id : data.fcBbffTeamId;

    if (homeTeamId === awayTeamId) {
      return { success: false, error: "FC BBFF and Outsider team must be different" };
    }

    const match = await db.match.create({
      data: {
        homeTeamId,
        awayTeamId,
        matchDate: new Date(data.matchDate),
        venue: data.venue || null,
        competitionId: data.competitionId || null,
        seasonId: data.seasonId || null,
        matchDay: data.matchDay || null,
        referee: data.referee || null,
        notes: data.notes || null,
        status: data.status || "SCHEDULED",
      },
    });

    // If FC BBFF player IDs were selected for this match, create match lineups
    if (data.selectedPlayerIds && data.selectedPlayerIds.length > 0) {
      await db.matchLineup.createMany({
        data: data.selectedPlayerIds.map((playerId) => ({
          matchId: match.id,
          playerId,
          teamId: data.fcBbffTeamId,
          type: "STARTING",
        })),
        skipDuplicates: true,
      });
    }

    await createAuditLog({
      action: "CREATE",
      module: "matches",
      recordId: match.id,
      description: `Created match vs outsider team: ${trimmedName}`,
      newValue: { ...data, matchId: match.id },
    });

    revalidatePath("/admin/matches");
    revalidatePath("/matches");
    revalidatePath("/h2h");
    revalidatePath("/teams");
    return { success: true, data: match };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create match vs outsider team",
    };
  }
}

export async function updateMatchLineup(
  matchId: string,
  lineup: {
    playerId: string;
    teamId: string;
    type: "STARTING" | "SUBSTITUTE";
    position?: string | null;
    shirtNumber?: number | null;
  }[]
): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.MATCHES_UPDATE);

    const match = await db.match.findUnique({ where: { id: matchId } });
    if (!match) return { success: false, error: "Match not found" };

    if (match.status === "COMPLETED") {
      return { success: false, error: "Lineup cannot be edited after match is marked COMPLETED" };
    }

    await db.$transaction([
      db.matchLineup.deleteMany({ where: { matchId } }),
      db.matchLineup.createMany({
        data: lineup.map((l) => ({
          matchId,
          playerId: l.playerId,
          teamId: l.teamId,
          type: l.type,
          position: l.position || null,
          shirtNumber: l.shirtNumber || null,
        })),
      }),
    ]);

    await createAuditLog({
      action: "UPDATE",
      module: "matches",
      recordId: matchId,
      description: `Updated match lineup (${lineup.length} players)`,
    });

    revalidatePath("/admin/matches");
    revalidatePath(`/matches/${matchId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update match lineup",
    };
  }
}

export async function updateMatch(
  id: string,
  data: unknown
): Promise<ActionResponse<Match>> {
  try {
    await requirePermission(PERMISSIONS.MATCHES_UPDATE);
    const validated = updateMatchSchema.parse(data);

    const existing = await db.match.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Match not found" };

    const updateData: Record<string, unknown> = { ...validated };
    if (validated.matchDate) {
      updateData.matchDate = new Date(validated.matchDate);
    }

    const match = await db.match.update({ where: { id }, data: updateData });

    await createAuditLog({
      action: "UPDATE",
      module: "matches",
      recordId: id,
      description: `Updated match`,
      previousValue: existing,
      newValue: validated,
    });

    revalidatePath("/admin/matches");
    revalidatePath("/matches");
    return { success: true, data: match };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update match",
    };
  }
}

export async function updateMatchResult(
  matchId: string,
  data: unknown
): Promise<ActionResponse<Match>> {
  try {
    await requirePermission(PERMISSIONS.RESULTS_CREATE);
    const validated = matchResultSchema.parse(data);

    const existing = await db.match.findUnique({ where: { id: matchId } });
    if (!existing) return { success: false, error: "Match not found" };

    const match = await db.match.update({
      where: { id: matchId },
      data: {
        homeScore: validated.homeScore,
        awayScore: validated.awayScore,
        playerOfMatchId: validated.playerOfMatchId,
        matchReport: validated.matchReport,
        status: validated.status,
        isPublished: true,
      },
    });

    await createAuditLog({
      action: "UPDATE",
      module: "results",
      recordId: matchId,
      description: `Updated match result: ${validated.homeScore} - ${validated.awayScore}`,
      previousValue: { homeScore: existing.homeScore, awayScore: existing.awayScore },
      newValue: { homeScore: validated.homeScore, awayScore: validated.awayScore },
    });

    revalidatePath("/admin/matches");
    revalidatePath("/matches");
    revalidatePath(`/matches/${matchId}`);
    revalidatePath("/statistics");
    revalidatePath("/admin/statistics");
    revalidatePath("/admin/league-tables");
    revalidatePath("/");
    revalidatePath("/competitions");
    return { success: true, data: match };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update result",
    };
  }
}

export async function addMatchEvent(
  matchId: string,
  data: unknown
): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.RESULTS_CREATE);
    const validated = matchEventSchema.parse(data);

    await db.matchEvent.create({
      data: {
        matchId,
        ...validated,
      },
    });

    await createAuditLog({
      action: "CREATE",
      module: "match_events",
      recordId: matchId,
      description: `Added ${validated.eventType} at minute ${validated.minute}`,
    });

    revalidatePath("/admin/matches");
    revalidatePath(`/matches/${matchId}`);
    revalidatePath("/statistics");
    revalidatePath("/admin/statistics");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add match event",
    };
  }
}

export async function removeMatchEvent(eventId: string): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.RESULTS_DELETE);

    const event = await db.matchEvent.findUnique({ where: { id: eventId } });
    if (!event) return { success: false, error: "Event not found" };

    await db.matchEvent.delete({ where: { id: eventId } });

    revalidatePath("/admin/matches");
    revalidatePath(`/matches/${event.matchId}`);
    revalidatePath("/statistics");
    revalidatePath("/admin/statistics");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove event",
    };
  }
}

export async function deleteMatch(id: string): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.MATCHES_DELETE);

    const match = await db.match.findUnique({
      where: { id },
      include: { homeTeam: true, awayTeam: true },
    });
    if (!match) return { success: false, error: "Match not found" };

    // Explicitly delete all related data in a transaction to guarantee complete cascading removal
    await db.$transaction([
      db.matchEvent.deleteMany({ where: { matchId: id } }),
      db.matchLineup.deleteMany({ where: { matchId: id } }),
      db.matchPhoto.deleteMany({ where: { matchId: id } }),
      db.match.delete({ where: { id } }),
    ]);

    await createAuditLog({
      action: "DELETE",
      module: "matches",
      recordId: id,
      description: `Deleted match (${match.homeTeam?.name} vs ${match.awayTeam?.name}) and all related data (goals, assists, cards, lineups, photos)`,
    });

    revalidatePath("/admin/matches");
    revalidatePath("/matches");
    revalidatePath(`/matches/${id}`);
    revalidatePath("/statistics");
    revalidatePath("/admin/statistics");
    revalidatePath("/admin/league-tables");
    revalidatePath("/competitions");
    revalidatePath("/teams");
    revalidatePath("/players");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete match",
    };
  }
}

export async function getUpcomingMatches(limit = 5) {
  return db.match.findMany({
    where: {
      status: "SCHEDULED",
      matchDate: { gte: new Date() },
    },
    orderBy: { matchDate: "asc" },
    take: limit,
    include: {
      homeTeam: true,
      awayTeam: true,
      competition: true,
    },
  });
}

export async function getRecentResults(limit = 5) {
  return db.match.findMany({
    where: {
      status: "COMPLETED",
      isPublished: true,
    },
    orderBy: { matchDate: "desc" },
    take: limit,
    include: {
      homeTeam: true,
      awayTeam: true,
      competition: true,
      playerOfMatch: true,
    },
  });
}

export async function setMatchLineup(
  matchId: string,
  teamId: string,
  lineup: {
    playerId: string;
    type: "STARTING" | "SUBSTITUTE";
    position?: string;
    shirtNumber?: number;
  }[]
): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.MATCHES_UPDATE);

    // Remove existing lineup for this team in this match
    await db.matchLineup.deleteMany({
      where: {
        matchId,
        player: { teamPlayers: { some: { teamId } } },
      },
    });

    // Create new lineup
    await db.matchLineup.createMany({
      data: lineup.map((l) => ({
        matchId,
        playerId: l.playerId,
        teamId,
        type: l.type,
        position: l.position,
        shirtNumber: l.shirtNumber,
      })),
    });

    await createAuditLog({
      action: "UPDATE",
      module: "matches",
      recordId: matchId,
      description: `Updated match lineup for team ${teamId}`,
    });

    revalidatePath(`/admin/matches/${matchId}`);
    revalidatePath(`/matches/${matchId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to set lineup",
    };
  }
}
