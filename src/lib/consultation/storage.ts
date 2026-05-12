const STORAGE_KEY = "roots_consultation_draft";

// Discard saved drafts after 72 hours. Consultation answers are special-
// category medical data — if someone returned to a shared computer a week
// later we don't want to repopulate a stranger's pregnancy/medication state.
// 72h is generous enough to cover "I'll come back after work / over the
// weekend" without holding sensitive data indefinitely.
const DRAFT_MAX_AGE_MS = 72 * 60 * 60 * 1000;

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
    // Age check — drop and clear stale drafts so the customer starts fresh.
    if (
      typeof parsed.savedAt !== "number" ||
      Date.now() - parsed.savedAt > DRAFT_MAX_AGE_MS
    ) {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
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
