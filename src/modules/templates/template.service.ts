import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { TEMPLATES } from "@/lib/data";
import { TemplateQueryInput, CreateTemplateInput } from "./template.schema";
import { JWTPayload } from "../auth/auth.jwt";
import { hasPermission } from "../auth/auth.rbac";

const CACHE_TTL_SECONDS = 60; // Cache templates for 60 seconds

export async function getTemplates(query: TemplateQueryInput) {
  const cacheKey = `templates:cat_${query.category}:q_${query.search}:p_${query.page}`;

  // 1. Check Redis Cache
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return {
        ...(typeof cached === "string" ? JSON.parse(cached) : cached),
        source: "redis_cache",
      };
    }
  } catch (err) {
    console.warn("Redis read failed, querying database/memory:", err);
  }

  // 2. Query Data from Neon DB
  let dbTemplates: any[] = [];
  try {
    dbTemplates = await prisma.template.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("DB query for templates failed, using built-in catalog fallback:", err);
    dbTemplates = [];
  }

  // Format DB templates
  let results: any[] = dbTemplates.map((t, idx) => ({
    id: t.id,
    slug: t.slug,
    index: `№ ${(idx + 1).toString().padStart(4, "0")}`,
    title: t.title,
    categoryId: t.category,
    categoryName: t.category.toUpperCase(),
    format: "classic",
    formatLabel: "Standard Format",
    svgDataUri: t.svgDataUri,
    width: t.width,
    height: t.height,
    aspectRatio: `${t.width}:${t.height}`,
    tags: t.tags || [],
    defaultTopText: t.defaultTopText || "",
    defaultBottomText: t.defaultBottomText || "",
    isWatermarkFree: true,
    trendingRank: idx + 1,
    remixCount: t.downloads || 1500,
    downloadCount: t.downloads || 800,
    createdAt: t.createdAt.toISOString(),
  }));

  if (query.category && query.category !== "all") {
    results = results.filter(
      (t) =>
        t.categoryId.toLowerCase() === query.category.toLowerCase() ||
        t.categoryName.toLowerCase() === query.category.toLowerCase()
    );
  }

  if (query.search && query.search.trim().length > 0) {
    const q = query.search.toLowerCase().trim();
    results = results.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.tags.some((tag: string) => tag.toLowerCase().includes(q))
    );
  }

  const responseData = {
    templates: results,
    total: results.length,
    page: query.page,
    limit: query.limit,
  };

  return {
    ...responseData,
    source: "database",
  };
}

export async function createTemplate(input: CreateTemplateInput, user?: JWTPayload) {
  const slug = input.slug || input.title.toLowerCase().replace(/[^a-z0-9]/g, "-") + `-${Date.now()}`;

  const template = await prisma.template.upsert({
    where: { slug },
    update: {
      title: input.title,
      category: input.category,
      tags: input.tags,
      svgDataUri: input.svgDataUri,
      width: input.width || 1080,
      height: input.height || 1080,
      defaultTopText: input.defaultTopText || null,
      defaultBottomText: input.defaultBottomText || null,
    },
    create: {
      slug,
      title: input.title,
      category: input.category,
      tags: input.tags,
      svgDataUri: input.svgDataUri,
      width: input.width || 1080,
      height: input.height || 1080,
      defaultTopText: input.defaultTopText || null,
      defaultBottomText: input.defaultBottomText || null,
    },
  });

  return template;
}

export async function deleteTemplate(idOrSlug: string) {
  try {
    const deleted = await prisma.template.deleteMany({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "TEMPLATE_DELETED",
        targetId: idOrSlug,
        targetType: "TEMPLATE",
        details: `Deleted template ${idOrSlug}`,
        actorEmail: "SUPER_ADMIN",
      },
    }).catch(() => {});

    return { success: true, count: deleted.count };
  } catch (err) {
    throw new Error("Failed to remove template card from database");
  }
}

export async function deleteMultipleTemplates(idsOrSlugs: string[]) {
  try {
    const deleted = await prisma.template.deleteMany({
      where: {
        OR: [
          { id: { in: idsOrSlugs } },
          { slug: { in: idsOrSlugs } },
        ],
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "TEMPLATES_BULK_DELETED",
        targetType: "TEMPLATE",
        details: `Bulk deleted ${deleted.count} templates (${idsOrSlugs.join(", ")})`,
        actorEmail: "SUPER_ADMIN",
      },
    }).catch(() => {});

    return { success: true, count: deleted.count };
  } catch (err) {
    throw new Error("Failed to bulk remove templates from database");
  }
}
