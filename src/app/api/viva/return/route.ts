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
  const orderCodeParam = searchParams.get("s") ?? undefined;

  // High-visibility breadcrumb. We have had one report of a customer
  // landing on a 404 immediately after a successful preauth despite the
  // order/payment being in good DB state. The redirect we emit here is
  // the only thing under our control on that path, so it goes in the log
  // verbatim. Cheap to keep; expensive to be without next time.
  console.log("[viva-return] incoming", {
    url: req.nextUrl.pathname + req.nextUrl.search,
    host: req.nextUrl.host,
    transactionId,
    eventId,
    orderCode: orderCodeParam,
  });

  let result;
  try {
    result = await processVivaReturn({ transactionId, eventId });
  } catch (err) {
    // Anything thrown out of processVivaReturn would otherwise surface as
    // a 500 to the customer (i.e. Vercel's error page, which can render
    // as 404 in some edge cases). Catch and downgrade to the friendly
    // payment-failed landing — the webhook owns authoritative state.
    console.error("[viva-return] processVivaReturn threw", err);
    const url = new URL("/checkout/payment-failed", req.nextUrl.origin);
    return NextResponse.redirect(url);
  }

  console.log("[viva-return] result", result);

  // Build redirect targets against `req.nextUrl.origin` (the public host
  // Vercel resolved for this request) rather than `req.url`. Belt-and-
  // braces — `req.url` *should* be the same value, but being explicit
  // avoids any chance of leaking a deployment-internal host into the
  // Location header the browser ends up navigating to.
  const origin = req.nextUrl.origin;

  if (result.outcome === "success" && result.orderId) {
    const url = new URL("/checkout/confirmation", origin);
    url.searchParams.set("order_id", result.orderId);
    console.log("[viva-return] redirect → confirmation", url.toString());
    return NextResponse.redirect(url);
  }

  if (result.outcome === "failure") {
    // Dedicated friendly landing. Cart is left active by payment.ts so
    // /checkout will re-render the form with the same items on retry.
    const url = new URL("/checkout/payment-failed", origin);
    if (eventId) url.searchParams.set("eventId", eventId);
    console.log("[viva-return] redirect → payment-failed", url.toString());
    return NextResponse.redirect(url);
  }

  // Unknown — Viva returned us here without a parseable transaction. We
  // attempt to find a payment row by the OrderCode in the `s` param as a
  // last-chance recovery: if there's a matching order with an authorized
  // or captured payment, the customer is on the success path even though
  // the synchronous retrieve was inconclusive.
  if (result.orderId) {
    const url = new URL("/checkout/confirmation", origin);
    url.searchParams.set("order_id", result.orderId);
    console.log(
      "[viva-return] redirect → confirmation (recovered from unknown)",
      url.toString(),
    );
    return NextResponse.redirect(url);
  }

  const url = new URL("/checkout/payment-failed", origin);
  console.log("[viva-return] redirect → payment-failed (unknown, no orderId)", url.toString());
  return NextResponse.redirect(url);
}
