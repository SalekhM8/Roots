import { z } from "zod";

// ---- Address ----
export const addressSchema = z.object({
  label: z.string().max(50).optional(),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  line1: z.string().min(1, "Address line 1 is required").max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  postcode: z
    .string()
    .min(1, "Postcode is required")
    .regex(
      /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
      "Enter a valid UK postcode"
    ),
  countryCode: z.string().default("GB"),
  phone: z.string().max(20).optional(),
  isDefaultShipping: z.boolean().default(false),
  isDefaultBilling: z.boolean().default(false),
});

// ---- Profile ----
export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.string().refine(
    (val) => {
      const date = new Date(val);
      const age = (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return age >= 18;
    },
    { message: "You must be at least 18 years old" }
  ),
});

// ---- Consultation Answers ----
export const consultationAnswersSchema = z.object({
  // Step 2 — Medication History
  hasMedicalConditions: z.boolean(),
  medicalConditionsText: z.string().max(2000).optional(),
  currentMedicationsText: z.string().max(2000).optional(),
  hasPriorGlp1Use: z.boolean(),
  priorGlp1Details: z.string().max(2000).optional(),

  // Individual medical conditions (Step 3)
  hasEpilepsy: z.boolean().default(false),
  hasHighCholesterol: z.boolean().default(false),
  hasDiabetes: z.boolean().default(false),
  hasGalactoseIntolerance: z.boolean().default(false),
  hasLappLactaseDeficiency: z.boolean().default(false),
  hasGlucoseGalactoseMalabsorption: z.boolean().default(false),
  hasLiverKidneyProblems: z.boolean().default(false),
  hasIbd: z.boolean().default(false),
  hasThyroidProblems: z.boolean().default(false),
  hasDepression: z.boolean().default(false),

  // Step 3 — Lifestyle and Medical
  heightCm: z.number().min(100, "Height must be at least 100cm").max(250, "Height cannot exceed 250cm"),
  weightKg: z.number().min(30, "Weight must be at least 30kg").max(300, "Weight cannot exceed 300kg"),
  isPregnantOrBreastfeeding: z.boolean(),
  hasMedicalConditionsList: z.boolean(),
  medicalConditionsListText: z.string().max(2000).optional(),
  hasPancreatitisHistory: z.boolean(),
  pancreatitisDetails: z.string().max(2000).optional(),
  hasEatingDisorderHistory: z.boolean(),
  eatingDisorderDetails: z.string().max(2000).optional(),
  hasAllergies: z.boolean(),
  allergiesText: z.string().max(2000).optional(),
  drinksAlcohol: z.boolean(),
  alcoholDetails: z.string().max(2000).optional(),
  hasDisabilities: z.boolean(),
  disabilitiesDetails: z.string().max(2000).optional(),
  gpDetails: z.string().min(1, "GP details are required").max(500),

  // Step 4 — Safety Confirmations
  safetyConfirmations: z.object({
    readPatientLeaflet: z.literal(true, { message: "Required" }),
    useAsPrescribed: z.literal(true, { message: "Required" }),
    informSurgeon: z.literal(true, { message: "Required" }),
    noReturns: z.literal(true, { message: "Required" }),
  }),
  consentConfirmed: z.literal(true, {
    message: "You must confirm the declaration",
  }),
});

// ---- Order Number ----
export function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `ROOTS-${date}-${seq}`;
}

// ---- Cart ----
export const addToCartSchema = z.object({
  variantId: z.string().uuid("Invalid variant"),
  quantity: z.number().int().min(1).max(10),
});

export const updateCartItemSchema = z.object({
  itemId: z.string().uuid("Invalid item"),
  quantity: z.number().int().min(0).max(10),
});

// ---- Checkout ----
export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  useSameForBilling: z.boolean().default(true),
});

// ---- Guest Checkout ----
export const guestCartItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
});

export const guestCheckoutSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  phone: z.string().max(20).optional(),
  shippingAddress: addressSchema,
  useSameForBilling: z.boolean().default(true),
  items: z.array(guestCartItemSchema).min(1, "Cart cannot be empty"),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ConsultationAnswersInput = z.infer<typeof consultationAnswersSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>;
