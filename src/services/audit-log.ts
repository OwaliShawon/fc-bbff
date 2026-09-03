"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type AuditLogInput = {
  userId?: string;
  action: string;
  module: string;
  recordId?: string;
  description?: string;
  previousValue?: unknown;
  newValue?: unknown;
};

/**
 * Creates an audit log entry for the current authenticated user.
 */
export async function createAuditLog(input: AuditLogInput) {
  try {
    let userId = input.userId;
    if (!userId) {
      const session = await auth();
      userId = session?.user?.id;
    }
    if (!userId) return;

    const userExists = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!userExists) return;

    await db.auditLog.create({
      data: {
        userId,
        action: input.action,
        module: input.module,
        recordId: input.recordId,
        description: input.description,
        previousValue: input.previousValue
          ? JSON.stringify(input.previousValue)
          : null,
        newValue: input.newValue ? JSON.stringify(input.newValue) : null,
      },
    });
  } catch (error) {
    // Audit logging should never break the main operation
    console.error("Failed to create audit log:", error);
  }
}

export async function getAuditLogs(limit = 50) {
  try {
    return await db.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  } catch (error) {
    console.error("Failed to get audit logs:", error);
    return [];
  }
}
