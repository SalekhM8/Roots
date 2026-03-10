import { db } from "@/lib/db";
import { capturePaymentIntent, voidPaymentIntent } from "@/lib/payments/stripe";
import { writeAuditLog } from "@/lib/security/audit";
import { inngest } from "@/server/workflows/inngest";
import { randomUUID } from "crypto";

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
      orders: {
        include: { payments: { where: { status: "authorized" } } },
        take: 1,
      },
    },
  });

  if (!consultation) {
    return { success: false, error: "Consultation not found." };
  }

  if (consultation.status !== "submitted" && consultation.status !== "under_review") {
    return { success: false, error: "Consultation is not in a reviewable state." };
  }

  const order = consultation.orders[0];
  const payment = order?.payments[0];

  // Block approval if no order or no authorized payment exists
  if (!order || !payment) {
    return {
      success: false,
      error: "Cannot approve: no order with authorised payment found. The patient may not have completed checkout yet.",
    };
  }

  // Capture the authorized payment
  try {
    await capturePaymentIntent(
      payment.stripePaymentIntentId,
      `capture-${payment.id}-${randomUUID()}`
    );
  } catch {
    return {
      success: false,
      error: "Failed to capture payment. The authorisation may have expired.",
    };
  }

  const now = new Date();

  await db.$transaction(async (tx) => {
    // Create prescriber review
    await tx.prescriberReview.create({
      data: {
        consultationId: input.consultationId,
        prescriberUserId: input.prescriberUserId,
        decision: "approved",
        internalNote: input.internalNote,
        customerMessage: input.customerMessage,
      },
    });

    // Create prescription if variant is set
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

    // Update consultation status
    await tx.consultation.update({
      where: { id: input.consultationId },
      data: { status: "approved", approvedAt: now },
    });

    // Update order + payment (guaranteed to exist — checked above)
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "captured", capturedAt: now },
    });

    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "captured",
        fulfillmentStatus: "ready_to_pack",
      },
    });

    // Create fulfillment job
    await tx.fulfillmentJob.create({
      data: { orderId: order.id },
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
    // Emit payment captured event for POM approval capture
    inngest.send({
      name: "payment/captured",
      data: {
        userId: consultation.userId,
        orderId: order.id,
        amountMinor: payment.amountMinor,
        orderNumber: order.orderNumber,
      },
    }),
  ]);

  return { success: true };
}

/**
 * Reject a consultation. Voids the payment authorization.
 */
export async function rejectConsultation(
  input: ReviewInput & { customerMessage: string }
): Promise<ReviewResult> {
  const consultation = await db.consultation.findUnique({
    where: { id: input.consultationId },
    include: {
      orders: {
        include: { payments: { where: { status: "authorized" } } },
        take: 1,
      },
    },
  });

  if (!consultation) {
    return { success: false, error: "Consultation not found." };
  }

  if (consultation.status !== "submitted" && consultation.status !== "under_review") {
    return { success: false, error: "Consultation is not in a reviewable state." };
  }

  const order = consultation.orders[0];
  const payment = order?.payments[0];

  // Void payment authorization
  if (payment) {
    try {
      await voidPaymentIntent(
        payment.stripePaymentIntentId,
        `void-${payment.id}-${randomUUID()}`
      );
    } catch {
      // Log but continue — authorization may have already expired
    }
  }

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

    if (order && payment) {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "voided", voidedAt: new Date() },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: "voided" },
      });
    }
  });

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
