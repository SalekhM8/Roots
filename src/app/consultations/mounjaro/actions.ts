"use server";

import { requireUser } from "@/lib/auth";
import { submitConsultation } from "@/server/services/consultation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type { ConsultationAnswersInput } from "@/lib/validation/schemas";

export async function submitConsultationAction(formData: ConsultationAnswersInput) {
  const user = await requireUser();

  const rl = checkRateLimit("consultation", user.id);
  if (!rl.allowed) {
    return { success: false as const, error: "Too many requests. Please try again shortly." };
  }

  return submitConsultation(user.id, formData);
}
