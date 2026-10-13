import { NextRequest } from "next/server";
import { verifyJWT, JWTPayload } from "../auth/auth.jwt";
import { Role, isAtLeastRole } from "../auth/auth.rbac";

/**
 * Extracts and verifies JWT from Authorization header or cookies
 */
export async function authenticateRequest(req: NextRequest): Promise<JWTPayload | null> {
  // 1. Check Bearer Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = await verifyJWT(token);
    if (payload) return payload;
  }

  // 2. Check Cookie (auth_token)
  const cookieToken = req.cookies.get("auth_token")?.value;
  if (cookieToken) {
    const payload = await verifyJWT(cookieToken);
    if (payload) return payload;
  }

  return null;
}

/**
 * Validates that the authenticated user meets the minimum required RBAC role
 */
export function checkRoleAuthorization(user: JWTPayload, requiredRole: Role): boolean {
  return isAtLeastRole(user.role, requiredRole);
}

/**
 * Helper to get client IP for rate limiting
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "127.0.0.1";
}
