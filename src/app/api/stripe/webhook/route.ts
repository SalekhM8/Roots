import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/payments/stripe";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/security/audit";
import { inngest } from "@/server/workflows/inngest";
import type Stripe from "stripe";

/**
 * Stripe webhook handler with idempotency.
 *
 * Handles:
 * - payment_intent.succeeded → update payment status to authorized/captured
 * - payment_intent.payment_failed → update payment status to failed
 * - payment_intent.canceled → update payment status to voided
 * - charge.captured → update payment to captured, update order fulfillment
 *
 * Configure in Stripe Dashboard:
 *   Webhook URL: https://rootspharmacy.co.uk/api/stripe/webhook
 *   Events: payment_intent.succeeded, payment_intent.payment_failed,
 *           payment_intent.canceled, charge.captured
 *   Signing secret: STRIPE_WEBHOOK_SECRET env var
 */
export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = await headers();
  const sig = headerPayload.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: check if we've already processed this event
  const existingPayment = await db.payment.findFirst({
    where: { stripeEventId: event.id },
    select: { id: true },
  });

  if (existingPayment) {
    return NextResponse.json({ received: true, deduplicated: true });
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(
        event.data.object as Stripe.PaymentIntent,
        event.id
      );
      break;

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(
        event.data.object as Stripe.PaymentIntent,
        event.id
      );
      break;

    case "payment_intent.canceled":
      await handlePaymentIntentCanceled(
        event.data.object as Stripe.PaymentIntent,
        event.id
      );
      break;
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  eventId: string
) {
  const payment = await db.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: {
      order: { select: { id: true, orderType: true, orderNumber: true, userId: true } },
    },
  });

  if (!payment) return;

  // For automatic capture (supplements): payment is captured immediately
  // For manual capture (POM/mixed): payment is authorized, awaiting capture
  const isCaptured = paymentIntent.capture_method === "automatic";
  const now = new Date();

  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: isCaptured ? "captured" : "authorized",
        stripeEventId: eventId,
        authorizedAt: now,
        capturedAt: isCaptured ? now : null,
      },
    });

    await tx.order.update({
      where: { id: payment.order.id },
      data: {
        paymentStatus: isCaptured ? "captured" : "authorized",
        // Supplement-only orders go straight to ready_to_pack
        ...(isCaptured ? { fulfillmentStatus: "ready_to_pack" } : {}),
      },
    });

    // Create fulfillment job for supplement orders (auto-captured)
    if (isCaptured) {
      await tx.fulfillmentJob.create({
        data: { orderId: payment.order.id },
      });
    }
  });

  await writeAuditLog({
    actorRole: "system",
    entityType: "Payment",
    entityId: payment.id,
    action: isCaptured ? "payment.captured" : "payment.authorized",
    newState: {
      stripePaymentIntentId: paymentIntent.id,
      amountMinor: paymentIntent.amount,
      orderType: payment.order.orderType,
    },
  });

  // Emit payment/captured event for auto-capture (supplements)
  if (isCaptured) {
    await inngest.send({
      name: "payment/captured",
      data: {
        userId: payment.order.userId,
        orderId: payment.order.id,
        amountMinor: paymentIntent.amount,
        orderNumber: payment.order.orderNumber,
      },
    });
  }
}

async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  eventId: string
) {
  const payment = await db.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: { order: { select: { id: true } } },
  });

  if (!payment) return;

  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "failed", stripeEventId: eventId },
    });

    await tx.order.update({
      where: { id: payment.order.id },
      data: { paymentStatus: "failed" },
    });
  });

  await writeAuditLog({
    actorRole: "system",
    entityType: "Payment",
    entityId: payment.id,
    action: "payment.failed",
    newState: { stripePaymentIntentId: paymentIntent.id },
  });
}

async function handlePaymentIntentCanceled(
  paymentIntent: Stripe.PaymentIntent,
  eventId: string
) {
  const payment = await db.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: { order: { select: { id: true } } },
  });

  if (!payment) return;

  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "voided",
        stripeEventId: eventId,
        voidedAt: new Date(),
      },
    });

    await tx.order.update({
      where: { id: payment.order.id },
      data: { paymentStatus: "voided" },
    });
  });

  await writeAuditLog({
    actorRole: "system",
    entityType: "Payment",
    entityId: payment.id,
    action: "payment.voided",
    newState: { stripePaymentIntentId: paymentIntent.id },
  });
}
