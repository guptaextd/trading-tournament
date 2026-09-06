// lib/rateLimit.ts
interface BucketEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, BucketEntry>();

export async function rateLimit(
  key: string, 
  { max, windowMs }: { max: number; windowMs: number }
): Promise<boolean> {
  const now = Date.now();
  const entry = buckets.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count++;
  buckets.set(key, entry);

  return entry.count <= max;
}
