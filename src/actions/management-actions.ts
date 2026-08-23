"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { createAuditLog } from "@/services/audit-log";
import type { ActionResponse } from "@/types";
import type { ManagementRole } from "@prisma/client";

const managementSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["MANAGER", "CAPTAIN", "VICE_CAPTAIN"]),
  tenure: z.string().min(2, "Tenure is required (e.g., 2014 - 2025)"),
  isCurrent: z.boolean().default(false),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  playerId: z.string().optional(),
  sortOrder: z.number().default(0),
});

async function requirePermission(permission: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!hasPermission(session.user.role, permission as never))
    throw new Error("Insufficient permissions");
  return session;
}

export async function getManagementMembers() {
  try {
    return await db.managementMember.findMany({
      where: { deletedAt: null },
      orderBy: [{ role: "asc" }, { isCurrent: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            slug: true,
            jerseyNumber: true,
            position: true,
            photoUrl: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error in getManagementMembers:", error);
    return [];
  }
}

export async function getManagementMembersByRole(role: ManagementRole) {
  try {
    return await db.managementMember.findMany({
      where: { role, deletedAt: null },
      orderBy: [{ isCurrent: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            slug: true,
            jerseyNumber: true,
            position: true,
            photoUrl: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error in getManagementMembersByRole:", error);
    return [];
  }
}

export async function createManagementMember(data: unknown): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.PLAYERS_CREATE);
    const validated = managementSchema.parse(data);

    const member = await db.managementMember.create({
      data: {
        name: validated.name,
        role: validated.role,
        tenure: validated.tenure,
        isCurrent: validated.isCurrent,
        bio: validated.bio || null,
        photoUrl: validated.photoUrl || null,
        playerId: validated.playerId || null,
        sortOrder: validated.sortOrder,
      },
    });

    await createAuditLog({
      action: "CREATE",
      module: "management",
      recordId: member.id,
      description: `Added ${validated.role}: ${validated.name} (${validated.tenure})`,
    });

    revalidatePath("/management");
    revalidatePath("/admin/management");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create management member",
    };
  }
}

export async function updateManagementMember(id: string, data: unknown): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.PLAYERS_UPDATE);
    const validated = managementSchema.parse(data);

    const member = await db.managementMember.update({
      where: { id },
      data: {
        name: validated.name,
        role: validated.role,
        tenure: validated.tenure,
        isCurrent: validated.isCurrent,
        bio: validated.bio || null,
        photoUrl: validated.photoUrl || null,
        playerId: validated.playerId || null,
        sortOrder: validated.sortOrder,
      },
    });

    await createAuditLog({
      action: "UPDATE",
      module: "management",
      recordId: id,
      description: `Updated ${member.role}: ${member.name}`,
    });

    revalidatePath("/management");
    revalidatePath("/admin/management");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update management member",
    };
  }
}

export async function deleteManagementMember(id: string): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.PLAYERS_DELETE);

    const member = await db.managementMember.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await createAuditLog({
      action: "DELETE",
      module: "management",
      recordId: id,
      description: `Deleted ${member.role}: ${member.name}`,
    });

    revalidatePath("/management");
    revalidatePath("/admin/management");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete management member",
    };
  }
}
