import { NextResponse } from "next/server";
import { getMolliePayment } from "@/lib/payments/mollie";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/security/audit";
import { inngest } from "@/server/workflows/inngest";

/**
 * Mollie webhook handler.
 *
 * Mollie sends a POST with `id` form field containing the payment ID.
 * We fetch the payment from Mollie to validate status (no HMAC signing).
 *
 * Configure in Mollie Dashboard or pass `webhookUrl` on payment creation:
 *   Webhook URL: https://rootspharmacy.co.uk/api/mollie/webhook
 */
export async function POST(req: Request) {
  const formData = await req.formData();
  const paymentId = formData.get("id") as string | null;

  if (!paymentId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Fetch payment from Mollie API — this is how you validate the webhook
  let molliePayment;
  try {
    molliePayment = await getMolliePayment(paymentId);
  } catch {
    return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
  }

  // Find our payment record
  const payment = await db.payment.findFirst({
    where: { molliePaymentId: paymentId },
    include: {
      order: {
        select: {
          id: true,
          orderType: true,
          orderNumber: true,
          userId: true,
        },
      },
    },
  });

  if (!payment) {
    // Unknown payment — acknowledge to prevent retries
    return NextResponse.json({ received: true });
  }

  const mollieStatus = molliePayment.status;
  const currentStatus = payment.status;

  switch (mollieStatus) {
    case "authorized": {
      if (currentStatus !== "pending") break;
      await handleAuthorized(payment);
      break;
    }
    case "paid": {
      if (currentStatus !== "pending" && currentStatus !== "authorized") break;
      await handlePaid(payment);
      break;
    }
    case "failed": {
      if (currentStatus !== "pending") break;
      await handleFailed(payment, paymentId);
      break;
    }
    case "expired": {
      if (currentStatus !== "pending") break;
      await handleExpired(payment, paymentId);
      break;
    }
    case "canceled": {
      if (currentStatus !== "pending" && currentStatus !== "authorized") break;
      await handleCanceled(payment, paymentId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

type PaymentWithOrder = {
  id: string;
  molliePaymentId: string;
  status: string;
  amountMinor: number;
  order: {
    id: string;
    orderType: string;
    orderNumber: string;
    userId: string | null;
  };
};

async function handleAuthorized(payment: PaymentWithOrder) {
  // Manual capture payment (POM/mixed) — authorized, awaiting prescriber review
  const now = new Date();

  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "authorized", authorizedAt: now },
    });

    await tx.order.update({
      where: { id: payment.order.id },
      data: { paymentStatus: "authorized" },
    });
  });

  await writeAuditLog({
    actorRole: "system",
    entityType: "Payment",
    entityId: payment.id,
    action: "payment.authorized",
    newState: {
      molliePaymentId: payment.molliePaymentId,
      amountMinor: payment.amountMinor,
      orderType: payment.order.orderType,
    },
  });
}

async function handlePaid(payment: PaymentWithOrder) {
  // Payment captured/completed
  const now = new Date();
  const wasAuthorized = payment.status === "authorized";

  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "captured",
        capturedAt: now,
        ...(!wasAuthorized ? { authorizedAt: now } : {}),
      },
    });

    await tx.order.update({
      where: { id: payment.order.id },
      data: {
        paymentStatus: "captured",
        // Auto-capture supplements go straight to ready_to_pack
        ...(!wasAuthorized ? { fulfillmentStatus: "ready_to_pack" } : {}),
      },
    });

    // Create fulfillment job for auto-capture orders
    if (!wasAuthorized) {
      await tx.fulfillmentJob.create({
        data: { orderId: payment.order.id },
      });
    }
  });

  await writeAuditLog({
    actorRole: "system",
    entityType: "Payment",
    entityId: payment.id,
    action: "payment.captured",
    newState: {
      molliePaymentId: payment.molliePaymentId,
      amountMinor: payment.amountMinor,
      orderType: payment.order.orderType,
    },
  });

  // Emit payment captured event
  if (!wasAuthorized) {
    await inngest.send({
      name: "payment/captured",
      data: {
        userId: payment.order.userId,
        orderId: payment.order.id,
        amountMinor: payment.amountMinor,
        orderNumber: payment.order.orderNumber,
      },
    });
  }
}

async function handleFailed(payment: PaymentWithOrder, molliePaymentId: string) {
  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "failed" },
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
    newState: { molliePaymentId },
  });
}

async function handleExpired(payment: PaymentWithOrder, molliePaymentId: string) {
  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "expired" },
    });

    await tx.order.update({
      where: { id: payment.order.id },
      data: { paymentStatus: "expired" },
    });
  });

  await writeAuditLog({
    actorRole: "system",
    entityType: "Payment",
    entityId: payment.id,
    action: "payment.expired",
    newState: { molliePaymentId },
  });
}

async function handleCanceled(payment: PaymentWithOrder, molliePaymentId: string) {
  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "voided", voidedAt: new Date() },
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
    newState: { molliePaymentId },
  });
}
