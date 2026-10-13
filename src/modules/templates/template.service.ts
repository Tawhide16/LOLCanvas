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

  // 2. Query Data from Neon DB + Built-in catalog
  let dbTemplates: any[] = [];
  try {
    dbTemplates = await prisma.template.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("DB query for templates failed, using built-in catalog:", err);
  }

  const dbFormatted = dbTemplates.map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    categoryId: t.category,
    categoryName: t.category.toUpperCase(),
    format: "classic",
    svgDataUri: t.svgDataUri,
    width: t.width,
    height: t.height,
    tags: t.tags || [],
    defaultTopText: t.defaultTopText || "",
    defaultBottomText: t.defaultBottomText || "",
    isWatermarkFree: true,
    trendingRank: 1,
    remixCount: t.downloads || 0,
    createdAt: t.createdAt.toISOString(),
  }));

  // Merge: DB templates + static templates that are not overridden by slug/id
  const dbSlugs = new Set(dbFormatted.map((t) => t.slug));
  const uniqueStatic = TEMPLATES.filter((t) => !dbSlugs.has(t.slug));
  let results = [...dbFormatted, ...uniqueStatic];

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
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  const responseData = {
    templates: results,
    total: results.length,
    page: query.page,
    limit: query.limit,
  };

  // 3. Store in Redis Cache
  try {
    await redis.set(cacheKey, responseData, { ex: CACHE_TTL_SECONDS });
  } catch (err) {
    console.warn("Redis write failed:", err);
  }

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
    // Attempt deletion by id or slug
    const deleted = await prisma.template.deleteMany({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });
    return { success: true, count: deleted.count };
  } catch (err) {
    throw new Error("Failed to remove template card from database");
  }
}
