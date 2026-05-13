import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";
import {
  BreadcrumbJsonLd,
  DrugJsonLd,
  FaqJsonLd,
  MedicalOrganizationJsonLd,
  MedicalWebPageJsonLd,
} from "@/components/seo/json-ld";
import { MedicalReviewByline } from "@/components/seo/medical-review-byline";
import {
  CLINICAL_CONTENT_LAST_REVIEWED,
  MEDICAL_REVIEWER,
  MOUNJARO_HUB_PUBLISHED,
} from "@/lib/clinical/credentials";
import {
  MOUNJARO_DOSES,
  MOUNJARO_DRUG_FACTS,
  MOUNJARO_FAQS,
} from "@/data/mounjaro";
import { ROUTES } from "@/lib/constants";

/**
 * Mounjaro information hub. This is the page we are targeting for
 * "mounjaro uk", "buy mounjaro online uk", "tirzepatide uk", "mounjaro
 * weight loss" and related navigational/transactional queries.
 *
 * Compliance posture (CAP Rule 12.12 / Human Medicines Regs 2012 /
 * MHRA-ASA-GPhC joint enforcement notice Apr + Sep 2025):
 *   - Page is framed as information about a CONSULTATION SERVICE, not as
 *     an advertisement for a POM. We do not list "buy now" CTAs, claim
 *     efficacy in marketing language, show before/afters, or use price
 *     anchoring. We refer to the medicine by name only because referring
 *     to a POM by name in a consultation context is permitted.
 *   - Every claim is sourced to SmPC / BNF / NHS / NICE.
 *   - Side effects + contraindications get the same visual weight as
 *     benefits.
 *
 * E-E-A-T:
 *   - Named reviewing pharmacist with GPhC number above the fold
 *     (MedicalReviewByline).
 *   - Last reviewed date visible + in MedicalWebPage.dateModified.
 *   - JSON-LD: MedicalOrganization (with parentOrganization = licensed
 *     dispensing pharmacy), MedicalWebPage, Drug, FAQPage, BreadcrumbList.
 */

const URL_PATH = "/treatments/mounjaro";
const PAGE_TITLE = "Mounjaro (Tirzepatide) Weight Loss Consultation | Roots Pharmacy";
const PAGE_DESCRIPTION =
  "Start a UK clinical consultation for Mounjaro (tirzepatide). Reviewed by a GPhC-registered pharmacist. Next-day discreet delivery if approved.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: URL_PATH },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: URL_PATH,
    type: "article",
    locale: "en_GB",
    siteName: "Roots Pharmacy",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

function StartCTA() {
  return (
    <LinkButton href={ROUTES.consultation} variant="primary">
      Start your consultation
    </LinkButton>
  );
}

