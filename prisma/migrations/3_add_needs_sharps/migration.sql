-- Add needs_sharps flag to consultations and orders.
--
-- Set at dose-selection time via the sharps modal (one combined Yes/No
-- question, default No). Stored on the consultation as the permanent
-- clinical record and copied onto the order at checkout creation so
-- packers can see the flag without a join through consultations.
--
-- Free of charge to the customer — sharps + needles cost pennies and
-- the safe-disposal benefit dwarfs the unit cost.

ALTER TABLE "consultations"
  ADD COLUMN "needs_sharps" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "orders"
  ADD COLUMN "needs_sharps" BOOLEAN NOT NULL DEFAULT false;
