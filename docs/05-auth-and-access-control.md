# 05-auth-and-access-control.md

## Provider: Clerk
Owns credentials. App DB stores clerk_user_id reference only. No password_hash in our DB.

## Auth Methods
Customer: email + password. Internal: seeded accounts. No magic link in v1.

## Account Requirements
Public browsing: no auth. Start consultation: guest OK. Submit consultation: auth required. Checkout: auth required.

## Roles (stored in app DB user_roles table)
customer, admin, prescriber. Checked server-side on every protected action.

## Auth UX
Must look like ROOTS (customize Clerk components). Auth gate preserves consultation state via sessionStorage. Post-auth: restore and continue.

## Internal Accounts
Seeded. No self-service admin creation.

## Access Matrix
Customer: own data only. Admin: all orders/fulfillment/products. Prescriber: consultation review + linked orders.

## Security
Server-side role checks everywhere. No PHI in auth callbacks/URLs. No hidden admin pages without enforcement.
