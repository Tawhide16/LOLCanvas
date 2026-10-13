import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import redis from "./redis";

// Memory-based sliding window rate limiter fallback
class MemoryRateLimiter {
  private hits = new Map<string, number[]>();

  async limit(identifier: string, maxRequests: number, windowSeconds: number) {
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    let timestamps = this.hits.get(identifier) || [];
    // Filter timestamps within current window
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length >= maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: Math.ceil((timestamps[0] + windowSeconds * 1000 - now) / 1000),
      };
    }

    timestamps.push(now);
    this.hits.set(identifier, timestamps);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - timestamps.length,
      reset: windowSeconds,
    };
  }
}

const memoryLimiter = new MemoryRateLimiter();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a specific key (IP address or User ID)
 * @param identifier Client IP or User ID
 * @param maxRequests Maximum allowed requests in the window
 * @param windowSeconds Window duration in seconds (default: 60)
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests = 60,
  windowSeconds = 60
): Promise<RateLimitResult> {
  // If Upstash Redis instance is available
  if (redis instanceof Redis) {
    try {
      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
        analytics: true,
      });

      const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
      return {
        success,
        limit,
        remaining,
        reset: Math.ceil((reset - Date.now()) / 1000),
      };
    } catch (err) {
      console.warn("Upstash rate limit check failed, using fallback memory limiter:", err);
    }
  }

  // Use high-performance memory fallback limiter
  return memoryLimiter.limit(identifier, maxRequests, windowSeconds);
}
