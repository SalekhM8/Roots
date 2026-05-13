/**
 * Mounjaro (tirzepatide) clinical + commercial content data.
 *
 * Single source of truth feeding:
 *  - /treatments/mounjaro hub page
 *  - /treatments/mounjaro/[dose] per-strength pages
 *  - /guides/* comparison + side-effect pages
 *  - JSON-LD FAQPage, Drug, MedicalWebPage schema
 *
 * All copy here is factual, SmPC/PIL/NHS/BNF/MHRA-aligned, and framed as
 * information supporting a clinical consultation outcome — NOT as promotion
 * of a prescription-only medicine. This is required by CAP Rule 12.12 and
 * the joint MHRA/ASA/GPhC enforcement notice (Apr + Sep 2025).
 *
 * Sources cited inline by reference number throughout the site:
 *  [1] eMC SmPC — Mounjaro 2.5/5/7.5/10/12.5/15 mg solution for injection
 *      https://www.medicines.org.uk/emc/product/15481/smpc
 *  [2] BNF — Tirzepatide
 *      https://bnf.nice.org.uk/drugs/tirzepatide/
 *  [3] NHS — About tirzepatide (Mounjaro)
 *      https://www.nhs.uk/medicines/tirzepatide-mounjaro/
 *  [4] MHRA — Yellow Card scheme
 *      https://yellowcard.mhra.gov.uk/
 *  [5] NICE TA1026 — Tirzepatide for managing overweight and obesity
 *      https://www.nice.org.uk/guidance/ta1026
 *  [6] Diabetes UK — Mounjaro
 *      https://www.diabetes.org.uk/about-diabetes/looking-after-diabetes/treatments/tablets-and-medication/glp-1/mounjaro
 */

export interface Dose {
  /** URL slug, e.g. "2-5mg". */
  slug: string;
  /** Display value, e.g. "2.5mg". */
  label: string;
  /** Numerical mg value. */
  mg: number;
  /** Position in the dose escalation schedule (1 = starter). */
  step: number;
  /** Concise positioning sentence. */
  positioning: string;
  /** When this dose is appropriate. */
  whenAppropriate: string;
  /** What to expect at this dose. */
  whatToExpect: string;
}

export const MOUNJARO_DOSES: Dose[] = [
  {
    slug: "2-5mg",
    label: "2.5mg",
    mg: 2.5,
    step: 1,
    positioning:
      "The starter dose. Used for the first four weeks to allow your body to adjust to tirzepatide. Not intended for long-term weight management.",
    whenAppropriate:
      "First-time users of any GLP-1 / GIP receptor agonist. The 2.5mg dose is a tolerability step — it is rarely effective for sustained weight loss on its own. After four weeks your prescriber will usually escalate you to 5mg.",
    whatToExpect:
      "Most side effects occur during the first weeks at this dose as your body adjusts. Common: mild nausea, reduced appetite, occasional digestive changes. These typically settle within 1–2 weeks. Weight loss at 2.5mg is variable and modest — the goal of this dose is safety, not results.",
  },
  {
    slug: "5mg",
    label: "5mg",
    mg: 5,
    step: 2,
    positioning:
      "The first maintenance dose. Where most clinically meaningful weight loss begins, with a side-effect profile that the majority of patients tolerate well.",
    whenAppropriate:
      "Patients who have completed four weeks at 2.5mg without significant side effects. Some patients respond strongly at 5mg and remain on this dose long-term; others step up after a further four weeks if response and tolerability are favourable.",
    whatToExpect:
      "Appetite suppression typically becomes noticeable. Most patients see steady weight reduction over the following weeks. Gastrointestinal side effects (nausea, reflux, constipation) may return briefly after the step-up and usually settle within 7–10 days.",
  },
  {
    slug: "7-5mg",
    label: "7.5mg",
    mg: 7.5,
    step: 3,
    positioning:
      "A mid-range escalation dose for patients whose weight loss has plateaued at 5mg.",
    whenAppropriate:
      "After at least four weeks at 5mg, if response has slowed AND if the lower dose was tolerated. Not used routinely — your prescriber may keep you at 5mg if response remains good.",
    whatToExpect:
      "Renewed appetite suppression. Some patients see a clear second wave of weight loss; others tolerate well but plateau again. Gastrointestinal symptoms may briefly recur.",
  },
  {
    slug: "10mg",
    label: "10mg",
    mg: 10,
    step: 4,
    positioning:
      "A maintenance dose used by many patients long term once they reach this strength.",
    whenAppropriate:
      "After tolerating 7.5mg for at least four weeks. 10mg is one of the most commonly used long-term maintenance doses in clinical practice.",
    whatToExpect:
      "Pronounced appetite suppression. Many patients achieve their target weight on this dose. Side effects, if present, are usually milder than during the early escalation phase.",
  },
  {
    slug: "12-5mg",
    label: "12.5mg",
    mg: 12.5,
    step: 5,
    positioning:
      "A higher escalation step for patients whose response has plateaued at 10mg.",
    whenAppropriate:
      "After at least four weeks at 10mg, with continued tolerability and a clinical rationale to push further. Your prescriber will weigh additional benefit against the rising side-effect profile.",
    whatToExpect:
      "Variable additional weight loss above 10mg. Some patients gain substantial further benefit; others see diminishing returns. Side-effect risk increases at higher doses.",
  },
  {
    slug: "15mg",
    label: "15mg",
    mg: 15,
    step: 6,
    positioning:
      "The maximum licensed dose. Reserved for patients who require it and have tolerated stepwise escalation through every prior strength.",
    whenAppropriate:
      "After tolerating 12.5mg. Not all patients reach this dose — many do not need to. Your prescriber will only recommend 15mg if there is a clear continued clinical benefit and your side-effect burden remains acceptable.",
    whatToExpect:
      "The highest level of appetite suppression. Gastrointestinal side effects are most common at this dose. Long-term maintenance at 15mg is appropriate for some patients but not the default.",
  },
];

