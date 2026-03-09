# 06-data-model.md

## Purpose
Canonical data model for ROOTS v1. No implementation should deviate from this schema.

---

## 1. Global Conventions

- **IDs**: UUIDs for all primary keys
- **Timestamps**: `created_at` and `updated_at` on every table. Domain-specific timestamps where useful (`submitted_at`, `approved_at`, `captured_at`, `shipped_at`, `delivered_at`)
- **Money**: integer fields in minor units (pence). Column suffix: `_minor`. Never use floats.
- **Soft deletion**: use `archived_at` on products only. Orders/consultations/users are never soft-deleted.
- **Enums**: use Prisma enums for stable core values (consultation_status, payment_status, fulfillment_status, shipping_status, role)
- **Auditing**: every privileged action generates an audit_log row

---

## 2. Core Entities

### Identity / Access
- users
- user_roles

### Customer Profile
- customer_profiles
- addresses

### Catalog
- products
- product_variants
- collections
- collection_products

### Commerce
- carts
- cart_items
- orders
- order_items
- payments

### Clinical
- consultations
- consultation_answers
- consultation_uploads
- prescriber_reviews
- prescriptions

### Operations
- fulfillment_jobs
- shipments
- tracking_events

### System
- email_events
- audit_logs

---

## 3. users

Auth identity record. Clerk owns credentials — this table stores the app-side reference.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| clerk_user_id | String | unique, from Clerk |
| email | String | unique, synced from Clerk |
| email_verified_at | DateTime? | |
| is_active | Boolean | default true |
| created_at | DateTime | |
| updated_at | DateTime | |

**DO NOT store password_hash. Clerk owns authentication.**

Indexes: unique on `clerk_user_id`, unique on `email`, index on `created_at`

---

## 4. user_roles

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| role | Enum | customer, admin, prescriber |
| created_at | DateTime | |

A user can have multiple roles. v1 typical: customer only, admin only, prescriber only.

---

## 5. customer_profiles

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| user_id | UUID | unique FK → users |
| first_name | String | |
| last_name | String | |
| phone | String? | |
| date_of_birth | Date | |
| created_at | DateTime | |
| updated_at | DateTime | |

---

## 6. addresses

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| label | String? | e.g. "Home", "Work" |
| first_name | String | |
| last_name | String | |
| line1 | String | |
| line2 | String? | |
| city | String | |
| postcode | String | validated UK postcode format |
| country_code | String | default "GB" |
| phone | String? | |
| is_default_shipping | Boolean | |
| is_default_billing | Boolean | |
| created_at | DateTime | |
| updated_at | DateTime | |

Rule: orders snapshot addresses at checkout. Do not depend on mutable address rows after order placement.

---

## 7. collections

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| name | String | |
| slug | String | unique |
| description | String? | |
| sort_order | Int | |
| is_active | Boolean | |
| created_at | DateTime | |
| updated_at | DateTime | |

Initial: weight-loss, womens-health, sleep-recovery, hydration, general-health

---

## 8. products

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| name | String | |
| slug | String | unique |
| short_description | String | |
| long_description | String | |
| product_type | Enum | pom, supplement, other |
| requires_consultation | Boolean | |
| is_active | Boolean | |
| is_visible | Boolean | |
| default_image_url | String? | |
| archived_at | DateTime? | soft-delete for products only |
| created_at | DateTime | |
| updated_at | DateTime | |

---

## 9. product_variants

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| product_id | UUID | FK → products |
| name | String | e.g. "2.5mg", "5mg" |
| slug_fragment | String | |
| sku | String | unique |
| price_minor | Int | price in pence |
| currency | String | default "GBP" |
| stock_quantity | Int | |
| weight_grams | Int? | for shipping |
| is_active | Boolean | |
| created_at | DateTime | |
| updated_at | DateTime | |

Indexes: index on `product_id`, unique on `sku`

---

## 10. collection_products

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| collection_id | UUID | FK → collections |
| product_id | UUID | FK → products |
| sort_order | Int | |

---

