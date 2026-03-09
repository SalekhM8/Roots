# 07-consultations-and-clinical-flow.md

## Purpose
This document defines the consultation and prescriber workflow for ROOTS v1.
It is the source of truth for the Mounjaro journey.

---

## 1. Scope

### In scope for v1
- Mounjaro consultation only
- Account required before final submit
- Payment authorized after consultation + checkout
- Prescriber review: approve / reject / request more info
- Photo and ID upload request if needed
- Order moves to fulfillment only after approval + capture

### Out of scope for v1
- Subscriptions, AI review, live chat, video consultation, multiple POM flows

---

## 2. Core Principles
1. Consultation is a guided clinical intake, not a generic form.
2. Customer always knows where they are and what happens next.
3. Account required before final submission.
4. Prescriber decision is always human.
5. Mounjaro order not fulfilled until consultation approved AND payment captured.

---

## 3. Consultation Route

`/consultations/mounjaro`

Same header, footer, typography, spacing as the rest of the site. Premium, calm form UI.

---

## 4. Pre-Start Requirements Screen

Before the form begins, show what the customer needs:
- Current weight and height
- A list of current medications and strengths
- GP details
- Front and side-facing body photos
- Photographic ID

Checkbox: "I have this information ready" — required to proceed.

---

## 5. Consultation Step Structure

### Step 1 — Process Confirmation
Display the process steps:
1. Complete our online consultation (5 mins)
2. Select and pay for your products
3. Upload recent body photos
4. Clinical approval by our doctors
5. Same day dispatch (if approved before 2pm)

Checkbox required: "Yes, I confirm" — must check to proceed.

### Step 2 — Your Medication History
Questions:
- **Do you take any medication, or have any medical conditions?** (Yes/No, mandatory)
  - If Yes: free text field for medication names and strengths
- **Have you ever used Wegovy or Mounjaro before?** (Yes/No, mandatory)
  - If Yes: free text field for details (which one, dose, duration, when stopped)

### Step 3 — Lifestyle and Medical History
Questions:
- **What is your height and weight?** (mandatory)
  - Height: numeric input with unit toggle (Centimeters / Feet & Inches)
  - Weight: numeric input with unit toggle (Kilos / Stone & Pounds)
  - BMI calculated and displayed client-side, recalculated server-side
  - Store canonical values: always cm and kg internally
- **Are you currently breastfeeding, pregnant or planning to be pregnant?** (Yes/No, mandatory)
- **Have you ever had any of the following conditions?** (Yes/No, mandatory)
  - Epilepsy
  - High cholesterol
  - Diabetes
  - Galactose intolerance
  - Lapp lactase deficiency
  - Glucose-galactose malabsorption
  - Liver or kidney problems (including reduced function)
  - Inflammatory bowel disease, colitis or Crohn's disease
  - Problems affecting your thyroid
  - Depression or a mood related disorder
  - If Yes: free text field for details
- **Have you ever had pancreatitis, gall stones, reduced bile flow or had your gall bladder removed?** (Yes/No, mandatory)
  - If Yes: free text field for details
- **Have you ever suffered from anorexia, bulimia, body dysmorphia or any other diagnosed eating disorder?** (Yes/No, mandatory)
  - If Yes: free text field for details
- **Do you have any confirmed allergies to food, medicines or chemicals?** (Yes/No, mandatory)
  - If Yes: free text field for details
- **Do you drink alcohol?** (Yes/No, mandatory)
  - If Yes: free text field for frequency/amount
- **Do you have any disabilities or special needs that we should be aware of?** (Yes/No, mandatory)
  - If Yes: free text field for details

### Step 4 — Safety Confirmations
Display safety information:
- Injectable weight loss medication should not be used during pregnancy or breastfeeding. If you are taking an oral contraceptive pill you will need to use additional contraception, such as condoms.
- Inflammation of the pancreas is a rare side effect of taking Mounjaro or Wegovy injections.
- The warning signs to look out for are abdominal pain which persists, worsens or radiates to the back, fever, vomiting, yellowing of skin or a fast heartbeat.

Individual checkboxes (ALL mandatory):
- [ ] I agree to read the in-pack patient information leaflet for Mounjaro
- [ ] I agree to use Mounjaro as prescribed: one dose a week, with no breaks. If I have a break in treatment of 2 weeks or more I may need to re-start at the lowest dose.
- [ ] If I have surgery in the future, I agree to make my surgeon aware of any weight loss medications I have taken in the previous 6 months
- [ ] I understand this medication cannot be returned once it is dispatched by the pharmacy

Final declaration checkbox (mandatory):
- [ ] I confirm that I am over 18, that this is for my sole use, that I understand this is a non-emergency service, that I have answered all questions accurately, and I understand that the doctor will use this information to prescribe safely for me.

Legal consent line: "By providing us with your details you confirm that you have read, understood and agreed to our legal terms, and you agree that we can use the information you've provided to deliver our service and assess treatment for you."

---

## 6. Progress Indicator
Numbered step indicator (1, 2, 3, 4) visible at top of form. Active step highlighted (filled circle), completed steps marked, future steps outlined. Same style as Oxford Online Pharmacy reference.

---

## 7. Save and Restore Behavior

### Pre-auth state
While unauthenticated: form state preserved in React state (useState/useReducer). On hitting auth gate: serialize to sessionStorage.

### Post-auth state
After sign-in/sign-up: restore from sessionStorage, return to final step or submit confirmation. Never force re-entry.

### Canonical save
Only on final submit does the consultation become a server record tied to the account.

### Clear
SessionStorage cleared after successful server submission.

---

## 8. Account Gate

User may begin as guest. Before final submit: require sign-up or sign-in.

UX wording: "Create your account to securely submit your consultation" — not generic ecommerce auth wording.

