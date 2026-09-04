"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { createVenueSchema, updateVenueSchema } from "@/lib/validations";
import { createAuditLog } from "@/services/audit-log";
import type { ActionResponse, PaginatedResponse, Venue } from "@/types";

async function requirePermission(permission: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!hasPermission(session.user.role, permission as never))
    throw new Error("Insufficient permissions");
  return session;
}

export async function getVenues(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  isHomeVenue?: boolean;
}): Promise<PaginatedResponse<Venue>> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const skip = (page - 1) * pageSize;

  try {
    const where: Record<string, unknown> = { deletedAt: null };
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { city: { contains: params.search, mode: "insensitive" } },
        { address: { contains: params.search, mode: "insensitive" } },
      ];
    }
    if (typeof params?.isHomeVenue === "boolean") {
      where.isHomeVenue = params.isHomeVenue;
    }

    const [venues, total] = await Promise.all([
      db.venue.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ isHomeVenue: "desc" }, { name: "asc" }],
      }),
      db.venue.count({ where }),
    ]);

    return { data: venues, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  } catch (error) {
    console.error("Error in getVenues:", error);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }
}

export async function getAllVenues(): Promise<Venue[]> {
  try {
    return await db.venue.findMany({
      where: { deletedAt: null },
      orderBy: [{ isHomeVenue: "desc" }, { name: "asc" }],
    });
  } catch (error) {
    console.error("Error in getAllVenues:", error);
    return [];
  }
}

export async function getVenueById(id: string): Promise<Venue | null> {
  return db.venue.findUnique({
    where: { id, deletedAt: null },
  });
}

export async function createVenue(data: unknown): Promise<ActionResponse<Venue>> {
  try {
    await requirePermission(PERMISSIONS.VENUES_CREATE);
    const validated = createVenueSchema.parse(data);

    const venue = await db.venue.create({
      data: {
        name: validated.name,
        city: validated.city || null,
        address: validated.address || null,
        turfType: validated.turfType || null,
        capacity: validated.capacity || null,
        photoUrl: validated.photoUrl || null,
        notes: validated.notes || null,
        isHomeVenue: validated.isHomeVenue ?? false,
      },
    });

    await createAuditLog({
      action: "CREATE",
      module: "venues",
      recordId: venue.id,
      description: `Created venue: ${venue.name}`,
    });

    revalidatePath("/admin/venues");
    revalidatePath("/admin/matches");
    revalidatePath("/admin/events");
    return { success: true, data: venue };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create venue" };
  }
}

export async function updateVenue(id: string, data: unknown): Promise<ActionResponse<Venue>> {
  try {
    await requirePermission(PERMISSIONS.VENUES_UPDATE);
    const validated = updateVenueSchema.parse(data);

    const existing = await db.venue.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Venue not found" };

    const updateData: Record<string, unknown> = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.city !== undefined) updateData.city = validated.city || null;
    if (validated.address !== undefined) updateData.address = validated.address || null;
    if (validated.turfType !== undefined) updateData.turfType = validated.turfType || null;
    if (validated.capacity !== undefined) updateData.capacity = validated.capacity || null;
    if (validated.photoUrl !== undefined) updateData.photoUrl = validated.photoUrl || null;
    if (validated.notes !== undefined) updateData.notes = validated.notes || null;
    if (validated.isHomeVenue !== undefined) updateData.isHomeVenue = validated.isHomeVenue;

    const venue = await db.venue.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      action: "UPDATE",
      module: "venues",
      recordId: id,
      description: `Updated venue: ${venue.name}`,
    });

    revalidatePath("/admin/venues");
    revalidatePath("/admin/matches");
    revalidatePath("/admin/events");
    return { success: true, data: venue };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update venue" };
  }
}

export async function deleteVenue(id: string): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.VENUES_DELETE);

    const venue = await db.venue.findUnique({ where: { id } });
    if (!venue) return { success: false, error: "Venue not found" };

    await db.venue.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await createAuditLog({
      action: "DELETE",
      module: "venues",
      recordId: id,
      description: `Deleted venue: ${venue.name}`,
    });

    revalidatePath("/admin/venues");
    revalidatePath("/admin/matches");
    revalidatePath("/admin/events");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete venue" };
  }
}
