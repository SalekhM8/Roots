"use server";

import { requireUser } from "@/lib/auth";
import { submitRefillConsultation } from "@/server/services/consultation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type { RefillConsultationInput } from "@/lib/validation/schemas";

export async function submitRefillConsultationAction(
  prevConsultationId: string,
  formData: RefillConsultationInput,
) {
  const user = await requireUser();

  const rl = await checkRateLimit("consultation", user.id);
  if (!rl.allowed) {
    return {
      success: false as const,
      error: "Too many requests. Please try again shortly.",
    };
  }

  return submitRefillConsultation(user.id, prevConsultationId, formData);
}
