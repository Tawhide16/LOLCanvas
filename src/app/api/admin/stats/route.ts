import { NextRequest } from "next/server";
import { getSystemStats } from "@/modules/admin/admin.service";
import { successResponse, errorResponse } from "@/modules/common/apiResponse";

export async function GET(_req: NextRequest) {
  try {
    const stats = await getSystemStats();
    return successResponse(stats, "System statistics retrieved");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load system stats";
    return errorResponse(msg, 500);
  }
}
