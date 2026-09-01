"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { createPlayerSchema, updatePlayerSchema } from "@/lib/validations";
import { createAuditLog } from "@/services/audit-log";
import { slugify } from "@/lib/utils";
import type { ActionResponse, PaginatedResponse, Player } from "@/types";

async function requirePermission(permission: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (!hasPermission(session.user.role, permission as never)) {
    throw new Error("Insufficient permissions");
  }
  return session;
}

export async function getPlayers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  position?: string;
  teamId?: string;
}): Promise<PaginatedResponse<Player>> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {
    deletedAt: null,
  };

  if (params?.search) {
    where.OR = [
      { firstName: { contains: params.search, mode: "insensitive" } },
      { lastName: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params?.status) {
    where.status = params.status;
  }

  if (params?.position) {
    where.position = params.position;
  }

  if (params?.teamId) {
    where.teamPlayers = {
      some: { teamId: params.teamId },
    };
  }

  const [players, total] = await Promise.all([
    db.player.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        teamPlayers: {
          include: { team: true },
        },
      },
    }),
    db.player.count({ where }),
  ]);

  return {
    data: players,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPlayerById(id: string) {
  return db.player.findUnique({
    where: { id, deletedAt: null },
    include: {
      teamPlayers: {
        include: { team: true },
      },
      matchLineups: {
        include: {
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
              competition: true,
            },
          },
        },
        orderBy: { match: { matchDate: "desc" } },
        take: 10,
      },
      matchEvents: {
        include: {
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
            },
          },
        },
      },
      playerOfMatch: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
    },
  });
}

export async function getPlayerBySlug(slug: string) {
  return db.player.findUnique({
    where: { slug, deletedAt: null },
    include: {
      teamPlayers: {
        include: { team: true },
      },
      matchLineups: {
        include: {
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
              competition: true,
            },
          },
        },
        orderBy: { match: { matchDate: "desc" } },
        take: 10,
      },
      matchEvents: {
        include: {
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
            },
          },
        },
      },
      playerOfMatch: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
    },
  });
}

export async function createPlayer(
  data: unknown
): Promise<ActionResponse<Player>> {
  try {
    const session = await requirePermission(PERMISSIONS.PLAYERS_CREATE);
    const validated = createPlayerSchema.parse(data);
    const { teamId, isCaptain, isViceCaptain, ...playerFields } = validated;

    const baseSlug = slugify(`${playerFields.firstName}-${playerFields.lastName}`);
    let slug = baseSlug;
    let counter = 1;
    while (await db.player.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const player = await db.player.create({
      data: {
        ...playerFields,
        slug,
        dateOfBirth: playerFields.dateOfBirth
          ? new Date(playerFields.dateOfBirth)
          : null,
        dateJoined: playerFields.dateJoined
          ? new Date(playerFields.dateJoined)
          : new Date(),
      },
    });

    if (teamId) {
      const teamOps: any[] = [];
      if (isCaptain) {
        teamOps.push(
          db.teamPlayer.updateMany({
            where: { teamId, isCaptain: true },
            data: { isCaptain: false },
          })
        );
      }
      if (isViceCaptain) {
        teamOps.push(
          db.teamPlayer.updateMany({
            where: { teamId, isViceCaptain: true },
            data: { isViceCaptain: false },
          })
        );
      }

      teamOps.push(
        db.teamPlayer.create({
          data: {
            teamId,
            playerId: player.id,
            isCaptain: isCaptain || false,
            isViceCaptain: isViceCaptain || false,
          },
        })
      );

      await db.$transaction(teamOps);
    }

    createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      module: "players",
      recordId: player.id,
      description: `Created player: ${playerFields.firstName} ${playerFields.lastName}${teamId ? " and assigned to team" : ""}`,
      newValue: validated,
    }).catch((err) => console.error("Audit log error:", err));

    revalidatePath("/admin/players");
    revalidatePath("/admin/teams");
    revalidatePath("/players");
    revalidatePath("/teams");

    return { success: true, data: player };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create player",
    };
  }
}