export default function MounjaroHubPage() {
  return (
    <div className="bg-roots-cream">
      <MedicalOrganizationJsonLd />
      <MedicalWebPageJsonLd
        url={URL_PATH}
        name={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        datePublished={MOUNJARO_HUB_PUBLISHED}
        dateModified={CLINICAL_CONTENT_LAST_REVIEWED}
        reviewer={MEDICAL_REVIEWER}
        about={["Obesity", "Overweight", "Type 2 diabetes"]}
        specialty="Endocrine"
      />
      <DrugJsonLd
        proprietaryName={MOUNJARO_DRUG_FACTS.proprietaryName}
        nonProprietaryName={MOUNJARO_DRUG_FACTS.nonProprietaryName}
        atcCode={MOUNJARO_DRUG_FACTS.atcCode}
        mechanismOfAction={MOUNJARO_DRUG_FACTS.mechanismOfAction}
        indication={MOUNJARO_DRUG_FACTS.indication}
        url={URL_PATH}
        manufacturer={MOUNJARO_DRUG_FACTS.manufacturer}
        doseSchedule={MOUNJARO_DOSES.map((d) => ({ doseValue: d.mg, doseUnit: "mg" }))}
      />
      <FaqJsonLd faqs={MOUNJARO_FAQS} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Treatments", href: "/treatments/mounjaro" },
          { name: "Mounjaro" },
        ]}
      />

      {/* Hero — editorial framing, no marketing claims */}
      <section className="bg-roots-green text-roots-cream">
        <div className="page-container py-20 md:py-28">
          <nav aria-label="Breadcrumb" className="mb-8 text-xs text-roots-cream/70">
            <Link href="/" className="underline-offset-2 hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-roots-cream">Mounjaro</span>
          </nav>
          <h1 className="max-w-3xl text-[38px] font-medium leading-tight md:text-[56px]">
            Mounjaro weight loss consultation
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-roots-cream/85">
            Tirzepatide, prescribed online by a UK GPhC-registered pharmacist when
            clinically appropriate. Structured medical questionnaire, prescriber
            review, and discreet next-day delivery if approved.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <StartCTA />
            <span className="text-sm text-roots-cream/70">
              No charge unless your consultation is approved.
            </span>
          </div>
        </div>
      </section>

      {/* Byline + last reviewed */}
      <section className="page-container -mt-8">
        <MedicalReviewByline
          reviewer={MEDICAL_REVIEWER}
          lastReviewedIso={CLINICAL_CONTENT_LAST_REVIEWED}
        />
      </section>

      {/* On-this-page contents */}
      <section className="page-container pb-6">
        <div className="glass-card rounded-[var(--radius-card)] p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-roots-navy/60">
            On this page
          </p>
          <ul className="grid grid-cols-1 gap-2 text-sm text-roots-navy/80 sm:grid-cols-2 md:grid-cols-3">
            {[
              ["what-is", "What Mounjaro is"],
              ["how-it-works", "How it works"],
              ["eligibility", "Who it's for"],
              ["doses", "Doses & escalation"],
              ["how-to-use", "How to use it"],
              ["side-effects", "Side effects"],
              ["contraindications", "Who shouldn't take it"],
              ["interactions", "Interactions"],
              ["expectations", "What to expect"],
              ["alternatives", "Mounjaro vs Wegovy"],
              ["our-service", "Our service"],
              ["faqs", "FAQs"],
            ].map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="underline-offset-2 hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What is Mounjaro */}
      <section id="what-is" className="page-container py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-roots-navy/85">
          <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
            What Mounjaro is
          </h2>
          <p>
            Mounjaro is the UK brand name for <strong>tirzepatide</strong>, a
            once-weekly injection licensed by the MHRA for chronic weight
            management and for type&nbsp;2 diabetes. It is a prescription-only
            medicine (POM) and can only be supplied in the UK after a clinical
            consultation with a qualified prescriber. Tirzepatide is the first
            licensed medicine to act on both the GLP-1 and GIP receptors —
            two of the gut hormone pathways the body uses to regulate appetite
            and blood sugar.
          </p>
          <p>
            Mounjaro is supplied as a pre-filled pen for self-injection. It is
            manufactured by Eli&nbsp;Lilly and Company. The medicine is
            available in six strengths from 2.5&nbsp;mg up to 15&nbsp;mg per
            weekly dose. Treatment always starts at the lowest strength to
            allow your body to adjust, and is escalated stepwise based on your
            clinical response and tolerability.
          </p>
          <p className="text-sm text-roots-navy/60">
            Sources: eMC SmPC; BNF tirzepatide monograph; NHS — About
            tirzepatide; NICE TA1026.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-roots-cream-2/40 py-12 md:py-16">
        <div className="page-container">
          <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-roots-navy/85">
            <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
              How Mounjaro works
            </h2>
            <p>
              Tirzepatide is a <strong>dual GIP and GLP-1 receptor agonist</strong>.
              It mimics two natural gut hormones that are released after eating.
              By activating both receptors at once, it produces a combined
              effect that single-receptor GLP-1 medicines (such as semaglutide)
              do not.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Slows the rate at which food leaves the stomach.</li>
              <li>Increases the feeling of fullness after eating.</li>
              <li>Reduces appetite signalling from the brain.</li>
              <li>
                Improves glucose-dependent insulin secretion, which helps
                regulate blood sugar in people with type 2 diabetes.
              </li>
            </ul>
            <p>
              The result for most patients is a meaningful reduction in calorie
              intake without conscious dieting. Mounjaro is not a substitute
              for sustainable diet and activity changes — it is most effective
              when combined with a reduced-calorie diet and increased physical
              activity, in line with NICE guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section id="eligibility" className="page-container py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-roots-navy/85">
          <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
            Who Mounjaro is for
          </h2>
          <p>
            In the UK, tirzepatide for weight management is normally appropriate
            for adults who meet the following BMI criteria, in line with the
            manufacturer's licensed indication and NICE TA1026:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>BMI of 30 or above</strong> (obesity), or
            </li>
            <li>
              <strong>BMI of 27 or above</strong> (overweight) with at least one
              weight-related health condition — for example type&nbsp;2
              diabetes, high blood pressure, high cholesterol, or obstructive
              sleep apnoea.
            </li>
          </ul>
          <p>
            Eligibility is decided by the reviewing prescriber after a full
            assessment of your medical history, current medications, and any
            previous experience with weight management medicines. Final
            decisions follow the manufacturer's prescribing information and
            current UK clinical guidance. We do not auto-approve consultations.
          </p>
          <div className="glass-warning rounded-[var(--radius-card)] p-5 text-sm">
            <p className="font-semibold text-roots-navy">A consultation is not a guarantee of treatment.</p>
            <p className="mt-1 text-roots-navy/80">
              If our prescriber decides Mounjaro is not appropriate for you,
              you will not be charged for the medicine and the reasoning will
              be explained to you in writing.
            </p>
          </div>
        </div>
      </section>

      {/* Doses */}
      <section id="doses" className="bg-roots-cream-2/40 py-12 md:py-16">
        <div className="page-container">
          <div className="mx-auto max-w-4xl">
            <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-roots-navy/85">
              <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
                Doses and escalation
              </h2>
              <p>
                Mounjaro is available in six pen strengths. Treatment always
                starts at 2.5&nbsp;mg — the tolerability step — for four weeks,
                then steps up in 2.5&nbsp;mg increments at intervals of at
                least four weeks, based on your response and how well you
                tolerate each dose. Not every patient needs every step. Many
                stay on a maintenance dose between 5&nbsp;mg and 10&nbsp;mg
                long-term.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {MOUNJARO_DOSES.map((d) => (
                <Link
                  key={d.slug}
                  href={`/treatments/mounjaro/${d.slug}`}
                  className="glass-card-strong group rounded-[var(--radius-card)] p-5 transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-medium text-roots-green">
                      {d.label}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-roots-navy/50">
                      Step {d.step}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-roots-navy/80">
                    {d.positioning}
                  </p>
                  <span className="mt-3 inline-block text-xs font-medium text-roots-green underline-offset-2 group-hover:underline">
                    Read about {d.label} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to use */}
      <section id="how-to-use" className="page-container py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-roots-navy/85">
          <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
            How to use Mounjaro
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Once a week, on the same day each week, at any time of day, with
              or without food.
            </li>
            <li>
              Subcutaneous injection (just under the skin) using a single-use
              pre-filled pen. Suitable sites: abdomen, front of thigh, back of
              upper arm. Rotate the site each week.
            </li>
            <li>
              Store in the fridge (2–8°C) in the original carton. Once
              removed, the pen can be kept below 30°C for up to 21 days.
              Discard if frozen.
            </li>
            <li>
              If you miss a dose and your next scheduled dose is more than four
              days away, take the missed dose. If less than four days, skip it
              — never double-up.
            </li>
          </ul>
          <p className="text-sm text-roots-navy/60">
            Full step-by-step instructions are in the Patient Information
            Leaflet (PIL) supplied with every pen. Always read the PIL before
            your first injection.
          </p>
        </div>
      </section>

      {/* Side effects */}
      <section id="side-effects" className="bg-roots-cream-2/40 py-12 md:py-16">
        <div className="page-container">
          <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-roots-navy/85">
            <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
              Side effects
            </h2>
            <p>
              Like all medicines, Mounjaro can cause side effects, although
              not everybody gets them. The list below summarises the most
              relevant effects — for the complete list, refer to the SmPC and
              the Patient Information Leaflet.
            </p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="glass-card rounded-[var(--radius-card)] p-5">
                <h3 className="text-xl font-medium text-roots-navy">
                  Very common &amp; common
                </h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-roots-navy/80">
                  <li>Nausea</li>
                  <li>Diarrhoea</li>
                  <li>Vomiting</li>
                  <li>Constipation</li>
                  <li>Abdominal pain</li>
                  <li>Reduced appetite</li>
                  <li>Indigestion / reflux</li>
                  <li>Fatigue</li>
                  <li>Injection-site reactions</li>
                  <li>Dizziness</li>
                  <li>Headache</li>
                </ul>
              </div>
              <div className="glass-error rounded-[var(--radius-card)] p-5">
                <h3 className="text-xl font-medium text-roots-navy">
                  Serious — seek urgent medical advice
                </h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-roots-navy/80">
                  <li>
                    Acute pancreatitis — severe upper abdominal pain that may
                    radiate to the back, with or without vomiting
                  </li>
                  <li>
                    Severe allergic reaction (anaphylaxis) — swelling of the
                    face, lips, tongue or throat, difficulty breathing
                  </li>
                  <li>Gallbladder problems including gallstones</li>
                  <li>
                    Worsening of diabetic eye disease (people with type 2
                    diabetes)
                  </li>
                  <li>
                    Severe dehydration from persistent vomiting or diarrhoea
                  </li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-roots-navy/60">
              Report any suspected side effect directly to the MHRA via the{" "}
              <a
                href="https://yellowcard.mhra.gov.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Yellow Card scheme
              </a>
              . Reporting side effects helps the MHRA monitor the safety of
              the medicine.
            </p>
          </div>
        </div>
      </section>

      {/* Contraindications */}
      <section id="contraindications" className="page-container py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-roots-navy/85">
          <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
            Who should not take Mounjaro
          </h2>
          <p>Mounjaro is not appropriate, or requires specialist input, if you:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>are pregnant, breastfeeding, or planning a pregnancy soon;</li>
            <li>
              have a personal or family history of medullary thyroid carcinoma,
              or Multiple Endocrine Neoplasia syndrome type 2 (MEN&nbsp;2);
            </li>
            <li>have a history of pancreatitis;</li>
            <li>have severe gastrointestinal disease, including gastroparesis;</li>
            <li>have severe kidney or liver impairment;</li>
            <li>have diabetic retinopathy (if you have type 2 diabetes);</li>
            <li>are under 18 years of age.</li>
          </ul>
          <p>
            Your prescriber will review all of this during your consultation.
            Be honest and complete in your answers — incomplete information is
            the most common reason a consultation has to be paused for clarifying
            questions.
          </p>
        </div>
      </section>

      {/* Interactions */}
      <section id="interactions" className="bg-roots-cream-2/40 py-12 md:py-16">
        <div className="page-container">
          <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-roots-navy/85">
            <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
              Interactions with other medicines
            </h2>
            <p>
              Mounjaro slows stomach emptying, which can affect how quickly
              other oral medicines are absorbed. Particular attention is needed
              for:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Combined hormonal contraceptives:</strong> the
                manufacturer recommends switching to a non-oral form, or adding
                a barrier method, for four weeks after starting Mounjaro and
                for four weeks after each dose increase.
              </li>
              <li>
                <strong>Insulin and sulfonylureas</strong> (in people with
                type 2 diabetes): dose adjustment may be needed to reduce the
                risk of hypoglycaemia.
              </li>
              <li>
                <strong>Warfarin and other oral medicines with a narrow
                therapeutic index:</strong> increased monitoring may be
                appropriate.
              </li>
            </ul>
            <p>
              Tell your prescriber about every medicine you take, including
              over-the-counter products, supplements and herbal remedies.
            </p>
          </div>
        </div>
      </section>

      {/* Expectations */}
      <section id="expectations" className="page-container py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-roots-navy/85">
          <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
            What to expect on treatment
          </h2>
          <p>
            The SURMOUNT-1 clinical trial reported average weight reductions of
            around 15–22% of starting body weight over 72 weeks of treatment,
            depending on the maintenance dose reached. Individual results vary
            significantly — some patients achieve more, some less. Weight loss
            is most pronounced when treatment is combined with dietary change
            and increased physical activity.
          </p>
          <p>
            The first weeks at each new dose typically carry the highest
            side-effect burden, mostly gastrointestinal, which usually settles
            within one to two weeks. If side effects are not manageable, your
            prescriber may keep you on a lower dose for longer or stop
            treatment altogether — neither result is a failure of the
            consultation.
          </p>
          <p>
            Stopping treatment is associated with appetite returning to its
            pre-treatment level. Sustainable lifestyle change is the only way
            to maintain weight loss after treatment ends, and is a core part of
            the conversation your prescriber will have with you.
          </p>
        </div>
      </section>

      {/* Alternatives */}
      <section id="alternatives" className="bg-roots-cream-2/40 py-12 md:py-16">
        <div className="page-container">
          <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-roots-navy/85">
            <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
              Mounjaro compared with other weight loss medicines
            </h2>
            <p>
              Mounjaro (tirzepatide) is one of several GLP-1-based medicines
              licensed in the UK for weight management. The most commonly asked
              comparison is with Wegovy (semaglutide). Both are once-weekly
              injections; both act on the GLP-1 receptor; only Mounjaro also
              activates the GIP receptor.
            </p>
            <p>
              The SURMOUNT-5 head-to-head trial reported greater average weight
              loss on tirzepatide than on semaglutide at the doses tested. The
              side-effect profile is broadly similar, dominated by
              gastrointestinal symptoms during dose escalation. Suitability of
              either medicine for you depends on your full medical history and
              the prescriber's assessment.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/guides/mounjaro-vs-wegovy"
                className="inline-flex items-center rounded-[var(--radius-btn)] border border-roots-green/30 bg-roots-cream-2/60 px-4 py-2 text-sm font-medium text-roots-green underline-offset-2 hover:underline"
              >
                Read: Mounjaro vs Wegovy
              </Link>
              <Link
                href="/guides/mounjaro-vs-ozempic"
                className="inline-flex items-center rounded-[var(--radius-btn)] border border-roots-green/30 bg-roots-cream-2/60 px-4 py-2 text-sm font-medium text-roots-green underline-offset-2 hover:underline"
              >
                Read: Mounjaro vs Ozempic
              </Link>
              <Link
                href="/guides/how-does-mounjaro-work"
                className="inline-flex items-center rounded-[var(--radius-btn)] border border-roots-green/30 bg-roots-cream-2/60 px-4 py-2 text-sm font-medium text-roots-green underline-offset-2 hover:underline"
              >
                Read: How does Mounjaro work
              </Link>
              <Link
                href="/guides/mounjaro-side-effects-uk"
                className="inline-flex items-center rounded-[var(--radius-btn)] border border-roots-green/30 bg-roots-cream-2/60 px-4 py-2 text-sm font-medium text-roots-green underline-offset-2 hover:underline"
              >
                Read: Mounjaro side effects
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our service */}
      <section id="our-service" className="page-container py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-roots-navy/85">
          <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
            How a Mounjaro consultation works with Roots
          </h2>
          <ol className="list-decimal space-y-3 pl-5">
            <li>
              <strong>Complete the medical questionnaire.</strong> Around 10
              minutes. Covers weight and height (we calculate BMI), medical
              history, current medications and lifestyle. You will be asked to
              upload a recent photograph and proof of identity so the prescriber
              can verify you.
            </li>
            <li>
              <strong>Prescriber review.</strong> A UK GPhC-registered
              pharmacist independent prescriber reviews every consultation in
              full. There is no auto-approval. If anything is unclear, the
              prescriber will message you for more information.
            </li>
            <li>
              <strong>Decision.</strong> If treatment is appropriate, payment
              is taken for the medicine and an order is created. If not, you
              will not be charged for the medicine and the prescriber's reasoning
              will be explained to you.
            </li>
            <li>
              <strong>Dispense and delivery.</strong> Your medicine is dispensed
              by our GPhC-registered pharmacy partner and dispatched the same
              working day in cold-chain insulated packaging. Royal Mail Tracked 24
              delivery is included.
            </li>
            <li>
              <strong>Aftercare.</strong> Your account holds a record of every
              consultation, every approval, every dispatch. Repeat consultations
              are streamlined — you will not be asked to re-enter information
              that has not changed.
            </li>
          </ol>
          <div className="mt-2">
            <StartCTA />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faqs" className="bg-roots-cream-2/40 py-12 md:py-16">
        <div className="page-container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
              Frequently asked questions
            </h2>
            <div className="mt-8 space-y-4">
              {MOUNJARO_FAQS.map((faq, i) => (
                <details
                  key={i}
                  className="glass-card rounded-[var(--radius-card)] p-5"
                >
                  <summary className="cursor-pointer text-base font-medium text-roots-navy">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-roots-navy/80">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA + safety footer */}
      <section className="page-container py-16 md:py-20">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
            Ready to start your consultation?
          </h2>
          <p className="text-base leading-relaxed text-roots-navy/80">
            A qualified UK prescriber will review your answers and contact you
            if anything needs clarifying. You are not charged for the medicine
            unless your consultation is approved.
          </p>
          <div className="flex flex-col items-center gap-3">
            <StartCTA />
            <p className="text-xs text-roots-navy/60">
              Last clinically reviewed{" "}
              <time dateTime={CLINICAL_CONTENT_LAST_REVIEWED}>
                {new Date(CLINICAL_CONTENT_LAST_REVIEWED).toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "long", year: "numeric" }
                )}
              </time>{" "}
              by {MEDICAL_REVIEWER.name}, {MEDICAL_REVIEWER.qualification} (
              {MEDICAL_REVIEWER.registerType} {MEDICAL_REVIEWER.registerNumber}).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
