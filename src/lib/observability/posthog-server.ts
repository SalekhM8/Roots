import { PostHog } from "posthog-node";

let _posthog: PostHog | null = null;

/**
 * Server-side PostHog client for server events.
 * No PHI in any captured events.
 */
export function getPostHogServer(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  if (!_posthog) {
    _posthog = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.posthog.com",
    });
  }

  return _posthog;
}
