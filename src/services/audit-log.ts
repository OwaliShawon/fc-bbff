"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type AuditLogInput = {
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
    const session = await auth();
    if (!session?.user?.id) return;

    await db.auditLog.create({
      data: {
        userId: session.user.id,
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
