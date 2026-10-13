import { NextRequest } from "next/server";
import { getAllMemesForAdmin } from "@/modules/admin/admin.service";
import { successResponse, errorResponse } from "@/modules/common/apiResponse";

export async function GET(_req: NextRequest) {
  try {
    const memes = await getAllMemesForAdmin(60);
    return successResponse(memes, "Memes list retrieved for moderation");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load memes";
    return errorResponse(msg, 500);
  }
}
