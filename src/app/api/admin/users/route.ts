import { NextRequest } from "next/server";
import { getAllUsers, createUserOrAdmin } from "@/modules/admin/admin.service";
import { successResponse, errorResponse } from "@/modules/common/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") || undefined;

    const users = await getAllUsers({ search, role });
    return successResponse(users, "Users list retrieved");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load users";
    return errorResponse(msg, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.email) {
      return errorResponse("Email is required", 400);
    }

    const newUser = await createUserOrAdmin({
      email: body.email,
      name: body.name,
      role: body.role || "CREATOR",
      actorEmail: body.actorEmail || "SUPER_ADMIN",
    });

    return successResponse(newUser, "User created successfully", 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create user";
    return errorResponse(msg, 400);
  }
}
