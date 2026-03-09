# 16-testing-and-release.md

## Critical Test Journeys
1. Mounjaro: consult → auth gate → resume → submit → checkout → auth → approve → capture → fulfill → ship
2. Rejection: submit → checkout → auth → reject → void → notified
3. More info: submit → checkout → request info → upload → re-review
4. Auth expiry: submit → checkout → 7 days → expired → customer emailed
5. Supplements: cart → checkout → capture → fulfill → ship
6. Mixed: POM+supplement → single checkout → auth → approve → capture all → fulfill

## Release Checklist
All secrets set. DB migrated+seeded. S3 private. Stripe webhook + pharma waiver. Resend configured. Click & Drop API key. Sentry+PostHog. Seed accounts. E2E payment test.

## Rollback
Previous deploy available. Migration rollback documented. Emergency payment disable path.
