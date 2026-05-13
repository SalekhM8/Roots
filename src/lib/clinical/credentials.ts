/**
 * Single source of truth for clinical credentials displayed across the site.
 *
 * These values feed into:
 *  - The MedicalReviewByline component shown on Mounjaro pages
 *  - JSON-LD schema (MedicalOrganization, MedicalWebPage.reviewedBy, Drug)
 *  - The footer GPhC disclosure
 *
 * NOTE: values prefixed TODO are placeholders. Swap before launch.
 *
 * CAP / ASA / MHRA / GPhC compliance:
 *  - Internet Pharmacy Logo must link to the GPhC register entry once issued
 *  - Superintendent pharmacist name + GPhC number must be visible on every
 *    page that discusses a POM
 *  - "Last reviewed" date should be refreshed at least every 12 months
 */

export const PHARMACY = {
  /** Trading name shown to customers. */
  name: "Roots Pharmacy",
  /** Licensed GPhC-registered partner that dispenses prescriptions. */
  licensedEntity: {
    name: "Lumina Pharma Ltd",
    companyNumber: "16803872",
    /** TODO: replace with real GPhC pharmacy registration number. */
    gphcRegistration: "TODO_GPHC_PHARMACY_NUMBER",
    /** TODO: replace with the URL of the GPhC register entry for the pharmacy. */
    gphcRegisterUrl: "https://www.pharmacyregulation.org/registers/pharmacy",
  },
  /** TODO: replace with real CQC provider ID once issued (England-only). */
  cqc: {
    providerId: "TODO_CQC_ID",
    rating: "TODO" as "Outstanding" | "Good" | "Requires improvement" | "Inadequate" | "TODO",
  },
  /** TODO: replace with registered office address. */
  address: {
    streetAddress: "TODO Street",
    addressLocality: "TODO City",
    postalCode: "TODO POSTCODE",
    addressCountry: "GB",
  },
} as const;

/**
 * Named clinical staff. These appear on every Mounjaro-adjacent page as
 * "Reviewed by" bylines and feed into MedicalWebPage.reviewedBy schema.
 *
 * Add new entries as the team grows. The slug is used for /team/[slug]
 * author hub pages.
 */
export interface Clinician {
  slug: string;
  name: string;
  qualification: string;
  /** "GPhC" for pharmacists, "GMC" for prescribing doctors. */
  registerType: "GPhC" | "GMC";
  registerNumber: string;
  /** Short bio used on author hub pages and schema.org Person.description. */
  bio: string;
  role: "Superintendent Pharmacist" | "Pharmacist" | "Prescriber" | "Medical Director";
}

/** TODO: replace placeholders with real clinical team. */
export const SUPERINTENDENT_PHARMACIST: Clinician = {
  slug: "superintendent-pharmacist",
  name: "TODO Superintendent Pharmacist Name",
  qualification: "MPharm",
  registerType: "GPhC",
  registerNumber: "TODO_GPHC_NUMBER",
  bio: "Superintendent Pharmacist at Roots Pharmacy, responsible for the safe and effective supply of all medicines dispensed to UK patients.",
  role: "Superintendent Pharmacist",
};

/** TODO: replace with the actual reviewing pharmacist (may be the SI or another). */
export const MEDICAL_REVIEWER: Clinician = SUPERINTENDENT_PHARMACIST;

/**
 * Registry of all clinicians the site links to from /team/[slug] hub pages
 * and from MedicalReviewByline links. Keyed by slug.
 *
 * Add new entries here as the team grows. The /team/[slug] route reads
 * directly from this map. Slug paths under /team/[slug] not present here
 * return 404.
 */
export const CLINICIANS: Record<string, Clinician> = {
  [SUPERINTENDENT_PHARMACIST.slug]: SUPERINTENDENT_PHARMACIST,
};

/**
 * ISO date string used in "Reviewed [date]" bylines and MedicalWebPage
 * dateModified schema. Bump on substantive clinical content changes.
 */
export const CLINICAL_CONTENT_LAST_REVIEWED = "2026-05-13";

/**
 * First publication date for the Mounjaro hub + cluster. Used in
 * MedicalWebPage.datePublished. Keep stable — do not bump on content edits.
 */
export const MOUNJARO_HUB_PUBLISHED = "2026-05-13";
