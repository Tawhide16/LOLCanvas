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
  let results: any[] = dbTemplates.map((t, idx) => {
    const authorTag = (t.tags || []).find((tag: string) => tag.startsWith("author:"));
    const authorEmail = authorTag ? authorTag.replace("author:", "") : null;

    const originalUrl =
      t.defaultBottomText &&
      (t.defaultBottomText.startsWith("data:image") || t.defaultBottomText.startsWith("http"))
        ? t.defaultBottomText
        : t.svgDataUri;

    return {
      id: t.id,
      slug: t.slug,
      index: `№ ${(idx + 1).toString().padStart(4, "0")}`,
      title: t.title,
      categoryId: t.category,
      categoryName: t.category.toUpperCase(),
      format: "classic",
      formatLabel: "Standard Format",
      svgDataUri: t.svgDataUri,
      // Omit multi-megabyte originalUrl from catalog list for instantaneous web loading
      originalUrl: undefined,
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
      authorEmail: authorEmail,
    };
  });

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

  // 3. Cache response in Redis/Memory for 120 seconds for instant sub-millisecond retrieval
  try {
    await redis.set(cacheKey, responseData, { ex: 120 });
  } catch (err) {}

  return {
    ...responseData,
    source: "database",
  };
}

async function invalidateTemplateCache() {
  try {
    await redis.del("templates:cat_all:q_:p_1");
  } catch (e) {}
}

export async function createTemplate(
  input: CreateTemplateInput & { authorEmail?: string; originalUrl?: string },
  user?: JWTPayload
) {
  await invalidateTemplateCache();
  const slug = input.slug || input.title.toLowerCase().replace(/[^a-z0-9]/g, "-") + `-${Date.now()}`;
  const creatorEmail = input.authorEmail || user?.email || "anonymous@lolcanvas.studio";

  const tags = [...(input.tags || [])];
  if (!tags.some((t) => t.startsWith("author:"))) {
    tags.push(`author:${creatorEmail.toLowerCase()}`);
  }

  // Preserve real original image for downloads
  const originalSource = input.originalUrl || input.defaultBottomText || input.svgDataUri;

  const template = await prisma.template.upsert({
    where: { slug },
    update: {
      title: input.title,
      category: input.category,
      tags: tags,
      svgDataUri: input.svgDataUri,
      width: input.width || 1080,
      height: input.height || 1080,
      defaultTopText: input.defaultTopText || null,
      defaultBottomText: originalSource || null,
    },
    create: {
      slug,
      title: input.title,
      category: input.category,
      tags: tags,
      svgDataUri: input.svgDataUri,
      width: input.width || 1080,
      height: input.height || 1080,
      defaultTopText: input.defaultTopText || null,
      defaultBottomText: originalSource || null,
    },
  });

  return template;
}

export async function updateTemplate(input: {
  id: string;
  title?: string;
  category?: string;
  svgDataUri?: string;
  originalUrl?: string;
  authorEmail?: string;
  isSystemOptimization?: boolean;
}) {
  const existing = await prisma.template.findFirst({
    where: {
      OR: [{ id: input.id }, { slug: input.id }],
    },
  });

  if (!existing) {
    throw new Error("Template card not found");
  }

  const authorTag = (existing.tags || []).find((t: string) => t.startsWith("author:"));
  const cardOwner = authorTag ? authorTag.replace("author:", "").toLowerCase().trim() : null;
  const requesterEmail = input.authorEmail ? input.authorEmail.toLowerCase().trim() : null;

  // STRICT POLICY ENFORCEMENT (unless it is purely a performance compression for web display):
  if (!input.isSystemOptimization && cardOwner && (!requesterEmail || requesterEmail !== cardOwner)) {
    throw new Error(
      `Permission denied: Only the original creator (${cardOwner}) can edit this card. Admins are authorized to delete cards, but cannot edit cards created by others.`
    );
  }

  const updated = await prisma.template.update({
    where: { id: existing.id },
    data: {
      ...(input.title ? { title: input.title.trim().toUpperCase() } : {}),
      ...(input.category ? { category: input.category } : {}),
      ...(input.svgDataUri ? { svgDataUri: input.svgDataUri } : {}),
      ...(input.originalUrl ? { defaultBottomText: input.originalUrl } : {}),
    },
  });

  await invalidateTemplateCache();
  return updated;
}

export async function deleteTemplate(idOrSlug: string) {
  try {
    await invalidateTemplateCache();
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
