/**
 * Simple in-memory rate limiter for serverless.
 * For production at scale, swap to Vercel KV or Upstash Redis.
 *
 * Limits: auth endpoints, consultation submit, upload presign,
 * checkout creation, admin actions.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (unref to not prevent process exit)
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, 60_000);
cleanupTimer.unref();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const LIMITS: Record<string, RateLimitConfig> = {
  auth: { maxRequests: 10, windowMs: 60_000 },
  consultation: { maxRequests: 5, windowMs: 60_000 },
  upload: { maxRequests: 10, windowMs: 60_000 },
  checkout: { maxRequests: 5, windowMs: 60_000 },
  admin: { maxRequests: 30, windowMs: 60_000 },
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given action + identifier.
 */
export type RateLimitAction = keyof typeof LIMITS;

export function checkRateLimit(
  action: RateLimitAction,
  identifier: string
): RateLimitResult {
  const config = LIMITS[action];
  if (!config) return { allowed: true, remaining: 999, resetAt: 0 };

  const key = `${action}:${identifier}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}
