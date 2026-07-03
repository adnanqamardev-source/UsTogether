export interface RateLimitEntry {
  count: number;
  last: number;
}

const limits = new Map<string, RateLimitEntry>();

export function checkRateLimit(key: string, max = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = limits.get(key);

  if (!entry || now - entry.last > windowMs) {
    limits.set(key, { count: 1, last: now });
    return true;
  }

  entry.count += 1;
  entry.last = now;
  limits.set(key, entry);

  return entry.count <= max;
}