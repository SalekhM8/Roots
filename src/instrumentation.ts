import { initSentry } from "@/lib/observability/sentry";
import { assertServerEnv } from "@/lib/env";

/**
 * Next.js instrumentation hook. Runs once per server process at startup
 * (both Node.js runtime and Edge runtime). This is where we initialize
 * Sentry — without it, the SDK silently does nothing — and validate the
 * server environment so a misconfigured deployment crashes on boot rather
 * than on the first request.
 */
export function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" ||
    process.env.NEXT_RUNTIME === "edge"
  ) {
    assertServerEnv();
    initSentry();
  }
}
