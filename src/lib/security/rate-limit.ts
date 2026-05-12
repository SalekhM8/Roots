/**
 * Distributed rate limiter backed by Vercel KV (Upstash Redis under the hood).
 *
 * Why distributed: serverless functions on Vercel are isolated per-instance,
 * so an in-memory Map gives every concurrent invocation its own counter and
 * leaks the limit. Upstash's REST API works from both Node and Edge runtimes
 * and serialises counts across all instances.
 *
 * Limits below cover: auth, consultation submit, upload presign, checkout
 * creation, admin actions. Each limit uses a sliding-window algorithm via
 * `@upstash/ratelimit`.
 *
 * Env vars (auto-set by Vercel when you provision Upstash via marketplace):
 *   KV_REST_API_URL
 *   KV_REST_API_TOKEN
 *
 * If the env vars are missing, the limiter fails OPEN (allows the request)
 * but logs a warning. We deliberately fail open rather than closed because
 * a misconfigured KV would otherwise lock every user out of the entire app.
 */

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const LIMITS = {
  auth: { maxRequests: 10, windowMs: 60_000 },
  consultation: { maxRequests: 5, windowMs: 60_000 },
  upload: { maxRequests: 10, windowMs: 60_000 },
  checkout: { maxRequests: 5, windowMs: 60_000 },
  admin: { maxRequests: 30, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitConfig>;

export type RateLimitAction = keyof typeof LIMITS;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

let redis: Redis | null = null;
let warnedMissingEnv = false;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    if (!warnedMissingEnv) {
      console.warn(
        "[rate-limit] KV_REST_API_URL/KV_REST_API_TOKEN not set — rate limiting disabled (failing open).",
      );
      warnedMissingEnv = true;
    }
    return null;
  }
  redis = new Redis({ url, token });
  return redis;
}

// One Ratelimit instance per action, lazily created. Each uses sliding-window.
const limiters = new Map<RateLimitAction, Ratelimit>();

function getLimiter(action: RateLimitAction): Ratelimit | null {
  const cached = limiters.get(action);
  if (cached) return cached;
  const client = getRedis();
  if (!client) return null;
  const cfg = LIMITS[action];
  const limiter = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(cfg.maxRequests, `${cfg.windowMs} ms`),
    prefix: `rl:${action}`,
    analytics: false,
  });
  limiters.set(action, limiter);
  return limiter;
}

/**
 * Check rate limit for a given action + identifier.
 * Identifier should be a stable per-actor key — e.g. user.id, guest email,
 * or IP for unauthenticated endpoints.
 */
export async function checkRateLimit(
  action: RateLimitAction,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getLimiter(action);
  if (!limiter) {
    // Fail open when KV is unconfigured (dev / first deploy before KV provisioned).
    const cfg = LIMITS[action];
    return { allowed: true, remaining: cfg.maxRequests, resetAt: 0 };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  } catch (err) {
    // Network blip or KV outage — fail open and surface in logs.
    console.error("[rate-limit] check failed; failing open:", err);
    const cfg = LIMITS[action];
    return { allowed: true, remaining: cfg.maxRequests, resetAt: 0 };
  }
}
