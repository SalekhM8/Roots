# 08-orders-payments-and-statuses.md

## Consultation Statuses
draft → submitted → under_review → approved | rejected | action_required
action_required → under_review (after upload). Any active → expired (service logic only).

## Payment Statuses
pending → authorized → captured | voided | expired
captured → refunded

## Fulfillment Statuses
unfulfilled → ready_to_pack → packed → labels_created → collection_booked → shipped → delivered

## Shipping Statuses
not_created → label_generated → tracking_attached → collected → in_transit → delivered

## Mounjaro/Mixed Lifecycle
1. Consultation submitted. 2. Checkout: authorize full amount. 3. Review.
4a. Approved: capture all → ready_to_pack. 4b. Rejected: void all. 4c. More info: action_required.
5. Auth expired (7 days): payment expired, email customer to re-checkout.
6. Pack → labels via Click & Drop → ship → deliver.

## Supplement Lifecycle
Checkout: capture immediately → ready_to_pack → pack → ship → deliver.

## Authorization Expiry — CRITICAL
Standard Stripe auth: 7 days. Extended auth NOT available for healthcare merchants.
- Store capture_before from Stripe on payment record
- Inngest daily job: check auth expiring within 24hrs → alert admin
- Expired before review: void, mark expired, email customer
- Prescriber SLA: 48hr target, 5-day max

## Transition Rules
- ready_to_pack requires payment captured
- shipped requires packed + tracking
- No capture before POM approval
- Rejection voids auth promptly
- Mixed: authorize all, capture all on approval, void all on rejection

## Audit
Every transition → audit_log with actor, role, entity, action, before/after, timestamp.

## Email Triggers
submitted, action_required, approved, rejected, captured, shipped, expired (re-checkout).
