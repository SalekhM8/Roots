import { inngest } from "./inngest";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/resend";
import * as templates from "@/lib/email/templates";
import { voidOrRefundVivaPayment } from "@/server/services/payment";
import { VivaError } from "@/lib/payments/viva";

/**
 * All transactional emails are triggered through Inngest workflows,
 * never inline in route handlers. Each send creates an email_events record.
 */

export const sendAccountCreatedEmail = inngest.createFunction(
  { id: "send-account-created-email" },
  { event: "user/created" },
  async ({ event }) => {
    const { userId } = event.data;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { customerProfile: { select: { firstName: true } } },
    });
    if (!user) return;

    const name = user.customerProfile?.firstName ?? "there";
    const html = templates.accountCreated(name);

    const { messageId } = await sendEmail({
      to: user.email,
      subject: "Welcome to ROOTS Pharmacy",
      html,
    });

    await db.emailEvent.create({
      data: {
        userId,
        emailType: "account_created",
        providerMessageId: messageId,
        sentAt: messageId ? new Date() : null,
        status: messageId ? "sent" : "failed",
      },
    });
  }
);

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

/**
 * Order confirmation — fired when a customer's payment first transitions out of
 * `pending` (i.e. authorized for POM/mixed, captured for supplements).
 *
 * Triggered by the payment-provider webhook. Currently NOT fired anywhere yet
 * because the Mollie webhook is being torn out — wire `inngest.send({ name:
 * "order/created", data: { userId, orderId, orderNumber, isPom } })` from the
 * Viva webhook on first non-pending state transition.
 */
export const sendOrderConfirmationEmail = inngest.createFunction(
  { id: "send-order-confirmation-email" },
  { event: "order/created" },
  async ({ event }) => {
    const { userId, orderId, orderNumber, isPom } = event.data;

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
      const order = await db.order.findUnique({
        where: { id: orderId },
        select: { guestEmail: true },
      });
      if (!order?.guestEmail) return;
      toEmail = order.guestEmail;
      name = "there";
    }

    const html = templates.orderConfirmation(name, orderNumber, !!isPom);

    const { messageId } = await sendEmail({
      to: toEmail,
      subject: `Order ${orderNumber} Received — ROOTS Pharmacy`,
      html,
    });

    await db.emailEvent.create({
      data: {
        userId: userId ?? undefined,
        recipientEmail: toEmail,
        orderId,
        emailType: "order_confirmation",
        providerMessageId: messageId,
        sentAt: messageId ? new Date() : null,
        status: messageId ? "sent" : "failed",
      },
    });
  },
);

/**
 * Internal admin notification on every new order.
 *
 * Listens to the same `order/created` event as the customer-facing
 * confirmation, so any future provider that emits this event (Viva today,
 * a backup acquirer tomorrow) gets admin notifications for free.
 *
 * Goes to ADMIN_NOTIFICATIONS_EMAIL (defaults to admin@rootspharmacy.co.uk).
 * Resend send failures still create an email_events row with status=failed
 * so we can spot a broken pipeline at a glance.
 */
const ADMIN_NOTIFICATIONS_EMAIL =
  process.env.ADMIN_NOTIFICATIONS_EMAIL ?? "admin@rootspharmacy.co.uk";

