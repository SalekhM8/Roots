-- ============================================================
-- Migration: 1_email_indexes_and_cascades
-- ============================================================
-- H5: Add four indexes on email_events to support common queries
--     (status+createdAt for the queue scan, plus userId / orderId /
--     consultationId for the per-entity history lookups in admin UI
--     and in the operational crons).
--
-- H6: Switch FK delete behaviour from RESTRICT → CASCADE for
--     Payment, FulfillmentJob, and Shipment so deleting an order
--     (rare — only in dev/test cleanup or GDPR erasure flows) does
--     not error on dangling child rows.
--     Order.user, Order.consultation and EmailEvent.user are already
--     SET NULL via Prisma's default for optional FKs, no change.
-- ============================================================

-- ---- H6: Cascades ----

ALTER TABLE "payments" DROP CONSTRAINT "payments_order_id_fkey";
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "fulfillment_jobs" DROP CONSTRAINT "fulfillment_jobs_order_id_fkey";
ALTER TABLE "fulfillment_jobs" ADD CONSTRAINT "fulfillment_jobs_order_id_fkey"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shipments" DROP CONSTRAINT "shipments_order_id_fkey";
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_fkey"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ---- H5: EmailEvent indexes ----

CREATE INDEX "email_events_status_created_at_idx"
  ON "email_events"("status", "created_at");

CREATE INDEX "email_events_user_id_idx"
  ON "email_events"("user_id");

CREATE INDEX "email_events_order_id_idx"
  ON "email_events"("order_id");

CREATE INDEX "email_events_consultation_id_idx"
  ON "email_events"("consultation_id");
