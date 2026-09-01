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

// Helper: raw SQL fallback for player creation when Prisma DMMF is stale
async function rawCreatePlayer(
  playerFields: Record<string, unknown>,
  slug: string,
): Promise<Player> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const dob = playerFields.dateOfBirth ? new Date(playerFields.dateOfBirth as string).toISOString() : null;
  const dj = playerFields.dateJoined ? new Date(playerFields.dateJoined as string).toISOString() : now;

  const esc = (v: string | null | undefined) => v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`;
  const secPos = playerFields.secondaryPosition
    ? `'${String(playerFields.secondaryPosition).replace(/'/g, "''")}'` + '::"PlayerPosition"'
    : 'NULL';

  const sql = `
    INSERT INTO players (
      id, "firstName", "lastName", slug, "jerseyNumber", position, "secondaryPosition",
      "currentCity", "dateOfBirth", nationality, height, weight, "preferredFoot",
      "dateJoined", bio, "photoUrl", status, "isFeatured", "createdAt", "updatedAt"
    ) VALUES (
      '${id}',
      ${esc(playerFields.firstName as string)},
      ${esc(playerFields.lastName as string)},
      ${esc(slug)},
      ${playerFields.jerseyNumber != null ? Number(playerFields.jerseyNumber) : 'NULL'},
      ${esc(playerFields.position as string || 'FORWARD')}::"PlayerPosition",
      ${secPos},
      ${esc(playerFields.currentCity as string | null)},
      ${dob ? `'${dob}'::timestamp` : 'NULL'},
      ${esc(playerFields.nationality as string | null)},
      ${esc(playerFields.height as string | null)},
      ${esc(playerFields.weight as string | null)},
      ${esc(playerFields.preferredFoot as string | null)},
      '${dj}'::timestamp,
      ${esc(playerFields.bio as string | null)},
      ${esc(playerFields.photoUrl as string | null)},
      ${esc(playerFields.status as string || 'ACTIVE')}::"PlayerStatus",
      ${playerFields.isFeatured ? 'true' : 'false'},
      '${now}'::timestamp,
      '${now}'::timestamp
    )
  `;

  await db.$executeRawUnsafe(sql);

  const rows: any[] = await db.$queryRaw`SELECT * FROM players WHERE id = ${id} LIMIT 1`;
  return rows[0] as Player;
}

