import { Redis } from "@upstash/redis";

// Simple high-performance in-memory fallback cache for development without Redis credentials
class MemoryCacheFallback {
  private store = new Map<string, string>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  async get<T = unknown>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as unknown as T;
    }
  }

  async set(key: string, value: unknown, options?: { ex?: number }): Promise<"OK"> {
    const stringValue = typeof value === "string" ? value : JSON.stringify(value);
    this.store.set(key, stringValue);

    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.timers.delete(key);
    }

    if (options?.ex) {
      const timer = setTimeout(() => {
        this.store.delete(key);
        this.timers.delete(key);
      }, options.ex * 1000);
      if (typeof timer.unref === "function") {
        timer.unref();
      }
      this.timers.set(key, timer);
    }
    return "OK";
  }

  async del(key: string): Promise<number> {
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.timers.delete(key);
    }
    const existed = this.store.delete(key);
    return existed ? 1 : 0;
  }
}

// Global cache for development hot-reloading
const globalForRedis = globalThis as unknown as {
  redisClient: Redis | MemoryCacheFallback | undefined;
};

function createRedisClient(): Redis | MemoryCacheFallback {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      return new Redis({ url, token });
    } catch (err) {
      console.warn("Failed to initialize Upstash Redis, falling back to in-memory cache:", err);
    }
  }

  return new MemoryCacheFallback();
}

export const redis = globalForRedis.redisClient ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redisClient = redis;
}

export default redis;
