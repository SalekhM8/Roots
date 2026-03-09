# 15-build-order.md

## Exact sequence — do not jump ahead.

0. Prep: export Shopify assets, screenshots, inspect CSS values, commit docs
1. Scaffold: Next.js, TS, Tailwind, Prisma, Clerk, Stripe, Resend, Inngest, observability
2. Design system + homepage clone (must match Shopify before logic work)
3. Public commerce: collections, products, Mounjaro PDP
4. Auth + DB together: Clerk, Prisma schema (doc 06), migrations, seeds
5. Account dashboard: shell, profile, addresses, orders, consultations
6. Consultation flow: 4-step form (doc 07), auth gate, save/restore
7. Checkout + payment: immediate capture (supplements), authorize-all (POM/mixed), webhooks
8. Prescriber workflow: queue, review, approve/reject/request-info, capture/void
9. Uploads: presigned S3, consultation-scoped
10. Fulfillment: queue, mark packed, Click & Drop API, tracking, mark shipped
11. Emails: all templates via Resend + Inngest
12. Observability + hardening: Sentry, PostHog, OTel, rate limits, audit review
13. QA + launch prep

After each phase: run /simplify

## Rules
No subs, AI, or direct RM API in v1. Lock visual system first. Every feature needs: transitions, audits, emails, RBAC.
