import type { Metadata } from "next";
import { GuideLayout } from "@/components/seo/guide-layout";

const TITLE = "Mounjaro vs Ozempic: what's actually different";
const DESC =
  "Ozempic is licensed in the UK for type 2 diabetes, not weight loss. Here is what that means for patients comparing Ozempic and Mounjaro for weight management.";

export const metadata: Metadata = {
  title: `${TITLE} | Roots Pharmacy`,
  description: DESC,
  alternates: { canonical: "/guides/mounjaro-vs-ozempic" },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: "/guides/mounjaro-vs-ozempic",
    type: "article",
    locale: "en_GB",
    siteName: "Roots Pharmacy",
  },
  robots: { index: true, follow: true },
};

const FAQS = [
  {
    question: "Can I buy Ozempic for weight loss in the UK?",
    answer:
      "No. Ozempic (semaglutide) is licensed in the UK for type 2 diabetes only. The licensed semaglutide product for weight management is Wegovy. Prescribing Ozempic for weight loss is off-label and is strongly discouraged because it diverts supply away from people with diabetes who depend on the medicine. UK regulators have issued specific guidance on this.",
  },
  {
    question: "Is Mounjaro just Ozempic for weight loss?",
    answer:
      "No. They are different molecules. Ozempic / Wegovy contain semaglutide — a single GLP-1 receptor agonist. Mounjaro contains tirzepatide — a dual GLP-1 and GIP receptor agonist. The same molecule (tirzepatide) is also licensed for type 2 diabetes under the same brand name, Mounjaro.",
  },
  {
    question: "Which is more effective for weight loss?",
    answer:
      "Wegovy (the licensed semaglutide product for weight loss) and Mounjaro are both highly effective. SURMOUNT-5, a head-to-head trial of tirzepatide against semaglutide, reported greater average weight loss on tirzepatide at the doses tested. Direct comparison with Ozempic is not appropriate because Ozempic is not licensed or dose-optimised for weight loss.",
  },
];

export default function GuidePage() {
  return (
    <GuideLayout
      slug="mounjaro-vs-ozempic"
      title={TITLE}
      description={DESC}
      about={["Obesity", "Type 2 diabetes"]}
      faqs={FAQS}
    >
      <h2 className="text-3xl font-medium text-roots-green">
        The short answer
      </h2>
      <p>
        Mounjaro and Ozempic are different medicines used for different
        primary indications in the UK. Mounjaro (tirzepatide) is licensed
        for both chronic weight management and type 2 diabetes. Ozempic
        (semaglutide) is licensed in the UK for type 2 diabetes only. The
        licensed semaglutide product for weight management is Wegovy.
      </p>

      <div className="glass-warning rounded-[var(--radius-card)] p-5 text-sm">
        <p className="font-semibold text-roots-navy">
          Ozempic is not licensed for weight loss in the UK.
        </p>
        <p className="mt-1 text-roots-navy/80">
          The MHRA, NHS England and the GPhC have all issued statements
          urging clinicians and pharmacies not to prescribe or supply Ozempic
          for weight management. Off-label demand has caused supply shortages
          for people with diabetes who depend on the medicine. We do not
          prescribe Ozempic for weight loss.
        </p>
      </div>

      <h2 className="text-3xl font-medium text-roots-green">
        What each medicine actually is
      </h2>
      <p>
        <strong>Ozempic</strong> is the brand name for semaglutide at the
        doses (0.25–2.0&nbsp;mg) licensed for type 2 diabetes. It is a
        single GLP-1 receptor agonist.
      </p>
      <p>
        <strong>Wegovy</strong> is the brand name for semaglutide at the
        higher doses (up to 2.4&nbsp;mg) licensed specifically for weight
        management.
      </p>
      <p>
        <strong>Mounjaro</strong> is the brand name for tirzepatide. The
        same brand name and the same molecule are licensed in the UK for
        both type 2 diabetes and chronic weight management. Tirzepatide is
        a dual GLP-1 and GIP receptor agonist.
      </p>

      <h2 className="text-3xl font-medium text-roots-green">
        Why Mounjaro is the licensed comparison, not Ozempic
      </h2>
      <p>
        When patients ask about &quot;Ozempic for weight loss&quot;, the
        clinically and legally appropriate UK comparison is with Wegovy or
        Mounjaro — the two products licensed for weight management. Choosing
        between them is a prescriber decision based on medical history,
        BMI, comorbidities, and individual response.
      </p>

      <h2 className="text-3xl font-medium text-roots-green">
        What we do
      </h2>
      <p>
        Roots Pharmacy offers a consultation for the UK-licensed weight
        management medicine Mounjaro. We do not prescribe Ozempic or any
        other off-label medicine for weight loss. Every consultation is
        reviewed by a UK GPhC-registered pharmacist independent prescriber.
      </p>

      <p className="text-sm text-roots-navy/60">
        Sources: SmPC for Ozempic, Wegovy and Mounjaro; MHRA Drug Safety
        Update on GLP-1 receptor agonist supply; NHS England guidance on
        off-label prescribing of GLP-1 medicines; NICE TA875 and TA1026.
      </p>
    </GuideLayout>
  );
}
