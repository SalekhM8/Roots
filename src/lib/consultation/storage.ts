const STORAGE_KEY = "roots_consultation_draft";

export interface ConsultationDraft {
  step: number;
  formState: Record<string, string | number | boolean | null>;
  savedAt: number;
}

export function saveConsultationState(state: ConsultationDraft): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage may be unavailable (private browsing, quota exceeded)
  }
}

export function loadConsultationState(): ConsultationDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsultationDraft;
    // Basic shape validation
    if (
      typeof parsed.step !== "number" ||
      typeof parsed.formState !== "object" ||
      parsed.formState === null
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearConsultationState(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
