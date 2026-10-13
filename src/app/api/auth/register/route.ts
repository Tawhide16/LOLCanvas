import { NextRequest } from "next/server";
import { registerSchema } from "@/modules/auth/auth.schema";
import { registerUser } from "@/modules/auth/auth.service";
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
    // 1. Rate Limiting (5 registrations per minute per IP)
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(`register:${clientIp}`, 5, 60);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.reset);
    }

    // 2. Parse & Zod Validation
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    // 3. Register user
    const { user, token } = await registerUser(validatedData);

    const response = successResponse(
      { user, token },
      "User registered successfully",
      201
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
    const message = err instanceof Error ? err.message : "Registration failed";
    return errorResponse(message, 400);
  }
}
