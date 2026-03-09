# CLAUDE.md

## Project
ROOTS is a custom UK pharmacy and wellness platform. It sells one flagship consultation-led prescription medicine (Mounjaro) and a small range of wellness supplements. The platform replaces an existing Shopify storefront and must visually match it as closely as possible while implementing custom clinical, commerce, and fulfillment workflows.

## Primary Goal
Recreate the Shopify visual theme with pixel-level fidelity while implementing a consultation-led and commerce-led workflow that is fast, secure, and scalable to thousands of users.

## Source of Truth — Read These First
Before writing ANY code for a feature, read the relevant doc:
- `docs/00-product-overview.md` — what ROOTS is and what v1 must achieve
- `docs/01-brand-and-styling.md` — visual system (THE visual source of truth)
- `docs/01-theme-extracted-values.md` — exact values extracted from Shopify theme config
- `shopify-theme-reference/` — complete Shopify theme export (Liquid templates, CSS, config)
- `docs/02-architecture.md` — stack, hosting, domain modules, build philosophy
- `docs/03-route-map.md` — every route, access control, route groups
- `docs/04-user-journeys.md` — every user flow end to end
- `docs/05-auth-and-access-control.md` — Clerk setup, roles, session rules
- `docs/06-data-model.md` — complete Prisma schema with indexes and constraints
- `docs/07-consultations-and-clinical-flow.md` — consultation questions, save/restore, prescriber workflow
- `docs/08-orders-payments-and-statuses.md` — state machines, transition rules, Stripe authorize/capture
- `docs/09-fulfillment-and-shipping.md` — Click & Drop API integration, label printing, collection
- `docs/10-emails-and-notifications.md` — every transactional email, Resend + Inngest
- `docs/11-admin-and-prescriber-dashboards.md` — internal UI, queues, review pages
- `docs/12-security-privacy-and-compliance.md` — PHI handling, RBAC, upload security, audit logging
- `docs/13-observability-and-operations.md` — Sentry, PostHog, OpenTelemetry, alerting
- `docs/14-ai-and-agent-boundaries.md` — no AI in v1
- `docs/15-build-order.md` — exact implementation sequence
- `docs/16-testing-and-release.md` — testing strategy, launch checklist

## Stack
- Next.js 14+ App Router
- TypeScript (strict mode)
- Tailwind CSS
- Prisma + Neon Postgres (use @neondatabase/serverless driver with connection pooling)
- Clerk (authentication and session management)
- Stripe (payments — pharma waiver required, authorize/capture model)
- AWS S3 (presigned uploads for medical photos/ID)
- Resend (transactional email)
- Inngest (durable workflows, event-driven jobs)
- Royal Mail Click & Drop API (shipping labels and tracking)
- Sentry (error monitoring)
- PostHog (product analytics — no PHI)
- OpenTelemetry (traces)

## Build Order — Follow This Exactly
1. Theme tokens, font loading, CSS custom properties
2. Layout shell: announcement bar, header, footer
3. Homepage clone (must visually match Shopify before moving on)
4. Collection page template + product page template
5. Mounjaro PDP with "Start Consultation" CTA
6. Clerk auth integration (sign-up, sign-in, route protection, role seeding)
7. Prisma schema from doc 06, migrations, seed data
8. Account dashboard shell (orders list, consultations list, profile, addresses)
9. Multi-step consultation flow with local state persistence and auth gate
10. Cart + checkout: supplement immediate capture, POM/mixed authorize-all model
11. Stripe webhook handler with idempotency
12. Prescriber review queue and consultation detail page
13. Approve/reject/request-more-info actions with payment capture/void
14. Upload flow (presigned S3, consultation-scoped)
15. Fulfillment queue with mark-packed, Click & Drop API push, tracking attach
16. Transactional emails via Resend + Inngest workflows
17. Observability: Sentry, PostHog, OTel traces
18. Hardening: rate limiting, audit log coverage review, logging redaction pass

