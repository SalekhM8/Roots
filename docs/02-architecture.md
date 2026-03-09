# 02-architecture.md

## Purpose
Technical architecture. Prevents overengineering and future rewrites.

## 1. Architecture: Modular Monolith
One deployable Next.js app with strong internal domain separation.

## 2. Stack
- Next.js 14+ App Router, TypeScript, Tailwind CSS
- Neon Postgres + Prisma (@neondatabase/serverless for connection pooling)
- Clerk (auth), Stripe (payments — pharma waiver required)
- AWS S3 (presigned uploads), Resend (email), Inngest (workflows)
- Royal Mail Click & Drop API (shipping)
- Sentry, PostHog, OpenTelemetry (observability)

## 3. Runtime
Server Components by default. Client Components only for: consultation form, cart, upload UI, modals, admin tables with client filtering. Route Handlers for server endpoints.

## 4. Hosting: Vercel
Environments: local, preview, production.

## 5. Database: Neon Postgres
Use @neondatabase/serverless for connection pooling (critical for Vercel serverless). PITR enabled. UUID PKs. Foreign keys everywhere. Composite indexes for admin queries.

## 6. Domains
Public (marketing, catalog), Auth/Account, Clinical (consultations, reviews, prescriptions, uploads), Commerce (carts, checkout, orders, payments), Operations (fulfillment, shipments, tracking), Internal (admin, prescriber, audit).

## 7. Build Philosophy
No premature microservices. No library sprawl. No business logic in page files. Every feature defines: routes, entities, statuses, emails, audit events, roles, components.
