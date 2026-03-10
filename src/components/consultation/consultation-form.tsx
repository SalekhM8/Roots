"use client";

import { useReducer, useCallback, useMemo, useState, useTransition, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProgressIndicator from "@/components/consultation/progress-indicator";
import { Checkbox, Textarea, FormCard, QuestionBlock, UnitToggle, YesNoRadio } from "@/components/consultation/form-primitives";
import { submitConsultationAction } from "@/app/consultations/mounjaro/actions";
import {
  saveConsultationState,
  loadConsultationState,
  clearConsultationState,
} from "@/lib/consultation/storage";
import type { ConsultationAnswersInput } from "@/lib/validation/schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HeightUnit = "cm" | "ftin";
type WeightUnit = "kg" | "stlbs";

interface FormState {
  step: number; // 0 = pre-start, 1-4 = form steps

  // Step 0
  readyConfirmed: boolean;

  // Step 1
  processConfirmed: boolean;

  // Step 2
  hasMedicalConditions: boolean | null;
  medicalConditionsText: string;
  hasPriorGlp1Use: boolean | null;
  priorGlp1Details: string;

  // Step 3
  heightUnit: HeightUnit;
  heightCm: string;
  heightFeet: string;
  heightInches: string;
  weightUnit: WeightUnit;
  weightKg: string;
  weightStone: string;
  weightLbs: string;
  isPregnantOrBreastfeeding: boolean | null;
  hasMedicalConditionsList: boolean | null;
  medicalConditionsListText: string;
  hasEpilepsy: boolean;
  hasHighCholesterol: boolean;
  hasDiabetes: boolean;
  hasGalactoseIntolerance: boolean;
  hasLappLactaseDeficiency: boolean;
  hasGlucoseGalactoseMalabsorption: boolean;
  hasLiverKidneyProblems: boolean;
  hasIbd: boolean;
  hasThyroidProblems: boolean;
  hasDepression: boolean;
  hasPancreatitisHistory: boolean | null;
  pancreatitisDetails: string;
  hasEatingDisorderHistory: boolean | null;
  eatingDisorderDetails: string;
  hasAllergies: boolean | null;
  allergiesText: string;
  drinksAlcohol: boolean | null;
  alcoholDetails: string;
  hasDisabilities: boolean | null;
  disabilitiesDetails: string;
  gpDetails: string;

  // Step 4
  readPatientLeaflet: boolean;
  useAsPrescribed: boolean;
  informSurgeon: boolean;
  noReturns: boolean;
  consentConfirmed: boolean;
}

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: FormState[keyof FormState] }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "GO_TO_STEP"; step: number }
  | { type: "RESTORE"; state: Partial<FormState> };

// ---------------------------------------------------------------------------
// Initial state & reducer
// ---------------------------------------------------------------------------

