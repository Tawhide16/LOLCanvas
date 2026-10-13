import { SignJWT, jwtVerify } from "jose";
import { Role } from "./auth.rbac";

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  name?: string | null;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "lolcanvas_super_secret_jwt_key_2026_modern_swiss_brutalist"
);

const JWT_EXPIRES_IN = "7d"; // 7 days session

/**
 * Sign and issue a stateless JWT token
 */
export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

/**
 * Verify and decode an incoming JWT token
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as Role,
      name: payload.name as string | null,
    };
  } catch (error) {
    return null;
  }
}