export async function updatePlayer(
  id: string,
  data: unknown
): Promise<ActionResponse<Player>> {
  try {
    const session = await requirePermission(PERMISSIONS.PLAYERS_UPDATE);
    const validated = updatePlayerSchema.parse(data);
    const { teamId, isCaptain, isViceCaptain, ...playerFields } = validated;

    const existing = await db.player.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Player not found" };
    }

    const updateData: Record<string, unknown> = { ...playerFields };
    if (playerFields.dateOfBirth !== undefined) {
      updateData.dateOfBirth = playerFields.dateOfBirth
        ? new Date(playerFields.dateOfBirth)
        : null;
    }
    if (playerFields.dateJoined !== undefined) {
      updateData.dateJoined = playerFields.dateJoined
        ? new Date(playerFields.dateJoined)
        : existing.dateJoined;
    }

    // Only recalculate slug if name actually changed
    const nameChanged =
      (playerFields.firstName !== undefined && playerFields.firstName !== existing.firstName) ||
      (playerFields.lastName !== undefined && playerFields.lastName !== existing.lastName);

    if (nameChanged) {
      const firstName = playerFields.firstName ?? existing.firstName;
      const lastName = playerFields.lastName ?? existing.lastName;
      const newSlug = slugify(`${firstName}-${lastName}`);
      if (newSlug !== existing.slug) {
        let slug = newSlug;
        let counter = 1;
        while (
          await db.player.findFirst({ where: { slug, NOT: { id } } })
        ) {
          slug = `${newSlug}-${counter}`;
          counter++;
        }
        updateData.slug = slug;
      }
    }

    const txOps: any[] = [
      db.player.update({
        where: { id },
        data: updateData,
      }),
    ];

    if (teamId !== undefined) {
      if (!teamId) {
        // Remove from all teams
        txOps.push(
          db.teamPlayer.deleteMany({
            where: { playerId: id },
          })
        );
      } else {
        // Remove from other teams
        txOps.push(
          db.teamPlayer.deleteMany({
            where: { playerId: id, NOT: { teamId } },
          })
        );

        if (isCaptain) {
          txOps.push(
            db.teamPlayer.updateMany({
              where: { teamId, isCaptain: true, NOT: { playerId: id } },
              data: { isCaptain: false },
            })
          );
        }
        if (isViceCaptain) {
          txOps.push(
            db.teamPlayer.updateMany({
              where: { teamId, isViceCaptain: true, NOT: { playerId: id } },
              data: { isViceCaptain: false },
            })
          );
        }

        txOps.push(
          db.teamPlayer.upsert({
            where: { teamId_playerId: { teamId, playerId: id } },
            create: {
              teamId,
              playerId: id,
              isCaptain: isCaptain || false,
              isViceCaptain: isViceCaptain || false,
            },
            update: {
              isCaptain: isCaptain !== undefined ? isCaptain : false,
              isViceCaptain: isViceCaptain !== undefined ? isViceCaptain : false,
            },
          })
        );
      }
    }

    const [player] = await db.$transaction(txOps);

    createAuditLog({
      userId: session.user.id,
      action: "UPDATE",
      module: "players",
      recordId: id,
      description: `Updated player: ${player.firstName} ${player.lastName}`,
      previousValue: existing,
      newValue: validated,
    }).catch((err) => console.error("Audit log error:", err));

    revalidatePath("/admin/players");
    revalidatePath("/admin/teams");
    revalidatePath("/players");
    revalidatePath("/teams");
    if (player.slug) {
      revalidatePath(`/players/${player.slug}`);
    }

    return { success: true, data: player };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update player",
    };
  }
}

export async function deletePlayer(id: string): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.PLAYERS_DELETE);

    const player = await db.player.findUnique({ where: { id } });
    if (!player) {
      return { success: false, error: "Player not found" };
    }

    // Soft delete
    await db.player.update({
      where: { id },
      data: { deletedAt: new Date(), status: "INACTIVE" },
    });

    await createAuditLog({
      action: "DELETE",
      module: "players",
      recordId: id,
      description: `Deleted player: ${player.firstName} ${player.lastName}`,
    });

    revalidatePath("/admin/players");
    revalidatePath("/players");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete player",
    };
  }
}

export async function getFeaturedPlayers() {
  return db.player.findMany({
    where: {
      isFeatured: true,
      status: "ACTIVE",
      deletedAt: null,
    },
    include: {
      teamPlayers: {
        include: { team: true },
      },
    },
    take: 6,
  });
}

export async function getAllActivePlayers() {
  return db.player.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
    },
    include: {
      teamPlayers: {
        include: { team: true },
      },
    },
    orderBy: [{ position: "asc" }, { jerseyNumber: "asc" }],
  });
}
