import { db } from "@/lib/db";
import { ConsultationStatus } from "@/generated/prisma/client";
import {
  consultationAnswersSchema,
  refillConsultationSchema,
  type ConsultationAnswersInput,
  type RefillConsultationInput,
} from "@/lib/validation/schemas";
import { writeAuditLog } from "@/lib/security/audit";
import { inngest } from "@/server/workflows/inngest";

const MOUNJARO_SLUG = "mounjaro";

// Terminal/non-blocking statuses. A customer with ONLY consultations in
// these states is free to start a brand-new consultation.
// - rejected / expired: prescriber declined or auth lapsed, fresh start
// - approved:           prescriber already decided + payment captured; this
//                       is a COMPLETED transaction, not an in-flight one.
//                       Mounjaro is a repeat-purchase business — locking a
//                       customer out forever after one successful order
//                       would kill reorders, which is the revenue model.
const INACTIVE_STATUSES: ConsultationStatus[] = ["rejected", "expired", "approved"];

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

/**
 * Submit a refill consultation. The patient has previously completed an
 * approved Mounjaro consultation and received their order. Instead of
 * forcing them to refill the full questionnaire, we:
 *
 * 1. Verify they have a prior `approved` consultation with a captured
 *    payment (i.e. they actually completed the journey before).
 * 2. Inherit chronic medical history from the prior consultation's
 *    answers — height, conditions list, allergies, GP details, etc.
 * 3. Take only the delta from this form: current weight, side effects,
 *    anything-changed flags, dose preference, re-confirmed consent.
 * 4. Promote any "new condition" / "new medication" text into the
 *    appropriate boolean+text columns so the prescriber sees it in the
 *    same fields they normally review.
 * 5. Re-ask safety-critical items (pregnancy, pancreatitis episode,
 *    mood) because a stale answer here would be clinically unsafe.
 * 6. Mark the new consultation in `answersJson` so the prescriber UI
 *    can show a "REFILL" badge with a link back to the prior consult.
 *
 * Routes through the same prescriber review pipeline as a fresh
 * consultation — fires `consultation/submitted`, lands in the queue,
 * gets reviewed, captures payment on approval / voids on rejection.
 */
