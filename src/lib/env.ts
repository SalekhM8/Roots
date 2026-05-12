import { z } from "zod";

/**
 * Centralised, fail-fast environment validation.
 *
 * Imported once from `src/instrumentation.ts` at server boot so a missing or
 * malformed required variable surfaces immediately with a readable error,
 * rather than as a `Cannot read properties of undefined` at request time.
 *
 * Three groupings:
 *   - required:  must be present in every environment, server crashes if missing
 *   - optional:  feature degrades gracefully when absent (Sentry, Click&Drop, etc.)
 *   - public:    NEXT_PUBLIC_* — inlined into client bundle, so we validate the
 *                shape we expect to read on the server too
 *
 * Payment provider (Viva) vars are required — the integration owns its own
 * runtime fail-fast checks too, but listing them here surfaces misconfig at
 * boot instead of at first checkout.
 */

const serverSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Clerk
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),

  // Email
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1).optional(),

  // S3 uploads
  S3_UPLOAD_BUCKET: z.string().min(1),
  AWS_REGION: z.string().min(1).optional(),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),

  // Viva payments — see src/lib/payments/viva.ts.
  // Two parallel auth schemes against two distinct hostnames per environment.
  VIVA_ENV: z.enum(["demo", "production"]),
  VIVA_MERCHANT_ID: z.string().uuid(),
  VIVA_API_KEY: z.string().min(1),
  VIVA_CLIENT_ID: z.string().min(1),
  VIVA_CLIENT_SECRET: z.string().min(1),
  VIVA_SOURCE_CODE: z.string().min(1),
  // Webhook verification key — fetched once via GET /api/messages/config/token
  // (Basic auth) and pinned in env. Echoed verbatim from the GET handshake on
  // /api/viva/webhook so Viva can verify URL ownership at registration.
  VIVA_WEBHOOK_KEY: z.string().min(1),

  // Optional integrations — degrade gracefully if absent
  SENTRY_DSN: z.string().url().optional(),
  CLICK_DROP_API_KEY: z.string().min(1).optional(),
  OPS_ALERT_EMAIL: z.string().email().optional(),

  // Vercel KV (rate limiter — added in C2)
  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().min(1).optional(),

  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
});

const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
});

type ServerEnv = z.infer<typeof serverSchema>;
type PublicEnv = z.infer<typeof publicSchema>;

function formatError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

let cachedServerEnv: ServerEnv | null = null;

/**
 * Returns validated server-side env vars. Throws on first call if validation
 * fails. Subsequent calls return the cached parse.
 *
 * Safe to call from Edge runtime — Zod is isomorphic.
 */
export function serverEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;

  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    const message = `Invalid server environment configuration:\n${formatError(result.error)}`;
    // Log AND throw so the failure is visible in Vercel logs even if the
    // throwing context swallows it.
    console.error(message);
    throw new Error(message);
  }
  cachedServerEnv = result.data;
  return cachedServerEnv;
}

let cachedPublicEnv: PublicEnv | null = null;

export function publicEnv(): PublicEnv {
  if (cachedPublicEnv) return cachedPublicEnv;
  const result = publicSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });
  if (!result.success) {
    const message = `Invalid public environment configuration:\n${formatError(result.error)}`;
    console.error(message);
    throw new Error(message);
  }
  cachedPublicEnv = result.data;
  return cachedPublicEnv;
}

/**
 * Eager validation — call from `instrumentation.ts#register` so a misconfigured
 * deployment fails on boot rather than on the first request.
 *
 * Only validates the server schema; client-side reads happen via individual
 * `process.env.NEXT_PUBLIC_*` references which Next.js inlines at build time.
 */
export function assertServerEnv(): void {
  serverEnv();
}
