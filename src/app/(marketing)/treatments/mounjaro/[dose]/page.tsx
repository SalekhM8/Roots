import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LinkButton } from "@/components/ui/link-button";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  MedicalOrganizationJsonLd,
  MedicalWebPageJsonLd,
} from "@/components/seo/json-ld";
import { MedicalReviewByline } from "@/components/seo/medical-review-byline";
import { MetaPixelEvent } from "@/components/observability/meta-pixel-event";
import {
  CLINICAL_CONTENT_LAST_REVIEWED,
  MEDICAL_REVIEWER,
  MOUNJARO_HUB_PUBLISHED,
} from "@/lib/clinical/credentials";
import { MOUNJARO_DOSES } from "@/data/mounjaro";
import { ROUTES } from "@/lib/constants";

/**
 * Per-dose Mounjaro information page. Targets the long-tail queries
 * "mounjaro 5mg", "mounjaro 7.5mg uk", "tirzepatide 10mg side effects",
 * etc — every dose strength is a distinct keyword cluster that competitors
 * are already ranking for with thin SKU pages.
 *
 * Each page is framed as clinical information about a specific dose step,
 * not as a product listing. Pricing is not shown here — that lives behind
 * the consultation flow once a prescriber has decided you should be on
 * this dose.
 */

interface PageProps {
  params: Promise<{ dose: string }>;
}

