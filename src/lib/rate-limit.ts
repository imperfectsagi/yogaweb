/**
 * Simple, dependency-free rate limiter backed by Cloudflare KV.
 *
 * Used to protect:
 *  - /api/admin/login  (brute-force login protection)
 *  - /api/admin/password (password-change abuse)
 *  - /api/leads (public contact/free-class form spam)
 *  - /api/admin/media/upload (upload flooding)
 *
 * KV is eventually consistent, which is fine here: this is a defense-in-depth
 * throttle, not a strict counter. Cloudflare's edge network + WAF provide the
 * first layer of DDoS protection automatically; this adds an app-level layer
 * against credential stuffing and form spam.
 */

import { getRateLimitKv } from "./db";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * @param key Unique bucket key, e.g. `login:<ip>` or `lead:<ip>`
 * @param limit Max requests allowed within the window
 * @param windowSeconds Length of the sliding window
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const kv = getRateLimitKv();
  const now = Date.now();
  const raw = await kv.get(key);

  let count = 0;
  let windowStart = now;

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { count: number; windowStart: number };
      if (now - parsed.windowStart < windowSeconds * 1000) {
        count = parsed.count;
        windowStart = parsed.windowStart;
      }
    } catch {
      // corrupt value, reset
    }
  }

  count += 1;

  const allowed = count <= limit;
  const retryAfterSeconds = Math.max(
    0,
    Math.ceil((windowStart + windowSeconds * 1000 - now) / 1000)
  );

  await kv.put(key, JSON.stringify({ count, windowStart }), {
    expirationTtl: windowSeconds,
  });

  return {
    allowed,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds,
  };
}

/** Extracts the caller's IP from Cloudflare's standard header. */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