## 11. carts

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| status | Enum | active, converted, abandoned |
| created_at | DateTime | |
| updated_at | DateTime | |

Rule: cart marked `converted` when order is created. Cart items copied to order items with snapshots.

---

## 12. cart_items

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| cart_id | UUID | FK → carts |
| product_variant_id | UUID | FK → product_variants |
| quantity | Int | |
| unit_price_minor | Int | |
| created_at | DateTime | |
| updated_at | DateTime | |

---

## 13. consultations

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| product_id | UUID | FK → products |
| product_variant_id | UUID? | selected dose |
| status | Enum | draft, submitted, under_review, action_required, approved, rejected, expired |
| started_at | DateTime | |
| submitted_at | DateTime? | |
| approved_at | DateTime? | |
| rejected_at | DateTime? | |
| expires_at | DateTime? | |
| created_at | DateTime | |
| updated_at | DateTime | |

Constraint: only one active (non-expired, non-rejected) Mounjaro consultation per user.

Indexes: index on `user_id`, index on `status`, index on `submitted_at`, composite `(status, submitted_at)` for prescriber queue

---

## 14. consultation_answers

Stores both flexible JSON and normalized queryable fields.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| consultation_id | UUID | unique FK → consultations |
| answers_json | JSON | full blob of all answers |
| height_cm | Float | canonical height |
| weight_kg | Float | canonical weight |
| bmi | Float | server-calculated |
| is_pregnant_or_breastfeeding | Boolean | |
| has_medical_conditions | Boolean | |
| medical_conditions_text | String? | |
| current_medications_text | String? | |
| has_prior_glp1_use | Boolean | |
| prior_glp1_details | String? | |
| has_pancreatitis_history | Boolean | |
| has_eating_disorder_history | Boolean | |
| has_allergies | Boolean | |
| allergies_text | String? | |
| drinks_alcohol | Boolean | |
| has_disabilities | Boolean | |
| gp_details | String? | GP name/practice |
| consent_confirmed | Boolean | |
| safety_confirmations_json | JSON | individual checkbox states |
| created_at | DateTime | |
| updated_at | DateTime | |

---

## 15. consultation_uploads

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| consultation_id | UUID | FK → consultations |
| user_id | UUID | FK → users |
| storage_key | String | S3 object key |
| file_name | String | |
| mime_type | String | |
| file_size_bytes | Int | |
| upload_type | Enum | body_photo_front, body_photo_side, photo_id |
| status | Enum | requested, uploaded, accepted, rejected |
| uploaded_at | DateTime? | |
| created_at | DateTime | |
| updated_at | DateTime | |

---

## 16. prescriber_reviews

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| consultation_id | UUID | FK → consultations |
| prescriber_user_id | UUID | FK → users |
| decision | Enum | approved, rejected, more_info_required |
| internal_note | String? | |
| customer_message | String? | |
| created_at | DateTime | |

Every decision creates an audit_log entry.

---

## 17. prescriptions

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| consultation_id | UUID | FK → consultations |
| prescriber_user_id | UUID | FK → users |
| product_variant_id | UUID | FK → product_variants |
| quantity | Int | |
| directions | String | |
| issued_at | DateTime | |
| reference_code | String | unique |
| created_at | DateTime | |
| updated_at | DateTime | |

---

## 18. orders

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| order_number | String | unique, format: ROOTS-YYYYMMDD-XXXX |
| order_type | Enum | pom, supplement, mixed |
| consultation_id | UUID? | FK → consultations (for POM/mixed) |
| shipping_address_snapshot | JSON | snapshotted at checkout |
| billing_address_snapshot | JSON? | |
| payment_status | Enum | pending, authorized, captured, voided, refunded, expired |
| fulfillment_status | Enum | unfulfilled, ready_to_pack, packed, labels_created, collection_booked, shipped, delivered |
| shipping_status | Enum | not_created, label_generated, tracking_attached, collected, in_transit, delivered |
| currency | String | default "GBP" |
| subtotal_minor | Int | |
| shipping_minor | Int | |
| tax_minor | Int | |
| discount_minor | Int | default 0 |
| total_minor | Int | |
| placed_at | DateTime | |
| created_at | DateTime | |
| updated_at | DateTime | |

