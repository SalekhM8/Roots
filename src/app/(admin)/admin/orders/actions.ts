"use server";

import { requireAnyRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { refundPayment } from "@/lib/payments/stripe";
import { writeAuditLog } from "@/lib/security/audit";
import { randomUUID } from "crypto";

export async function refundOrderAction(
  orderId: string,
  amountMinor?: number,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAnyRole("admin", "prescriber");

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      payments: {
        where: { status: "captured" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!order) {
    return { success: false, error: "Order not found." };
  }

  if (order.payments.length === 0) {
    return { success: false, error: "No captured payment to refund." };
  }

  const payment = order.payments[0];

  // Determine refund amount — full refund if not specified
  const refundAmount = amountMinor ?? payment.amountMinor;

  if (refundAmount <= 0 || refundAmount > payment.amountMinor) {
    return { success: false, error: "Invalid refund amount." };
  }

  const isFullRefund = refundAmount === payment.amountMinor;
  const idempotencyKey = randomUUID();

  try {
    await refundPayment(
      payment.stripePaymentIntentId,
      refundAmount,
      idempotencyKey
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Stripe refund failed.";
    return { success: false, error: message };
  }

  // Update payment status
  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: isFullRefund ? "refunded" : "captured",
      refundedAt: isFullRefund ? new Date() : undefined,
    },
  });

  // Update order payment status if full refund
  if (isFullRefund) {
    await db.order.update({
      where: { id: orderId },
      data: { paymentStatus: "refunded" },
    });
  }

  await writeAuditLog({
    actorUserId: user.id,
    actorRole: "admin",
    entityType: "Order",
    entityId: orderId,
    action: isFullRefund ? "order.refunded" : "order.partially_refunded",
    previousState: { paymentStatus: order.paymentStatus },
    newState: {
      paymentStatus: isFullRefund ? "refunded" : order.paymentStatus,
      refundAmountMinor: refundAmount,
      reason: reason ?? null,
    },
  });

  return { success: true };
}
