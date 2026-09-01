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
  role: z.enum(["PRESIDENT", "MANAGER", "CAPTAIN", "VICE_CAPTAIN"]),
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
    if ((db as any).managementMember) {
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
    }

    // Direct SQL fallback if runtime Prisma client was cached without managementMember
    const rows: any[] = await db.$queryRaw`
      SELECT 
        m.id, m.name, m.role, m.tenure, m."isCurrent", m.bio, m."photoUrl", m."playerId", m."sortOrder", m."createdAt", m."updatedAt", m."deletedAt",
        p.id as "p_id", p."firstName" as "p_firstName", p."lastName" as "p_lastName", p.slug as "p_slug", p."jerseyNumber" as "p_jerseyNumber", p.position as "p_position", p."photoUrl" as "p_photoUrl"
      FROM management_members m
      LEFT JOIN players p ON m."playerId" = p.id
      WHERE m."deletedAt" IS NULL
      ORDER BY m.role ASC, m."isCurrent" DESC, m."sortOrder" ASC, m."createdAt" DESC
    `;

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      tenure: r.tenure,
      isCurrent: r.isCurrent,
      bio: r.bio,
      photoUrl: r.photoUrl,
      playerId: r.playerId,
      sortOrder: r.sortOrder,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      deletedAt: r.deletedAt,
      player: r.p_id
        ? {
            id: r.p_id,
            firstName: r.p_firstName,
            lastName: r.p_lastName,
            slug: r.p_slug,
            jerseyNumber: r.p_jerseyNumber,
            position: r.p_position,
            photoUrl: r.p_photoUrl,
          }
        : null,
    }));
  } catch (error) {
    console.error("Error in getManagementMembers:", error);
    return [];
  }
}

export async function getManagementMembersByRole(role: ManagementRole) {
  try {
    if ((db as any).managementMember) {
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
    }

    const rows: any[] = await db.$queryRaw`
      SELECT 
        m.id, m.name, m.role, m.tenure, m."isCurrent", m.bio, m."photoUrl", m."playerId", m."sortOrder", m."createdAt", m."updatedAt", m."deletedAt",
        p.id as "p_id", p."firstName" as "p_firstName", p."lastName" as "p_lastName", p.slug as "p_slug", p."jerseyNumber" as "p_jerseyNumber", p.position as "p_position", p."photoUrl" as "p_photoUrl"
      FROM management_members m
      LEFT JOIN players p ON m."playerId" = p.id
      WHERE m.role = ${role}::"ManagementRole" AND m."deletedAt" IS NULL
      ORDER BY m."isCurrent" DESC, m."sortOrder" ASC, m."createdAt" DESC
    `;

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      tenure: r.tenure,
      isCurrent: r.isCurrent,
      bio: r.bio,
      photoUrl: r.photoUrl,
      playerId: r.playerId,
      sortOrder: r.sortOrder,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      deletedAt: r.deletedAt,
      player: r.p_id
        ? {
            id: r.p_id,
            firstName: r.p_firstName,
            lastName: r.p_lastName,
            slug: r.p_slug,
            jerseyNumber: r.p_jerseyNumber,
            position: r.p_position,
            photoUrl: r.p_photoUrl,
          }
        : null,
    }));
  } catch (error) {
    console.error("Error in getManagementMembersByRole:", error);
    return [];
  }
}

export async function createManagementMember(data: unknown): Promise<ActionResponse> {
  try {
    const session = await requirePermission(PERMISSIONS.PLAYERS_CREATE);
    const validated = managementSchema.parse(data);

    let memberId: string;
    if ((db as any).managementMember) {
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
      memberId = member.id;
    } else {
      const generatedId = crypto.randomUUID();
      await db.$executeRaw`
        INSERT INTO management_members (id, name, role, tenure, "isCurrent", bio, "photoUrl", "playerId", "sortOrder", "createdAt", "updatedAt")
        VALUES (${generatedId}, ${validated.name}, ${validated.role}::"ManagementRole", ${validated.tenure}, ${validated.isCurrent}, ${validated.bio || null}, ${validated.photoUrl || null}, ${validated.playerId || null}, ${validated.sortOrder}, NOW(), NOW())
      `;
      memberId = generatedId;
    }

    createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      module: "management",
      recordId: memberId,
      description: `Added ${validated.role}: ${validated.name} (${validated.tenure})`,
    }).catch((err) => console.error("Audit log error:", err));

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
    const session = await requirePermission(PERMISSIONS.PLAYERS_UPDATE);
    const validated = managementSchema.parse(data);

    if ((db as any).managementMember) {
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

      createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        module: "management",
        recordId: id,
        description: `Updated ${member.role}: ${member.name}`,
      }).catch((err) => console.error("Audit log error:", err));
    } else {
      await db.$executeRaw`
        UPDATE management_members
        SET name = ${validated.name},
            role = ${validated.role}::"ManagementRole",
            tenure = ${validated.tenure},
            "isCurrent" = ${validated.isCurrent},
            bio = ${validated.bio || null},
            "photoUrl" = ${validated.photoUrl || null},
            "playerId" = ${validated.playerId || null},
            "sortOrder" = ${validated.sortOrder},
            "updatedAt" = NOW()
        WHERE id = ${id}
      `;

      createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        module: "management",
        recordId: id,
        description: `Updated ${validated.role}: ${validated.name}`,
      }).catch((err) => console.error("Audit log error:", err));
    }

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
    const session = await requirePermission(PERMISSIONS.PLAYERS_DELETE);

    if ((db as any).managementMember) {
      const member = await db.managementMember.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        module: "management",
        recordId: id,
        description: `Deleted ${member.role}: ${member.name}`,
      }).catch((err) => console.error("Audit log error:", err));
    } else {
      await db.$executeRaw`
        UPDATE management_members
        SET "deletedAt" = NOW()
        WHERE id = ${id}
      `;

      createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        module: "management",
        recordId: id,
        description: `Deleted management record ${id}`,
      }).catch((err) => console.error("Audit log error:", err));
    }

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
