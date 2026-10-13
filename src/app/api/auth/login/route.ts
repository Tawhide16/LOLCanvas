import { NextRequest } from "next/server";
import { loginSchema } from "@/modules/auth/auth.schema";
import { loginUser } from "@/modules/auth/auth.service";
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
  rateLimitResponse,
} from "@/modules/common/apiResponse";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/modules/common/middlewares";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (10 login attempts per minute per IP)
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(`login:${clientIp}`, 10, 60);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.reset);
    }

    // 2. Parse & Zod Validation
    const body = await req.json();
    const validatedData = loginSchema.parse(body);

    // 3. Login user
    const { user, token } = await loginUser(validatedData);

    const response = successResponse(
      { user, token },
      "Logged in successfully",
      200
    );

    // 4. Set HTTP-only secure session cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    if (err && typeof err === "object" && "name" in err && err.name === "ZodError") {
      return zodErrorResponse(err as import("zod").ZodError);
    }
    const message = err instanceof Error ? err.message : "Invalid credentials";
    return errorResponse(message, 401);
  }
}