export function generateStaticParams() {
  return MOUNJARO_DOSES.map((d) => ({ dose: d.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { dose: slug } = await params;
  const dose = MOUNJARO_DOSES.find((d) => d.slug === slug);
  if (!dose) return { title: "Not found" };

  const title = `Mounjaro ${dose.label} (Tirzepatide ${dose.label}) — UK Dose Information | Roots Pharmacy`;
  const description = `What Mounjaro ${dose.label} is, when it is appropriate, and what to expect. UK clinical consultation with a GPhC-registered pharmacist.`;
  const url = `/treatments/mounjaro/${dose.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      locale: "en_GB",
      siteName: "Roots Pharmacy",
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function MounjaroDosePage({ params }: PageProps) {
  const { dose: slug } = await params;
  const dose = MOUNJARO_DOSES.find((d) => d.slug === slug);
  if (!dose) notFound();

  const idx = MOUNJARO_DOSES.findIndex((d) => d.slug === slug);
  const prev = idx > 0 ? MOUNJARO_DOSES[idx - 1] : null;
  const next = idx < MOUNJARO_DOSES.length - 1 ? MOUNJARO_DOSES[idx + 1] : null;

  const urlPath = `/treatments/mounjaro/${dose.slug}`;
  const pageTitle = `Mounjaro ${dose.label} information`;
  const pageDesc = `Mounjaro ${dose.label} (tirzepatide ${dose.label}) — when it is used, what to expect, side-effect profile, and how to start a UK consultation.`;

  const doseFaqs = [
    {
      question: `When is Mounjaro ${dose.label} used?`,
      answer: dose.whenAppropriate,
    },
    {
      question: `What should I expect on Mounjaro ${dose.label}?`,
      answer: dose.whatToExpect,
    },
    {
      question: `Can I start treatment directly on Mounjaro ${dose.label}?`,
      answer:
        dose.step === 1
          ? "Yes — every patient new to tirzepatide starts at 2.5mg for the first four weeks, regardless of weight or BMI. This is the tolerability step."
          : `No. Treatment with tirzepatide always begins at 2.5mg for at least four weeks. Your prescriber escalates the dose in 2.5mg steps based on response and tolerability. ${dose.label} is reached only after completing the earlier steps successfully.`,
    },
    {
      question: `Is Mounjaro ${dose.label} the maximum dose?`,
      answer:
        dose.mg === 15
          ? "Yes. 15mg is the highest licensed dose of Mounjaro and is reserved for patients who require it and have tolerated stepwise escalation through every prior strength."
          : `No. The maximum licensed dose of Mounjaro is 15mg. ${dose.label} sits at step ${dose.step} of six. Your prescriber will only escalate beyond ${dose.label} if there is a clear continued clinical benefit and you are tolerating the medicine.`,
    },
  ];

  return (
    <div className="bg-roots-cream">
      <MetaPixelEvent
        event="ViewContent"
        contentName={`Mounjaro ${dose.label}`}
        contentCategory="Weight Loss"
        contentIds={[`mounjaro-${dose.slug}`]}
        contentType="product_group"
      />
      <MedicalOrganizationJsonLd />
      <MedicalWebPageJsonLd
        url={urlPath}
        name={pageTitle}
        description={pageDesc}
        datePublished={MOUNJARO_HUB_PUBLISHED}
        dateModified={CLINICAL_CONTENT_LAST_REVIEWED}
        reviewer={MEDICAL_REVIEWER}
        about={["Obesity", "Overweight"]}
        specialty="Endocrine"
      />
      <FaqJsonLd faqs={doseFaqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Mounjaro", href: "/treatments/mounjaro" },
          { name: dose.label },
        ]}
      />

      <section className="bg-roots-green text-roots-cream">
        <div className="page-container py-16 md:py-24">
          <nav aria-label="Breadcrumb" className="mb-8 text-xs text-roots-cream/70">
            <Link href="/" className="underline-offset-2 hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/treatments/mounjaro" className="underline-offset-2 hover:underline">
              Mounjaro
            </Link>
            <span className="mx-2">/</span>
            <span className="text-roots-cream">{dose.label}</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-wider text-roots-cream/70">
            Step {dose.step} of {MOUNJARO_DOSES.length}
          </p>
          <h1 className="mt-3 max-w-3xl text-[36px] font-medium leading-tight md:text-[52px]">
            Mounjaro {dose.label} (tirzepatide {dose.label})
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-roots-cream/85">
            {dose.positioning}
          </p>
          <div className="mt-8">
            <LinkButton href={ROUTES.consultation} variant="primary">
              Start your consultation
            </LinkButton>
          </div>
        </div>
      </section>

      <section className="page-container -mt-8">
        <MedicalReviewByline
          reviewer={MEDICAL_REVIEWER}
          lastReviewedIso={CLINICAL_CONTENT_LAST_REVIEWED}
        />
      </section>

      <section className="page-container py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-10 text-base leading-relaxed text-roots-navy/85">
          <div>
            <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
              When Mounjaro {dose.label} is appropriate
            </h2>
            <p className="mt-4">{dose.whenAppropriate}</p>
          </div>

          <div>
            <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
              What to expect at {dose.label}
            </h2>
            <p className="mt-4">{dose.whatToExpect}</p>
          </div>

          <div className="glass-warning rounded-[var(--radius-card)] p-5 text-sm">
            <p className="font-semibold text-roots-navy">
              Dose decisions are made by your prescriber.
            </p>
            <p className="mt-1 text-roots-navy/80">
              You cannot select a dose strength directly. Treatment always
              starts at 2.5&nbsp;mg and escalates in 2.5&nbsp;mg steps every
              four weeks at the earliest, based on how you respond and tolerate
              the medicine.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
              Side-effect profile at this dose
            </h2>
            <p className="mt-4">
              Mounjaro&apos;s side-effect profile is dose-dependent.
              Gastrointestinal effects (nausea, diarrhoea, vomiting,
              constipation, abdominal pain, reduced appetite) are most common
              during the first one to two weeks at any new dose and usually
              settle. Higher doses carry a higher risk of these effects.
              Serious effects — including acute pancreatitis, severe allergic
              reaction, and gallbladder problems — are uncommon but possible
              at every dose and require urgent medical advice.
            </p>
            <p className="mt-3">
              See the{" "}
              <Link
                href="/guides/mounjaro-side-effects-uk"
                className="text-roots-green underline underline-offset-2"
              >
                full side-effect guide
              </Link>{" "}
              for detail.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-medium text-roots-green md:text-4xl">
              Questions specific to {dose.label}
            </h2>
            <div className="mt-6 space-y-4">
              {doseFaqs.map((faq, i) => (
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

          {/* Prev / next dose navigation */}
          <div className="flex flex-col gap-4 border-t border-roots-navy/10 pt-8 sm:flex-row sm:justify-between">
            {prev ? (
              <Link
                href={`/treatments/mounjaro/${prev.slug}`}
                className="group inline-flex flex-col text-left"
              >
                <span className="text-xs uppercase tracking-wider text-roots-navy/50">
                  Previous step
                </span>
                <span className="text-xl font-medium text-roots-green underline-offset-2 group-hover:underline">
                  ← Mounjaro {prev.label}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/treatments/mounjaro/${next.slug}`}
                className="group inline-flex flex-col text-right sm:items-end"
              >
                <span className="text-xs uppercase tracking-wider text-roots-navy/50">
                  Next step
                </span>
                <span className="text-xl font-medium text-roots-green underline-offset-2 group-hover:underline">
                  Mounjaro {next.label} →
                </span>
              </Link>
            ) : (
              <span />
            )}
          </div>

          <div className="text-center">
            <Link
              href="/treatments/mounjaro"
              className="text-sm font-medium text-roots-green underline underline-offset-2"
            >
              Back to the Mounjaro hub
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