const initialState: FormState = {
  step: 0,
  readyConfirmed: false,
  processConfirmed: false,
  hasMedicalConditions: null,
  medicalConditionsText: "",
  hasPriorGlp1Use: null,
  priorGlp1Details: "",
  heightUnit: "cm",
  heightCm: "",
  heightFeet: "",
  heightInches: "",
  weightUnit: "kg",
  weightKg: "",
  weightStone: "",
  weightLbs: "",
  isPregnantOrBreastfeeding: null,
  hasMedicalConditionsList: null,
  medicalConditionsListText: "",
  hasEpilepsy: false,
  hasHighCholesterol: false,
  hasDiabetes: false,
  hasGalactoseIntolerance: false,
  hasLappLactaseDeficiency: false,
  hasGlucoseGalactoseMalabsorption: false,
  hasLiverKidneyProblems: false,
  hasIbd: false,
  hasThyroidProblems: false,
  hasDepression: false,
  hasPancreatitisHistory: null,
  pancreatitisDetails: "",
  hasEatingDisorderHistory: null,
  eatingDisorderDetails: "",
  hasAllergies: null,
  allergiesText: "",
  drinksAlcohol: null,
  alcoholDetails: "",
  hasDisabilities: null,
  disabilitiesDetails: "",
  gpDetails: "",
  readPatientLeaflet: false,
  useAsPrescribed: false,
  informSurgeon: false,
  noReturns: false,
  consentConfirmed: false,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "NEXT_STEP":
      return { ...state, step: Math.min(state.step + 1, 4) };
    case "PREV_STEP":
      return { ...state, step: Math.max(state.step - 1, 0) };
    case "GO_TO_STEP":
      return { ...state, step: action.step };
    case "RESTORE":
      return { ...state, ...action.state };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Unit conversion helpers
// ---------------------------------------------------------------------------

function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

function stoneLbsToKg(stone: number, lbs: number): number {
  return (stone * 14 + lbs) * 0.453592;
}

// ---------------------------------------------------------------------------
// Conditions list (Step 3)
// ---------------------------------------------------------------------------

const MEDICAL_CONDITIONS_LIST = [
  "Epilepsy",
  "High cholesterol",
  "Diabetes",
  "Galactose intolerance",
  "Lapp lactase deficiency",
  "Glucose-galactose malabsorption",
  "Liver or kidney problems",
  "IBD/colitis/Crohn's",
  "Thyroid problems",
  "Depression or mood disorder",
] as const;

const MEDICAL_CONDITIONS_CHECKBOXES: { field: keyof FormState; label: string }[] = [
  { field: "hasEpilepsy", label: "Epilepsy" },
  { field: "hasHighCholesterol", label: "High cholesterol" },
  { field: "hasDiabetes", label: "Diabetes" },
  { field: "hasGalactoseIntolerance", label: "Galactose intolerance" },
  { field: "hasLappLactaseDeficiency", label: "Lapp lactase deficiency" },
  { field: "hasGlucoseGalactoseMalabsorption", label: "Glucose-galactose malabsorption" },
  { field: "hasLiverKidneyProblems", label: "Liver or kidney problems" },
  { field: "hasIbd", label: "IBD/colitis/Crohn's" },
  { field: "hasThyroidProblems", label: "Thyroid problems" },
  { field: "hasDepression", label: "Depression or mood disorder" },
];

// ---------------------------------------------------------------------------
// Process steps (Step 1)
// ---------------------------------------------------------------------------

const PROCESS_STEPS = [
  "Complete this online medical consultation form.",
  "A qualified prescriber will review your answers within 24 hours.",
  "If approved, your medication will be dispensed from our UK pharmacy.",
  "Your order will be dispatched via tracked delivery.",
  "Ongoing support is available from our clinical team throughout your treatment.",
] as const;

// ---------------------------------------------------------------------------
// Main Form Component
// ---------------------------------------------------------------------------

export default function ConsultationForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Restore saved state on mount
  useEffect(() => {
    const saved = loadConsultationState();
    if (saved) {
      dispatch({ type: "RESTORE", state: { ...saved.formState, step: saved.step } as Partial<FormState> });
    }
  }, []);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.step]);

  // Debounce sessionStorage writes to avoid blocking main thread on every keystroke
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (state.step > 0) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const { step, ...formState } = state;
        saveConsultationState({ step, formState, savedAt: Date.now() });
      }, 800);
    }
    return () => clearTimeout(saveTimerRef.current);
  }, [state]);

  const setField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      dispatch({ type: "SET_FIELD", field, value });
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Computed values
  // ---------------------------------------------------------------------------

  const heightInCm = useMemo((): number => {
    if (state.heightUnit === "cm") {
      return parseFloat(state.heightCm) || 0;
    }
    return feetInchesToCm(
      parseFloat(state.heightFeet) || 0,
      parseFloat(state.heightInches) || 0
    );
  }, [state.heightUnit, state.heightCm, state.heightFeet, state.heightInches]);

  const weightInKg = useMemo((): number => {
    if (state.weightUnit === "kg") {
      return parseFloat(state.weightKg) || 0;
    }
    return stoneLbsToKg(
      parseFloat(state.weightStone) || 0,
      parseFloat(state.weightLbs) || 0
    );
  }, [state.weightUnit, state.weightKg, state.weightStone, state.weightLbs]);

  const bmi = useMemo((): number | null => {
    if (heightInCm < 100 || weightInKg < 30) return null;
    const heightM = heightInCm / 100;
    return weightInKg / (heightM * heightM);
  }, [heightInCm, weightInKg]);

  const bmiLabel = useMemo((): string => {
    if (bmi === null) return "";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Healthy";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }, [bmi]);

  const bmiColor = useMemo((): string => {
    if (bmi === null) return "";
    if (bmi < 18.5) return "bg-amber-100 text-amber-800";
    if (bmi < 25) return "bg-green-100 text-green-800";
    if (bmi < 30) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  }, [bmi]);

  const hasAnyConditionChecked = useMemo((): boolean => {
    return (
      state.hasEpilepsy ||
      state.hasHighCholesterol ||
      state.hasDiabetes ||
      state.hasGalactoseIntolerance ||
      state.hasLappLactaseDeficiency ||
      state.hasGlucoseGalactoseMalabsorption ||
      state.hasLiverKidneyProblems ||
      state.hasIbd ||
      state.hasThyroidProblems ||
      state.hasDepression
    );
  }, [
    state.hasEpilepsy,
    state.hasHighCholesterol,
    state.hasDiabetes,
    state.hasGalactoseIntolerance,
    state.hasLappLactaseDeficiency,
    state.hasGlucoseGalactoseMalabsorption,
    state.hasLiverKidneyProblems,
    state.hasIbd,
    state.hasThyroidProblems,
    state.hasDepression,
  ]);

  // ---------------------------------------------------------------------------
  // Step validation
  // ---------------------------------------------------------------------------

  const canContinueStep1 = state.processConfirmed;

  const canContinueStep2 =
    state.hasMedicalConditions !== null &&
    state.hasPriorGlp1Use !== null &&
    (state.hasMedicalConditions === false || state.medicalConditionsText.trim().length > 0) &&
    (state.hasPriorGlp1Use === false || state.priorGlp1Details.trim().length > 0);

  const canContinueStep3 = useMemo(() => {
    if (heightInCm < 100 || heightInCm > 250) return false;
    if (weightInKg < 30 || weightInKg > 300) return false;
    if (state.isPregnantOrBreastfeeding === null) return false;
    if (hasAnyConditionChecked && !state.medicalConditionsListText.trim()) return false;
    if (state.hasPancreatitisHistory === null) return false;
    if (state.hasPancreatitisHistory && !state.pancreatitisDetails.trim()) return false;
    if (state.hasEatingDisorderHistory === null) return false;
    if (state.hasEatingDisorderHistory && !state.eatingDisorderDetails.trim()) return false;
    if (state.hasAllergies === null) return false;
    if (state.hasAllergies && !state.allergiesText.trim()) return false;
    if (state.drinksAlcohol === null) return false;
    if (state.drinksAlcohol && !state.alcoholDetails.trim()) return false;
    if (state.hasDisabilities === null) return false;
    if (state.hasDisabilities && !state.disabilitiesDetails.trim()) return false;
    if (!state.gpDetails.trim()) return false;
    return true;
  }, [
    heightInCm,
    weightInKg,
    state.isPregnantOrBreastfeeding,
    hasAnyConditionChecked,
    state.medicalConditionsListText,
    state.hasPancreatitisHistory,
    state.pancreatitisDetails,
    state.hasEatingDisorderHistory,
    state.eatingDisorderDetails,
    state.hasAllergies,
    state.allergiesText,
    state.drinksAlcohol,
    state.alcoholDetails,
    state.hasDisabilities,
    state.disabilitiesDetails,
    state.gpDetails,
  ]);

  const canSubmit =
    state.readPatientLeaflet &&
    state.useAsPrescribed &&
    state.informSurgeon &&
    state.noReturns &&
    state.consentConfirmed;

  // ---------------------------------------------------------------------------
  // Submit handler
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    setSubmitError(null);

    // If not authenticated, save state and redirect to sign-in
    if (!isSignedIn) {
      const { step, ...formState } = state;
      saveConsultationState({ step, formState, savedAt: Date.now() });
      router.push("/sign-in?redirect_url=/consultations/mounjaro");
      return;
    }

    startTransition(async () => {
      const payload: ConsultationAnswersInput = {
        hasMedicalConditions: state.hasMedicalConditions === true,
        medicalConditionsText: state.hasMedicalConditions ? state.medicalConditionsText : undefined,
        currentMedicationsText: state.hasMedicalConditions ? state.medicalConditionsText : undefined,
        hasPriorGlp1Use: state.hasPriorGlp1Use === true,
        priorGlp1Details: state.hasPriorGlp1Use ? state.priorGlp1Details : undefined,
        heightCm: Math.round(heightInCm * 10) / 10,
        weightKg: Math.round(weightInKg * 10) / 10,
        isPregnantOrBreastfeeding: state.isPregnantOrBreastfeeding === true,
        hasEpilepsy: state.hasEpilepsy,
        hasHighCholesterol: state.hasHighCholesterol,
        hasDiabetes: state.hasDiabetes,
        hasGalactoseIntolerance: state.hasGalactoseIntolerance,
        hasLappLactaseDeficiency: state.hasLappLactaseDeficiency,
        hasGlucoseGalactoseMalabsorption: state.hasGlucoseGalactoseMalabsorption,
        hasLiverKidneyProblems: state.hasLiverKidneyProblems,
        hasIbd: state.hasIbd,
        hasThyroidProblems: state.hasThyroidProblems,
        hasDepression: state.hasDepression,
        hasMedicalConditionsList: hasAnyConditionChecked,
        medicalConditionsListText: hasAnyConditionChecked
          ? state.medicalConditionsListText
          : undefined,
        hasPancreatitisHistory: state.hasPancreatitisHistory === true,
        pancreatitisDetails: state.hasPancreatitisHistory ? state.pancreatitisDetails : undefined,
        hasEatingDisorderHistory: state.hasEatingDisorderHistory === true,
        eatingDisorderDetails: state.hasEatingDisorderHistory
          ? state.eatingDisorderDetails
          : undefined,
        hasAllergies: state.hasAllergies === true,
        allergiesText: state.hasAllergies ? state.allergiesText : undefined,
        drinksAlcohol: state.drinksAlcohol === true,
        alcoholDetails: state.drinksAlcohol ? state.alcoholDetails : undefined,
        hasDisabilities: state.hasDisabilities === true,
        disabilitiesDetails: state.hasDisabilities ? state.disabilitiesDetails : undefined,
        gpDetails: state.gpDetails.trim(),
        safetyConfirmations: {
          readPatientLeaflet: true as const,
          useAsPrescribed: true as const,
          informSurgeon: true as const,
          noReturns: true as const,
        },
        consentConfirmed: true as const,
      };

      const result = await submitConsultationAction(payload);

      if (result.success) {
        clearConsultationState();
        router.push(`/consultations/mounjaro/upload-photos?consultation=${result.consultationId}`);
      } else {
        setSubmitError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }, [canSubmit, isSignedIn, state, heightInCm, weightInKg, hasAnyConditionChecked, router]);

  // ---------------------------------------------------------------------------
  // Step 0 — Pre-Start Requirements
  // ---------------------------------------------------------------------------

  if (state.step === 0) {
    return (
      <div>
        <h1 className="mb-6 text-center text-[32px] font-medium text-roots-green md:text-[42px]">
          Mounjaro Consultation
        </h1>
        <p className="mb-8 text-center text-lg text-roots-navy/70">
          Complete our online consultation to determine if Mounjaro is right for you. A
          qualified prescriber will review your answers.
        </p>

        <FormCard>
          <h2 className="mb-6 text-xl font-medium text-roots-green">
            Before you begin, please have the following ready:
          </h2>
          <ul className="space-y-4 text-base text-roots-navy/80">
            {[
              "Your current weight and height",
              "A list of current medications and their strengths",
              "Your GP details (name and practice)",
              "Front and side-facing body photos",
              "Photographic ID",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-roots-green text-xs text-roots-cream">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm text-roots-navy/60">
            The consultation takes approximately 5 minutes. Your answers are confidential
            and reviewed only by our clinical team.
          </p>

          <div className="mt-8 space-y-5">
            <Checkbox
              id="ready-confirmed"
              checked={state.readyConfirmed}
              onChange={(v) => setField("readyConfirmed", v)}
              label="I have this information ready"
            />
            <Button
              variant="secondary"
              disabled={!state.readyConfirmed}
              onClick={() => dispatch({ type: "NEXT_STEP" })}
              className="w-full"
            >
              Begin Consultation
            </Button>
          </div>
        </FormCard>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Steps 1-4
  // ---------------------------------------------------------------------------

  return (
    <div>
      <h1 className="mb-2 text-center text-[32px] font-medium text-roots-green md:text-[42px]">
        Mounjaro Consultation
      </h1>
      <p className="mb-8 text-center text-base text-roots-navy/60">
        Step {state.step} of 4
      </p>

      <ProgressIndicator currentStep={state.step} />

      {/* Step 1 — Process Confirmation */}
      {state.step === 1 && (
        <FormCard>
          <h2 className="mb-6 text-xl font-medium text-roots-green">
            How the Process Works
          </h2>
          <ol className="space-y-4 text-base text-roots-navy/80">
            {PROCESS_STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-roots-green/10 text-sm font-medium text-roots-green">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <div className="mt-8 space-y-5">
            <Checkbox
              id="process-confirmed"
              checked={state.processConfirmed}
              onChange={(v) => setField("processConfirmed", v)}
              label="Yes, I confirm I understand the process"
            />
            <Button
              variant="secondary"
              disabled={!canContinueStep1}
              onClick={() => dispatch({ type: "NEXT_STEP" })}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        </FormCard>
      )}

      {/* Step 2 — Medication History */}
      {state.step === 2 && (
        <FormCard>
          <h2 className="mb-8 text-xl font-medium text-roots-green">
            Medication History
          </h2>

          <div className="space-y-8">
            <QuestionBlock question="Do you take any medication, or have any medical conditions?">
              <YesNoRadio name="hasMedicalConditions" value={state.hasMedicalConditions} onChange={(v) => setField("hasMedicalConditions", v)} />
              {state.hasMedicalConditions && (
                <Textarea
                  value={state.medicalConditionsText}
                  onChange={(v) => setField("medicalConditionsText", v)}
                  placeholder="Please list your medications and/or medical conditions..."
                />
              )}
            </QuestionBlock>

            <QuestionBlock question="Have you ever used Wegovy or Mounjaro before?">
              <YesNoRadio name="hasPriorGlp1Use" value={state.hasPriorGlp1Use} onChange={(v) => setField("hasPriorGlp1Use", v)} />
              {state.hasPriorGlp1Use && (
                <Textarea
                  value={state.priorGlp1Details}
                  onChange={(v) => setField("priorGlp1Details", v)}
                  placeholder="Which medication, what dose, how long did you use it, and when did you stop?"
                />
              )}
            </QuestionBlock>
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              variant="ghost"
              onClick={() => dispatch({ type: "PREV_STEP" })}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              variant="secondary"
              disabled={!canContinueStep2}
              onClick={() => dispatch({ type: "NEXT_STEP" })}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </FormCard>
      )}

      {/* Step 3 — Lifestyle & Medical History */}
      {state.step === 3 && (
        <FormCard>
          <h2 className="mb-8 text-xl font-medium text-roots-green">
            Lifestyle &amp; Medical History
          </h2>

          <div className="space-y-8">
            {/* Height */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-roots-navy">Height</p>
                <UnitToggle
                  options={[
                    { value: "cm", label: "cm" },
                    { value: "ftin", label: "ft & in" },
                  ]}
                  value={state.heightUnit}
                  onChange={(v) => setField("heightUnit", v as HeightUnit)}
                />
              </div>
              {state.heightUnit === "cm" ? (
                <Input
                  type="number"
                  placeholder="e.g. 170"
                  value={state.heightCm}
                  onChange={(e) => setField("heightCm", e.target.value)}
                  min={100}
                  max={250}
                />
              ) : (
                <div className="flex gap-3">
                  <Input
                    type="number"
                    placeholder="Feet"
                    value={state.heightFeet}
                    onChange={(e) => setField("heightFeet", e.target.value)}
                    min={3}
                    max={8}
                  />
                  <Input
                    type="number"
                    placeholder="Inches"
                    value={state.heightInches}
                    onChange={(e) => setField("heightInches", e.target.value)}
                    min={0}
                    max={11}
                  />
                </div>
              )}
            </div>

            {/* Weight */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-roots-navy">Weight</p>
                <UnitToggle
                  options={[
                    { value: "kg", label: "kg" },
                    { value: "stlbs", label: "st & lbs" },
                  ]}
                  value={state.weightUnit}
                  onChange={(v) => setField("weightUnit", v as WeightUnit)}
                />
              </div>
              {state.weightUnit === "kg" ? (
                <Input
                  type="number"
                  placeholder="e.g. 85"
                  value={state.weightKg}
                  onChange={(e) => setField("weightKg", e.target.value)}
                  min={30}
                  max={300}
                />
              ) : (
                <div className="flex gap-3">
                  <Input
                    type="number"
                    placeholder="Stone"
                    value={state.weightStone}
                    onChange={(e) => setField("weightStone", e.target.value)}
                    min={4}
                    max={47}
                  />
                  <Input
                    type="number"
                    placeholder="Pounds"
                    value={state.weightLbs}
                    onChange={(e) => setField("weightLbs", e.target.value)}
                    min={0}
                    max={13}
                  />
                </div>
              )}
            </div>

            {/* BMI badge */}
            {bmi !== null && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-roots-navy/60">Your BMI:</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${bmiColor}`}
                >
                  {bmi.toFixed(1)} — {bmiLabel}
                </span>
              </div>
            )}

            {/* Pregnancy / breastfeeding */}
            <QuestionBlock question="Are you currently breastfeeding, pregnant or planning to be pregnant?">
              <YesNoRadio name="isPregnantOrBreastfeeding" value={state.isPregnantOrBreastfeeding} onChange={(v) => setField("isPregnantOrBreastfeeding", v)} />
            </QuestionBlock>

            {/* Medical conditions list — individual checkboxes */}
            <QuestionBlock question="Do you have, or have you ever had, any of the following conditions?">
              <div className="space-y-3">
                {MEDICAL_CONDITIONS_CHECKBOXES.map(({ field, label }) => (
                  <Checkbox
                    key={field}
                    id={`condition-${field}`}
                    checked={state[field] as boolean}
                    onChange={(v) => setField(field, v)}
                    label={label}
                  />
                ))}
              </div>
              {hasAnyConditionChecked && (
                <Textarea
                  value={state.medicalConditionsListText}
                  onChange={(v) => setField("medicalConditionsListText", v)}
                  placeholder="Please provide details about your condition(s)..."
                />
              )}
            </QuestionBlock>

            {/* Pancreatitis */}
            <QuestionBlock question="Have you ever had pancreatitis, gall stones, reduced bile flow or had your gall bladder removed?">
              <YesNoRadio name="hasPancreatitisHistory" value={state.hasPancreatitisHistory} onChange={(v) => setField("hasPancreatitisHistory", v)} />
              {state.hasPancreatitisHistory && (
                <Textarea
                  value={state.pancreatitisDetails}
                  onChange={(v) => setField("pancreatitisDetails", v)}
                  placeholder="Please provide details..."
                />
              )}
            </QuestionBlock>

            {/* Eating disorders */}
            <QuestionBlock question="Have you ever suffered from anorexia, bulimia, body dysmorphia or any other diagnosed eating disorder?">
              <YesNoRadio name="hasEatingDisorderHistory" value={state.hasEatingDisorderHistory} onChange={(v) => setField("hasEatingDisorderHistory", v)} />
              {state.hasEatingDisorderHistory && (
                <Textarea
                  value={state.eatingDisorderDetails}
                  onChange={(v) => setField("eatingDisorderDetails", v)}
                  placeholder="Please provide details..."
                />
              )}
            </QuestionBlock>

            {/* Allergies */}
            <QuestionBlock question="Do you have any confirmed allergies to food, medicines or chemicals?">
              <YesNoRadio name="hasAllergies" value={state.hasAllergies} onChange={(v) => setField("hasAllergies", v)} />
              {state.hasAllergies && (
                <Textarea
                  value={state.allergiesText}
                  onChange={(v) => setField("allergiesText", v)}
                  placeholder="Please list your allergies..."
                />
              )}
            </QuestionBlock>

            {/* Alcohol */}
            <QuestionBlock question="Do you drink alcohol?">
              <YesNoRadio name="drinksAlcohol" value={state.drinksAlcohol} onChange={(v) => setField("drinksAlcohol", v)} />
              {state.drinksAlcohol && (
                <Textarea
                  value={state.alcoholDetails}
                  onChange={(v) => setField("alcoholDetails", v)}
                  placeholder="How often and how much do you typically drink?"
                />
              )}
            </QuestionBlock>

            {/* Disabilities */}
            <QuestionBlock question="Do you have any disabilities or special needs?">
              <YesNoRadio name="hasDisabilities" value={state.hasDisabilities} onChange={(v) => setField("hasDisabilities", v)} />
              {state.hasDisabilities && (
                <Textarea
                  value={state.disabilitiesDetails}
                  onChange={(v) => setField("disabilitiesDetails", v)}
                  placeholder="Please provide details..."
                />
              )}
            </QuestionBlock>

            {/* GP details */}
            <div className="space-y-3">
              <p className="text-base font-medium text-roots-navy">
                GP details <span className="text-red-500">*</span>
              </p>
              <Input
                placeholder="GP name and practice address"
                value={state.gpDetails}
                onChange={(e) => setField("gpDetails", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              variant="ghost"
              onClick={() => dispatch({ type: "PREV_STEP" })}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              variant="secondary"
              disabled={!canContinueStep3}
              onClick={() => dispatch({ type: "NEXT_STEP" })}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </FormCard>
      )}

      {/* Step 4 — Safety Confirmations */}
      {state.step === 4 && (
        <FormCard>
          <h2 className="mb-8 text-xl font-medium text-roots-green">
            Safety &amp; Consent
          </h2>

          <div className="space-y-8">
            {/* Safety information block */}
            <div className="space-y-4 rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 p-6">
              <h3 className="text-base font-medium text-amber-900">
                Important Safety Information
              </h3>
              <div className="space-y-3 text-sm text-amber-800">
                <p>
                  <strong>Pregnancy &amp; breastfeeding:</strong> Mounjaro should not be
                  used during pregnancy or while breastfeeding. If you become pregnant
                  while using this medication, stop treatment immediately and contact your
                  GP.
                </p>
                <p>
                  <strong>Pancreatitis:</strong> In rare cases, GLP-1 receptor agonists
                  have been associated with pancreatitis. Seek immediate medical attention
                  if you experience severe, persistent abdominal pain that may radiate to
                  the back, with or without nausea and vomiting.
                </p>
              </div>
            </div>

            {/* Required checkboxes */}
            <div className="space-y-5">
              <p className="text-base font-medium text-roots-navy">
                Please confirm each of the following:
              </p>

              <Checkbox
                id="read-patient-leaflet"
                checked={state.readPatientLeaflet}
                onChange={(v) => setField("readPatientLeaflet", v)}
                label="I have read, or will read, the patient information leaflet provided with my medication"
              />

              <Checkbox
                id="use-as-prescribed"
                checked={state.useAsPrescribed}
                onChange={(v) => setField("useAsPrescribed", v)}
                label="I will use this medication as prescribed (weekly injection, no breaks unless advised by a clinician)"
              />

              <Checkbox
                id="inform-surgeon"
                checked={state.informSurgeon}
                onChange={(v) => setField("informSurgeon", v)}
                label="If I am due to have surgery, I will inform the surgical team that I am taking a weight loss medication"
              />

              <Checkbox
                id="no-returns"
                checked={state.noReturns}
                onChange={(v) => setField("noReturns", v)}
                label="I understand that once medication has been dispatched, it cannot be returned for a refund"
              />
            </div>

            {/* Final declaration */}
            <div className="space-y-4 rounded-[var(--radius-card)] border border-roots-green/10 bg-roots-cream/30 p-6">
              <h3 className="text-base font-medium text-roots-navy">Declaration</h3>
              <p className="text-sm text-roots-navy/70">
                I confirm that all answers provided in this consultation are truthful and
                accurate to the best of my knowledge. I understand that providing false or
                misleading information could endanger my health. I consent to my answers
                being reviewed by a qualified prescriber for the purposes of clinical
                assessment.
              </p>
              <Checkbox
                id="consent-confirmed"
                checked={state.consentConfirmed}
                onChange={(v) => setField("consentConfirmed", v)}
                label="I agree to the declaration above"
              />
            </div>

            {submitError && (
              <div className="rounded-[var(--radius-input)] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {submitError}
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              variant="ghost"
              onClick={() => dispatch({ type: "PREV_STEP" })}
              className="flex-1"
              disabled={isPending}
            >
              Back
            </Button>
            <Button
              variant="secondary"
              disabled={!canSubmit || isPending}
              loading={isPending}
              onClick={handleSubmit}
              className="flex-1"
            >
              Submit Consultation
            </Button>
          </div>
        </FormCard>
      )}
    </div>
  );
}
