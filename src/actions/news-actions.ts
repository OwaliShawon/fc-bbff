"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { createNewsSchema, updateNewsSchema, newsCategorySchema } from "@/lib/validations";
import { createAuditLog } from "@/services/audit-log";
import { slugify } from "@/lib/utils";
import type { ActionResponse, PaginatedResponse, News, NewsCategory } from "@/types";

async function requirePermission(permission: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!hasPermission(session.user.role, permission as never))
    throw new Error("Insufficient permissions");
  return session;
}

export async function getNews(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  categoryId?: string;
}): Promise<PaginatedResponse<News>> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = { deletedAt: null };
  if (params?.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { content: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params?.status) where.status = params.status;
  if (params?.categoryId) where.categoryId = params.categoryId;

  const [news, total] = await Promise.all([
    db.news.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        author: { select: { id: true, name: true, avatar: true } },
      },
    }),
    db.news.count({ where }),
  ]);

  return { data: news, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getNewsBySlug(slug: string) {
  return db.news.findUnique({
    where: { slug, deletedAt: null },
    include: {
      category: true,
      author: { select: { id: true, name: true, avatar: true } },
    },
  });
}

export async function getNewsById(id: string) {
  return db.news.findUnique({
    where: { id, deletedAt: null },
    include: {
      category: true,
      author: { select: { id: true, name: true, avatar: true } },
    },
  });
}

export async function createNews(data: unknown): Promise<ActionResponse<News>> {
  try {
    const session = await requirePermission(PERMISSIONS.NEWS_CREATE);
    const validated = createNewsSchema.parse(data);

    const baseSlug = slugify(validated.title);
    let slug = baseSlug;
    let counter = 1;
    while (await db.news.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const news = await db.news.create({
      data: {
        ...validated,
        slug,
        authorId: session.user.id,
        publishedAt:
          validated.status === "PUBLISHED" ? new Date() : validated.publishedAt ? new Date(validated.publishedAt) : null,
        scheduledAt: validated.scheduledAt ? new Date(validated.scheduledAt) : null,
      },
    });

    await createAuditLog({
      action: "CREATE",
      module: "news",
      recordId: news.id,
      description: `Created news article: ${validated.title}`,
    });

    revalidatePath("/admin/news");
    revalidatePath("/news");
    return { success: true, data: news };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create news" };
  }
}

export async function updateNews(id: string, data: unknown): Promise<ActionResponse<News>> {
  try {
    await requirePermission(PERMISSIONS.NEWS_UPDATE);
    const validated = updateNewsSchema.parse(data);

    const existing = await db.news.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Article not found" };

    const updateData: Record<string, unknown> = { ...validated };

    if (validated.title && validated.title !== existing.title) {
      const newSlug = slugify(validated.title);
      let slug = newSlug;
      let counter = 1;
      while (await db.news.findFirst({ where: { slug, NOT: { id } } })) {
        slug = `${newSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    if (validated.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      updateData.publishedAt = new Date();
    }
    if (validated.scheduledAt) {
      updateData.scheduledAt = new Date(validated.scheduledAt);
    }

    const news = await db.news.update({ where: { id }, data: updateData });

    await createAuditLog({
      action: "UPDATE",
      module: "news",
      recordId: id,
      description: `Updated news: ${news.title}`,
    });

    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath(`/news/${news.slug}`);
    return { success: true, data: news };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update news" };
  }
}

export async function deleteNews(id: string): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.NEWS_DELETE);

    const news = await db.news.findUnique({ where: { id } });
    if (!news) return { success: false, error: "Article not found" };

    await db.news.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await createAuditLog({
      action: "DELETE",
      module: "news",
      recordId: id,
      description: `Deleted news: ${news.title}`,
    });

    revalidatePath("/admin/news");
    revalidatePath("/news");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete news" };
  }
}

// ============================================================================
// NEWS CATEGORIES
// ============================================================================

export async function getNewsCategories(): Promise<NewsCategory[]> {
  return db.newsCategory.findMany({ orderBy: { name: "asc" } });
}

export async function createNewsCategory(data: unknown): Promise<ActionResponse<NewsCategory>> {
  try {
    await requirePermission(PERMISSIONS.NEWS_CREATE);
    const validated = newsCategorySchema.parse(data);

    const slug = slugify(validated.name);
    const category = await db.newsCategory.create({
      data: { name: validated.name, slug },
    });

    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create category" };
  }
}

export async function deleteNewsCategory(id: string): Promise<ActionResponse> {
  try {
    await requirePermission(PERMISSIONS.NEWS_DELETE);
    await db.newsCategory.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete category" };
  }
}

// ============================================================================
// PUBLIC QUERIES
// ============================================================================

export async function getLatestNews(limit = 6) {
  return db.news.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      category: true,
      author: { select: { id: true, name: true, avatar: true } },
    },
  });
}

export async function getRelatedNews(newsId: string, categoryId: string | null, limit = 4) {
  return db.news.findMany({
    where: {
      id: { not: newsId },
      status: "PUBLISHED",
      deletedAt: null,
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      category: true,
      author: { select: { id: true, name: true, avatar: true } },
    },
  });
}
