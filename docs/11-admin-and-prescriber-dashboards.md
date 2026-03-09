# 11-admin-and-prescriber-dashboards.md

## Principles
Functional but ROOTS-branded. Every queue answers: what needs doing, by whom, right now. All lists server-side paginated (25/page).

## Admin Home (/admin)
Cards: consultations awaiting review, orders awaiting fulfillment, action required, shipped today, auth expiring <24hrs.

## Prescriber Queue (/admin/consultations)
Columns: customer, age, BMI, product, date, status, uploads, order, auth expiry. Sort: oldest first. Flag expiry <48hrs.

## Review Page (/admin/consultations/[id])
Patient summary, metrics, all medical answers, GP details, safety confirmations, uploads, order/payment/auth-expiry context, notes, actions (approve/reject/request info).

## Orders (/admin/orders + /admin/orders/[id])
Full order detail: items, consultation link, payment, shipping, fulfillment, audit timeline.

## Fulfillment (/admin/fulfillment)
See doc 09. Checkbox selection, bulk actions.

## Products (/admin/products)
List, edit, pricing, stock, collections, archive.

## Search: order number, email, name, tracking number.
## Status Pills: consistent design across all views.
## Audit Timeline: chronological events on detail pages.
