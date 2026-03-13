import { inngest } from "./inngest";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/resend";
import * as templates from "@/lib/email/templates";

/**
 * All transactional emails are triggered through Inngest workflows,
 * never inline in route handlers. Each send creates an email_events record.
 */

export const sendConsultationSubmittedEmail = inngest.createFunction(
  { id: "send-consultation-submitted-email" },
  { event: "consultation/submitted" },
  async ({ event }) => {
    const { userId, consultationId } = event.data;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { customerProfile: { select: { firstName: true } } },
    });
    if (!user) return;

    const name = user.customerProfile?.firstName ?? "there";
    const html = templates.consultationSubmitted(name);

    const { messageId } = await sendEmail({
      to: user.email,
      subject: "Consultation Received — ROOTS Pharmacy",
      html,
    });

    await db.emailEvent.create({
      data: {
        userId,
        consultationId,
        emailType: "consultation_submitted",
        providerMessageId: messageId,
        sentAt: messageId ? new Date() : null,
        status: messageId ? "sent" : "failed",
      },
    });
  }
);

export const sendConsultationApprovedEmail = inngest.createFunction(
  { id: "send-consultation-approved-email" },
  { event: "consultation/approved" },
  async ({ event }) => {
    const { userId, consultationId, orderNumber } = event.data;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { customerProfile: { select: { firstName: true } } },
    });
    if (!user) return;

    const name = user.customerProfile?.firstName ?? "there";
    const html = templates.consultationApproved(name, orderNumber);

    const { messageId } = await sendEmail({
      to: user.email,
      subject: "Consultation Approved — ROOTS Pharmacy",
      html,
    });

    await db.emailEvent.create({
      data: {
        userId,
        consultationId,
        emailType: "consultation_approved",
        providerMessageId: messageId,
        sentAt: messageId ? new Date() : null,
        status: messageId ? "sent" : "failed",
      },
    });
  }
);

export const sendConsultationRejectedEmail = inngest.createFunction(
  { id: "send-consultation-rejected-email" },
  { event: "consultation/rejected" },
  async ({ event }) => {
    const { userId, consultationId, reason } = event.data;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { customerProfile: { select: { firstName: true } } },
    });
    if (!user) return;

    const name = user.customerProfile?.firstName ?? "there";
    const html = templates.consultationRejected(name, reason);

    const { messageId } = await sendEmail({
      to: user.email,
      subject: "Consultation Update — ROOTS Pharmacy",
      html,
    });

    await db.emailEvent.create({
      data: {
        userId,
        consultationId,
        emailType: "consultation_rejected",
        providerMessageId: messageId,
        sentAt: messageId ? new Date() : null,
        status: messageId ? "sent" : "failed",
      },
    });
  }
);

export const sendActionRequiredEmail = inngest.createFunction(
  { id: "send-action-required-email" },
  { event: "consultation/action-required" },
  async ({ event }) => {
    const { userId, consultationId, message } = event.data;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { customerProfile: { select: { firstName: true } } },
    });
    if (!user) return;

    const name = user.customerProfile?.firstName ?? "there";
    const html = templates.actionRequired(name, message);

    const { messageId } = await sendEmail({
      to: user.email,
      subject: "Action Required — ROOTS Pharmacy",
      html,
    });

    await db.emailEvent.create({
      data: {
        userId,
        consultationId,
        emailType: "action_required",
        providerMessageId: messageId,
        sentAt: messageId ? new Date() : null,
        status: messageId ? "sent" : "failed",
      },
    });
  }
);

export const sendOrderShippedEmail = inngest.createFunction(
  { id: "send-order-shipped-email" },
  { event: "order/shipped" },
  async ({ event }) => {
    const { userId, orderId, orderNumber, trackingUrl } = event.data;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { customerProfile: { select: { firstName: true } } },
    });
    if (!user) return;

    const name = user.customerProfile?.firstName ?? "there";
    const html = templates.orderShipped(name, orderNumber, trackingUrl);

    const { messageId } = await sendEmail({
      to: user.email,
      subject: `Order ${orderNumber} Shipped — ROOTS Pharmacy`,
      html,
    });

    await db.emailEvent.create({
      data: {
        userId,
        orderId,
        emailType: "order_shipped",
        providerMessageId: messageId,
        sentAt: messageId ? new Date() : null,
        status: messageId ? "sent" : "failed",
      },
    });
  }
);