After each phase, run `/simplify` to review code quality, eliminate duplication, and fix structural issues.

## Architecture Rules — Non-Negotiable
- Server Components by default. Client Components ONLY for interactive elements (forms, modals, cart, tables with client-side filtering).
- Page files orchestrate. They do NOT contain business logic.
- Business logic lives in `server/services/` and `server/workflows/`.
- Integration code lives in `lib/` (e.g., `lib/payments/stripe.ts`, `lib/shipping/click-drop.ts`).
- UI components live in `components/` organized by domain.
- Every server mutation validates input with Zod. No exceptions.
- Every status transition is implemented as a service function, never inline in a route handler.
- Every privileged action (approve, reject, capture, void, pack, ship) creates an audit log entry.
- All money values stored as integers in minor units (pence). Never use floats for money.

## Folder Structure
```
src/
  app/
    (marketing)/          # homepage, about, contact, legal pages
    (shop)/               # collections, products, cart, checkout
    (account)/            # customer dashboard, orders, consultations, profile
    (admin)/              # admin + prescriber internal pages
    api/                  # route handlers (webhooks, presign, actions)
  components/
    layout/               # header, footer, announcement bar
    marketing/            # hero, showcase sections
    product/              # product cards, PDPs
    consultation/         # multi-step form, progress indicator
    checkout/             # cart, checkout flow
    account/              # dashboard cards, order/consultation detail
    admin/                # queues, review pages, fulfillment
    ui/                   # shared primitives (buttons, inputs, pills, modals)
  lib/
    auth/                 # Clerk helpers, role checks
    db/                   # Prisma client, connection pooling
    payments/             # Stripe service (intents, capture, void, webhooks)
    shipping/             # Click & Drop API adapter
    email/                # Resend templates and send helpers
    validation/           # Zod schemas
    observability/        # Sentry, PostHog, OTel setup
    security/             # rate limiting, audit log helpers
  server/
    services/             # domain service functions (consultation, order, fulfillment, payment)
    workflows/            # Inngest workflow definitions
    queries/              # read-only data fetching functions
  styles/                 # global CSS, tokens
  hooks/                  # React hooks for client components
  types/                  # shared TypeScript types
public/
  assets/theme/           # exported Shopify assets (logos, icons, illustrations)
docs/                     # all source-of-truth documentation
```

## Performance Rules
- Use Neon serverless driver (`@neondatabase/serverless`) for connection pooling. Vercel serverless functions will exhaust connections without this.
- Server-side paginate ALL admin list pages. Never load unbounded result sets.
- Add composite database indexes for every filtered admin query: `(fulfillment_status, created_at)`, `(payment_status, fulfillment_status)`, `(status, submitted_at)` on consultations.
- Lazy-load non-critical images. Optimize hero and product media.
- Split admin route group from public bundles using Next.js route groups.
- No N+1 queries. Use Prisma `include` for related data in list views.

## Payment Rules — Critical
- Stripe pharma waiver is required before processing POM payments.
- Mounjaro orders and mixed orders (POM + supplements): authorize FULL amount at checkout, capture ALL on prescriber approval, void ALL on rejection.
- Supplement-only orders: capture immediately at checkout.
- Standard Stripe authorization expires in 7 days. Store the `capture_before` timestamp from Stripe on the payment record.
- Create an Inngest cron job that checks for authorizations expiring within 24 hours and alerts admin.
- If authorization expires before prescriber review: void the payment, set order to `payment_expired`, email customer to re-checkout.
- Use idempotency keys on all Stripe write operations.
- Store `stripe_event_id` on webhook processing to prevent duplicate handling.
- Verify webhook signatures on every Stripe webhook request.

## Consultation Rules
- Consultation questions must exactly match the schema in doc 07 (based on Oxford Online Pharmacy flow).
- Form state preserved in React state (useState/useReducer) across steps.
- Before auth gate: save state to sessionStorage.
- After auth redirect: restore from sessionStorage, continue flow.
- Clear sessionStorage after successful server submit.
- Only one active Mounjaro consultation per user at a time.
- Server-side BMI calculation is canonical. Never trust client BMI.
- All consultation answers are special category data under UK GDPR. Handle accordingly.

