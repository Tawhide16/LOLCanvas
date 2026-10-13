import { PrismaClient } from "@prisma/client";

// Global cache for Prisma instance across hot reloads in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Universal Prisma Client instance for LOLCanvas.
 * Compatible with:
 *  - Local PostgreSQL / Docker Compose
 *  - Neon Serverless PostgreSQL (Direct or Pooled)
 *  - Supabase PostgreSQL (Direct or Transaction Pooler)
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
