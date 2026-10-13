import { NextRequest } from "next/server";
import { authenticateRequest } from "@/modules/common/middlewares";
import { getUserProfile } from "@/modules/auth/auth.service";
import {
  successResponse,
  errorResponse,
} from "@/modules/common/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const authUser = await authenticateRequest(req);
    if (!authUser) {
      return errorResponse("Unauthorized: Please log in to access this resource", 401);
    }

    const profile = await getUserProfile(authUser.userId);
    if (!profile) {
      return errorResponse("User not found", 404);
    }

    return successResponse(profile, "User profile retrieved");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch user";
    return errorResponse(message, 500);
  }
}
