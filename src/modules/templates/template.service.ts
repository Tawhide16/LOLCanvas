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

  // 2. Query Data (Prisma database or built-in templates fallback)
  let results = [...TEMPLATES];

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

export async function createTemplate(input: CreateTemplateInput, user: JWTPayload) {
  // RBAC check: Only CURATOR or ADMIN can add templates
  const canCreate = hasPermission(user.role, "create:template");
  if (!canCreate) {
    throw new Error("Unauthorized: CURATOR or ADMIN role required to publish templates.");
  }

  const template = await prisma.template.create({
    data: {
      slug: input.slug,
      title: input.title,
      category: input.category,
      tags: input.tags,
      svgDataUri: input.svgDataUri,
      width: input.width,
      height: input.height,
      defaultTopText: input.defaultTopText,
      defaultBottomText: input.defaultBottomText,
    },
  });

  return template;
}
