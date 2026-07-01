export interface RateLimitEntry {
  count: number;
  last: number;
}

const localLimit = new Map<string, RateLimitEntry>();

type RedisClient = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ex?: number) => Promise<void>;
  incr: (key: string) => Promise<number>;
  expire: (key: string, ttl: number) => Promise<void>;
};

let redisClient: RedisClient | null = null;

async function getRedisClient(): Promise<RedisClient | null> {
  if (redisClient) return redisClient;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!redisUrl || !redisToken) return null;

  // Lazy-load upstash client; falling back to local map if unavailable
  try {
    const { Redis } = await import('@upstash/redis');
    redisClient = new Redis({ url: redisUrl, token: redisToken }) as any as RedisClient;
    return redisClient;
  } catch (e) {
    console.warn('Failed to initialize Upstash Redis client, falling back to in-memory rate limit.', e);
    return null;
  }
}

export async function checkRateLimit(key: string, max = 10, windowMs = 60000): Promise<boolean> {
  const now = Date.now();
  const redis = await getRedisClient();

  if (redis !== null) {
    try {
      const existing = await redis.get(key);
      let count = 0;
      let last = 0;

      if (existing) {
        try {
          const parsed = JSON.parse(existing) as { count: number; last: number };
          count = parsed.count;
          last = parsed.last;
        } catch {
          count = 0;
        }
      }

      if (!count || now - last > windowMs) {
        await redis.set(key, JSON.stringify({ count: 1, last: now }), windowMs / 1000);
        return true;
      }

      count += 1;
      last = now;
      await redis.set(key, JSON.stringify({ count, last }), windowMs / 1000);
      return count <= max;
    } catch {
      // Fall back to local if Redis fails
    }
  }

  // Local in-memory fallback (dev / single-instance)
  const entry = localLimit.get(key);
  if (!entry || now - entry.last > windowMs) {
    localLimit.set(key, { count: 1, last: now });
    return true;
  }

  entry.count += 1;
  entry.last = now;
  localLimit.set(key, entry);
  return entry.count <= max;
}