---

## 9. Consultation Creation (on final submit)

System creates:
- `consultation` record (status: `submitted`)
- `consultation_answers` record (JSON + normalized fields)
- `audit_log` entry
- `email_event` for consultation submitted

User directed to select Mounjaro variant/dose and proceed to checkout.

---

## 10. Consultation Answers Storage

### consultation_answers fields
- `answers_json` — full JSON blob of all answers for flexibility
- `height_cm` — canonical height in centimeters
- `weight_kg` — canonical weight in kilograms
- `bmi` — server-calculated BMI
- `is_pregnant_or_breastfeeding` — boolean
- `has_medical_conditions` — boolean
- `medical_conditions_text` — free text details
- `current_medications_text` — free text medications
- `has_prior_glp1_use` — boolean
- `prior_glp1_details` — free text
- `has_pancreatitis_history` — boolean
- `has_eating_disorder_history` — boolean
- `has_allergies` — boolean
- `allergies_text` — free text
- `drinks_alcohol` — boolean
- `has_disabilities` — boolean
- `gp_details` — free text (GP name/practice)
- `consent_confirmed` — boolean
- `safety_confirmations_json` — JSON object of individual safety checkbox states

---

## 11. Checkout Linkage

Mounjaro consultation and order MUST be linked via `consultation_id` on the order.

### Payment model for orders containing POM items
- Authorize FULL amount at checkout (Mounjaro + any supplements in same basket)
- Do NOT capture until prescriber approves
- Store Stripe `capture_before` timestamp on payment record

### Payment model for supplement-only orders
- Capture immediately at checkout

### Order status after Mounjaro/mixed checkout
- payment = `authorized`
- consultation = `submitted` or `under_review`
- fulfillment = `unfulfilled`

---

## 12. Authorization Expiry Handling

Standard Stripe authorization expires in 7 days. Extended authorization is NOT available for healthcare merchants.

### Rules
- Store `capture_before` from Stripe PaymentIntent on the payment record
- Inngest cron job: check daily for authorizations expiring within 24 hours, alert admin
- If authorization expires before review: set payment to `expired`, set order to `payment_expired`, email customer asking them to re-checkout
- Target prescriber review SLA: 48 hours, hard maximum 5 days

---

## 13. Prescriber Queue

Show consultations where status is `submitted`, `under_review`, or `action_required` (after customer upload).

Queue columns: customer name, age/DOB, BMI, product/dose, submission time, status, upload status, linked order payment state, time until auth expiry.

Default sort: oldest unreviewed first. Flag any where auth expiry < 48 hours.

---

## 14. Prescriber Review Screen

Sections:
- **Patient summary**: name, DOB, age, email, phone
- **Metrics**: height, weight, BMI
- **Clinical content**: all medical answers rendered clearly (conditions, medications, allergies, GLP-1 history, eating disorders, pancreatitis, pregnancy, alcohol, disabilities)
- **GP details**
- **Safety confirmations**: display which checkboxes were confirmed
- **Commerce context**: selected Mounjaro dose, order number, payment status, auth expiry time
- **Uploads**: requested? uploaded? previews/links
- **Notes**: internal note field, customer-facing message field
- **Actions**: Approve, Reject, Request More Info

---

## 15. Prescriber Actions

### Approve
- Create `prescriber_reviews` row (decision: approved)
- Create `prescriptions` row
- Consultation status → `approved`
- Capture payment (full amount)
- Order fulfillment → `ready_to_pack`
- Audit log entry
- Email: order approved + payment captured

### Reject
- Create `prescriber_reviews` row (decision: rejected)
- Consultation status → `rejected`
- Void payment authorization
- Audit log entry
- Email: order rejected, payment voided

### Request More Info
- Create `prescriber_reviews` row (decision: more_info_required)
- Consultation status → `action_required`
- Create upload request if photos/ID needed
- Store customer-facing message
- Audit log entry
- Email: action needed with clear instructions

---

## 16. Upload Flow

### Upload types
- `body_photo_front`
- `body_photo_side`
- `photo_id`

### Trigger
Only shown when prescriber requests more information.

### Customer flow
1. Receives action-required email
2. Signs in
3. Goes to consultation/order detail
4. Sees upload task with clear instructions
5. Uploads via presigned S3 URL
6. Upload status → `uploaded`
7. Prescriber queue reflects updated state

### Storage
Private S3 bucket. Uploads scoped to user + consultation. Short-lived presigned URLs.

---

## 17. Customer Consultation Detail Page

Show: submitted date, status (user-friendly wording), linked order, what happens next, upload CTA if needed.

Status mapping:
- `submitted` → "Submitted — under review"
- `under_review` → "Under clinical review"
- `action_required` → "Action needed — please upload requested information"
- `approved` → "Approved"
- `rejected` → "We were unable to approve your consultation"

Timeline visualization: Consultation submitted → Order received → Clinical review → Approved/Action needed/Rejected → Dispatched

---

## 18. Validation Rules

- All fields validated client-side for UX, server-side for truth
- No consultation submitted without all required fields and all consent checkboxes
- Server recalculates BMI from height_cm and weight_kg
- Reject obviously invalid values (height < 100cm or > 250cm, weight < 30kg or > 300kg)
- Account must exist before submission

---

## 19. Audit Requirements

Audit log on: consultation submit, every status change, upload request, upload received, prescriber decision, payment capture/void linked to decision.

---

## 20. Acceptance Criteria

- Guest can begin consultation
- Account required before final submit
- State restored after auth gate
- Consultation linked to user and order
- Prescriber can approve/reject/request more info with full clinical context
- Uploads can be requested and completed
- Approved consultations move orders into fulfillment
- Rejected consultations void payment and prevent fulfillment
- Authorization expiry is monitored and handled
