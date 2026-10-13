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

    return successResponse(result, "Templates retrieved successfully");
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

    const template = await createTemplate(validatedData, authUser || undefined);

    return successResponse(template, "Template created successfully", 201);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "name" in err && err.name === "ZodError") {
      return zodErrorResponse(err as import("zod").ZodError);
    }
    const message = err instanceof Error ? err.message : "Failed to create template";
    return errorResponse(message, 400);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return errorResponse("Template ID or slug is required", 400);
    }

    const { deleteTemplate } = await import("@/modules/templates/template.service");
    const result = await deleteTemplate(id);

    return successResponse(result, "Template removed successfully");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to remove template";
    return errorResponse(message, 400);
  }
}