export const sendAdminNewOrderEmail = inngest.createFunction(
  { id: "send-admin-new-order-email" },
  { event: "order/created" },
  async ({ event }) => {
    const { orderId } = event.data;

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: { include: { customerProfile: true } },
        items: {
          select: {
            quantity: true,
            productNameSnapshot: true,
            variantNameSnapshot: true,
            skuSnapshot: true,
          },
        },
      },
    });
    if (!order) return;

    // Build a human label for the customer column. Account orders show
    // "First Last (email)"; guest orders fall back to the captured email.
    const profile = order.user?.customerProfile;
    const fullName = profile
      ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
      : "";
    let customerLabel: string;
    if (order.user) {
      customerLabel = fullName
        ? `${fullName} (${order.user.email})`
        : order.user.email;
    } else if (order.guestEmail) {
      customerLabel = `Guest — ${order.guestEmail}`;
    } else {
      customerLabel = "Unknown";
    }

    const itemsSummary =
      order.items
        .map((item) => {
          const label =
            [item.productNameSnapshot, item.variantNameSnapshot]
              .filter(Boolean)
              .join(" ") ||
            item.skuSnapshot ||
            "Item";
          return `${item.quantity}× ${label}`;
        })
        .join("\n") || "(no line items)";

    const amountFormatted = `£${(order.totalMinor / 100).toFixed(2)}`;
    const isPom = order.orderType !== "supplement";

    const html = templates.adminNewOrder({
      orderNumber: order.orderNumber,
      amountFormatted,
      customerLabel,
      isPom,
      itemsSummary,
      orderId: order.id,
    });

    const { messageId } = await sendEmail({
      to: ADMIN_NOTIFICATIONS_EMAIL,
      subject: `New Order ${order.orderNumber} — ${amountFormatted}${isPom ? " (POM)" : ""}`,
      html,
    });

    await db.emailEvent.create({
      data: {
        recipientEmail: ADMIN_NOTIFICATIONS_EMAIL,
        orderId,
        emailType: "admin_new_order",
        providerMessageId: messageId,
        sentAt: messageId ? new Date() : null,
        status: messageId ? "sent" : "failed",
      },
    });
  },
);

/**
 * Admin notification fired when a patient submits a consultation.
 * Listens on the same `consultation/submitted` event as the customer
 * "Consultation Received" email — separate function so the customer
 * send is unaffected if this one fails. Idempotent: deduped on
 * (consultationId, emailType) so a re-fire never double-sends.
 */
