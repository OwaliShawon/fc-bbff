"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import {
  createCompetitionSchema,
  updateCompetitionSchema,
  createSeasonSchema,
  updateSeasonSchema,
} from "@/lib/validations";
import { createAuditLog } from "@/services/audit-log";
import { slugify } from "@/lib/utils";
import type {
  ActionResponse,
  PaginatedResponse,
  Competition,
  Season,
  LeagueTableEntry,
} from "@/types";

async function requirePermission(permission: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!hasPermission(session.user.role, permission as never))
    throw new Error("Insufficient permissions");
  return session;
}

// ============================================================================
// SEASONS
// ============================================================================

export async function getSeasons(): Promise<Season[]> {
  return db.season.findMany({ orderBy: { startDate: "desc" } });
}

export async function getSeasonById(id: string) {
  return db.season.findUnique({
    where: { id },
    include: { competitions: true },
  });
}

export async function createSeason(data: unknown): Promise<ActionResponse<Season>> {
  try {
    await requirePermission(PERMISSIONS.COMPETITIONS_CREATE);
    const validated = createSeasonSchema.parse(data);

    // If setting as current, unset others
    if (validated.isCurrent) {
      await db.season.updateMany({ data: { isCurrent: false } });
    }

    const season = await db.season.create({
      data: {
        ...validated,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
      },
    });

    await createAuditLog({
      action: "CREATE",
      module: "seasons",
      recordId: season.id,
      description: `Created season: ${validated.name}`,
    });

    revalidatePath("/admin/competitions");
    return { success: true, data: season };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create season" };
  }
}

export async function updateSeason(id: string, data: unknown): Promise<ActionResponse<Season>> {
  try {
    await requirePermission(PERMISSIONS.COMPETITIONS_UPDATE);
    const validated = updateSeasonSchema.parse(data);

    if (validated.isCurrent) {
      await db.season.updateMany({ where: { NOT: { id } }, data: { isCurrent: false } });
    }

    const updateData: Record<string, unknown> = { ...validated };
    if (validated.startDate) updateData.startDate = new Date(validated.startDate);
    if (validated.endDate) updateData.endDate = new Date(validated.endDate);

    const season = await db.season.update({ where: { id }, data: updateData });

    await createAuditLog({
      action: "UPDATE",
      module: "seasons",
      recordId: id,
      description: `Updated season: ${season.name}`,
    });

    revalidatePath("/admin/competitions");
    return { success: true, data: season };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update season" };
  }
}

export async function deleteSeason(id: string): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.COMPETITIONS_DELETE);
    await db.season.delete({ where: { id } });

    await createAuditLog({
      action: "DELETE",
      module: "seasons",
      recordId: id,
      description: `Deleted season`,
    });

    revalidatePath("/admin/competitions");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete season" };
  }
}

// ============================================================================
// COMPETITIONS
// ============================================================================

