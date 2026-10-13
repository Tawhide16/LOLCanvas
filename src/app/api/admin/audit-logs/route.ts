import { NextRequest } from "next/server";
import { getAuditLogs } from "@/modules/admin/admin.service";
import { successResponse, errorResponse } from "@/modules/common/apiResponse";

export async function GET(_req: NextRequest) {
  try {
    const logs = await getAuditLogs(50);
    return successResponse(logs, "Audit logs retrieved");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load audit logs";
    return errorResponse(msg, 500);
  }
}
