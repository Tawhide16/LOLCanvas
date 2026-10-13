import { NextRequest } from "next/server";
import {
  updateUserRole,
  updateUserStatus,
  deleteUserByAdmin,
} from "@/modules/admin/admin.service";
import { successResponse, errorResponse } from "@/modules/common/apiResponse";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    if (body.role) {
      const updated = await updateUserRole({
        targetUserId: id,
        newRole: body.role,
        actorEmail: body.actorEmail || "SUPER_ADMIN",
      });
      return successResponse(updated, "User role updated successfully");
    }

    if (body.status) {
      const updated = await updateUserStatus({
        targetUserId: id,
        status: body.status,
        actorEmail: body.actorEmail || "SUPER_ADMIN",
      });
      return successResponse(updated, "User status updated successfully");
    }

    return errorResponse("No valid update field (role or status) provided", 400);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update user";
    return errorResponse(msg, 400);
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await deleteUserByAdmin({
      targetUserId: id,
      actorEmail: "SUPER_ADMIN",
    });

    return successResponse(result, "User deleted successfully");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete user";
    return errorResponse(msg, 400);
  }
}
