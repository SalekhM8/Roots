# 10-emails-and-notifications.md

## Provider: Resend. All via Inngest workflows (not inline).

## Emails
- Account created / verification
- Consultation submitted
- Action required (upload needed)
- Order approved
- Order rejected
- Payment captured
- Payment expired (re-checkout needed)
- Shipped (with tracking)
- Delivered (optional)

## Design: ROOTS branded (dark green/cream), one CTA per email, clean.
## Rules: Idempotent, workflow-driven, every send creates email_events record.
## Internal: Dashboard counters for new consultations, uploads, failures.
