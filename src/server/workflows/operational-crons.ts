import { inngest } from "./inngest";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/resend";
import * as templates from "@/lib/email/templates";

/**
 * Operational crons that keep the system clean and surface stuck work to ops.
 * Each runs daily on TZ=Europe/London so DST transitions don't shift the run.
 */

const STALE_DRAFT_DAYS = 30;
const ACTION_REQUIRED_REMINDER_HOURS = 48;
const STUCK_PACKED_HOURS = 48;

/**
 * Mark consultation drafts that have been idle for >30 days as `expired`.
 * Customers can always start a new one; this stops the prescriber queue and
 * admin views from filling up with abandoned drafts.
 */
export const cleanupStaleDraftConsultations = inngest.createFunction(
  { id: "cleanup-stale-draft-consultations" },
  { cron: "TZ=Europe/London 0 3 * * *" },
  async () => {
    const cutoff = new Date(Date.now() - STALE_DRAFT_DAYS * 24 * 60 * 60 * 1000);

    const result = await db.consultation.updateMany({
      where: {
        status: "draft",
        updatedAt: { lt: cutoff },
      },
      data: { status: "expired" },
    });

    return { expired: result.count };
  },
);

/**
 * Email customers whose consultation has been stuck in `action_required`
 * for >48 hours, asking them to respond. Uses the latest prescriber review's
 * customerMessage so the reminder echoes the original ask.
 *
 * Idempotency: skips consultations that already have an
 * `action_required_reminder` email event.
 */
export const remindActionRequiredConsultations = inngest.createFunction(
  { id: "remind-action-required-consultations" },
  { cron: "TZ=Europe/London 0 9 * * *" },
  async () => {
    const cutoff = new Date(
      Date.now() - ACTION_REQUIRED_REMINDER_HOURS * 60 * 60 * 1000,
    );

    const consultations = await db.consultation.findMany({
      where: {
        status: "action_required",
        updatedAt: { lt: cutoff },
      },
      include: {
        user: {
          include: { customerProfile: { select: { firstName: true } } },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { customerMessage: true },
        },
      },
    });

    let reminded = 0;

    for (const consultation of consultations) {
      const alreadySent = await db.emailEvent.findFirst({
        where: {
          consultationId: consultation.id,
          emailType: "action_required_reminder",
        },
        select: { id: true },
      });
      if (alreadySent) continue;

      const name = consultation.user.customerProfile?.firstName ?? "there";
      const message =
        consultation.reviews[0]?.customerMessage ??
        "Your prescriber has requested more information to continue with your consultation.";
      const html = templates.actionRequired(name, message);

      const { messageId } = await sendEmail({
        to: consultation.user.email,
        subject: "Reminder: Action Required — ROOTS Pharmacy",
        html,
      });

      await db.emailEvent.create({
        data: {
          userId: consultation.userId,
          consultationId: consultation.id,
          emailType: "action_required_reminder",
          providerMessageId: messageId,
          sentAt: messageId ? new Date() : null,
          status: messageId ? "sent" : "failed",
        },
      });

      reminded += 1;
    }

    return { checked: consultations.length, reminded };
  },
);

/**
 * Internal alert for orders that have been packed (or have labels created)
 * but not shipped within 48 hours. Emails OPS_ALERT_EMAIL with the list so
 * the warehouse team can chase them down.
 */
export const alertStuckPackedOrders = inngest.createFunction(
  { id: "alert-stuck-packed-orders" },
  { cron: "TZ=Europe/London 0 10 * * *" },
  async () => {
    const cutoff = new Date(Date.now() - STUCK_PACKED_HOURS * 60 * 60 * 1000);

    const stuckOrders = await db.order.findMany({
      where: {
        fulfillmentStatus: { in: ["packed", "labels_created"] },
        fulfillmentJob: {
          packedAt: { lt: cutoff },
        },
      },
      select: {
        id: true,
        orderNumber: true,
        fulfillmentStatus: true,
        fulfillmentJob: { select: { packedAt: true } },
      },
    });

    if (stuckOrders.length === 0) {
      return { stuck: 0, alerted: false };
    }

    const opsEmail = process.env.OPS_ALERT_EMAIL;
    if (!opsEmail) {
      // No ops email configured — surface count so it shows up in Inngest run history.
      return { stuck: stuckOrders.length, alerted: false };
    }

    const rows = stuckOrders
      .map(
        (o) =>
          `<tr><td style="padding:6px 12px;border:1px solid #ddd">${o.orderNumber}</td>` +
          `<td style="padding:6px 12px;border:1px solid #ddd">${o.fulfillmentStatus}</td>` +
          `<td style="padding:6px 12px;border:1px solid #ddd">${o.fulfillmentJob?.packedAt?.toISOString() ?? "—"}</td></tr>`,
      )
      .join("");
    const html =
      `<p>The following orders have been packed for more than ${STUCK_PACKED_HOURS} hours but not shipped:</p>` +
      `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px"><thead>` +
      `<tr><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Order</th>` +
      `<th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Status</th>` +
      `<th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Packed at</th></tr>` +
      `</thead><tbody>${rows}</tbody></table>`;

    const { messageId } = await sendEmail({
      to: opsEmail,
      subject: `[ROOTS Ops] ${stuckOrders.length} order(s) stuck after packing`,
      html,
    });

    return {
      stuck: stuckOrders.length,
      alerted: !!messageId,
    };
  },
);