export async function getCompetitions(params?: {
  page?: number;
  pageSize?: number;
  seasonId?: string;
  status?: string;
}): Promise<PaginatedResponse<Competition>> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (params?.seasonId) where.seasonId = params.seasonId;
  if (params?.status) where.status = params.status;

  const [competitions, total] = await Promise.all([
    db.competition.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        season: true,
        competitionTeams: {
          include: { team: true },
        },
        _count: { select: { matches: true, competitionTeams: true } },
      },
    }),
    db.competition.count({ where }),
  ]);

  return { data: competitions, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getCompetitionById(id: string) {
  return db.competition.findUnique({
    where: { id },
    include: {
      season: true,
      competitionTeams: { include: { team: true } },
      matches: {
        include: { homeTeam: true, awayTeam: true },
        orderBy: { matchDate: "asc" },
      },
    },
  });
}

export async function getCompetitionBySlug(slug: string) {
  return db.competition.findUnique({
    where: { slug },
    include: {
      season: true,
      competitionTeams: { include: { team: true } },
      matches: {
        include: { homeTeam: true, awayTeam: true },
        orderBy: { matchDate: "asc" },
      },
    },
  });
}

export async function createCompetition(data: unknown): Promise<ActionResponse<Competition>> {
  try {
    await requirePermission(PERMISSIONS.COMPETITIONS_CREATE);
    const validated = createCompetitionSchema.parse(data);

    const baseSlug = slugify(validated.name);
    let slug = baseSlug;
    let counter = 1;
    while (await db.competition.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const competition = await db.competition.create({
      data: {
        ...validated,
        slug,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
      },
    });

    await createAuditLog({
      action: "CREATE",
      module: "competitions",
      recordId: competition.id,
      description: `Created competition: ${validated.name}`,
    });

    revalidatePath("/admin/competitions");
    revalidatePath("/competitions");
    return { success: true, data: competition };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create competition" };
  }
}

export async function updateCompetition(id: string, data: unknown): Promise<ActionResponse<Competition>> {
  try {
    await requirePermission(PERMISSIONS.COMPETITIONS_UPDATE);
    const validated = updateCompetitionSchema.parse(data);

    const existing = await db.competition.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Competition not found" };

    const updateData: Record<string, unknown> = { ...validated };
    if (validated.startDate) updateData.startDate = new Date(validated.startDate);
    if (validated.endDate) updateData.endDate = new Date(validated.endDate);
    if (validated.name && validated.name !== existing.name) {
      const newSlug = slugify(validated.name);
      let slug = newSlug;
      let counter = 1;
      while (await db.competition.findFirst({ where: { slug, NOT: { id } } })) {
        slug = `${newSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    const competition = await db.competition.update({ where: { id }, data: updateData });

    await createAuditLog({
      action: "UPDATE",
      module: "competitions",
      recordId: id,
      description: `Updated competition: ${competition.name}`,
    });

    revalidatePath("/admin/competitions");
    revalidatePath("/competitions");
    return { success: true, data: competition };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update competition" };
  }
}

export async function deleteCompetition(id: string): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.COMPETITIONS_DELETE);

    await db.competition.delete({ where: { id } });

    await createAuditLog({
      action: "DELETE",
      module: "competitions",
      recordId: id,
      description: `Deleted competition`,
    });

    revalidatePath("/admin/competitions");
    revalidatePath("/competitions");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete competition" };
  }
}

export async function setCompetitionTeams(
  competitionId: string,
  teamIds: string[]
): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.COMPETITIONS_UPDATE);

    await db.$transaction([
      db.competitionTeam.deleteMany({ where: { competitionId } }),
      ...teamIds.map((teamId) =>
        db.competitionTeam.create({
          data: { competitionId, teamId },
        })
      ),
    ]);

    revalidatePath("/admin/competitions");
    revalidatePath("/competitions");
    revalidatePath("/admin/league-tables");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update competition teams",
    };
  }
}

export async function addTeamToCompetition(
  competitionId: string,
  teamId: string
): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.COMPETITIONS_UPDATE);

    await db.competitionTeam.create({
      data: { competitionId, teamId },
    });

    revalidatePath("/admin/competitions");
    revalidatePath("/competitions");
    revalidatePath("/admin/league-tables");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add team" };
  }
}

export async function removeTeamFromCompetition(
  competitionId: string,
  teamId: string
): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.COMPETITIONS_UPDATE);

    await db.competitionTeam.delete({
      where: { competitionId_teamId: { competitionId, teamId } },
    });

    revalidatePath("/admin/competitions");
    revalidatePath("/competitions");
    revalidatePath("/admin/league-tables");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to remove team" };
  }
}

// ============================================================================
// LEAGUE TABLE CALCULATION
// ============================================================================

export async function getLeagueTable(competitionId: string): Promise<LeagueTableEntry[]> {
  const competition = await db.competition.findUnique({
    where: { id: competitionId },
    include: {
      competitionTeams: { include: { team: true } },
      matches: {
        where: { status: "COMPLETED", isPublished: true },
        include: { homeTeam: true, awayTeam: true },
      },
    },
  });

  if (!competition) return [];

  const tableMap = new Map<string, LeagueTableEntry>();

  // Initialize all teams
  for (const ct of competition.competitionTeams) {
    tableMap.set(ct.teamId, {
      teamId: ct.teamId,
      teamName: ct.team.name,
      teamLogo: ct.team.logoUrl,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      position: 0,
    });
  }

  // Calculate from matches
  for (const match of competition.matches) {
    if (match.homeScore === null || match.awayScore === null) continue;

    const homeEntry = tableMap.get(match.homeTeamId);
    const awayEntry = tableMap.get(match.awayTeamId);

    if (homeEntry) {
      homeEntry.played++;
      homeEntry.goalsFor += match.homeScore;
      homeEntry.goalsAgainst += match.awayScore;

      if (match.homeScore > match.awayScore) {
        homeEntry.won++;
        homeEntry.points += competition.pointsForWin;
      } else if (match.homeScore === match.awayScore) {
        homeEntry.drawn++;
        homeEntry.points += competition.pointsForDraw;
      } else {
        homeEntry.lost++;
        homeEntry.points += competition.pointsForLoss;
      }
      homeEntry.goalDifference = homeEntry.goalsFor - homeEntry.goalsAgainst;
    }

    if (awayEntry) {
      awayEntry.played++;
      awayEntry.goalsFor += match.awayScore;
      awayEntry.goalsAgainst += match.homeScore;

      if (match.awayScore > match.homeScore) {
        awayEntry.won++;
        awayEntry.points += competition.pointsForWin;
      } else if (match.awayScore === match.homeScore) {
        awayEntry.drawn++;
        awayEntry.points += competition.pointsForDraw;
      } else {
        awayEntry.lost++;
        awayEntry.points += competition.pointsForLoss;
      }
      awayEntry.goalDifference = awayEntry.goalsFor - awayEntry.goalsAgainst;
    }
  }

  // Sort: points desc, goal difference desc, goals for desc
  const table = Array.from(tableMap.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  // Assign positions
  table.forEach((entry, index) => {
    entry.position = index + 1;
  });

  return table;
}
