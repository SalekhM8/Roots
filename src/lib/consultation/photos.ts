/**
 * Shared helpers for the post-payment photo step.
 *
 * Mounjaro moved its photo upload from pre-payment to post-payment (Juniper-
 * style: pay first, then upload; a prescriber only reviews once photos are in).
 * These pure helpers are the single source of truth for "does this consultation
 * still need photos?" so the rule stays identical across the upload page guard,
 * the presign service, the account CTAs, the admin queue badge, and the nudge
 * workflow.
 *
 * Deliberately string-typed (not coupled to Prisma enums) so any caller can pass
 * a lightly-selected row without importing generated types.
 */

/** The three photo slots the customer is asked to upload, in display order. */
export const REQUIRED_PHOTO_TYPES = [
  "body_photo_front",
  "body_photo_side",
  "photo_id",
] as const;

/** Upload row shape needed to judge completeness. */
export interface UploadLike {
  uploadType: string;
  status: string;
}

/** Order row shape needed to judge "paid". */
export interface OrderPaymentLike {
  paymentStatus: string;
}

/**
 * An upload counts toward completeness once it has actually landed in S3
 * (`uploaded`) or been positively reviewed (`accepted`). `requested` (presigned
 * but never PUT) and `rejected` do not count.
 */
function isUsablePhoto(u: UploadLike): boolean {
  return u.status === "uploaded" || u.status === "accepted";
}

/**
 * True once all three required photo types are present as usable uploads.
 * This is the gate the customer must satisfy and the signal that clears the
 * "Awaiting photos" badge / nudges.
 */
export function photosComplete(uploads: UploadLike[]): boolean {
  return REQUIRED_PHOTO_TYPES.every((type) =>
    uploads.some((u) => u.uploadType === type && isUsablePhoto(u)),
  );
}

/**
 * Detect a refill consultation from its `answersJson`. `submitRefillConsultation`
 * tags the blob with `refill.isRefill = true`; first-time consultations store a
 * flat answers object with no `refill` key. Refills inherit a prior approved
 * consultation and intentionally skip the photo step entirely — so they must be
 * excluded from every photo gate/badge/nudge.
 */
export function isRefillAnswers(answersJson: unknown): boolean {
  if (!answersJson || typeof answersJson !== "object") return false;
  const refill = (answersJson as { refill?: { isRefill?: boolean } }).refill;
  return refill?.isRefill === true;
}

/**
 * A consultation needs the post-payment photo step when it is a first-time
 * (non-refill) prescription consultation. Every `Consultation` row is for a POM
 * product, so the only discriminator at the consultation level is refill status.
 */
export function consultationNeedsPhotos(answersJson: unknown): boolean {
  return !isRefillAnswers(answersJson);
}

/**
 * "Paid" for the purpose of unlocking the upload step: the customer has either
 * an authorized preauth (POM) or a captured charge. `pending`/`failed`/`expired`
 * do not unlock uploads. Returns the matching order (newest-relevant) or null.
 */
export function findPaidOrder<T extends OrderPaymentLike>(
  orders: T[],
): T | null {
  return (
    orders.find(
      (o) =>
        o.paymentStatus === "authorized" || o.paymentStatus === "captured",
    ) ?? null
  );
}