Note: `expired` added to payment_status for auth expiry cases.

Indexes: unique on `order_number`, index on `user_id`, index on `payment_status`, index on `fulfillment_status`, index on `created_at`, composite `(fulfillment_status, created_at)`, composite `(payment_status, fulfillment_status)`, composite `(order_type, fulfillment_status)`

---

## 19. order_items

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| order_id | UUID | FK → orders |
| product_id | UUID | FK → products |
| product_variant_id | UUID | FK → product_variants |
| product_name_snapshot | String | |
| variant_name_snapshot | String | |
| sku_snapshot | String | |
| quantity | Int | |
| unit_price_minor | Int | |
| line_total_minor | Int | |
| created_at | DateTime | |

---

## 20. payments

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| order_id | UUID | FK → orders |
| provider | String | "stripe" |
| stripe_payment_intent_id | String | |
| stripe_event_id | String? | last processed webhook event ID for idempotency |
| status | Enum | pending, authorized, captured, voided, refunded, failed, expired |
| amount_minor | Int | |
| currency | String | |
| capture_before | DateTime? | from Stripe, for auth expiry monitoring |
| authorized_at | DateTime? | |
| captured_at | DateTime? | |
| voided_at | DateTime? | |
| refunded_at | DateTime? | |
| idempotency_key | String? | |
| created_at | DateTime | |
| updated_at | DateTime | |

Indexes: index on `stripe_payment_intent_id`, index on `capture_before`

---

## 21. fulfillment_jobs

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| order_id | UUID | FK → orders |
| status | Enum | ready_to_pack, packed, exported_for_labels, shipped |
| packed_by_user_id | UUID? | FK → users |
| packed_at | DateTime? | |
| notes | String? | |
| created_at | DateTime | |
| updated_at | DateTime | |

---

## 22. shipments

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| order_id | UUID | FK → orders |
| carrier | String | "royal_mail" |
| service | String | "tracked_24" or "tracked_48" |
| tracking_number | String? | |
| tracking_url | String? | |
| click_drop_order_id | String? | ID from Click & Drop API response |
| status | Enum | not_created, label_generated, tracking_attached, collected, in_transit, delivered |
| label_generated_at | DateTime? | |
| collected_at | DateTime? | |
| shipped_at | DateTime? | |
| delivered_at | DateTime? | |
| created_at | DateTime | |
| updated_at | DateTime | |

---

## 23. tracking_events

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| shipment_id | UUID | FK → shipments |
| event_code | String | |
| event_label | String | |
| occurred_at | DateTime | |
| payload_json | JSON? | |
| created_at | DateTime | |

---

## 24. email_events

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| order_id | UUID? | |
| consultation_id | UUID? | |
| email_type | String | see doc 10 for types |
| provider_message_id | String? | from Resend |
| sent_at | DateTime? | |
| status | String | queued, sent, failed |
| created_at | DateTime | |
| updated_at | DateTime | |

---

## 25. audit_logs

Append-only. Never update or delete.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| actor_user_id | UUID? | |
| actor_role | String? | |
| entity_type | String | e.g. "consultation", "order", "payment" |
| entity_id | UUID | |
| action | String | e.g. "consultation.approved", "payment.captured" |
| previous_state_json | JSON? | |
| new_state_json | JSON? | |
| metadata_json | JSON? | |
| created_at | DateTime | |

---

## 26. Data Integrity Rules

1. No Mounjaro/mixed order → `ready_to_pack` unless consultation = approved AND payment = captured
2. No prescription without approved consultation and prescriber_user_id
3. Every privileged action creates audit_log
4. Every order_item snapshots product/variant names and SKU
5. Uploads always scoped to user + consultation
6. Cart marked `converted` when order created; items copied with snapshots
7. Order number generated as `ROOTS-{YYYYMMDD}-{4-digit-sequential}` (unique)
