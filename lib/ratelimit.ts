export interface RateLimitEntry {
  count: number;
  last: number;
}

// For serverless environments, we need a persistent backend.
// Strategy: use Redis if REDIS_URL is provided, otherwise fallback to in-memory (dev only).
type RateLimitBackend = {
  get: (key: string) => Promise<RateLimitEntry | undefined>;
  set: (key: string, value: RateLimitEntry, ttlMs: number) => Promise<void>;
};

// In-memory fallback (not persistent across serverless instances, use only for dev)
const memory = new Map<string, { entry: RateLimitEntry; expiry: number }>();

async function getMemory(key: string): Promise<RateLimitEntry | undefined> {
  const now = Date.now();
  const item = memory.get(key);
  if (!item) return undefined;
  if (now > item.expiry) {
    memory.delete(key);
    return undefined;
  }
  return item.entry;
}

async function setMemory(key: string, value: RateLimitEntry, ttlMs: number): Promise<void> {
  const now = Date.now();
  memory.set(key, { entry: value, expiry: now + ttlMs });
}

// Redis backend (Upstash, Redis Cloud, etc.)
async function getRedis(): Promise<RateLimitBackend | null> {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    // Dynamic import to avoid adding a dependency unless explicitly configured
    const mod = await import('redis');
    const createClient = (mod as any).createClient || mod.default?.createClient;
    const client = createClient({ url });
    await client.connect();
    return {
      get: async (key: string) => {
        const raw = await client.get(`ratelimit:${key}`);
        return raw ? (JSON.parse(raw) as RateLimitEntry) : undefined;
      },
      set: async (key: string, value: RateLimitEntry, ttlMs: number) => {
        await client.setEx(`ratelimit:${key}`, Math.ceil(ttlMs / 1000), JSON.stringify(value));
      },
    };
  } catch (e) {
    console.warn('Redis backend unavailable, falling back to in-memory:', e);
    return null;
  }
}

const backendPromise = getRedis().catch(() => null);

export async function checkRateLimit(key: string, max = 10, windowMs = 60000): Promise<boolean> {
  const now = Date.now();
  const backend = await backendPromise;

  const entry = backend
    ? await backend.get(key)
    : await getMemory(key);

  if (!entry || now - entry.last > windowMs) {
    const newEntry: RateLimitEntry = { count: 1, last: now };
    if (backend) {
      await backend.set(key, newEntry, windowMs);
    } else {
      await setMemory(key, newEntry, windowMs);
    }
    return true;
  }

  entry.count += 1;
  entry.last = now;
  if (backend) {
    await backend.set(key, entry, windowMs - (now - entry.last));
  } else {
    await setMemory(key, entry, windowMs);
  }

  return entry.count <= max;
}