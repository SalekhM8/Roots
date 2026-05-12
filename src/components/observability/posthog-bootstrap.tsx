"use client";

import { useEffect } from "react";
import { initPostHog } from "@/lib/observability/posthog";

/**
 * Mount-once bootstrap so PostHog actually initializes in the browser.
 * Renders nothing.
 */
export function PostHogBootstrap() {
  useEffect(() => {
    initPostHog();
  }, []);
  return null;
}
