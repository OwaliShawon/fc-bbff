"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { createAuditLog } from "@/services/audit-log";
import type { ActionResponse } from "@/types";

export async function getMediaFiles() {
  try {
    return await db.media.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return [];
  }
}

export async function createMediaFile(data: {
  title: string;
  url: string;
  type?: string;
  size?: number;
}): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const media = await db.media.create({
      data: {
        fileName: data.title,
        url: data.url,
        fileType: data.type || "image/jpeg",
        fileSize: data.size || 0,
        uploadedById: session.user.id,
      },
    });

    await createAuditLog({
      action: "CREATE",
      module: "media",
      recordId: media.id,
      description: `Uploaded media: ${data.title}`,
    });

    revalidatePath("/admin/media");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add media",
    };
  }
}

export async function deleteMediaFile(id: string): Promise<ActionResponse> {
  try {
    await db.media.delete({ where: { id } });
    revalidatePath("/admin/media");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete media",
    };
  }
}
