"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { createEventSchema, updateEventSchema } from "@/lib/validations";
import { createAuditLog } from "@/services/audit-log";
import { slugify } from "@/lib/utils";
import type { ActionResponse, PaginatedResponse, Event } from "@/types";

async function requirePermission(permission: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!hasPermission(session.user.role, permission as never))
    throw new Error("Insufficient permissions");
  return session;
}

export async function getEvents(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  eventType?: string;
}): Promise<PaginatedResponse<Event>> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = { deletedAt: null };
  if (params?.search) {
    where.title = { contains: params.search, mode: "insensitive" };
  }
  if (params?.status) where.status = params.status;
  if (params?.eventType) where.eventType = params.eventType;

  const [events, total] = await Promise.all([
    db.event.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { eventDate: "desc" },
      include: { gallery: true },
    }),
    db.event.count({ where }),
  ]);

  return { data: events, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getEventById(id: string) {
  return db.event.findUnique({
    where: { id, deletedAt: null },
    include: { gallery: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getEventBySlug(slug: string) {
  return db.event.findUnique({
    where: { slug, deletedAt: null },
    include: { gallery: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function createEvent(data: unknown): Promise<ActionResponse<Event>> {
  try {
    await requirePermission(PERMISSIONS.EVENTS_CREATE);
    const validated = createEventSchema.parse(data);

    const baseSlug = slugify(validated.title);
    let slug = baseSlug;
    let counter = 1;
    while (await db.event.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const event = await db.event.create({
      data: {
        ...validated,
        slug,
        eventDate: new Date(validated.eventDate),
        registrationUrl: validated.registrationUrl || null,
      },
    });

    await createAuditLog({
      action: "CREATE",
      module: "events",
      recordId: event.id,
      description: `Created event: ${validated.title}`,
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true, data: event };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create event" };
  }
}

export async function updateEvent(id: string, data: unknown): Promise<ActionResponse<Event>> {
  try {
    await requirePermission(PERMISSIONS.EVENTS_UPDATE);
    const validated = updateEventSchema.parse(data);

    const existing = await db.event.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Event not found" };

    const updateData: Record<string, unknown> = { ...validated };
    if (validated.eventDate) updateData.eventDate = new Date(validated.eventDate);
    if (validated.registrationUrl !== undefined) {
      updateData.registrationUrl = validated.registrationUrl || null;
    }
    if (validated.title && validated.title !== existing.title) {
      const newSlug = slugify(validated.title);
      let slug = newSlug;
      let counter = 1;
      while (await db.event.findFirst({ where: { slug, NOT: { id } } })) {
        slug = `${newSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    const event = await db.event.update({ where: { id }, data: updateData });

    await createAuditLog({
      action: "UPDATE",
      module: "events",
      recordId: id,
      description: `Updated event: ${event.title}`,
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true, data: event };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update event" };
  }
}

export async function deleteEvent(id: string): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.EVENTS_DELETE);

    const event = await db.event.findUnique({ where: { id } });
    if (!event) return { success: false, error: "Event not found" };

    await db.event.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await createAuditLog({
      action: "DELETE",
      module: "events",
      recordId: id,
      description: `Deleted event: ${event.title}`,
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete event" };
  }
}

export async function getUpcomingEvents(limit = 5) {
  return db.event.findMany({
    where: {
      status: { in: ["UPCOMING", "ONGOING"] },
      isPublished: true,
      deletedAt: null,
      eventDate: { gte: new Date() },
    },
    orderBy: { eventDate: "asc" },
    take: limit,
  });
}

export async function getPastEvents(limit = 10) {
  return db.event.findMany({
    where: {
      status: "COMPLETED",
      isPublished: true,
      deletedAt: null,
    },
    orderBy: { eventDate: "desc" },
    take: limit,
    include: { gallery: true },
  });
}
