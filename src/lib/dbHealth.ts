/**
 * Database Circuit Breaker & Resilient Query Helper for LOLCanvas
 * 
 * Prevents hanging requests and slow website loading when remote database (Supabase/Neon)
 * is unreachable, timing out, or inactive.
 */

let isDbHealthy = true;
let lastFailureTime = 0;
const RECOVERY_COOLDOWN_MS = 45 * 1000; // 45 seconds before retrying unreachable DB

export function isDbAvailable(): boolean {
  if (isDbHealthy) return true;
  // If cooldown has elapsed, give the DB another chance
  if (Date.now() - lastFailureTime > RECOVERY_COOLDOWN_MS) {
    return true;
  }
  return false;
}

export function markDbFailure(error?: any): void {
  isDbHealthy = false;
  lastFailureTime = Date.now();
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[DB Circuit Breaker] Database marked unreachable for 45s. Fallback activated. Error: ${
        error?.message || error
      }`
    );
  }
}

export function markDbSuccess(): void {
  isDbHealthy = true;
  lastFailureTime = 0;
}

/**
 * Executes a Prisma or DB promise with a strict timeout.
 * If the DB is already marked unreachable, it instantly returns the fallback value in 0ms.
 */
export async function withDbTimeout<T>(
  queryFn: () => Promise<T>,
  fallbackValue: T,
  timeoutMs = 600
): Promise<T> {
  if (!isDbAvailable()) {
    return fallbackValue;
  }

  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Database query timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    const result = await Promise.race([queryFn(), timeoutPromise]);
    if (timer) clearTimeout(timer);
    markDbSuccess();
    return result;
  } catch (err: any) {
    if (timer) clearTimeout(timer);
    markDbFailure(err);
    return fallbackValue;
  }
}