## Auth Rules
- Use Clerk for all authentication and session management.
- Store `clerk_user_id` on the app `users` table. Do NOT store password hashes — Clerk owns credentials.
- Roles (customer, admin, prescriber) stored in app DB via `user_roles` table.
- Role checks MUST happen server-side on every protected action and every protected page load. Never rely on UI hiding alone.
- Admin/prescriber accounts are seeded, not self-service.
- Auth gate in consultation flow must preserve and restore form state.

## Security Rules — Non-Negotiable
- No PHI in logs, analytics, error messages, or URLs.
- No secrets in client bundles or source code.
- All uploads use presigned S3 URLs. Private bucket only. Short-lived URLs.
- Uploads scoped to user + consultation. Ownership verified server-side before presign.
- All external input validated with Zod on the server.
- Stripe webhook signatures verified on every request.
- RBAC enforced server-side on every mutation and every protected page.
- Audit log written for every privileged action (append-only, never update or delete).
- Secure httpOnly cookies for sessions (handled by Clerk).
- Rate limit: auth endpoints, consultation submit, upload presign, checkout creation, all admin actions.

## Fulfillment Rules
- Mounjaro enters fulfillment queue ONLY after consultation approved AND payment captured.
- Supplements enter fulfillment queue once payment captured.
- Mixed orders: everything waits for POM approval, then entire order enters fulfillment.
- Click & Drop API integration from day one (not CSV export).
- Shipping adapter layer: all shipping logic behind `lib/shipping/` so provider can be swapped.
- Track: carrier, service, tracking_number, tracking_url, shipping_status per shipment.
- Customer receives shipped email with tracking link.

## Email Rules
- All transactional emails triggered through Inngest workflows, not inline in route handlers.
- Every email send creates an `email_events` record for traceability.
- Email content must match dashboard state. Never say "approved" if still under review.
- Email design: ROOTS branded (dark green/cream), clean, one primary CTA per email.
- Emails: account created, consultation submitted, order received, action required, approved, rejected, payment captured, shipped, delivered (optional).

## Visual Rules
- Follow `docs/01-brand-and-styling.md` exactly.
- Fraunces for logo wordmark only. DM Sans for all other text (body and headings).
- Color tokens: `--roots-green: #045c4b`, `--roots-cream: #fdf0d5`, `--roots-navy: #003049`, `--roots-orange: #f77f00`.
- Generous spacing. No cramped layouts. Minimum 64px vertical section padding.
- Soft radii everywhere (8-22px). No hard corners on public pages.
- Subtle motion only (200-300ms transitions). No springy animations.
- Homepage must look visually identical in spirit to the current Shopify theme.
- All public pages must feel premium, editorial, calm, high-trust.
- Status pills consistent across all admin views.

## What NOT To Build in v1
- Subscriptions or recurring billing
- AI workflows of any kind
- Direct Royal Mail API (use Click & Drop API)
- Support role or team messaging
- Multiple POM products beyond Mounjaro
- Complex marketing automation
- Multi-warehouse routing
- Guest checkout (account required)

## Code Quality
- Strict TypeScript. No `any` types except where truly unavoidable.
- Small, composable components. Max ~150 lines per component file.
- Explicit prop types on all components.
- Deterministic service functions for all workflows.
- Run `/simplify` after completing each build phase.
- Prefer named exports for service functions, default exports for page/layout components.

## Definition of Done for Each Feature
A feature is complete only when:
- [ ] UI exists and matches brand styling
- [ ] Server logic exists with Zod validation
- [ ] Database persistence works with correct indexes
- [ ] Status transitions update correctly
- [ ] Audit logs written for privileged actions
- [ ] Appropriate email triggered
- [ ] Role access enforced server-side
- [ ] No PHI leaked to logs/analytics
- [ ] Works on mobile viewport
