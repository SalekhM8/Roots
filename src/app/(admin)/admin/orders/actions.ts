"use server";

import { requireAnyRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { VivaError } from "@/lib/payments/viva";
import { voidOrRefundVivaPayment } from "@/server/services/payment";
import { writeAuditLog } from "@/lib/security/audit";

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

  // Full refund if not specified
  const refundAmount = amountMinor ?? payment.amountMinor;

  if (refundAmount <= 0 || refundAmount > payment.amountMinor) {
    return { success: false, error: "Invalid refund amount." };
  }

  if (!payment.vivaTransactionId) {
    return {
      success: false,
      error: "Payment has no Viva transaction reference — refund via Viva dashboard.",
    };
  }

  try {
    // voidOrRefundVivaPayment handles the Viva API call, payment row,
    // order paymentStatus, and writes the payment.refunded audit log.
    await voidOrRefundVivaPayment({
      paymentId: payment.id,
      amountMinor: refundAmount,
      reason: reason ?? `admin refund by ${user.id}`,
    });
  } catch (err) {
    const message =
      err instanceof VivaError
        ? `Viva refund failed (${err.status}): ${err.message}`
        : err instanceof Error
          ? err.message
          : "Refund failed.";
    return { success: false, error: message };
  }

  // Order-level audit on top of the payment-level one written by the service,
  // so the order timeline has admin attribution.
  const isFullRefund = refundAmount === payment.amountMinor;
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
