import { NextRequest } from "next/server";
import { deleteMemeByAdmin } from "@/modules/admin/admin.service";
import { successResponse, errorResponse } from "@/modules/common/apiResponse";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await deleteMemeByAdmin({
      memeId: id,
      actorEmail: "SUPER_ADMIN",
    });

    return successResponse(result, "Meme removed by admin");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete meme";
    return errorResponse(msg, 400);
  }
}
