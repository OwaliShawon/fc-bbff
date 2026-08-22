"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { createUserSchema, updateUserSchema } from "@/lib/validations";
import { createAuditLog } from "@/services/audit-log";
import { hash } from "bcryptjs";
import type { ActionResponse, PaginatedResponse, User } from "@/types";

async function requirePermission(permission: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!hasPermission(session.user.role, permission as never))
    throw new Error("Insufficient permissions");
  return session;
}

export async function getUsers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
}): Promise<PaginatedResponse<Omit<User, "password">>> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = { deletedAt: null };
  if (params?.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params?.role) where.role = params.role;
  if (params?.status) where.status = params.status;

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        lastLogin: true,
        emailVerified: true,
        resetToken: true,
        resetTokenExp: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    }),
    db.user.count({ where }),
  ]);

  return { data: users as Omit<User, "password">[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatar: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createUser(data: unknown): Promise<ActionResponse> {
  try {
    const session = await requirePermission(PERMISSIONS.USERS_CREATE);
    const validated = createUserSchema.parse(data);

    // Only SUPER_ADMIN can create SUPER_ADMIN users
    if (validated.role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only Super Admin can create Super Admin users" };
    }

    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    });
    if (existingUser) {
      return { success: false, error: "Email already exists" };
    }

    const hashedPassword = await hash(validated.password, 12);

    const user = await db.user.create({
      data: {
        ...validated,
        password: hashedPassword,
      },
    });

    await createAuditLog({
      action: "CREATE",
      module: "users",
      recordId: user.id,
      description: `Created user: ${validated.name} (${validated.role})`,
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create user" };
  }
}

export async function updateUser(id: string, data: unknown): Promise<ActionResponse> {
  try {
    const session = await requirePermission(PERMISSIONS.USERS_UPDATE);
    const validated = updateUserSchema.parse(data);

    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) return { success: false, error: "User not found" };

    // Prevent non-SUPER_ADMIN from modifying SUPER_ADMIN
    if (targetUser.role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Cannot modify Super Admin account" };
    }

    // Prevent role escalation to SUPER_ADMIN by non-SUPER_ADMIN
    if (validated.role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only Super Admin can assign Super Admin role" };
    }

    await db.user.update({ where: { id }, data: validated });

    await createAuditLog({
      action: "UPDATE",
      module: "users",
      recordId: id,
      description: `Updated user: ${targetUser.name}`,
      previousValue: { role: targetUser.role, status: targetUser.status },
      newValue: validated,
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update user" };
  }
}

export async function deleteUser(id: string): Promise<ActionResponse> {
  try {
    const session = await requirePermission(PERMISSIONS.USERS_DELETE);

    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) return { success: false, error: "User not found" };

    if (targetUser.role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Cannot delete Super Admin" };
    }

    // Prevent self-deletion
    if (session.user.id === id) {
      return { success: false, error: "Cannot delete your own account" };
    }

    await db.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: "INACTIVE" },
    });

    await createAuditLog({
      action: "DELETE",
      module: "users",
      recordId: id,
      description: `Deleted user: ${targetUser.name}`,
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete user" };
  }
}

export async function toggleUserStatus(id: string): Promise<ActionResponse> {
  try {
    const session = await requirePermission(PERMISSIONS.USERS_UPDATE);

    const user = await db.user.findUnique({ where: { id } });
    if (!user) return { success: false, error: "User not found" };

    if (user.role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Cannot modify Super Admin" };
    }

    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await db.user.update({ where: { id }, data: { status: newStatus } });

    await createAuditLog({
      action: "UPDATE",
      module: "users",
      recordId: id,
      description: `${newStatus === "ACTIVE" ? "Activated" : "Deactivated"} user: ${user.name}`,
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update user" };
  }
}
