# 13-observability-and-operations.md

## Tools: Sentry (errors), PostHog (analytics, no PHI), OpenTelemetry (traces).

## Traces: consultation submit, checkout, payment auth/capture/void, prescriber decisions, fulfillment, email send.

## Alerts: Stripe failures, capture failures, Click & Drop failures, email failures, auth expiry <24hrs.

## Inngest Jobs
Daily: auth expiry check, stale consultation cleanup (draft >30 days), action_required reminders (>48hrs), ops summary, unshipped check (packed >48hrs).

## Logging: IDs, transitions, timing. NEVER raw medical data.