export async function submitRefillConsultation(
  userId: string,
  prevConsultationId: string,
  formData: RefillConsultationInput,
): Promise<SubmitConsultationResult> {
  const parsed = refillConsultationSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please check your answers and try again.",
    };
  }
  const data = parsed.data;

  // Eligibility: prior consultation must belong to user, be approved,
  // and have an actual captured payment (proves they completed it, not
  // just got approved). Pull answers in the same query.
  const prev = await db.consultation.findFirst({
    where: {
      id: prevConsultationId,
      userId,
      status: "approved",
    },
    include: {
      answers: true,
      orders: {
        where: { paymentStatus: "captured" },
        select: { id: true },
      },
    },
  });
  if (!prev) {
    return {
      success: false,
      error:
        "Previous consultation not found or not eligible for refill.",
    };
  }
  if (!prev.answers) {
    return {
      success: false,
      error:
        "Previous consultation answers missing — please start a fresh consultation instead.",
    };
  }
  if (prev.orders.length === 0) {
    return {
      success: false,
      error:
        "Previous order was not captured — cannot refill from this consultation.",
    };
  }

  // Same duplicate-active guard as the fresh-consultation path.
  const existingActive = await db.consultation.findFirst({
    where: { userId, status: { notIn: INACTIVE_STATUSES } },
    select: { id: true },
  });
  if (existingActive) {
    return {
      success: false,
      error:
        "You already have an active consultation. Please check your account for details.",
    };
  }

  const prior = prev.answers;
  const bmi = data.weightKg / Math.pow(prior.heightCm / 100, 2);

  // Append helpers — keep the prior text and tag the new addition so the
  // prescriber can see both at a glance.
  function appendUpdate(
    priorText: string | null,
    newText: string | undefined,
  ): string | null {
    const trimmed = newText?.trim();
    if (!trimmed) return priorText;
    if (!priorText) return `(Refill update) ${trimmed}`;
    return `${priorText}\n\n(Refill update) ${trimmed}`;
  }

  const mergedMedicalConditionsText = data.hasNewConditions
    ? appendUpdate(prior.medicalConditionsText, data.newConditionsText)
    : prior.medicalConditionsText;
  const mergedMedicationsText = data.hasNewMedications
    ? appendUpdate(prior.currentMedicationsText, data.newMedicationsText)
    : prior.currentMedicationsText;
  const mergedPriorGlp1Details = appendUpdate(
    prior.priorGlp1Details,
    data.supplyExperience,
  );

  // answersJson stores the full snapshot of what the patient saw +
  // submitted, plus the refill metadata so the admin UI can detect
  // and visualise this as a refill.
  const answersJson = {
    refill: {
      isRefill: true,
      previousConsultationId: prev.id,
      supplyExperience: data.supplyExperience,
      hadSideEffects: data.hadSideEffects,
      sideEffectsText: data.sideEffectsText ?? null,
      hadPancreatitisEpisode: data.hadPancreatitisEpisode,
      hadMentalHealthConcerns: data.hadMentalHealthConcerns,
      mentalHealthDetails: data.mentalHealthDetails ?? null,
      dosePreference: data.dosePreference,
      newConditionsText: data.newConditionsText ?? null,
      newMedicationsText: data.newMedicationsText ?? null,
    },
    inheritedFromPrior: {
      heightCm: prior.heightCm,
      hasEpilepsy: prior.hasEpilepsy,
      hasHighCholesterol: prior.hasHighCholesterol,
      hasDiabetes: prior.hasDiabetes,
      hasGalactoseIntolerance: prior.hasGalactoseIntolerance,
      hasLappLactaseDeficiency: prior.hasLappLactaseDeficiency,
      hasGlucoseGalactoseMalabsorption:
        prior.hasGlucoseGalactoseMalabsorption,
      hasLiverKidneyProblems: prior.hasLiverKidneyProblems,
      hasIbd: prior.hasIbd,
      hasThyroidProblems: prior.hasThyroidProblems,
      hasDepression: prior.hasDepression,
      hasEatingDisorderHistory: prior.hasEatingDisorderHistory,
      hasAllergies: prior.hasAllergies,
      allergiesText: prior.allergiesText,
      drinksAlcohol: prior.drinksAlcohol,
      hasDisabilities: prior.hasDisabilities,
      gpDetails: prior.gpDetails,
    },
    weightKg: data.weightKg,
    isPregnantOrBreastfeeding: data.isPregnantOrBreastfeeding,
    consentConfirmed: data.consentConfirmed,
  };

  const consultation = await db.$transaction(async (tx) => {
    const created = await tx.consultation.create({
      data: {
        userId,
        productId: prev.productId,
        status: "submitted",
        submittedAt: new Date(),
      },
    });

    await tx.consultationAnswers.create({
      data: {
        consultationId: created.id,
        answersJson,
        // Patient-provided this round
        heightCm: prior.heightCm,
        weightKg: data.weightKg,
        bmi: Math.round(bmi * 10) / 10,
        isPregnantOrBreastfeeding: data.isPregnantOrBreastfeeding,
        // Merged text fields — prior + any refill updates
        hasMedicalConditions:
          prior.hasMedicalConditions || data.hasNewConditions,
        medicalConditionsText: mergedMedicalConditionsText,
        currentMedicationsText: mergedMedicationsText,
        // Chronic conditions inherited from prior — these don't usually
        // resolve between supplies. If something has changed, the patient
        // captures it via the "new condition" free text above.
        hasEpilepsy: prior.hasEpilepsy,
        hasHighCholesterol: prior.hasHighCholesterol,
        hasDiabetes: prior.hasDiabetes,
        hasGalactoseIntolerance: prior.hasGalactoseIntolerance,
        hasLappLactaseDeficiency: prior.hasLappLactaseDeficiency,
        hasGlucoseGalactoseMalabsorption:
          prior.hasGlucoseGalactoseMalabsorption,
        hasLiverKidneyProblems: prior.hasLiverKidneyProblems,
        hasIbd: prior.hasIbd,
        hasThyroidProblems: prior.hasThyroidProblems,
        hasDepression: prior.hasDepression,
        // Patient has obviously used GLP-1 by now — they finished a
        // previous supply. Stitch the new supply experience into the
        // details field so the prescriber can read the trajectory.
        hasPriorGlp1Use: true,
        priorGlp1Details: mergedPriorGlp1Details,
        // Re-asked safety-critical: if the patient reports an episode
        // this round we flip the history flag true permanently.
        hasPancreatitisHistory:
          prior.hasPancreatitisHistory || data.hadPancreatitisEpisode,
        hasEatingDisorderHistory: prior.hasEatingDisorderHistory,
        // Allergies and lifestyle inherited.
        hasAllergies: prior.hasAllergies,
        allergiesText: prior.allergiesText,
        drinksAlcohol: prior.drinksAlcohol,
        hasDisabilities: prior.hasDisabilities,
        gpDetails: prior.gpDetails,
        consentConfirmed: data.consentConfirmed,
        // Carry forward the prior safety confirmations — they were valid
        // at the original consult and the patient re-confirms consent
        // this round, which is what the GPhC regs actually require.
        safetyConfirmationsJson:
          prior.safetyConfirmationsJson as Record<string, boolean>,
      },
    });

    return created;
  });

  await Promise.all([
    writeAuditLog({
      actorUserId: userId,
      actorRole: "customer",
      entityType: "Consultation",
      entityId: consultation.id,
      action: "consultation.refill_submitted",
      newState: {
        productId: prev.productId,
        previousConsultationId: prev.id,
        bmi: Math.round(bmi * 10) / 10,
        dosePreference: data.dosePreference,
      },
    }),
    inngest.send({
      name: "consultation/submitted",
      data: { userId, consultationId: consultation.id },
    }),
  ]);

  return { success: true, consultationId: consultation.id };
}
