# Underwriting Pack — LUMINA PHARMA LIMITED (trading as ROOTS)

**Purpose:** Single source-of-truth document to provide to card acquirers and payment service providers during merchant underwriting for MCC 5912 (Drug Stores and Pharmacies).

**Last updated:** 2026-05-11

---

## 1. Business Identification

| Field | Value |
|---|---|
| Legal name | LUMINA PHARMA LIMITED |
| Trading name | ROOTS |
| Company number | **[FILL: Companies House number]** |
| Country of incorporation | United Kingdom |
| Registered office address | **[FILL: full registered address]** |
| Trading address | **[FILL: same or different]** |
| VAT number | **[FILL or "Not yet registered"]** |
| Year incorporated | **[FILL: year]** |
| Primary website | https://www.rootspharmacy.co.uk |
| Customer support email | **[FILL]** |
| Customer support phone | **[FILL]** |

---

## 2. Regulatory Licences and Certifications

| Authority | Status | Reference |
|---|---|---|
| **General Pharmaceutical Council (GPhC)** — registered UK pharmacy | Registered | **[FILL: GPhC premises registration number]** |
| **MHRA Registered Online Pharmacy Logo** | Registered | **[FILL: MHRA seller registration URL]** |
| **Care Quality Commission (CQC)** | **[FILL: registered / not applicable]** | **[FILL: provider ID if applicable]** |
| **LegitScript Healthcare Merchant Certification** | **In progress — application submitted** | Confirmation upon request |
| **Information Commissioner's Office (ICO)** | Registered (Data Controller) | **[FILL: ICO reg number]** |

Public verification:
- GPhC pharmacy register entry: **[FILL: URL to GPhC register listing]**
- MHRA registered seller list entry: **[FILL: URL to MHRA list entry]**

---

## 3. Responsible People

### Superintendent Pharmacist
| Field | Value |
|---|---|
| Name | **[FILL]** |
| GPhC registration number | **[FILL]** |
| Role | Superintendent Pharmacist (statutory role under Medicines Act / Human Medicines Regulations 2012) |

### Independent Prescriber
| Field | Value |
|---|---|
| Name | **[FILL]** |
| Professional regulator | **[FILL: GPhC / GMC / NMC]** |
| Registration number | **[FILL]** |
| Prescribing qualification | Independent Prescriber (annotated on register) |

### Company Directors and Beneficial Owners
| Name | Role | DOB | % shareholding | Nationality |
|---|---|---|---|---|
| **[FILL]** | Director / Registered Pharmacy Owner | **[FILL]** | **[FILL]** | **[FILL]** |
| **[FILL]** | Director / Operations | **[FILL]** | **[FILL]** | **[FILL]** |

ID documentation, proof of address, and source-of-funds documentation available upon request for each beneficial owner ≥25%.

---

## 4. Business Model

### Overview

ROOTS is an online UK pharmacy operating a consultation-led prescribing and dispensing model. Customers complete a structured medical consultation, which is reviewed by an independent prescriber registered with the relevant UK professional regulator. Where clinically appropriate, the prescriber issues a private prescription which is dispensed by LUMINA PHARMA LIMITED under its GPhC registration.

This is the same operating model used by other UK GPhC-registered online pharmacies including Numan, Voy (Manual Pharmacy), and The Independent Pharmacy.

### Customer Journey
1. Customer browses product information (no purchase possible without consultation for POMs)
2. Customer completes structured medical consultation (medical history, contraindications, lifestyle factors, ID verification)
3. Customer uploads identity verification documents to a private S3 bucket via presigned URL (PHI handled per UK GDPR special category rules)
4. Card payment is **pre-authorised** (not captured) at checkout
5. Independent prescriber reviews the consultation
6. If approved: payment captured, pharmacy dispenses, order shipped via Royal Mail tracked service
7. If rejected: payment voided (no charge to customer), customer notified with reason
8. If more information needed: prescriber requests it, consultation paused

### Product Categories

| Category | MCC | Description | % of expected volume |
|---|---|---|---|
| Prescription-only Medicines (POM) | 5912 | Mounjaro (tirzepatide) — licensed UK weight-management medicine | **[FILL: ~%]** |
| General Sale List / wellness supplements | 5912 | Vitamins and supplements (no POM) | **[FILL: ~%]** |

Only one POM in catalogue at launch. No controlled drugs. No Schedule 2/3 medicines. No items requiring special licence beyond the standard wholesale dealer's authorisation held by our supplier.

---

## 5. Supply Chain

| Field | Value |
|---|---|
| Wholesale supplier | **[FILL: e.g., Alliance Healthcare / AAH / specific name]** |
| Supplier WDA(H) licence number | **[FILL]** |
| Stock storage location | **[FILL: pharmacy address — must match GPhC registration]** |
| Stock control system | **[FILL: name of PMR/stock system]** |
| Cold chain controls | Mounjaro shipped with cold packs, 2-8°C maintained, 24-48h transit |