/**
 * Comprehensive Mounjaro FAQ. Used directly as the FAQ block on the hub and
 * marked up as FAQPage schema. Order matters — most-asked first.
 *
 * Every answer is information about the medicine to support an informed
 * consultation. None of these answers promote the medicine.
 */
export const MOUNJARO_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "What is Mounjaro?",
    answer:
      "Mounjaro is the brand name for tirzepatide, a once-weekly injection licensed in the UK for chronic weight management and for type 2 diabetes. It acts on both the GLP-1 and GIP receptors, two natural pathways that regulate appetite and blood sugar. Mounjaro is a prescription-only medicine — it is only supplied after a clinical consultation with a qualified prescriber who confirms it is appropriate for you.",
  },
  {
    question: "Am I eligible for a Mounjaro weight loss consultation?",
    answer:
      "In the UK, tirzepatide for weight management is normally appropriate for adults with a BMI of 30 or above, or a BMI of 27 or above when accompanied by at least one weight-related health condition such as type 2 diabetes, high blood pressure, or obstructive sleep apnoea. Eligibility is decided by your prescriber after reviewing your full medical history. Final decisions follow NICE guidance and the manufacturer's prescribing information.",
  },
  {
    question: "How does Mounjaro work?",
    answer:
      "Tirzepatide is a dual GLP-1 and GIP receptor agonist. By activating both receptors, it slows the rate at which food leaves the stomach, increases the feeling of fullness after eating, reduces appetite signals from the brain, and helps regulate post-meal blood sugar. The combined effect for most people is a meaningful reduction in calorie intake without conscious dieting.",
  },
  {
    question: "How much weight can I expect to lose on Mounjaro?",
    answer:
      "Clinical trial data from the SURMOUNT programme showed average weight reductions of around 15–22% of starting body weight over 72 weeks, depending on dose. Individual results vary widely — some patients lose substantially more, some less. Weight loss depends on dose, lifestyle, diet, exercise and individual physiology. Mounjaro is not a substitute for sustainable diet and activity changes.",
  },
  {
    question: "How is Mounjaro taken?",
    answer:
      "Mounjaro is a once-weekly subcutaneous injection (just under the skin) using a pre-filled pen. You administer it yourself at home, on the same day each week, at any time of day, with or without food. Suitable injection sites are the abdomen, the front of the thigh, or the back of the upper arm. Rotate the site each week.",
  },
  {
    question: "What doses are available?",
    answer:
      "Mounjaro is supplied in six pen strengths: 2.5mg, 5mg, 7.5mg, 10mg, 12.5mg and 15mg. Treatment always starts at 2.5mg — the tolerability step — for four weeks, then escalates in 2.5mg increments at intervals of at least four weeks based on your response and how well you tolerate each dose.",
  },
  {
    question: "What are the most common side effects?",
    answer:
      "The most commonly reported side effects are gastrointestinal: nausea, diarrhoea, vomiting, constipation, abdominal pain, indigestion and reduced appetite. These are usually mild to moderate and most common during the first weeks at a new dose. Other reported effects include fatigue, injection-site reactions, dizziness and headache. Suspected side effects can be reported to the MHRA via the Yellow Card scheme.",
  },
  {
    question: "Are there serious side effects I should know about?",
    answer:
      "Less common but serious adverse effects reported with tirzepatide include acute pancreatitis (severe upper abdominal pain that may radiate to the back), gallbladder problems, severe allergic reactions, and worsening of diabetic eye disease in people with type 2 diabetes. Seek urgent medical advice if you develop persistent severe abdominal pain, signs of an allergic reaction, or any symptom that concerns you. Full safety information is in the Patient Information Leaflet supplied with the medicine.",
  },
  {
    question: "Who should not take Mounjaro?",
    answer:
      "Mounjaro is not appropriate if you are pregnant, breastfeeding, planning a pregnancy in the near future, or have a personal or family history of medullary thyroid carcinoma or Multiple Endocrine Neoplasia syndrome type 2. It should be used with caution in people with a history of pancreatitis, severe gastrointestinal disease, severe kidney or liver impairment, or diabetic retinopathy. Your prescriber will review your full medical history during your consultation.",
  },
  {
    question: "Does Mounjaro interact with other medicines?",
    answer:
      "Mounjaro can slow stomach emptying, which may affect how quickly other oral medicines are absorbed. Particular care is needed with combined hormonal contraceptives — the manufacturer recommends using a barrier method or a non-oral form of contraception for four weeks after starting Mounjaro and for four weeks after each dose increase. Tell your prescriber about every medicine, supplement and herbal remedy you take.",
  },
  {
    question: "Can I drink alcohol on Mounjaro?",
    answer:
      "There is no formal contraindication, but alcohol can worsen the gastrointestinal side effects of tirzepatide and can affect blood sugar control. Many patients find their tolerance for alcohol drops noticeably while on treatment. Moderation is sensible, particularly during dose escalations.",
  },
  {
    question: "What happens if I miss a dose?",
    answer:
      "If you miss your weekly dose and your next scheduled dose is more than four days (72 hours) away, take the missed dose as soon as you remember. If your next scheduled dose is less than four days away, skip the missed dose and continue on your normal day. Never take two doses in the same week to make up for a missed one.",
  },
  {
    question: "How should I store Mounjaro?",
    answer:
      "Store Mounjaro pens in the refrigerator (2–8°C) in their original carton, away from the cooling element. Do not freeze. Once removed from the fridge, a pen can be kept at room temperature (up to 30°C) for up to 21 days. Discard any pen that has been frozen or stored above 30°C.",
  },
  {
    question: "Can I travel with Mounjaro?",
    answer:
      "Yes. Carry the pen in its original carton in a cool, insulated bag during transit. Keep it in your hand luggage when flying — do not check it into the hold, where it may freeze. Carry your prescription documentation in case of customs queries.",
  },
  {
    question: "What is the difference between Mounjaro and Wegovy?",
    answer:
      "Wegovy contains semaglutide (a single GLP-1 receptor agonist). Mounjaro contains tirzepatide, which acts on both GLP-1 and GIP receptors. Head-to-head data from the SURMOUNT-5 trial showed greater average weight loss on Mounjaro than on Wegovy at the doses tested. Side-effect profiles are broadly similar. Suitability of either medicine for you depends on your medical history.",
  },
  {
    question: "How do I start a Mounjaro consultation with Roots Pharmacy?",
    answer:
      "Use the Start Consultation link on this page. The consultation is a structured medical questionnaire covering your weight, height, medical history, current medications and lifestyle. A UK GPhC-registered prescriber reviews every consultation. If treatment is not appropriate for you, you will not be charged for the medicine and our clinician will explain the decision. If treatment is approved, your medicine is dispatched from a GPhC-registered pharmacy in discreet, temperature-controlled packaging.",
  },
  {
    question: "Is Mounjaro available on the NHS?",
    answer:
      "Tirzepatide is recommended by NICE (TA1026) for managing overweight and obesity through specialist weight management services within the NHS. Access through the NHS is currently limited and waiting lists are long in many areas. Many patients choose a private route to access the treatment more quickly. Speak to your GP about NHS options first if cost is your primary consideration.",
  },
  {
    question: "How is Mounjaro priced at Roots Pharmacy?",
    answer:
      "The fee you see at the end of your consultation covers the medicine, the prescriber review, and standard next-day tracked delivery. Pricing per pen increases stepwise with dose strength, reflecting the manufacturer's pricing. You only pay if your consultation is approved by the prescriber — there is no consultation fee.",
  },
  {
    question: "How quickly will I receive my Mounjaro?",
    answer:
      "Once your consultation is approved by the prescriber and payment is captured, your order is dispatched the same working day for next-working-day tracked delivery. Royal Mail Tracked 24 is the standard service. Cold-chain insulated packaging maintains the temperature requirement during transit.",
  },
  {
    question: "Is Roots Pharmacy a registered UK pharmacy?",
    answer:
      "Yes. Roots Pharmacy operates in partnership with a GPhC-registered pharmacy. Every prescription is reviewed by a qualified UK prescriber and dispensed by a registered pharmacy. Our superintendent pharmacist and the pharmacy's GPhC registration are published on this site, and the dispensing entity carries the official GPhC Internet Pharmacy logo.",
  },
];

export const MOUNJARO_DRUG_FACTS = {
  proprietaryName: "Mounjaro",
  nonProprietaryName: "tirzepatide",
  atcCode: "A10BX16",
  mechanismOfAction:
    "Dual glucose-dependent insulinotropic polypeptide (GIP) and glucagon-like peptide-1 (GLP-1) receptor agonist. Slows gastric emptying, increases satiety, reduces appetite signalling, and improves glucose-dependent insulin secretion.",
  indication:
    "Chronic weight management in adults with obesity (BMI ≥30) or overweight (BMI ≥27) with at least one weight-related comorbidity, as an adjunct to a reduced-calorie diet and increased physical activity. Also licensed for type 2 diabetes.",
  manufacturer: "Eli Lilly and Company",
} as const;
