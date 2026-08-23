"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { createAuditLog } from "@/services/audit-log";
import type { ActionResponse, SiteSettingsMap } from "@/types";

async function requirePermission(permission: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!hasPermission(session.user.role, permission as never))
    throw new Error("Insufficient permissions");
  return session;
}

export async function getSiteSettings(): Promise<SiteSettingsMap> {
  const settings = await db.siteSetting.findMany();
  const map: Record<string, string> = {};
  for (const setting of settings) {
    map[setting.key] = setting.value;
  }
  return {
    clubName: map.clubName || "FC BBFF",
    clubMotto: map.clubMotto || "Excellence in Football",
    clubLogo: map.clubLogo || "",
    favicon: map.favicon || "",
    contactEmail: map.contactEmail || "",
    contactPhone: map.contactPhone || "",
    address: map.address || "",
    aboutText: map.aboutText || "",
    footerText: map.footerText || "",
    facebookUrl: map.facebookUrl || "",
    twitterUrl: map.twitterUrl || "",
    instagramUrl: map.instagramUrl || "",
    youtubeUrl: map.youtubeUrl || "",
    clubHistory: map.clubHistory || "",
    mission: map.mission || "",
    vision: map.vision || "",
    clubValues: map.clubValues || "",
    ...map,
  };
}

export async function updateSiteSettings(
  data: Record<string, string>
): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.SETTINGS_UPDATE);

    for (const [key, value] of Object.entries(data)) {
      await db.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    await createAuditLog({
      action: "UPDATE",
      module: "settings",
      description: `Updated site settings`,
      newValue: data,
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update settings",
    };
  }
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export async function getDashboardStats() {
  const [
    totalPlayers,
    activePlayers,
    totalTeams,
    upcomingMatches,
    completedMatches,
    upcomingEvents,
    publishedNews,
    totalUsers,
  ] = await Promise.all([
    db.player.count({ where: { deletedAt: null } }),
    db.player.count({ where: { status: "ACTIVE", deletedAt: null } }),
    db.team.count({ where: { deletedAt: null } }),
    db.match.count({ where: { status: "SCHEDULED" } }),
    db.match.count({ where: { status: "COMPLETED" } }),
    db.event.count({
      where: { status: { in: ["UPCOMING", "ONGOING"] }, deletedAt: null },
    }),
    db.news.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    db.user.count({ where: { deletedAt: null } }),
  ]);

  return {
    totalPlayers,
    activePlayers,
    totalTeams,
    upcomingMatches,
    completedMatches,
    upcomingEvents,
    publishedNews,
    totalUsers,
  };
}

export async function getRecentAuditLogs(limit = 10) {
  return db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

// ============================================================================
// PLAYER STATISTICS
// ============================================================================

export async function getPlayerStatistics(params?: {
  seasonId?: string;
  competitionId?: string;
  teamId?: string;
}) {
  const matchWhere: Record<string, unknown> = {
    status: "COMPLETED",
    isPublished: true,
  };
  if (params?.seasonId) matchWhere.seasonId = params.seasonId;
  if (params?.competitionId) matchWhere.competitionId = params.competitionId;

  const playerWhere: Record<string, unknown> = {
    deletedAt: null,
  };
  if (params?.teamId) {
    playerWhere.teamPlayers = { some: { teamId: params.teamId } };
  }

  const players = await db.player.findMany({
    where: playerWhere,
    include: {
      teamPlayers: { include: { team: true } },
      matchEvents: {
        where: { match: matchWhere },
        include: { match: true },
      },
      matchLineups: {
        where: { match: matchWhere },
        include: { match: true },
      },
      playerOfMatch: {
        where: matchWhere,
      },
    },
  });

  return players.map((player) => {
    const goals = player.matchEvents.filter(
      (e) => e.eventType === "GOAL" || e.eventType === "PENALTY"
    ).length;
    const assists = player.matchEvents.filter(
      (e) => e.eventType === "ASSIST"
    ).length;
    const yellowCards = player.matchEvents.filter(
      (e) => e.eventType === "YELLOW_CARD"
    ).length;
    const redCards = player.matchEvents.filter(
      (e) => e.eventType === "RED_CARD"
    ).length;
    const starts = player.matchLineups.filter(
      (l) => l.type === "STARTING"
    ).length;
    const matchesPlayed = player.matchLineups.length;

    return {
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      playerPhoto: player.photoUrl,
      playerSlug: player.slug,
      position: player.position,
      jerseyNumber: player.jerseyNumber,
      teamName:
        player.teamPlayers[0]?.team?.name || null,
      matchesPlayed,
      starts,
      goals,
      assists,
      yellowCards,
      redCards,
      playerOfMatchAwards: player.playerOfMatch.length,
      minutesPlayed: 0, // Would need minute tracking for precise values
    };
  });
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

export async function getAuditLogs(params?: {
  page?: number;
  pageSize?: number;
  userId?: string;
  module?: string;
  action?: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only Super Admin can view audit logs");
  }

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (params?.userId) where.userId = params.userId;
  if (params?.module) where.module = params.module;
  if (params?.action) where.action = params.action;

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    db.auditLog.count({ where }),
  ]);

  return {
    data: logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
