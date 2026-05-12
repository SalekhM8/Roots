-- Viva.com payment provider migration.
-- Adds Viva-specific identifiers to the payments table and introduces a
-- generic webhook_events table for inbound provider webhook dedupe.

-- 1. Default provider switches from "mollie" to "viva" for new rows.
ALTER TABLE "payments"
  ALTER COLUMN "provider" SET DEFAULT 'viva';

-- 2. Allow Mollie identifier to be NULL — Viva-originated payments will not
--    have a Mollie payment id. Existing rows are unaffected.
ALTER TABLE "payments"
  ALTER COLUMN "mollie_payment_id" DROP NOT NULL;

-- 3. Viva-specific columns.
ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS "viva_order_code" TEXT,
  ADD COLUMN IF NOT EXISTS "viva_transaction_id" TEXT,
  ADD COLUMN IF NOT EXISTS "merchant_trns" UUID;

CREATE INDEX IF NOT EXISTS "payments_viva_order_code_idx"
  ON "payments" ("viva_order_code");

CREATE INDEX IF NOT EXISTS "payments_viva_transaction_id_idx"
  ON "payments" ("viva_transaction_id");

-- 4. webhook_events — at-least-once dedupe keyed on (provider, messageId).
--    For Viva, messageId is the per-delivery UUID in the envelope. Unique
--    constraint guarantees a single insert wins for repeat deliveries.
-- id is populated client-side by Prisma's @default(uuid()), matching how
-- the rest of the schema generates UUIDs (no pgcrypto dependency).
CREATE TABLE IF NOT EXISTS "webhook_events" (
  "id"           UUID         PRIMARY KEY,
  "provider"     TEXT         NOT NULL,
  "message_id"   TEXT         NOT NULL,
  "event_type"   TEXT,
  "received_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "payload_json" JSONB
);

CREATE UNIQUE INDEX IF NOT EXISTS "webhook_events_provider_message_id_key"
  ON "webhook_events" ("provider", "message_id");

CREATE INDEX IF NOT EXISTS "webhook_events_received_at_idx"
  ON "webhook_events" ("received_at");
