type Bucket = { count: number; until: number };

const buckets = new Map<string, Bucket>();

export function clientIp(headerValue: string | null) {
  const ip = headerValue?.split(",")[0]?.trim() ?? "";
  return ip.length > 0 && ip.length < 80 ? ip : "unknown";
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const row = buckets.get(key);
  if (!row || now > row.until) {
    buckets.set(key, { count: 1, until: now + windowMs });
    return true;
  }
  if (row.count >= limit) return false;
  row.count += 1;
  return true;
}
