/**
 * Viva.com Smart Checkout return URL.
 *
 * Viva sends the customer back here after the checkout interaction with
 * query params (per Viva Smart Checkout docs):
 *   - `t`        — TransactionId (UUID), present on success and on most failure modes
 *   - `s`        — int64 OrderCode (the 16-digit payment order id)
 *   - `eventId`  — numeric reason code on failure
 *   - `lang`     — locale code
 *   - `eci`      — Electronic Commerce Indicator (3DS outcome)
 *
 * The Source code (4-digit) on the Viva dashboard pins ONE success URL and
 * ONE failure URL — they are NOT settable per order. Both can safely point
 * at this single endpoint: we don't disambiguate from a query param, we
 * determine the outcome server-side by calling Viva's Retrieve Transaction
 * API on `t` and branching on the real StatusId.
 *
 * This is the PRIMARY signal for cancelled / 3DS-failed flows because Viva
 * does NOT emit a webhook for those events. For successful flows the 1796
 * webhook is the canonical state mutation; we run `processVivaReturn` here
 * mainly so the confirmation page renders without waiting on the webhook.
 *
 * Bypassed in Clerk middleware so customers paying as guests aren't bounced
 * to sign-in.
 */

import { NextResponse, type NextRequest } from "next/server";

import { processVivaReturn } from "@/server/services/payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const transactionId = searchParams.get("t") ?? undefined;
  const eventId = searchParams.get("eventId") ?? undefined;

  const result = await processVivaReturn({
    transactionId,
    eventId,
  });

  if (result.outcome === "success" && result.orderId) {
    const url = new URL("/checkout/confirmation", req.url);
    url.searchParams.set("order_id", result.orderId);
    return NextResponse.redirect(url);
  }

  if (result.outcome === "failure") {
    // Dedicated friendly landing. Cart is left active by payment.ts so
    // /checkout will re-render the form with the same items on retry.
    const url = new URL("/checkout/payment-failed", req.url);
    if (eventId) url.searchParams.set("eventId", eventId);
    return NextResponse.redirect(url);
  }

  // Unknown — Viva returned us here without a parseable transaction. Send
  // the customer to the failed landing too (the webhook owns canonical
  // state); message reads as "try again" which is the right action for
  // both genuine decline and the rare ambiguous-status case.
  const url = new URL("/checkout/payment-failed", req.url);
  return NextResponse.redirect(url);
}
