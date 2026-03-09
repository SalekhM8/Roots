import * as Sentry from "@sentry/nextjs";

/**
 * Initialize Sentry for error monitoring.
 * Called from instrumentation.ts.
 */
export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
    // Strip PHI from breadcrumbs and events
    beforeSend(event) {
      if (event.request?.data) {
        event.request.data = "[REDACTED]";
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      // Strip query strings that might contain PHI
      if (breadcrumb.data?.url) {
        try {
          const url = new URL(breadcrumb.data.url);
          url.search = "";
          breadcrumb.data.url = url.toString();
        } catch {
          // not a valid URL, skip
        }
      }
      return breadcrumb;
    },
  });
}
