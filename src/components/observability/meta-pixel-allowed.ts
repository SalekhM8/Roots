/**
 * PHI blocklist for Meta Pixel + CAPI. ANY route matching this list must
 * NOT fire Meta events (browser or server) — these pages contain or are
 * adjacent to clinical/medical data that would breach UK GDPR + our own
 * security rules if forwarded to an ad platform.
 *
 * Enforced in three places (defence in depth):
 *   1. MetaPixelBase — skips PageView on the client.
 *   2. MetaPixelEvent — skips conversion events on the client.
 *   3. /api/meta/capi — refuses to forward if event_source_url matches.
 *
 * Keep this list in sync with src/app/api/meta/capi/route.ts.
 */

const BLOCKED_PREFIXES = [
  "/consultations/", // every step of the clinical questionnaire
  "/account", // logged-in customer dashboard (orders, consultations, profile)
  "/admin", // staff/prescriber dashboards
  "/sign-in",
  "/sign-up",
  "/api/", // never relevant — APIs don't render pages
];

/**
 * Returns true if Meta events are allowed on this pathname.
 *
 * `pathname` should be the route path only — not a full URL, not query
 * string. e.g. `/treatments/mounjaro`, `/consultations/mounjaro/start`.
 */
export function isMetaPixelAllowed(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return !BLOCKED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  );
}
