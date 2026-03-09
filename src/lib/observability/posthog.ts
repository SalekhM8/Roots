"use client";

import posthog from "posthog-js";

/**
 * Initialize PostHog for product analytics.
 * No PHI in analytics events.
 */
export function initPostHog() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || typeof window === "undefined") return;

  posthog.init(key, {
    api_host: host ?? "https://eu.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    // Disable session recording for GDPR / PHI safety
    disable_session_recording: true,
    // Strip PHI-sensitive properties
    sanitize_properties: (properties) => {
      delete properties.$current_url;
      delete properties.$pathname;
      return properties;
    },
  });
}

export { posthog };