---

## 6. Clinical and Operational Controls

- All consultations reviewed by a UK-registered independent prescriber before dispense.
- Prescriber may approve, reject, or request more information.
- Consultations include checks for contraindications, drug interactions, pregnancy/breastfeeding status, mental health history, and ID verification.
- Server-side BMI calculation (not customer-input) for eligibility checks.
- One active Mounjaro consultation per customer at a time.
- Standard Operating Procedures (SOPs) covering: consultation review, dispensing, cold-chain, complaints handling, MHRA Yellow Card reporting, data protection. Available upon request.
- Audit trail: every privileged action (consultation approval/rejection, payment capture/void, dispense, shipment) writes an immutable audit log record.

---

## 7. Compliance Posture

- **UK GDPR / Data Protection Act 2018**: ICO registered. PHI handled as special category data. No PHI in logs, analytics, or URLs.
- **Human Medicines Regulations 2012**: compliant via GPhC-registered pharmacy and Independent Prescriber.
- **MHRA distance selling rules**: registered seller of medicines, MHRA logo displayed on every page.
- **PCI-DSS**: payments processed via PCI-DSS Level 1 acquirer; no card data touches our systems.
- **Anti-money laundering**: KYC on every customer (ID upload, address verification).
- **Card scheme compliance**: ready for Visa MCC 5912 pharmacy registration upon acquirer onboarding; LegitScript certification application in progress.

---

## 8. Financial Profile

| Field | Value |
|---|---|
| Business bank account | LUMINA PHARMA LIMITED — **[FILL: bank name]** |
| Sort code / account number | Available on request (verified statement provided) |
| Expected monthly turnover (month 1-3) | £**[FILL]** |
| Expected monthly turnover (month 6) | £**[FILL]** |
| Average transaction value | £**[FILL]** (POMs typically £100-£250, supplements typically £15-£60) |
| Refund rate (industry typical) | <2% — clinical decisions made before capture, so very few customer-side refunds |
| Chargeback rate target | <0.5% — managed via clear T&Cs, ID verification, fulfillment proof |

Settlement currency: GBP.

---

## 9. Technical Readiness

- Custom Next.js 14 e-commerce platform on Vercel
- Server-side validation on every payment action
- Preauth → capture → void state machine built and tested
- Webhook handler with signature/IP verification, idempotency keys, retry handling
- Automated reconciliation between payment provider and internal order state
- PCI-DSS scope minimised: all card entry via hosted fields / redirect, no card data on our servers
- Available integration patterns: hosted checkout redirect, hosted fields, Apple Pay / Google Pay
- Auth/capture window required: 5-7 days (between checkout and prescriber decision)

---

## 10. What We Need From the Acquirer

1. UK acquiring with GBP settlement to a UK business bank account
2. MCC 5912 underwriting approval with Visa pharmacy registration filed
3. Card support: Visa, Mastercard. Amex optional.
4. Wallets: Apple Pay, Google Pay
5. **Preauth + delayed capture support** (5-7 day window minimum)
6. Void and refund APIs
7. Webhooks for: authorisation, capture, void, refund, chargeback initiated/resolved
8. Sandbox/test environment for integration testing pre go-live
9. Reasonable rolling reserve terms (open to discussion; we have low chargeback expected profile)

---

## 11. Why You Should Approve Us

- Fully GPhC-registered UK pharmacy with statutory clinical oversight in place
- Same regulatory profile as established players (Numan, Voy, The Independent Pharmacy) who already operate on major UK acquirers
- Clinical decision happens *before* payment is captured — fundamentally lower refund/chargeback risk than retail pharma
- One POM only at launch (controlled scope, controlled risk)
- Modern technical platform built with audit, compliance, and PCI scope minimisation in mind from day one
- LegitScript application in progress; Visa pharmacy registration ready upon onboarding

---

## Appendices Available Upon Request

- Companies House extract
- GPhC pharmacy registration certificate
- MHRA seller registration confirmation
- Superintendent pharmacist GPhC certificate
- Prescriber registration certificate
- Director ID and proof of address documents
- Business bank account verification (statement / mandate)
- Wholesale supply agreement
- Insurance certificates (professional indemnity, employers liability, public liability, product liability)
- Standard Operating Procedures (SOPs)
- Sample consultation flow screenshots
- T&Cs, Privacy Policy, Returns Policy

---

**Primary contact for underwriting queries:**
Salekh Mahmood (Technical Director / Authorised Administrator)
**[FILL: phone]** | **[FILL: email]**

**Secondary contact (Statutory Director):**
**[FILL: partner name and contact]**
