import { NextRequest } from "next/server";
import {
  createMemeSchema,
  getMemesQuerySchema,
} from "@/modules/memes/meme.schema";
import { createMeme, getMemes } from "@/modules/memes/meme.service";
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
  rateLimitResponse,
} from "@/modules/common/apiResponse";
import { authenticateRequest, getClientIp } from "@/modules/common/middlewares";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 50,
      authorId: searchParams.get("authorId") || undefined,
      authorEmail: searchParams.get("authorEmail") || searchParams.get("email") || undefined,
    };

    const validatedQuery = getMemesQuerySchema.parse(queryParams);
    const result = await getMemes(validatedQuery);

    return successResponse(result, "Memes retrieved successfully");
  } catch (err: unknown) {
    if (err && typeof err === "object" && "name" in err && err.name === "ZodError") {
      return zodErrorResponse(err as import("zod").ZodError);
    }
    const message = err instanceof Error ? err.message : "Failed to fetch memes";
    return errorResponse(message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (30 meme creations per minute per client)
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(`meme_create:${clientIp}`, 30, 60);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.reset);
    }

    // 2. Parse & Zod Validation of Canvas Layers and Meme Data
    const body = await req.json();
    const validatedData = createMemeSchema.parse(body);

    // 3. Optional Authentication (User can save anonymously or as authenticated creator)
    const authUser = await authenticateRequest(req);

    // 4. Save to Database
    const meme = await createMeme(validatedData, authUser?.userId);

    return successResponse(meme, "Meme saved successfully", 201);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "name" in err && err.name === "ZodError") {
      return zodErrorResponse(err as import("zod").ZodError);
    }
    const message = err instanceof Error ? err.message : "Failed to create meme";
    return errorResponse(message, 400);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return errorResponse("Meme ID is required", 400);
    }

    const prisma = (await import("@/lib/prisma")).default;
    await prisma.meme.delete({
      where: { id },
    });

    return successResponse({ id, deleted: true }, "Meme removed successfully");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete meme";
    return errorResponse(message, 400);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, previewUrl, layers, isPublic, authorEmail } = body;

    if (!id) {
      return errorResponse("Meme ID is required", 400);
    }

    const authUser = await authenticateRequest(req);
    const requesterEmail = authorEmail || authUser?.email || null;
    const userId = authUser?.userId || null;

    const { updateMeme } = await import("@/modules/memes/meme.service");
    const updated = await updateMeme(
      id,
      { title, previewUrl, layers, isPublic },
      requesterEmail,
      userId
    );

    return successResponse(updated, "Meme updated successfully");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update meme";
    const status =
      message.includes("FORBIDDEN") || message.includes("Permission denied")
        ? 403
        : 400;
    return errorResponse(message, status);
  }
}

