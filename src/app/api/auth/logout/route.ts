import { NextRequest } from "next/server";
import { successResponse } from "@/modules/common/apiResponse";

export async function POST(_req: NextRequest) {
  const response = successResponse(null, "Logged out successfully");
  response.cookies.delete("auth_token");
  return response;
}
