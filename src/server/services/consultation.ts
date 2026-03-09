import { db } from "@/lib/db";
import { ConsultationStatus } from "@/generated/prisma/client";
import { consultationAnswersSchema, type ConsultationAnswersInput } from "@/lib/validation/schemas";
import { writeAuditLog } from "@/lib/security/audit";
import { inngest } from "@/server/workflows/inngest";

const MOUNJARO_SLUG = "mounjaro";

const INACTIVE_STATUSES: ConsultationStatus[] = ["rejected", "expired"];

export interface SubmitConsultationResult {
  success: boolean;
  consultationId?: string;
  error?: string;
}

/**
 * Submit a Mounjaro consultation for a user.
 * Validates answers, calculates BMI server-side, checks for existing active consultations,
 * and creates the consultation + answers in a transaction with audit logging.
 */
export async function submitConsultation(
  userId: string,
  formData: ConsultationAnswersInput
): Promise<SubmitConsultationResult> {
  // Server-side validation
  const parsed = consultationAnswersSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: "Please check your answers and try again." };
  }

  const data = parsed.data;

  // Server-side BMI calculation — never trust client
  const bmi = data.weightKg / Math.pow(data.heightCm / 100, 2);

  // Parallelize independent DB lookups
  const [existingConsultation, product] = await Promise.all([
    db.consultation.findFirst({
      where: {
        userId,
        status: { notIn: INACTIVE_STATUSES },
      },
      select: { id: true },
    }),
    db.product.findFirst({
      where: { slug: MOUNJARO_SLUG, isActive: true },
      select: { id: true },
    }),
  ]);

  if (existingConsultation) {
    return {
      success: false,
      error: "You already have an active consultation. Please check your account for details.",
    };
  }

  if (!product) {
    return {
      success: false,
      error: "This product is currently unavailable. Please try again later.",
    };
  }

  // Create Consultation + ConsultationAnswers in a transaction
  const consultation = await db.$transaction(async (tx) => {
    const created = await tx.consultation.create({
      data: {
        userId,
        productId: product.id,
        status: "submitted",
        submittedAt: new Date(),
      },
    });

    await tx.consultationAnswers.create({
      data: {
        consultationId: created.id,
        answersJson: { ...data },
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        bmi: Math.round(bmi * 10) / 10,
        isPregnantOrBreastfeeding: data.isPregnantOrBreastfeeding,
        hasMedicalConditions: data.hasMedicalConditions,
        medicalConditionsText: data.medicalConditionsText ?? null,
        currentMedicationsText: data.currentMedicationsText ?? null,
        hasEpilepsy: data.hasEpilepsy ?? false,
        hasHighCholesterol: data.hasHighCholesterol ?? false,
        hasDiabetes: data.hasDiabetes ?? false,
        hasGalactoseIntolerance: data.hasGalactoseIntolerance ?? false,
        hasLappLactaseDeficiency: data.hasLappLactaseDeficiency ?? false,
        hasGlucoseGalactoseMalabsorption: data.hasGlucoseGalactoseMalabsorption ?? false,
        hasLiverKidneyProblems: data.hasLiverKidneyProblems ?? false,
        hasIbd: data.hasIbd ?? false,
        hasThyroidProblems: data.hasThyroidProblems ?? false,
        hasDepression: data.hasDepression ?? false,
        hasPriorGlp1Use: data.hasPriorGlp1Use,
        priorGlp1Details: data.priorGlp1Details ?? null,
        hasPancreatitisHistory: data.hasPancreatitisHistory,
        hasEatingDisorderHistory: data.hasEatingDisorderHistory,
        hasAllergies: data.hasAllergies,
        allergiesText: data.allergiesText ?? null,
        drinksAlcohol: data.drinksAlcohol,
        hasDisabilities: data.hasDisabilities,
        gpDetails: data.gpDetails,
        consentConfirmed: data.consentConfirmed,
        safetyConfirmationsJson: data.safetyConfirmations as unknown as Record<string, boolean>,
      },
    });

    return created;
  });

  // Audit log + email event — no PHI
  await Promise.all([
    writeAuditLog({
      actorUserId: userId,
      actorRole: "customer",
      entityType: "Consultation",
      entityId: consultation.id,
      action: "consultation.submitted",
      newState: {
        productId: product.id,
        bmi: Math.round(bmi * 10) / 10,
      },
    }),
    inngest.send({
      name: "consultation/submitted",
      data: { userId, consultationId: consultation.id },
    }),
  ]);

  return { success: true, consultationId: consultation.id };
}