export const sendPaymentCapturedEmail = inngest.createFunction(
  { id: "send-payment-captured-email" },
  { event: "payment/captured" },
  async ({ event }) => {
    const { userId, orderId, amountMinor, orderNumber } = event.data;

    let toEmail: string;
    let name: string;

    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: { customerProfile: { select: { firstName: true } } },
      });
      if (!user) return;
      toEmail = user.email;
      name = user.customerProfile?.firstName ?? "there";
    } else {
      // Guest order — look up guestEmail from the order
      const order = await db.order.findUnique({
        where: { id: orderId },
        select: { guestEmail: true },
      });
      if (!order?.guestEmail) return;
      toEmail = order.guestEmail;
      name = "there";
    }

    const amount = `£${(amountMinor / 100).toFixed(2)}`;
    const html = templates.paymentCaptured(name, amount, orderNumber);

    const { messageId } = await sendEmail({
      to: toEmail,
      subject: `Payment Confirmed for Order #${orderNumber} — ROOTS Pharmacy`,
      html,
    });

    await db.emailEvent.create({
      data: {
        userId: userId ?? undefined,
        recipientEmail: toEmail,
        orderId,
        emailType: "payment_captured",
        providerMessageId: messageId,
        sentAt: messageId ? new Date() : null,
        status: messageId ? "sent" : "failed",
      },
    });
  }
);

/**
 * Delayed review request: waits 7 days after order shipped, then sends
 * a Trustpilot review request email. Only sends if no review email was
 * already sent for this order.
 */
export const sendReviewRequestEmail = inngest.createFunction(
  { id: "send-review-request-email" },
  { event: "order/shipped" },
  async ({ event, step }) => {
    const { userId, orderId } = event.data;

    // Wait 7 days after shipment
    await step.sleep("wait-for-delivery", "7d");

    // Check we haven't already sent a review email for this order
    const existing = await step.run("check-existing", async () => {
      return db.emailEvent.findFirst({
        where: { orderId, emailType: "review_request" },
      });
    });
    if (existing) return { skipped: true };

    await step.run("send-review-email", async () => {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: { customerProfile: { select: { firstName: true } } },
      });
      if (!user) return;

      const name = user.customerProfile?.firstName ?? "there";
      const html = templates.reviewRequest(name);

      const { messageId } = await sendEmail({
        to: user.email,
        subject: "How Was Your Experience? — ROOTS Pharmacy",
        html,
      });

      await db.emailEvent.create({
        data: {
          userId,
          orderId,
          emailType: "review_request",
          providerMessageId: messageId,
          sentAt: messageId ? new Date() : null,
          status: messageId ? "sent" : "failed",
        },
      });
    });

    return { sent: true };
  }
);

/**
 * Cron: Check for payment authorizations expiring within 24 hours.
 * Runs daily. Voids expired auths, marks payment as expired, emails customer.
 */
export const checkExpiringAuthorizations = inngest.createFunction(
  { id: "check-expiring-authorizations" },
  { cron: "0 6 * * *" }, // 6 AM daily
  async () => {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find authorized payments where capture deadline is within 24hrs or already past
    const expiringPayments = await db.payment.findMany({
      where: {
        status: "authorized",
        captureBefore: { lte: in24Hours },
      },
      include: {
        order: {
          include: {
            user: {
              include: {
                customerProfile: { select: { firstName: true } },
              },
            },
          },
        },
      },
    });

    for (const payment of expiringPayments) {
      // If already past capture deadline, void and notify
      if (payment.captureBefore && payment.captureBefore <= now) {
        await db.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "expired" },
          });
          await tx.order.update({
            where: { id: payment.orderId },
            data: { paymentStatus: "expired" },
          });
        });

        const user = payment.order.user;
        if (!user) continue; // Guest orders use automatic capture, no auth expiry
        const name = user.customerProfile?.firstName ?? "there";
        const html = templates.paymentExpired(name, payment.order.orderNumber);

        const { messageId } = await sendEmail({
          to: user.email,
          subject: "Payment Authorization Expired — ROOTS Pharmacy",
          html,
        });

        await db.emailEvent.create({
          data: {
            userId: user.id,
            orderId: payment.orderId,
            emailType: "payment_expired",
            providerMessageId: messageId,
            sentAt: messageId ? new Date() : null,
            status: messageId ? "sent" : "failed",
          },
        });
      }
    }

    return { checked: expiringPayments.length };
  }
);
