"use client";

/**
 * Refill consultation form — single-page delta-only follow-up for
 * returning Mounjaro patients. Chronic medical history is inherited from
 * the prior approved consultation on the server; here we only ask what
 * can have changed since the last supply.
 *
 * Three sections:
 *   1. How it's going (weight, supply experience, side effects)
 *   2. Anything changed (pregnancy, new conditions/meds, pancreatitis, mood)
 *   3. Next supply (dose preference, consent)
 *
 * Submits via the `submitRefillConsultationAction` server action which
 * validates with the same Zod schema and lands the new consultation in
 * the prescriber queue.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  FormCard,
  QuestionBlock,
  RadioCard,
  Textarea,
  YesNoRadio,
  Checkbox,
} from "@/components/consultation/form-primitives";
import { submitRefillConsultationAction } from "./actions";

interface RefillFormProps {
  prevConsultationId: string;
  priorWeightKg: number | null;
  priorHeightCm: number;
}

type DosePreference = "same" | "escalate" | "discuss";

export function RefillForm({
  prevConsultationId,
  priorWeightKg,
  priorHeightCm,
}: RefillFormProps) {
  const router = useRouter();
  const [submitting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [weightKg, setWeightKg] = useState<string>(
    priorWeightKg ? String(priorWeightKg) : "",
  );
  const [supplyExperience, setSupplyExperience] = useState("");
  const [hadSideEffects, setHadSideEffects] = useState<boolean | null>(null);
  const [sideEffectsText, setSideEffectsText] = useState("");
  const [isPregnantOrBreastfeeding, setIsPregnantOrBreastfeeding] = useState<
    boolean | null
  >(null);
  const [hasNewConditions, setHasNewConditions] = useState<boolean | null>(null);
  const [newConditionsText, setNewConditionsText] = useState("");
  const [hasNewMedications, setHasNewMedications] = useState<boolean | null>(
    null,
  );
  const [newMedicationsText, setNewMedicationsText] = useState("");
  const [hadPancreatitisEpisode, setHadPancreatitisEpisode] = useState<
    boolean | null
  >(null);
  const [hadMentalHealthConcerns, setHadMentalHealthConcerns] = useState<
    boolean | null
  >(null);
  const [mentalHealthDetails, setMentalHealthDetails] = useState("");
  const [dosePreference, setDosePreference] = useState<DosePreference | null>(
    null,
  );
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  // Derived: which conditional textareas are required to be non-empty.
  const sideEffectsTextRequired =
    hadSideEffects === true && sideEffectsText.trim().length === 0;
  const newConditionsTextRequired =
    hasNewConditions === true && newConditionsText.trim().length === 0;
  const newMedicationsTextRequired =
    hasNewMedications === true && newMedicationsText.trim().length === 0;
  const mentalHealthDetailsRequired =
    hadMentalHealthConcerns === true && mentalHealthDetails.trim().length === 0;

  const weightNumber = Number(weightKg);
  const weightValid =
    weightKg !== "" &&
    Number.isFinite(weightNumber) &&
    weightNumber >= 30 &&
    weightNumber <= 300;

  const allAnswered =
    weightValid &&
    supplyExperience.trim().length >= 10 &&
    hadSideEffects !== null &&
    !sideEffectsTextRequired &&
    isPregnantOrBreastfeeding !== null &&
    hasNewConditions !== null &&
    !newConditionsTextRequired &&
    hasNewMedications !== null &&
    !newMedicationsTextRequired &&
    hadPancreatitisEpisode !== null &&
    hadMentalHealthConcerns !== null &&
    !mentalHealthDetailsRequired &&
    dosePreference !== null &&
    consentConfirmed;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!allAnswered) {
      setError("Please answer every question before submitting.");
      return;
    }

    startTransition(async () => {
      const result = await submitRefillConsultationAction(prevConsultationId, {
        weightKg: weightNumber,
        supplyExperience: supplyExperience.trim(),
        hadSideEffects: hadSideEffects as boolean,
        sideEffectsText:
          hadSideEffects && sideEffectsText.trim()
            ? sideEffectsText.trim()
            : undefined,
        isPregnantOrBreastfeeding: isPregnantOrBreastfeeding as boolean,
        hasNewConditions: hasNewConditions as boolean,
        newConditionsText:
          hasNewConditions && newConditionsText.trim()
            ? newConditionsText.trim()
            : undefined,
        hasNewMedications: hasNewMedications as boolean,
        newMedicationsText:
          hasNewMedications && newMedicationsText.trim()
            ? newMedicationsText.trim()
            : undefined,
        hadPancreatitisEpisode: hadPancreatitisEpisode as boolean,
        hadMentalHealthConcerns: hadMentalHealthConcerns as boolean,
        mentalHealthDetails:
          hadMentalHealthConcerns && mentalHealthDetails.trim()
            ? mentalHealthDetails.trim()
            : undefined,
        dosePreference: dosePreference as DosePreference,
        consentConfirmed: true,
      });

      if (!result.success || !result.consultationId) {
        setError(result.error ?? "Could not submit. Please try again.");
        return;
      }

      router.push(
        `/consultations/mounjaro/select-dose?consultation=${result.consultationId}`,
      );
    });
  }

  const bmiPreview =
    weightValid && priorHeightCm
      ? (weightNumber / Math.pow(priorHeightCm / 100, 2)).toFixed(1)
      : null;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Section 1 — How it's going */}
      <FormCard>
        <h2 className="font-serif-display mb-2 text-roots-green text-3xl">
          How has your supply been going?
        </h2>
        <p className="mb-8 text-sm text-roots-navy/70">
          A quick check-in so your prescriber knows how you have responded
          to your current dose.
        </p>

        <div className="space-y-8">
          <QuestionBlock question="Your current weight (kg)">
            <div className="flex items-center gap-3">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min={30}
                max={300}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-32 rounded-[var(--radius-input)] border border-roots-green/20 bg-roots-cream px-4 py-3 text-base text-roots-navy outline-none transition-all duration-200 focus:border-roots-green focus:ring-2 focus:ring-roots-green/20"
              />
              <span className="text-sm text-roots-navy/60">kg</span>
              {bmiPreview && (
                <span className="ml-2 text-xs text-roots-navy/60">
                  BMI {bmiPreview}
                </span>
              )}
            </div>
          </QuestionBlock>

          <QuestionBlock question="How has Mounjaro been working for you so far?">
            <Textarea
              value={supplyExperience}
              onChange={setSupplyExperience}
              placeholder="Briefly describe your weight change, appetite, how you tolerated the dose, anything you'd like the prescriber to know."
              rows={5}
            />
            <p className="mt-2 text-xs text-roots-navy/50">
              {supplyExperience.length}/2000 — minimum 10 characters
            </p>
          </QuestionBlock>

          <QuestionBlock question="Have you experienced any side effects?">
            <YesNoRadio
              name="hadSideEffects"
              value={hadSideEffects}
              onChange={setHadSideEffects}
            />
            {hadSideEffects && (
              <Textarea
                value={sideEffectsText}
                onChange={setSideEffectsText}
                placeholder="Tell us what you experienced, how severe and whether it has resolved."
                rows={4}
              />
            )}
          </QuestionBlock>
        </div>
      </FormCard>

      {/* Section 2 — Anything changed */}
      <FormCard>
        <h2 className="font-serif-display mb-2 text-roots-green text-3xl">
          Anything changed since last time?
        </h2>
        <p className="mb-8 text-sm text-roots-navy/70">
          Your medical history is on file from your last consultation. Please
          tell us about anything new.
        </p>

        <div className="space-y-8">
          <QuestionBlock question="Are you currently pregnant, planning a pregnancy or breastfeeding?">
            <YesNoRadio
              name="isPregnantOrBreastfeeding"
              value={isPregnantOrBreastfeeding}
              onChange={setIsPregnantOrBreastfeeding}
            />
          </QuestionBlock>

          <QuestionBlock question="Have you been diagnosed with any new medical conditions?">
            <YesNoRadio
              name="hasNewConditions"
              value={hasNewConditions}
              onChange={setHasNewConditions}
            />
            {hasNewConditions && (
              <Textarea
                value={newConditionsText}
                onChange={setNewConditionsText}
                placeholder="What was diagnosed, when, and how is it being managed?"
                rows={4}
              />
            )}
          </QuestionBlock>

          <QuestionBlock question="Are you taking any new medications, supplements or recreational drugs?">
            <YesNoRadio
              name="hasNewMedications"
              value={hasNewMedications}
              onChange={setHasNewMedications}
            />
            {hasNewMedications && (
              <Textarea
                value={newMedicationsText}
                onChange={setNewMedicationsText}
                placeholder="Name, dose and how often you take it."
                rows={4}
              />
            )}
          </QuestionBlock>

          <QuestionBlock question="Have you had any episode that could be pancreatitis (severe upper abdominal pain, often with nausea)?">
            <YesNoRadio
              name="hadPancreatitisEpisode"
              value={hadPancreatitisEpisode}
              onChange={setHadPancreatitisEpisode}
            />
          </QuestionBlock>

          <QuestionBlock question="Have you had any new mental health concerns — low mood, depression or thoughts of self-harm?">
            <YesNoRadio
              name="hadMentalHealthConcerns"
              value={hadMentalHealthConcerns}
              onChange={setHadMentalHealthConcerns}
            />
            {hadMentalHealthConcerns && (
              <Textarea
                value={mentalHealthDetails}
                onChange={setMentalHealthDetails}
                placeholder="Tell us what you have been experiencing and whether you have spoken to your GP."
                rows={4}
              />
            )}
          </QuestionBlock>
        </div>
      </FormCard>

      {/* Section 3 — Next supply */}
      <FormCard>
        <h2 className="font-serif-display mb-2 text-roots-green text-3xl">
          Your next supply
        </h2>
        <p className="mb-8 text-sm text-roots-navy/70">
          Your prescriber has the final say on dose. Let them know what you
          would like to do next.
        </p>

        <div className="space-y-8">
          <QuestionBlock question="What would you like to do with your dose?">
            <div className="space-y-3">
              <RadioCard
                name="dosePreference"
                label="Stay on the same dose"
                checked={dosePreference === "same"}
                onChange={() => setDosePreference("same")}
              />
              <RadioCard
                name="dosePreference"
                label="Step up to the next dose"
                checked={dosePreference === "escalate"}
                onChange={() => setDosePreference("escalate")}
              />
              <RadioCard
                name="dosePreference"
                label="I'd like to discuss this with the prescriber"
                checked={dosePreference === "discuss"}
                onChange={() => setDosePreference("discuss")}
              />
            </div>
          </QuestionBlock>

          <div className="rounded-[var(--radius-input)] border border-roots-green/15 bg-roots-cream/40 p-5">
            <Checkbox
              id="consentConfirmed"
              checked={consentConfirmed}
              onChange={setConsentConfirmed}
              label={
                <span>
                  I confirm that the information above is accurate and complete
                  to the best of my knowledge. I understand my prescriber will
                  review this update and may contact me before issuing the next
                  supply.
                </span>
              }
            />
          </div>
        </div>
      </FormCard>

      {error && (
        <div className="glass-warning rounded-[var(--radius-card)] p-4 text-sm text-roots-navy">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <Button type="submit" disabled={submitting || !allAnswered} size="lg">
          {submitting ? "Submitting…" : "Submit refill consultation"}
        </Button>
        <p className="text-xs text-roots-navy/50">
          You will choose your dose on the next step.
        </p>
      </div>
    </form>
  );
}
