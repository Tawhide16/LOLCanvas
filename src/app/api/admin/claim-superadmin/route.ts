import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/modules/admin/admin.service";
import { successResponse, errorResponse } from "@/modules/common/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.toLowerCase().trim();

    if (!email) {
      return errorResponse("Email is required to grant Super Admin access", 400);
    }

    // Check if user exists or create them
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: body.name || email.split("@")[0],
          role: "SUPER_ADMIN",
          status: "ACTIVE",
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "SUPER_ADMIN",
          status: "ACTIVE",
        },
      });
    }

    await logAuditAction({
      actorId: user.id,
      actorEmail: email,
      action: "SUPER_ADMIN_CLAIMED",
      targetId: user.id,
      targetType: "USER",
      details: `User ${email} was granted full SUPER_ADMIN access`,
    });

    return successResponse(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      `Successfully granted SUPER_ADMIN access to ${email}`
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to assign Super Admin";
    return errorResponse(msg, 500);
  }
}
