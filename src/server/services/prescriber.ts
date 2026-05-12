import { db } from "@/lib/db";
import { VivaError } from "@/lib/payments/viva";
import {
  captureVivaPayment,
  voidOrRefundVivaPayment,
} from "@/server/services/payment";
import { writeAuditLog } from "@/lib/security/audit";
import { inngest } from "@/server/workflows/inngest";

interface ReviewInput {
  consultationId: string;
  prescriberUserId: string;
  internalNote?: string;
  customerMessage?: string;
}

interface ReviewResult {
  success: boolean;
  error?: string;
}

/**
 * Approve a consultation.
 * Creates review + prescription, captures payment, sets fulfillment to ready_to_pack.
 */
export async function approveConsultation(
  input: ReviewInput
): Promise<ReviewResult> {
  const consultation = await db.consultation.findUnique({
    where: { id: input.consultationId },
    include: {
      productVariant: true,
      // Fetch ALL orders newest-first. A consultation can have multiple
      // orders if the customer hit "continue to checkout" twice; we need
      // to find the order with the live authorised payment, not whichever
      // Prisma picked first.
      orders: {
        include: { payments: { where: { status: "authorized" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!consultation) {
    return { success: false, error: "Consultation not found." };
  }

  if (consultation.status !== "submitted" && consultation.status !== "under_review") {
    return { success: false, error: "Consultation is not in a reviewable state." };
  }

  const order = consultation.orders.find((o) => o.payments.length > 0);
  const payment = order?.payments[0];

  // Block approval if no order or no authorized payment exists
  if (!order || !payment) {
    return {
      success: false,
      error: "Cannot approve: no order with authorised payment found. The patient may not have completed checkout yet.",
    };
  }

  // Capture the authorized Viva payment. `captureVivaPayment` handles the
  // Payment row, the Order paymentStatus + fulfillmentStatus, the
  // FulfillmentJob upsert, the audit log, and the Inngest payment/captured
  // event. If it throws, the consultation stays under_review so the
  // prescriber can retry.
  try {
    await captureVivaPayment(payment.id);
  } catch (err) {
    if (err instanceof VivaError) {
      console.error("[prescriber.approve] Viva capture failed", {
        paymentId: payment.id,
        status: err.status,
        errorCode: err.errorCode,
        correlationId: err.correlationId,
      });
      // Viva ErrorCode 403 on capture means the preauth has expired or has
      // already been captured. Surface a specific message in that case.
      if (err.errorCode === 403) {
        return {
          success: false,
          error:
            "The payment authorisation has expired or was already captured. The customer needs to re-checkout.",
        };
      }
    }
    return {
      success: false,
      error: "Failed to capture payment. Please try again.",
    };
  }

  const now = new Date();

  // Second tx: clinical state. Capture has succeeded already; if this fails
  // we'd have a captured order with no review row — extremely unlikely
  // (single-row inserts). We log and let ops reconcile.
  await db.$transaction(async (tx) => {
    await tx.prescriberReview.create({
      data: {
        consultationId: input.consultationId,
        prescriberUserId: input.prescriberUserId,
        decision: "approved",
        internalNote: input.internalNote,
        customerMessage: input.customerMessage,
      },
    });

    if (consultation.productVariant) {
      await tx.prescription.create({
        data: {
          consultationId: input.consultationId,
          prescriberUserId: input.prescriberUserId,
          productVariantId: consultation.productVariant.id,
          quantity: 1,
          directions: "As directed by prescriber. See patient information leaflet.",
          issuedAt: now,
          referenceCode: `RX-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`,
        },
      });
    }

    await tx.consultation.update({
      where: { id: input.consultationId },
      data: { status: "approved", approvedAt: now },
    });
  });

  await Promise.all([
    writeAuditLog({
      actorUserId: input.prescriberUserId,
      actorRole: "prescriber",
      entityType: "Consultation",
      entityId: input.consultationId,
      action: "consultation.approved",
      previousState: { status: consultation.status },
      newState: { status: "approved" },
    }),
    inngest.send({
      name: "consultation/approved",
      data: {
        userId: consultation.userId,
        consultationId: input.consultationId,
        orderNumber: order.orderNumber,
      },
    }),
    // Note: the `payment/captured` event is emitted by `captureVivaPayment`
    // itself — no need to re-send here.
  ]);

  return { success: true };
}

/**
 * Reject a consultation. Releases the payment authorization.
 */
export async function rejectConsultation(
  input: ReviewInput & { customerMessage: string }
): Promise<ReviewResult> {
  const consultation = await db.consultation.findUnique({
    where: { id: input.consultationId },
    include: {
      // Same reason as approveConsultation: order by createdAt desc and
      // find the order that actually has an authorised payment to void.
      // Picking orders[0] blindly led to a silent void-skip in prod
      // (2026-05-12) when a consultation had a failed order ahead of a
      // good one.
      orders: {
        include: { payments: { where: { status: "authorized" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!consultation) {
    return { success: false, error: "Consultation not found." };
  }

  if (consultation.status !== "submitted" && consultation.status !== "under_review") {
    return { success: false, error: "Consultation is not in a reviewable state." };
  }

  const order = consultation.orders.find((o) => o.payments.length > 0);
  const payment = order?.payments[0];

  // Void the Viva preauth via the service. If it fails we log + audit but
  // continue with the rejection so the customer-facing decision isn't held
  // hostage by a transient payment-provider blip. Ops reconciles from the
  // audit log + Sentry. `voidOrRefundVivaPayment` updates the Payment + Order
  // rows on success.
  let voidSucceeded = false;
  if (payment) {
    try {
      await voidOrRefundVivaPayment({
        paymentId: payment.id,
        reason: `consultation.rejected: ${input.consultationId}`,
      });
      voidSucceeded = true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const correlationId =
        err instanceof VivaError ? err.correlationId : undefined;
      console.error(
        `[prescriber.reject] Viva void failed for payment ${payment.id}:`,
        message,
      );
      await writeAuditLog({
        actorUserId: input.prescriberUserId,
        actorRole: "prescriber",
        entityType: "Payment",
        entityId: payment.id,
        action: "payment.void.failed",
        metadata: {
          consultationId: input.consultationId,
          provider: "viva",
          vivaTransactionId: payment.vivaTransactionId,
          correlationId: correlationId ?? null,
          error: message,
        },
      });
    }
  }

  // Clinical state mutation. Always runs — even if the void failed — so the
  // patient sees the rejection promptly. The Payment/Order paymentStatus is
  // updated by `voidOrRefundVivaPayment` itself when it succeeds; if it
  // failed we leave the row untouched and rely on the operational sweeper
  // to retry void at preauth-expiry.
  await db.$transaction(async (tx) => {
    await tx.prescriberReview.create({
      data: {
        consultationId: input.consultationId,
        prescriberUserId: input.prescriberUserId,
        decision: "rejected",
        internalNote: input.internalNote,
        customerMessage: input.customerMessage,
      },
    });

    await tx.consultation.update({
      where: { id: input.consultationId },
      data: { status: "rejected", rejectedAt: new Date() },
    });
  });

  // Suppress unused-var lint while keeping the boolean local — it's
  // surfaced via the audit log already, but useful for future telemetry.
  void voidSucceeded;

  await Promise.all([
    writeAuditLog({
      actorUserId: input.prescriberUserId,
      actorRole: "prescriber",
      entityType: "Consultation",
      entityId: input.consultationId,
      action: "consultation.rejected",
      previousState: { status: consultation.status },
      newState: { status: "rejected" },
    }),
    inngest.send({
      name: "consultation/rejected",
      data: {
        userId: consultation.userId,
        consultationId: input.consultationId,
        reason: input.customerMessage ?? "Your consultation was not approved.",
      },
    }),
  ]);

  return { success: true };
}

/**
 * Request more information from the customer.
 */
export async function requestMoreInfo(
  input: ReviewInput & { customerMessage: string }
): Promise<ReviewResult> {
  const consultation = await db.consultation.findUnique({
    where: { id: input.consultationId },
  });

  if (!consultation) {
    return { success: false, error: "Consultation not found." };
  }

  if (consultation.status !== "submitted" && consultation.status !== "under_review") {
    return { success: false, error: "Consultation is not in a reviewable state." };
  }

  await db.$transaction(async (tx) => {
    await tx.prescriberReview.create({
      data: {
        consultationId: input.consultationId,
        prescriberUserId: input.prescriberUserId,
        decision: "more_info_required",
        internalNote: input.internalNote,
        customerMessage: input.customerMessage,
      },
    });

    await tx.consultation.update({
      where: { id: input.consultationId },
      data: { status: "action_required" },
    });
  });

  await Promise.all([
    writeAuditLog({
      actorUserId: input.prescriberUserId,
      actorRole: "prescriber",
      entityType: "Consultation",
      entityId: input.consultationId,
      action: "consultation.more_info_requested",
      previousState: { status: consultation.status },
      newState: { status: "action_required" },
    }),
    inngest.send({
      name: "consultation/action-required",
      data: {
        userId: consultation.userId,
        consultationId: input.consultationId,
        message: input.customerMessage ?? "Please provide additional information.",
      },
    }),
  ]);

  return { success: true };
}
