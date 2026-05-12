import type { NextConfig } from "next";

/**
 * Content Security Policy.
 *
 * v1 ships with `'unsafe-inline'` for scripts and styles because:
 *   - Next.js injects inline runtime scripts for hydration / streaming
 *   - The marketing layout includes inline gtag + Trustpilot bootstrap
 *   - Tailwind / shadcn rely on inline style attributes for dynamic classes
 *
 * `'unsafe-eval'` is allowed in development only (Next.js Fast Refresh).
 * Hardening to nonce-based CSP is tracked as a post-launch item.
 *
 * Allowlist covers the third-parties the app actually talks to:
 *   - Clerk (auth)
 *   - PostHog (analytics, EU + US hosts because the env var picks one)
 *   - Sentry (error monitoring)
 *   - Trustpilot (widget)
 *   - Google Ads / Tag Manager
 *   - Resend (email — server-side, but allowed defensively)
 *   - Royal Mail Click & Drop API (server-side)
 *   - Inngest (server-side workflow ingestion)
 *   - Upstash (rate-limiter REST)
 *   - AWS S3 (presigned upload PUT/GET)
 *
 * Payment provider hosts (Viva) will be added when that integration lands.
 */
const isDev = process.env.NODE_ENV !== "production";

const cspDirectives: Record<string, string[]> = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    "https://*.clerk.accounts.dev",
    "https://clerk.com",
    "https://*.clerk.dev",
    "https://www.googletagmanager.com",
    "https://www.googleadservices.com",
    "https://www.google.com",
    "https://widget.trustpilot.com",
    "https://*.trustpilot.com",
    "https://*.posthog.com",
    "https://eu-assets.i.posthog.com",
    "https://us-assets.i.posthog.com",
  ],
  "style-src": [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
  ],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https:",
  ],
  "font-src": [
    "'self'",
    "data:",
    "https://fonts.gstatic.com",
  ],
  "connect-src": [
    "'self'",
    "https://*.clerk.accounts.dev",
    "https://clerk.com",
    "https://*.clerk.dev",
    "https://api.clerk.dev",
    "https://*.posthog.com",
    "https://api.resend.com",
    "https://api.parcel.royalmail.com",
    "https://api.inngest.com",
    "https://*.ingest.sentry.io",
    "https://*.sentry.io",
    "https://*.upstash.io",
    "https://*.amazonaws.com",
    "https://www.google-analytics.com",
    "https://www.googletagmanager.com",
  ],
  "frame-src": [
    "'self'",
    "https://*.clerk.accounts.dev",
    "https://clerk.com",
    "https://challenges.cloudflare.com",
    "https://www.google.com",
  ],
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "object-src": ["'none'"],
  "worker-src": ["'self'", "blob:"],
  "manifest-src": ["'self'"],
  "media-src": ["'self'", "blob:", "data:"],
};

const cspHeader = Object.entries(cspDirectives)
  .map(([key, values]) => `${key} ${values.join(" ")}`)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
