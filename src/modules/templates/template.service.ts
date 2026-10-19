import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { TEMPLATES } from "@/lib/data";
import { TemplateQueryInput, CreateTemplateInput } from "./template.schema";
import { JWTPayload } from "../auth/auth.jwt";
import { hasPermission } from "../auth/auth.rbac";
import { IN_MEMORY_MEMES } from "../memes/meme.service";
import {
  getStoredCommunityTemplates,
  saveCommunityTemplate,
  deleteStoredCommunityTemplate,
} from "@/lib/communityStore";

const CACHE_TTL_SECONDS = 60; // Cache templates for 60 seconds

// In-memory community templates pool for reliable persistence across hot reloads & when DB is unavailable
export const IN_MEMORY_TEMPLATES: any[] = [];

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

  // 2. Query Data from Neon DB in parallel (with 1.5s timeout fallback if DB is unreachable)
  let dbTemplates: any[] = [];
  let publicMemes: any[] = [];
  try {
    const dbPromise = Promise.all([
      prisma.template.findMany({
        orderBy: { createdAt: "desc" },
        take: 60,
      }),
      prisma.meme.findMany({
        where: { isPublic: true },
        select: {
          id: true,
          title: true,
          previewUrl: true,
          width: true,
          height: true,
          downloads: true,
          createdAt: true,
          author: {
            select: {
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("DB connection timeout (1500ms)")), 1500)
    );

    const [templatesResult, memesResult]: any = await Promise.race([dbPromise, timeoutPromise]);
    dbTemplates = templatesResult;
    publicMemes = memesResult;
  } catch (err: any) {
    console.warn("DB query unavailable, using instant built-in fallback:", err?.message || err);
  }

  // Fallback to built-in catalog if DB query returned empty
  if (dbTemplates.length === 0) {
    dbTemplates = TEMPLATES.map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      category: t.categoryId,
      tags: t.tags || [],
      svgDataUri: t.svgDataUri,
      width: t.width,
      height: t.height,
      defaultTopText: t.defaultTopText,
      defaultBottomText: t.defaultBottomText,
      downloads: t.downloadCount || 1000,
      createdAt: new Date(t.createdAt || Date.now()),
    }));
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
      originalUrl: originalUrl || t.svgDataUri,
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
      createdAt: (t.createdAt instanceof Date ? t.createdAt : new Date()).toISOString(),
      authorEmail: authorEmail,
    };
  });

  // Prepend persistent community uploads (ensuring they appear first and always have images)
  const storedTemplates = getStoredCommunityTemplates();
  const allCommunityTemplates = [...IN_MEMORY_TEMPLATES, ...storedTemplates];
  const existingSlugs = new Set(results.map((r) => r.slug || r.id));
  for (const mem of allCommunityTemplates) {
    if (!existingSlugs.has(mem.slug) && !existingSlugs.has(mem.id)) {
      results.unshift({
        id: mem.id,
        slug: mem.slug,
        index: `№ ${(results.length + 1).toString().padStart(4, "0")}`,
        title: mem.title,
        categoryId: mem.category || "classic",
        categoryName: (mem.category || "COMMUNITY").toUpperCase(),
        format: "classic",
        formatLabel: "Community Upload",
        svgDataUri: mem.svgDataUri,
        originalUrl: mem.originalUrl || mem.svgDataUri,
        width: mem.width || 1080,
        height: mem.height || 1080,
        aspectRatio: `${mem.width || 1080}:${mem.height || 1080}`,
        tags: mem.tags || [],
        defaultTopText: mem.defaultTopText || "",
        defaultBottomText: mem.defaultBottomText || "",
        isWatermarkFree: true,
        trendingRank: 1,
        remixCount: mem.remixCount || 150,
        downloadCount: mem.downloadCount || 80,
        createdAt: (mem.createdAt instanceof Date ? mem.createdAt : new Date(mem.createdAt || Date.now())).toISOString(),
        authorEmail: mem.authorEmail,
      });
      existingSlugs.add(mem.slug);
      existingSlugs.add(mem.id);
    }
  }

  // Merge any public memes not already in the templates list
  const existingTitles = new Set(results.map((r) => r.title.toLowerCase().trim()));
  const existingIds = new Set(results.map((r) => r.id));

  const allMemesToMerge = [...IN_MEMORY_MEMES, ...publicMemes];

  for (const m of allMemesToMerge) {
    if (!m.previewUrl) continue;
    const titleKey = m.title.toLowerCase().trim();
    if (existingTitles.has(titleKey) || existingIds.has(m.id)) continue;

    results.unshift({
      id: m.id,
      slug: m.id,
      index: `№ ${(results.length + 1).toString().padStart(4, "0")}`,
      title: m.title.toUpperCase(),
      categoryId: "classic",
      categoryName: "COMMUNITY",
      format: "classic",
      formatLabel: "Community Upload",
      svgDataUri: m.previewUrl,
      originalUrl: m.previewUrl,
      width: m.width || 1080,
      height: m.height || 1080,
      aspectRatio: `${m.width || 1080}:${m.height || 1080}`,
      tags: ["classic", "community_upload", `author:${m.author?.email || "creator"}`],
      defaultTopText: "",
      defaultBottomText: m.previewUrl,
      isWatermarkFree: true,
      trendingRank: 1,
      remixCount: m.downloads || 1500,
      downloadCount: m.downloads || 800,
      createdAt: (m.createdAt instanceof Date ? m.createdAt : new Date()).toISOString(),
      authorEmail: m.author?.email || null,
    });
    existingTitles.add(titleKey);
    existingIds.add(m.id);
  }

  // Sort newest first
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Re-index
  results = results.map((r, idx) => ({
    ...r,
    index: `№ ${(idx + 1).toString().padStart(4, "0")}`,
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

  // 3. Cache response in Redis/Memory for 60 seconds
  try {
    await redis.set(cacheKey, responseData, { ex: 60 });
  } catch (err) {}

  return {
    ...responseData,
    source: "database",
  };
}

export async function invalidateTemplateCache() {
  try {
    const commonKeys = [
      "templates:cat_all:q_:p_1",
      "templates:cat_all:q_:p_null",
      "templates:cat_all:q_:p_undefined",
      "templates:cat_classic:q_:p_1",
    ];
    for (const key of commonKeys) {
      await redis.del(key);
    }
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
  const imageSource = input.svgDataUri || input.originalUrl || originalSource;

  const memTemplate = {
    id: slug,
    slug,
    title: input.title.trim().toUpperCase(),
    category: input.category,
    tags,
    svgDataUri: imageSource,
    originalUrl: originalSource,
    width: input.width || 1080,
    height: input.height || 1080,
    defaultTopText: input.defaultTopText || "",
    defaultBottomText: originalSource || "",
    authorEmail: creatorEmail,
    createdAt: new Date(),
  };

  // Add to in-memory community pool and persist to disk for resilience
  IN_MEMORY_TEMPLATES.unshift(memTemplate);
  saveCommunityTemplate(memTemplate);

  try {
    const template = await prisma.template.upsert({
      where: { slug },
      update: {
        title: input.title,
        category: input.category,
        tags: tags,
        svgDataUri: imageSource,
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
        svgDataUri: imageSource,
        width: input.width || 1080,
        height: input.height || 1080,
        defaultTopText: input.defaultTopText || null,
        defaultBottomText: originalSource || null,
      },
    });

    return template;
  } catch (err: any) {
    console.warn("DB offline during template creation, safely retained in-memory:", err?.message || err);
    return memTemplate;
  }
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
  deleteStoredCommunityTemplate(idOrSlug);
  await invalidateTemplateCache();
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
    console.warn("DB offline during deleteTemplate, deleted from persistent communityStore:", err);
    return { success: true, count: 1 };
  }
}

export async function deleteMultipleTemplates(idsOrSlugs: string[]) {
  for (const id of idsOrSlugs) {
    deleteStoredCommunityTemplate(id);
  }
  await invalidateTemplateCache();
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
    console.warn("DB offline during deleteMultipleTemplates, deleted from communityStore:", err);
    return { success: true, count: idsOrSlugs.length };
  }
}

