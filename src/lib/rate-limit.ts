/**
 * Simple in-memory rate limiter for serverless/edge.
 * Tracks attempts per key (typically IP) with a sliding window.
 * Note: In serverless, each instance has its own memory, so this is
 * per-instance. For stricter limiting, use Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 60_000); // Every 60 seconds

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  max: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Check rate limit for a given key.
 * Returns whether the request is allowed and remaining quota.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const entry = store.get(key);

  // No existing entry or window expired — allow and start fresh
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: config.max - 1, retryAfterSeconds: 0 };
  }

  // Within window — check count
  if (entry.count >= config.max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds: retryAfter };
  }

  // Within window, under limit — increment
  entry.count++;
  return { allowed: true, remaining: config.max - entry.count, retryAfterSeconds: 0 };
}

/**
 * Extract client IP from Next.js request headers.
 *
 * Prefer the platform-set headers (`x-vercel-forwarded-for`, then `x-real-ip`)
 * over the LEFT-most `x-forwarded-for` token, which a client can forge — the
 * left-most XFF value is attacker-controlled on Vercel (the edge appends the
 * real IP, it does not strip a spoofed leading value). Using the forgeable
 * value as a rate-limit key or stored abuse signal lets an attacker rotate it
 * to evade limits or poison another user's IP. `x-vercel-forwarded-for` is set
 * by the Vercel edge and is reserved (inbound copies are overwritten).
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}
