"use server";

import { requireAnyRole } from "@/lib/auth";
import {
  approveConsultation,
  rejectConsultation,
  requestMoreInfo,
} from "@/server/services/prescriber";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { revalidatePath } from "next/cache";

interface PrescriberActionInput {
  consultationId: string;
  internalNote?: string;
  customerMessage?: string;
}

export async function approveConsultationAction(input: PrescriberActionInput) {
  const user = await requireAnyRole("admin", "prescriber");
  const rl = checkRateLimit("admin", user.id);
  if (!rl.allowed) return { success: false, error: "Too many requests." };
  const result = await approveConsultation({
    ...input,
    prescriberUserId: user.id,
  });
  if (result.success) {
    revalidatePath("/admin/consultations");
  }
  return result;
}

export async function rejectConsultationAction(
  input: PrescriberActionInput & { customerMessage: string }
) {
  const user = await requireAnyRole("admin", "prescriber");
  const rl = checkRateLimit("admin", user.id);
  if (!rl.allowed) return { success: false, error: "Too many requests." };
  const result = await rejectConsultation({
    ...input,
    prescriberUserId: user.id,
  });
  if (result.success) {
    revalidatePath("/admin/consultations");
  }
  return result;
}

export async function requestMoreInfoAction(
  input: PrescriberActionInput & { customerMessage: string }
) {
  const user = await requireAnyRole("admin", "prescriber");
  const rl = checkRateLimit("admin", user.id);
  if (!rl.allowed) return { success: false, error: "Too many requests." };
  const result = await requestMoreInfo({
    ...input,
    prescriberUserId: user.id,
  });
  if (result.success) {
    revalidatePath("/admin/consultations");
  }
  return result;
}