// Helper: raw SQL fallback for player update when Prisma DMMF is stale
async function rawUpdatePlayer(
  id: string,
  updateData: Record<string, unknown>,
): Promise<Player> {
  // Build SET clauses dynamically for provided fields
  const setClauses: string[] = [];
  const values: unknown[] = [];

  const fieldMap: Record<string, { col: string; cast?: string }> = {
    firstName: { col: '"firstName"' },
    lastName: { col: '"lastName"' },
    slug: { col: 'slug' },
    jerseyNumber: { col: '"jerseyNumber"' },
    position: { col: 'position', cast: '::"PlayerPosition"' },
    secondaryPosition: { col: '"secondaryPosition"', cast: '::"PlayerPosition"' },
    currentCity: { col: '"currentCity"' },
    dateOfBirth: { col: '"dateOfBirth"' },
    nationality: { col: 'nationality' },
    height: { col: 'height' },
    weight: { col: 'weight' },
    preferredFoot: { col: '"preferredFoot"' },
    dateJoined: { col: '"dateJoined"' },
    bio: { col: 'bio' },
    photoUrl: { col: '"photoUrl"' },
    status: { col: 'status', cast: '::"PlayerStatus"' },
    isFeatured: { col: '"isFeatured"' },
  };

  for (const [key, val] of Object.entries(updateData)) {
    const mapping = fieldMap[key];
    if (!mapping) continue;

    if (val === null || val === undefined) {
      setClauses.push(`${mapping.col} = NULL`);
    } else if (mapping.cast && typeof val === 'string') {
      setClauses.push(`${mapping.col} = '${val.replace(/'/g, "''")}'${mapping.cast}`);
    } else if (typeof val === 'boolean') {
      setClauses.push(`${mapping.col} = ${val}`);
    } else if (typeof val === 'number') {
      setClauses.push(`${mapping.col} = ${val}`);
    } else if (val instanceof Date) {
      setClauses.push(`${mapping.col} = '${val.toISOString()}'::timestamp`);
    } else {
      setClauses.push(`${mapping.col} = '${String(val).replace(/'/g, "''")}'`);
    }
  }

  setClauses.push(`"updatedAt" = NOW()`);

  if (setClauses.length > 0) {
    const setStr = setClauses.join(', ');
    await db.$executeRawUnsafe(`UPDATE players SET ${setStr} WHERE id = '${id}'`);
  }

  const rows: any[] = await db.$queryRaw`SELECT * FROM players WHERE id = ${id} LIMIT 1`;
  return rows[0] as Player;
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

    let player: Player;
    try {
      player = await db.player.create({
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
    } catch (err: any) {
      if (err.message && err.message.includes("Unknown argument")) {
        // Stale Prisma client — use raw SQL fallback
        player = await rawCreatePlayer(playerFields, slug);
      } else {
        throw err;
      }
    }

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

    let player: Player;
    try {
      // Try Prisma-native update first
      const txOps: any[] = [
        db.player.update({
          where: { id },
          data: updateData,
        }),
      ];

      if (teamId !== undefined) {
        if (!teamId) {
          txOps.push(db.teamPlayer.deleteMany({ where: { playerId: id } }));
        } else {
          txOps.push(db.teamPlayer.deleteMany({ where: { playerId: id, NOT: { teamId } } }));
          if (isCaptain) {
            txOps.push(db.teamPlayer.updateMany({ where: { teamId, isCaptain: true, NOT: { playerId: id } }, data: { isCaptain: false } }));
          }
          if (isViceCaptain) {
            txOps.push(db.teamPlayer.updateMany({ where: { teamId, isViceCaptain: true, NOT: { playerId: id } }, data: { isViceCaptain: false } }));
          }
          txOps.push(
            db.teamPlayer.upsert({
              where: { teamId_playerId: { teamId, playerId: id } },
              create: { teamId, playerId: id, isCaptain: isCaptain || false, isViceCaptain: isViceCaptain || false },
              update: { isCaptain: isCaptain !== undefined ? isCaptain : false, isViceCaptain: isViceCaptain !== undefined ? isViceCaptain : false },
            })
          );
        }
      }

      const [updated] = await db.$transaction(txOps);
      player = updated;
    } catch (err: any) {
      if (err.message && err.message.includes("Unknown argument")) {
        // Stale Prisma client — use raw SQL fallback for the player update
        player = await rawUpdatePlayer(id, updateData);

        // Handle team operations separately (these use models that haven't changed)
        if (teamId !== undefined) {
          if (!teamId) {
            await db.teamPlayer.deleteMany({ where: { playerId: id } });
          } else {
            await db.teamPlayer.deleteMany({ where: { playerId: id, NOT: { teamId } } });
            if (isCaptain) {
              await db.teamPlayer.updateMany({ where: { teamId, isCaptain: true, NOT: { playerId: id } }, data: { isCaptain: false } });
            }
            if (isViceCaptain) {
              await db.teamPlayer.updateMany({ where: { teamId, isViceCaptain: true, NOT: { playerId: id } }, data: { isViceCaptain: false } });
            }
            await db.teamPlayer.upsert({
              where: { teamId_playerId: { teamId, playerId: id } },
              create: { teamId, playerId: id, isCaptain: isCaptain || false, isViceCaptain: isViceCaptain || false },
              update: { isCaptain: isCaptain !== undefined ? isCaptain : false, isViceCaptain: isViceCaptain !== undefined ? isViceCaptain : false },
            });
          }
        }
      } else {
        throw err;
      }
    }

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
