"use server";

import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/security/audit";
import { inngest } from "@/server/workflows/inngest";
import { checkRateLimit } from "@/lib/security/rate-limit";

const replySchema = z.object({
  consultationId: z.string().uuid(),
  // Bounded so the prescriber's review queue stays readable and we don't
  // blow out the audit log column with a wall of text.
  message: z.string().trim().min(10).max(2000),
});

export interface ReplyResult {
  success: boolean;
  error?: string;
}

/**
 * Customer reply to an action_required consultation.
 *
 * Flips the consultation back to `submitted` so the prescriber sees it
 * in their queue again, records the reply in the audit log (we don't
 * have a dedicated customer-reply table — adding one is post-launch
 * work), and fires an Inngest event so the prescriber can be notified.
 */
export async function respondToInfoRequest(
  input: z.infer<typeof replySchema>,
): Promise<ReplyResult> {
  const user = await requireUser();

  const parsed = replySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please write at least a couple of sentences (max 2000 characters).",
    };
  }

  const rl = await checkRateLimit("consultation", `user:${user.id}`);
  if (!rl.allowed) {
    return {
      success: false,
      error: "Too many submissions. Please try again shortly.",
    };
  }

  const consultation = await db.consultation.findFirst({
    where: { id: parsed.data.consultationId, userId: user.id },
    select: { id: true, status: true },
  });

  if (!consultation) {
    return { success: false, error: "Consultation not found." };
  }

  if (consultation.status !== "action_required") {
    return {
      success: false,
      error:
        "This consultation is not awaiting a reply. If you think this is wrong, please contact support.",
    };
  }

  await db.consultation.update({
    where: { id: consultation.id },
    data: { status: "submitted", submittedAt: new Date() },
  });

  await Promise.all([
    writeAuditLog({
      actorUserId: user.id,
      actorRole: "customer",
      entityType: "Consultation",
      entityId: consultation.id,
      action: "consultation.info_provided",
      previousState: { status: "action_required" },
      newState: { status: "submitted", replyLength: parsed.data.message.length },
      // The message itself is medical data — store it in metadata, not in
      // a generic state field that may end up in lower-trust logs.
      metadata: { message: parsed.data.message },
    }),
    inngest.send({
      name: "consultation/info-provided",
      data: { userId: user.id, consultationId: consultation.id },
    }),
  ]);

  return { success: true };
}
