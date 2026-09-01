"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { createTeamSchema, updateTeamSchema } from "@/lib/validations";
import { createAuditLog } from "@/services/audit-log";
import { slugify } from "@/lib/utils";
import type { ActionResponse, PaginatedResponse, Team } from "@/types";

async function requirePermission(permission: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!hasPermission(session.user.role, permission as never))
    throw new Error("Insufficient permissions");
  return session;
}

export async function getTeams(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}): Promise<PaginatedResponse<Team>> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = { deletedAt: null };

  if (params?.search) {
    where.name = { contains: params.search, mode: "insensitive" };
  }
  if (params?.status) {
    where.status = params.status;
  }

  const [teams, total] = await Promise.all([
    db.team.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { name: "asc" },
      include: {
        teamPlayers: {
          include: { player: true },
        },
        _count: {
          select: { teamPlayers: true, homeMatches: true, awayMatches: true },
        },
      },
    }),
    db.team.count({ where }),
  ]);

  return { data: teams, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getTeamById(id: string) {
  return db.team.findUnique({
    where: { id, deletedAt: null },
    include: {
      teamPlayers: {
        include: { player: true },
        orderBy: { player: { jerseyNumber: "asc" } },
      },
    },
  });
}

export async function getTeamBySlug(slug: string) {
  return db.team.findUnique({
    where: { slug, deletedAt: null },
    include: {
      teamPlayers: {
        include: { player: true },
        orderBy: { player: { jerseyNumber: "asc" } },
      },
      homeMatches: {
        include: { awayTeam: true, competition: true },
        orderBy: { matchDate: "desc" },
        take: 5,
      },
      awayMatches: {
        include: { homeTeam: true, competition: true },
        orderBy: { matchDate: "desc" },
        take: 5,
      },
    },
  });
}

export async function createTeam(data: unknown): Promise<ActionResponse<Team>> {
  try {
    await requirePermission(PERMISSIONS.TEAMS_CREATE);
    const validated = createTeamSchema.parse(data);

    const baseSlug = slugify(validated.name);
    let slug = baseSlug;
    let counter = 1;
    while (await db.team.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const team = await db.team.create({
      data: { ...validated, slug },
    });

    await createAuditLog({
      action: "CREATE",
      module: "teams",
      recordId: team.id,
      description: `Created team: ${validated.name}`,
      newValue: validated,
    });

    revalidatePath("/admin/teams");
    revalidatePath("/teams");
    return { success: true, data: team };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create team" };
  }
}

export async function updateTeam(id: string, data: unknown): Promise<ActionResponse<Team>> {
  try {
    await requirePermission(PERMISSIONS.TEAMS_UPDATE);
    const validated = updateTeamSchema.parse(data);

    const existing = await db.team.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Team not found" };

    const updateData: Record<string, unknown> = { ...validated };
    if (validated.name && validated.name !== existing.name) {
      const newSlug = slugify(validated.name);
      let slug = newSlug;
      let counter = 1;
      while (await db.team.findFirst({ where: { slug, NOT: { id } } })) {
        slug = `${newSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    const team = await db.team.update({ where: { id }, data: updateData });

    await createAuditLog({
      action: "UPDATE",
      module: "teams",
      recordId: id,
      description: `Updated team: ${team.name}`,
      previousValue: existing,
      newValue: validated,
    });

    revalidatePath("/admin/teams");
    revalidatePath("/teams");
    return { success: true, data: team };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update team" };
  }
}

export async function deleteTeam(id: string): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.TEAMS_DELETE);

    const team = await db.team.findUnique({ where: { id } });
    if (!team) return { success: false, error: "Team not found" };

    await db.team.update({
      where: { id },
      data: { deletedAt: new Date(), status: "INACTIVE" },
    });

    await createAuditLog({
      action: "DELETE",
      module: "teams",
      recordId: id,
      description: `Deleted team: ${team.name}`,
    });

    revalidatePath("/admin/teams");
    revalidatePath("/teams");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete team" };
  }
}

export async function addPlayerToTeam(
  teamId: string,
  playerId: string,
  options?: { isCaptain?: boolean; isViceCaptain?: boolean; transfer?: boolean }
): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.TEAMS_UPDATE);

    // Remove from any other teams to ensure clean transfer
    await db.teamPlayer.deleteMany({
      where: {
        playerId,
        NOT: { teamId },
      },
    });

    // If setting as captain, unset existing captain for this team
    if (options?.isCaptain) {
      await db.teamPlayer.updateMany({
        where: { teamId, isCaptain: true, NOT: { playerId } },
        data: { isCaptain: false },
      });
    }
    // If setting as vice captain, unset existing vice captain for this team
    if (options?.isViceCaptain) {
      await db.teamPlayer.updateMany({
        where: { teamId, isViceCaptain: true, NOT: { playerId } },
        data: { isViceCaptain: false },
      });
    }

    await db.teamPlayer.upsert({
      where: { teamId_playerId: { teamId, playerId } },
      create: {
        teamId,
        playerId,
        isCaptain: options?.isCaptain || false,
        isViceCaptain: options?.isViceCaptain || false,
      },
      update: {
        isCaptain: options?.isCaptain !== undefined ? options.isCaptain : undefined,
        isViceCaptain: options?.isViceCaptain !== undefined ? options.isViceCaptain : undefined,
      },
    });

    const player = await db.player.findUnique({ where: { id: playerId } });
    const team = await db.team.findUnique({ where: { id: teamId } });

    await createAuditLog({
      action: "UPDATE",
      module: "teams",
      recordId: teamId,
      description: `Assigned player ${player ? `${player.firstName} ${player.lastName}` : playerId} to team ${team?.name || teamId}`,
    });

    revalidatePath("/admin/teams");
    revalidatePath("/admin/players");
    revalidatePath("/teams");
    revalidatePath("/players");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add player" };
  }
}

export async function togglePlayerCaptain(
  teamId: string,
  playerId: string,
  isCaptain: boolean
): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.TEAMS_UPDATE);

    if (isCaptain) {
      await db.teamPlayer.updateMany({
        where: { teamId, isCaptain: true },
        data: { isCaptain: false },
      });
    }

    await db.teamPlayer.update({
      where: { teamId_playerId: { teamId, playerId } },
      data: { isCaptain },
    });

    revalidatePath("/admin/teams");
    revalidatePath("/admin/players");
    revalidatePath("/teams");
    revalidatePath("/players");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update captain status" };
  }
}

export async function togglePlayerViceCaptain(
  teamId: string,
  playerId: string,
  isViceCaptain: boolean
): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.TEAMS_UPDATE);

    if (isViceCaptain) {
      await db.teamPlayer.updateMany({
        where: { teamId, isViceCaptain: true },
        data: { isViceCaptain: false },
      });
    }

    await db.teamPlayer.update({
      where: { teamId_playerId: { teamId, playerId } },
      data: { isViceCaptain },
    });

    revalidatePath("/admin/teams");
    revalidatePath("/admin/players");
    revalidatePath("/teams");
    revalidatePath("/players");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update vice captain status" };
  }
}

export async function getTeamSquad(teamId: string) {
  return db.teamPlayer.findMany({
    where: { teamId },
    include: {
      player: true,
    },
    orderBy: [
      { isCaptain: "desc" },
      { isViceCaptain: "desc" },
      { player: { jerseyNumber: "asc" } },
    ],
  });
}

export async function removePlayerFromTeam(
  teamId: string,
  playerId: string
): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.TEAMS_UPDATE);

    await db.teamPlayer.delete({
      where: { teamId_playerId: { teamId, playerId } },
    });

    await createAuditLog({
      action: "UPDATE",
      module: "teams",
      recordId: teamId,
      description: `Removed player from team`,
    });

    revalidatePath("/admin/teams");
    revalidatePath("/admin/players");
    revalidatePath("/teams");
    revalidatePath("/players");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to remove player" };
  }
}

export async function getAllActiveTeams() {
  return db.team.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    include: {
      teamPlayers: { include: { player: true } },
      _count: { select: { teamPlayers: true } },
    },
    orderBy: { name: "asc" },
  });
}
