import { NextRequest } from "next/server";
import {
  templateQuerySchema,
  createTemplateSchema,
} from "@/modules/templates/template.schema";
import {
  getTemplates,
  createTemplate,
} from "@/modules/templates/template.service";
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
} from "@/modules/common/apiResponse";
import { authenticateRequest } from "@/modules/common/middlewares";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Single template lookup with original high-resolution image for downloading
    if (id) {
      // 1. Check in-memory community templates first
      const { IN_MEMORY_TEMPLATES } = await import("@/modules/templates/template.service");
      const memFound = IN_MEMORY_TEMPLATES.find((t) => t.id === id || t.slug === id);
      if (memFound) {
        return successResponse(
          { ...memFound, originalUrl: memFound.originalUrl || memFound.svgDataUri },
          "Template retrieved successfully"
        );
      }

      // 2. Check canonical built-in templates
      const { TEMPLATES } = await import("@/lib/data");
      const staticFound = TEMPLATES.find((t) => t.id === id || t.slug === id);
      if (staticFound) {
        return successResponse(
          { ...staticFound, originalUrl: staticFound.originalUrl || staticFound.svgDataUri },
          "Template retrieved successfully"
        );
      }

      // 3. Fallback to database query
      try {
        const prisma = (await import("@/lib/prisma")).default;
        const t = await prisma.template.findFirst({
          where: { OR: [{ id }, { slug: id }] },
        });
        if (t) {
          const originalUrl =
            t.defaultBottomText &&
            (t.defaultBottomText.startsWith("data:image") || t.defaultBottomText.startsWith("http"))
              ? t.defaultBottomText
              : t.svgDataUri;
          return successResponse({ ...t, originalUrl }, "Template retrieved successfully");
        }
      } catch (dbErr) {
        console.warn("DB template query unavailable:", dbErr);
      }

      return errorResponse("Template not found", 404);
    }

    const queryParams = {
      category: searchParams.get("category") || "all",
      search: searchParams.get("search") || "",
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 50,
    };

    // 1. Zod Validation
    const validatedQuery = templateQuerySchema.parse(queryParams);

    // 2. Fetch from Redis Cache or Database
    const result = await getTemplates(validatedQuery);
    const response = successResponse(result, "Templates retrieved successfully");
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    return response;
  } catch (err: unknown) {
    if (err && typeof err === "object" && "name" in err && err.name === "ZodError") {
      return zodErrorResponse(err as import("zod").ZodError);
    }
    const message = err instanceof Error ? err.message : "Failed to fetch templates";
    return errorResponse(message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await authenticateRequest(req);
    const body = await req.json();
    const validatedData = createTemplateSchema.parse(body);

    const authorEmail = body.authorEmail || authUser?.email || undefined;
    const originalUrl = body.originalUrl || undefined;
    const template = await createTemplate(
      { ...validatedData, authorEmail, originalUrl },
      authUser || undefined
    );

    return successResponse(template, "Template created successfully", 201);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "name" in err && err.name === "ZodError") {
      return zodErrorResponse(err as import("zod").ZodError);
    }
    const message = err instanceof Error ? err.message : "Failed to create template";
    return errorResponse(message, 400);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, category, svgDataUri, originalUrl, authorEmail, isSystemOptimization } = body;

    if (!id) {
      return errorResponse("Template ID is required", 400);
    }

    const { updateTemplate } = await import("@/modules/templates/template.service");
    const updated = await updateTemplate({
      id,
      title,
      category,
      svgDataUri,
      originalUrl,
      authorEmail,
      isSystemOptimization: Boolean(isSystemOptimization),
    });

    return successResponse(updated, "Template card updated successfully");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update template";
    const status = message.includes("Permission denied") ? 403 : 400;
    return errorResponse(message, status);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const idsParam = searchParams.get("ids");

    let idsToDelete: string[] = [];
    if (idsParam) {
      idsToDelete = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (id) {
      idsToDelete = [id];
    } else {
      try {
        const body = await req.json();
        if (body.ids && Array.isArray(body.ids)) {
          idsToDelete = body.ids;
        } else if (body.id) {
          idsToDelete = [body.id];
        }
      } catch (e) {}
    }

    if (idsToDelete.length === 0) {
      return errorResponse("Template ID or IDs required for deletion", 400);
    }

    const { deleteMultipleTemplates } = await import("@/modules/templates/template.service");
    const result = await deleteMultipleTemplates(idsToDelete);

    return successResponse(result, `Removed ${result.count} template card(s) successfully`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to remove template(s)";
    return errorResponse(message, 400);
  }
}
