# 03-route-map.md

## Public Routes
`/` homepage, `/collections/[slug]`, `/products/[slug]`, `/consultations/mounjaro` (guest start, auth for submit), `/sign-in`, `/sign-up`, `/about`, `/contact`, `/privacy`, `/terms`, `/delivery`, `/refunds`

## Account Routes (authenticated customer)
`/account` dashboard, `/account/orders`, `/account/orders/[id]`, `/account/consultations`, `/account/consultations/[id]`, `/account/profile`, `/account/addresses`

## Admin Routes (role required)
`/admin` dashboard, `/admin/consultations` queue, `/admin/consultations/[id]` review, `/admin/orders`, `/admin/orders/[id]`, `/admin/fulfillment`, `/admin/products`, `/admin/products/[id]`

## API Routes
`/api/stripe/webhook`, `/api/uploads/presign`, `/api/consultations/[id]/approve`, `/api/consultations/[id]/reject`, `/api/consultations/[id]/request-more-info`, `/api/fulfillment/push-to-click-drop`, `/api/orders/[id]/attach-tracking`, `/api/orders/[id]/mark-packed`, `/api/orders/[id]/mark-shipped`

## Rules
No PHI in URLs. Customer routes scope to owner. Admin routes server-protected by role.
