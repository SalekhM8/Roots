/**
 * One-off: send the abandoned-consultation nudge to salvoapril@gmail.com
 * with the SAME copy / template as the automation. Locates her user,
 * finds her submitted-without-payment Mounjaro consultation, renders the
 * nudge #1 template, and sends via Resend. Writes the email_events row
 * so this manual send is visible to the audit trail just like the
 * Inngest-driven sends will be.
 *
 * Safe to re-run only if you want to nudge again — each run will create
 * a new email send + a new email_events row.
 *
 * Run with:  npx tsx scripts/send-salvoapril-nudge.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
import { Resend } from "resend";
import { consultationAbandonedNudge } from "../src/lib/email/templates";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const TARGET_EMAIL = "salvoapril@gmail.com";
const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? "ROOTS Pharmacy <noreply@rootspharmacy.co.uk>";

async function main() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set in this shell");
  }

  const user = await db.user.findUnique({
    where: { email: TARGET_EMAIL },
    include: {
      customerProfile: { select: { firstName: true } },
    },
  });
  if (!user) {
    console.error(`No user found for ${TARGET_EMAIL}`);
    await db.$disconnect();
    process.exit(1);
  }

  const consultation = await db.consultation.findFirst({
    where: {
      userId: user.id,
      status: "submitted",
    },
    include: { orders: { select: { paymentStatus: true } } },
    orderBy: { submittedAt: "desc" },
  });
  if (!consultation) {
    console.error(`No submitted consultation found for ${TARGET_EMAIL}`);
    await db.$disconnect();
    process.exit(1);
  }

  const hasPaid = consultation.orders.some(
    (o) => o.paymentStatus === "authorized" || o.paymentStatus === "captured",
  );
  if (hasPaid) {
    console.error(
      `Consultation ${consultation.id} already has an authorised or captured payment — refusing to nudge.`,
    );
    await db.$disconnect();
    process.exit(1);
  }

  const name = user.customerProfile?.firstName ?? "there";
  const html = consultationAbandonedNudge(name, consultation.id, 1);
  const subject =
    "You're one step away — finish your Mounjaro consultation";

  console.log("About to send:");
  console.log(`  to:      ${user.email}`);
  console.log(`  subject: ${subject}`);
  console.log(`  consult: ${consultation.id}`);
  console.log(`  name:    ${name}`);

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: user.email,
    subject,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    await db.$disconnect();
    process.exit(1);
  }

  const messageId = data?.id ?? null;
  await db.emailEvent.create({
    data: {
      userId: user.id,
      consultationId: consultation.id,
      emailType: "consultation_abandoned_nudge_1",
      providerMessageId: messageId,
      sentAt: messageId ? new Date() : null,
      status: messageId ? "sent" : "failed",
    },
  });

  console.log(`\nSent. Resend message id: ${messageId}`);
  await db.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await db.$disconnect();
  process.exit(1);
});
