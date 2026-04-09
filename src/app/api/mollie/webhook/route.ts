import { NextResponse, after } from "next/server";
import { getMolliePayment } from "@/lib/payments/mollie";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/security/audit";
import { inngest } from "@/server/workflows/inngest";

/**
 * Mollie webhook handler.
 *
 * Returns 200 immediately so Mollie doesn't time out,
 * then processes the payment status update in the background via `after()`.
 */
export async function POST(req: Request) {
  const formData = await req.formData();
  const paymentId = formData.get("id") as string | null;

  if (!paymentId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Respond immediately — process in background
  after(async () => {
    try {
      await processWebhook(paymentId);
    } catch (err) {
      console.error("[mollie-webhook] processing failed:", paymentId, err);
    }
  });

  return NextResponse.json({ received: true });
}

async function processWebhook(paymentId: string) {
  // Fetch payment from Mollie API — this validates the webhook
  const molliePayment = await getMolliePayment(paymentId);

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

  if (!payment) return;

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
        ...(!wasAuthorized ? { fulfillmentStatus: "ready_to_pack" } : {}),
      },
    });

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
