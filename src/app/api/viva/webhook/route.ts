/**
 * Viva.com webhook endpoint.
 *
 * GET  /api/viva/webhook
 *   Viva calls this once at registration to verify URL ownership. We reply
 *   with `{"Key": "<VIVA_WEBHOOK_KEY>"}` echoed verbatim. The key was fetched
 *   once via `scripts/viva-fetch-webhook-key.ts` and pinned in env.
 *
 * POST /api/viva/webhook
 *   Inbound event delivery. Viva does NOT sign webhook bodies, so the
 *   documented authentication primitive is an IP allowlist plus a
 *   post-receive `retrieveTransaction` round-trip. We:
 *
 *     1. Reject any source IP not in the allowlist (demo or prod, by env).
 *     2. Parse the envelope. Insert into `webhook_events` — the unique
 *        `(provider, message_id)` constraint makes redelivery idempotent.
 *     3. Always return 200 (Viva treats non-2xx as failure and retries 24x
 *        hourly; 3xx is also treated as failure — never redirect).
 *     4. Process in the background via `after()` so we don't block on
 *        Viva's `retrieveTransaction` round-trip — Viva expects fast 2xx.
 *
 * This route is bypassed in Clerk middleware so Viva's POSTs don't trigger
 * a 302 to the sign-in page (which Viva would treat as a delivery failure).
 */

import { NextResponse, after, type NextRequest } from "next/server";

import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { serverEnv } from "@/lib/env";
import {
  clientIpFromHeaders,
  isIpAllowed,
} from "@/lib/security/ip-allowlist";
import {
  VIVA_DEMO_IPS,
  VIVA_PROD_IPS,
  type TransactionEventData,
  type VivaEventTypeId,
  type WebhookEnvelope,
} from "@/lib/payments/viva-types";
import { processVivaWebhook } from "@/server/services/payment";

export const runtime = "nodejs";
// Viva will not follow 3xx — keep this dynamic so we never serve a stale
// cached response, and never let Next try to optimise it into a redirect.
export const dynamic = "force-dynamic";

// ---------- GET (handshake) ------------------------------------------------

export async function GET() {
  const env = serverEnv();
  // Explicit no-cache: the GET handshake is one-shot and must not be served
  // from any edge/CDN cache or it could echo a stale Key.
  return NextResponse.json(
    { Key: env.VIVA_WEBHOOK_KEY },
    { headers: { "cache-control": "no-store" } },
  );
}

// ---------- POST (delivery) ------------------------------------------------

export async function POST(req: NextRequest) {
  // 1) IP allowlist check. We always 200 to Viva, but if the source IP is
  //    not allowlisted we drop the body without processing — this prevents
  //    forged events from mutating order state.
  const sourceIp = clientIpFromHeaders(req.headers);
  const allowlist =
    serverEnv().VIVA_ENV === "production" ? VIVA_PROD_IPS : VIVA_DEMO_IPS;
  if (!sourceIp || !isIpAllowed(sourceIp, allowlist)) {
    console.warn("[viva-webhook] rejected — IP not allowlisted", {
      sourceIp,
      env: serverEnv().VIVA_ENV,
    });
    // Return 403 here — Viva considers this a delivery failure and will
    // retry, but a non-allowlisted source isn't going to start passing the
    // check on retry, so the noise is bounded.
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  let envelope: WebhookEnvelope<TransactionEventData>;
  try {
    envelope = (await req.json()) as WebhookEnvelope<TransactionEventData>;
  } catch (err) {
    console.error("[viva-webhook] failed to parse JSON body", err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!envelope.MessageId || !envelope.EventTypeId) {
    console.warn("[viva-webhook] envelope missing MessageId/EventTypeId");
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // 2) Dedupe via unique (provider, message_id). If this insert succeeds we
  //    "own" processing this delivery. If it conflicts, this is a redelivery
  //    and we ack with 200 without re-processing.
  let isFresh = true;
  try {
    await db.webhookEvent.create({
      data: {
        provider: "viva",
        messageId: envelope.MessageId,
        eventType: String(envelope.EventTypeId),
        payloadJson: envelope as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    // Prisma P2002 (unique violation) on the (provider, message_id) index
    // means we've already seen this delivery — ack and exit.
    isFresh = false;
    if (
      typeof err !== "object" ||
      err === null ||
      !("code" in err) ||
      (err as { code: unknown }).code !== "P2002"
    ) {
      console.error("[viva-webhook] failed to record event", err);
      // Still ack 200 — we don't want Viva to retry on a transient DB blip
      // and pile up redeliveries. If we lost the dedupe row but the event
      // was real, the next delivery will succeed.
    }
  }

  if (!isFresh) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  // 3) Process in the background. We've already passed the IP check and
  //    inserted the dedupe row, so Viva is satisfied with a fast 200.
  after(async () => {
    try {
      await processVivaWebhook({
        messageId: envelope.MessageId,
        eventTypeId: envelope.EventTypeId as VivaEventTypeId,
        eventData: envelope.EventData,
        rawPayload: envelope,
      });
    } catch (err) {
      console.error("[viva-webhook] processing failed", {
        messageId: envelope.MessageId,
        eventTypeId: envelope.EventTypeId,
        err,
      });
    }
  });

  return NextResponse.json({ ok: true });
}