export const sendAdminConsultationSubmittedEmail = inngest.createFunction(
  { id: "send-admin-consultation-submitted-email" },
  { event: "consultation/submitted" },
  async ({ event }) => {
    const { consultationId } = event.data;

    const alreadySent = await db.emailEvent.findFirst({
      where: { consultationId, emailType: "admin_consultation_submitted" },
      select: { id: true },
    });
    if (alreadySent) return { skipped: true };

    const consultation = await db.consultation.findUnique({
      where: { id: consultationId },
      include: {
        user: { include: { customerProfile: true } },
        product: { select: { name: true } },
        answers: { select: { bmi: true, answersJson: true } },
        orders: {
          select: { paymentStatus: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!consultation) return;

    // Customer label — same convention as adminNewOrder so the inbox
    // shows the patient consistently across both notifications.
    const profile = consultation.user.customerProfile;
    const fullName = profile
      ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
      : "";
    const customerLabel = fullName
      ? `${fullName} (${consultation.user.email})`
      : consultation.user.email;

    // Refill detection — submitRefillConsultation tags answersJson.refill.isRefill.
    const answersJson = consultation.answers?.answersJson as
      | { refill?: { isRefill?: boolean } }
      | null
      | undefined;
    const isRefill = answersJson?.refill?.isRefill === true;

    const bmiFormatted = consultation.answers?.bmi
      ? (consultation.answers.bmi as number).toFixed(1)
      : null;

    const hasAuthorised = consultation.orders.some(
      (o) => o.paymentStatus === "authorized" || o.paymentStatus === "captured",
    );
    const hasPending = consultation.orders.some(
      (o) => o.paymentStatus === "pending",
    );
    const paymentStatus: "authorised" | "pending" | "none" = hasAuthorised
      ? "authorised"
      : hasPending
        ? "pending"
        : "none";

    const html = templates.adminConsultationSubmitted({
      consultationId,
      customerLabel,
      productName: consultation.product.name,
      isRefill,
      bmiFormatted,
      paymentStatus,
    });

    const subjectPrefix = isRefill
      ? "Refill consultation submitted"
      : "New consultation submitted";

    const { messageId } = await sendEmail({
      to: ADMIN_NOTIFICATIONS_EMAIL,
      subject: `${subjectPrefix} — ${customerLabel}`,
      html,
    });

    await db.emailEvent.create({
      data: {
        recipientEmail: ADMIN_NOTIFICATIONS_EMAIL,
        consultationId,
        emailType: "admin_consultation_submitted",
        providerMessageId: messageId,
        sentAt: messageId ? new Date() : null,
        status: messageId ? "sent" : "failed",
      },
    });
  },
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
  // Runs at 06:00 UK time year-round (Inngest evaluates the TZ prefix, so this
  // shifts correctly between GMT and BST). Without TZ= this would drift by one
  // hour twice a year.
  { cron: "TZ=Europe/London 0 6 * * *" },
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

    let voided = 0;
    let emailed = 0;

    for (const payment of expiringPayments) {
      // Only act on payments PAST the capture deadline. Viva's preauth window
      // is issuer-controlled (typically 1–5 days); we recorded our best-guess
      // captureBefore at create time. Once past it, the issuer may already
      // have released the hold, but we still call void as a belt-and-braces
      // cleanup — Viva is idempotent enough that a stale void is harmless.
      if (!payment.captureBefore || payment.captureBefore > now) continue;

      // Idempotency: skip if we've already emailed the customer for this order.
      const alreadyEmailed = await db.emailEvent.findFirst({
        where: { orderId: payment.orderId, emailType: "payment_expired" },
        select: { id: true },
      });
      if (alreadyEmailed) continue;

      // Attempt the Viva void. If this fails we must NOT mark the payment
      // expired — the issuer hold may still be live and capturable, and
      // marking expired would send the customer a "your auth expired"
      // email while the merchant could still take their money. Leave the
      // row as authorized and let the next sweeper run retry.
      try {
        await voidOrRefundVivaPayment({
          paymentId: payment.id,
          reason: "preauth.expired.sweeper",
        });
        voided += 1;
      } catch (err) {
        const correlationId =
          err instanceof VivaError ? err.correlationId : undefined;
        const message = err instanceof Error ? err.message : String(err);
        console.error("[preauth-sweeper] Viva void failed — will retry next run", {
          paymentId: payment.id,
          orderId: payment.orderId,
          correlationId,
          error: message,
        });
        // Skip the rest of this iteration: no status change, no email.
        continue;
      }

      // Override the post-void status to "expired" so the customer-facing
      // copy ("Payment Authorization Expired") matches the order state.
      // voidOrRefundVivaPayment sets "voided" on success — we treat the
      // sweeper-triggered case as semantically distinct.
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
      if (!user) continue; // Guest orders use immediate capture, no auth expiry path.
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
      emailed += 1;
    }

    return { checked: expiringPayments.length, voided, emailed };
  }
);

/**
 * Abandoned-consultation recovery: nudges patients who submitted a
 * consultation but never authorised payment. Fires three durable nudges
 * at 2h, 24h, and 72h after submission. Each nudge re-checks the
 * consultation state at send time so anyone who pays before the next
 * step never receives a follow-up.
 *
 * Triggered by `consultation/submitted` — same event as the customer-
 * facing "Consultation Received" email. Durable step.sleep means a
 * Vercel restart or deploy mid-wait does not lose the timer.
 */
export const remindAbandonedConsultations = inngest.createFunction(
  { id: "remind-abandoned-consultations" },
  { event: "consultation/submitted" },
  async ({ event, step }) => {
    const { userId, consultationId } = event.data;

    async function sendIfStillAbandoned(
      nudgeNumber: 1 | 2 | 3,
      subject: string,
    ): Promise<{ sent: boolean; reason?: string }> {
      const consultation = await db.consultation.findUnique({
        where: { id: consultationId },
        include: { orders: { select: { paymentStatus: true } } },
      });
      if (!consultation) return { sent: false, reason: "consultation_missing" };
      if (consultation.status !== "submitted") {
        return { sent: false, reason: `status_${consultation.status}` };
      }
      const hasPaid = consultation.orders.some(
        (o) =>
          o.paymentStatus === "authorized" || o.paymentStatus === "captured",
      );
      if (hasPaid) return { sent: false, reason: "payment_present" };

      const user = await db.user.findUnique({
        where: { id: userId },
        include: { customerProfile: { select: { firstName: true } } },
      });
      if (!user) return { sent: false, reason: "user_missing" };

      const name = user.customerProfile?.firstName ?? "there";
      const html = templates.consultationAbandonedNudge(
        name,
        consultationId,
        nudgeNumber,
      );

      const { messageId } = await sendEmail({
        to: user.email,
        subject,
        html,
      });

      await db.emailEvent.create({
        data: {
          userId,
          consultationId,
          emailType: `consultation_abandoned_nudge_${nudgeNumber}`,
          providerMessageId: messageId,
          sentAt: messageId ? new Date() : null,
          status: messageId ? "sent" : "failed",
        },
      });

      return { sent: true };
    }

    await step.sleep("wait-2h", "2h");
    const nudge1 = await step.run("nudge-1", () =>
      sendIfStillAbandoned(
        1,
        "You're one step away — finish your Mounjaro consultation",
      ),
    );

    await step.sleep("wait-22h", "22h");
    const nudge2 = await step.run("nudge-2", () =>
      sendIfStillAbandoned(
        2,
        "Your Mounjaro consultation is waiting",
      ),
    );

    await step.sleep("wait-48h", "48h");
    const nudge3 = await step.run("nudge-3", () =>
      sendIfStillAbandoned(
        3,
        "Final reminder: complete your Mounjaro consultation",
      ),
    );

    return { nudge1, nudge2, nudge3 };
  },
);

/**
 * Repeat-supply reminders for Mounjaro patients. Mounjaro pens are a
 * 4-week supply; without a nudge most customers slip out of treatment
 * continuity because they forget to start the short refill consultation
 * before they run out.
 *
 * Listens on `order/shipped`. The same event already drives the review
 * request email, so we know it fires for every dispatched order. We
 * filter to orders that have an approved Mounjaro consultation attached
 * — supplement-only orders have no consultation and skip this whole
 * function. Two sends: 21 days then a further 7 days.
 *
 * Suppression rules (checked at send time, not schedule time):
 *  - The customer already started a NEW consultation (active status that
 *    isn't approved/rejected/expired). They're back in flow — leave them
 *    alone.
 *  - We already wrote an emailEvent for this orderId + this nudge
 *    number. Belt-and-braces against re-fired `order/shipped` events.
 */
export const remindRepeatSupply = inngest.createFunction(
  { id: "remind-repeat-supply" },
  { event: "order/shipped" },
  async ({ event, step }) => {
    const { userId, orderId } = event.data;

    async function sendIfStillDue(
      nudgeNumber: 1 | 2,
      subject: string,
    ): Promise<{ sent: boolean; reason?: string }> {
      // Re-pull the order each send so consultation status / new
      // consultations etc are fresh, not as they were 3 weeks ago.
      const order = await db.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          consultationId: true,
          consultation: { select: { id: true, status: true } },
        },
      });
      if (!order) return { sent: false, reason: "order_missing" };
      if (!order.consultation || order.consultation.status !== "approved") {
        return { sent: false, reason: "not_mounjaro_or_not_approved" };
      }

      // Has the customer already started a new consultation since this
      // shipment? If so, they're already in flow — don't nag.
      const existingActive = await db.consultation.findFirst({
        where: {
          userId,
          status: { notIn: ["rejected", "expired", "approved"] },
        },
        select: { id: true },
      });
      if (existingActive) return { sent: false, reason: "already_re_engaged" };

      // Idempotency — never send the same reminder twice for one order.
      const alreadySent = await db.emailEvent.findFirst({
        where: {
          orderId,
          emailType: `repeat_supply_reminder_${nudgeNumber}`,
        },
        select: { id: true },
      });
      if (alreadySent) return { sent: false, reason: "already_sent" };

      const user = await db.user.findUnique({
        where: { id: userId },
        include: { customerProfile: { select: { firstName: true } } },
      });
      if (!user) return { sent: false, reason: "user_missing" };

      const name = user.customerProfile?.firstName ?? "there";
      const html = templates.repeatSupplyReminder(
        name,
        order.consultation.id,
        nudgeNumber,
      );

      const { messageId } = await sendEmail({
        to: user.email,
        subject,
        html,
      });

      await db.emailEvent.create({
        data: {
          userId,
          orderId,
          consultationId: order.consultation.id,
          emailType: `repeat_supply_reminder_${nudgeNumber}`,
          providerMessageId: messageId,
          sentAt: messageId ? new Date() : null,
          status: messageId ? "sent" : "failed",
        },
      });

      return { sent: true };
    }

    await step.sleep("wait-21d", "21d");
    const nudge1 = await step.run("nudge-1", () =>
      sendIfStillDue(
        1,
        "Your next Mounjaro supply may be due soon",
      ),
    );

    await step.sleep("wait-7d", "7d");
    const nudge2 = await step.run("nudge-2", () =>
      sendIfStillDue(
        2,
        "Time to reorder your Mounjaro",
      ),
    );

    return { nudge1, nudge2 };
  },
);
