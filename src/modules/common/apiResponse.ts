import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiResponseOptions<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | Record<string, string[]>;
  statusCode?: number;
}

export function successResponse<T>(data: T, message = "Success", statusCode = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status: statusCode }
  );
}

export function errorResponse(message: string, statusCode = 400, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details,
    },
    { status: statusCode }
  );
}

export function zodErrorResponse(error: ZodError) {
  const formattedErrors: Record<string, string[]> = {};

  (error.issues || []).forEach((err) => {
    const field = err.path.join(".") || "general";
    if (!formattedErrors[field]) {
      formattedErrors[field] = [];
    }
    formattedErrors[field].push(err.message);
  });

  return NextResponse.json(
    {
      success: false,
      error: "Validation failed",
      details: formattedErrors,
    },
    { status: 422 }
  );
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      success: false,
      error: "Too many requests. Please slow down.",
      retryAfter: retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfterSeconds.toString(),
      },
    }
  );
}
