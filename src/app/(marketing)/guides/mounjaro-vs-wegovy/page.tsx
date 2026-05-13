import type { Metadata } from "next";
import { GuideLayout } from "@/components/seo/guide-layout";

const TITLE = "Mounjaro vs Wegovy: a UK comparison";
const DESC =
  "Tirzepatide (Mounjaro) and semaglutide (Wegovy) are the two main licensed weight loss injections in the UK. Here is how they compare across mechanism, weight-loss data, side effects and availability.";

export const metadata: Metadata = {
  title: `${TITLE} | Roots Pharmacy`,
  description: DESC,
  alternates: { canonical: "/guides/mounjaro-vs-wegovy" },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: "/guides/mounjaro-vs-wegovy",
    type: "article",
    locale: "en_GB",
    siteName: "Roots Pharmacy",
  },
  robots: { index: true, follow: true },
};

const FAQS = [
  {
    question: "Is Mounjaro more effective than Wegovy?",
    answer:
      "Head-to-head data from the SURMOUNT-5 trial reported greater average weight loss on tirzepatide than on semaglutide at the doses tested. Both are highly effective compared to lifestyle intervention alone. Individual results vary substantially.",
  },
  {
    question: "Can I switch from Wegovy to Mounjaro?",
    answer:
      "Yes, with prescriber supervision. Switching is not a simple dose-for-dose swap because the two medicines act on different receptor combinations. Your prescriber will restart you on the 2.5mg Mounjaro tolerability step and re-escalate from there.",
  },
  {
    question: "Are the side effects the same?",
    answer:
      "Broadly similar — both are dominated by gastrointestinal side effects during dose escalation, mostly nausea, constipation and diarrhoea. Individual tolerability varies, and switching medicines is a reasonable option if one is poorly tolerated.",
  },
  {
    question: "Which is better for type 2 diabetes?",
    answer:
      "Both improve blood-sugar control. Tirzepatide is licensed as Mounjaro for weight management and as the same molecule for type 2 diabetes. Semaglutide is licensed as Wegovy for weight management and as Ozempic for diabetes. Your prescriber chooses based on your full medical picture.",
  },
];

export default function GuidePage() {
  return (
    <GuideLayout
      slug="mounjaro-vs-wegovy"
      title={TITLE}
      description={DESC}
      about={["Obesity", "Overweight"]}
      faqs={FAQS}
    >
      <h2 className="text-3xl font-medium text-roots-green">
        The short answer
      </h2>
      <p>
        Both Mounjaro (tirzepatide) and Wegovy (semaglutide) are once-weekly
        injections licensed by the MHRA for chronic weight management in
        adults. Both are prescription-only medicines and both must be
        prescribed in the context of a reduced-calorie diet and increased
        physical activity. The most important difference is mechanism:
        Wegovy is a single GLP-1 receptor agonist, while Mounjaro acts on
        both GLP-1 and GIP receptors.
      </p>

      <h2 className="text-3xl font-medium text-roots-green">
        Mechanism of action
      </h2>
      <p>
        <strong>Semaglutide (Wegovy)</strong> mimics GLP-1, a gut hormone
        that slows gastric emptying, suppresses appetite signalling and
        improves glucose-dependent insulin secretion.{" "}
        <strong>Tirzepatide (Mounjaro)</strong> mimics both GLP-1 and GIP.
        GIP is a second gut hormone that, in combination with GLP-1
        receptor activation, appears to produce a larger effect on appetite
        and on metabolic function than GLP-1 alone.
      </p>

      <h2 className="text-3xl font-medium text-roots-green">
        Weight loss data
      </h2>
      <p>
        In the SURMOUNT-1 trial, tirzepatide produced average body weight
        reductions of around 15% at the 5&nbsp;mg maintenance dose, around
        19% at 10&nbsp;mg, and around 21% at 15&nbsp;mg, over 72 weeks. In
        the STEP-1 trial, semaglutide 2.4&nbsp;mg produced average body
        weight reductions of around 15% over 68 weeks. The SURMOUNT-5
        head-to-head trial reported greater average weight loss on
        tirzepatide than on semaglutide at the doses tested. Trial
        populations and protocols differ, so results are not directly
        comparable between trials, but the head-to-head signal is the
        relevant one for most clinical decisions.
      </p>

      <h2 className="text-3xl font-medium text-roots-green">
        Side effects
      </h2>
      <p>
        Side-effect profiles are very similar. Both medicines cause
        gastrointestinal symptoms — nausea, vomiting, diarrhoea,
        constipation and reduced appetite — most commonly during the first
        weeks at each new dose. Serious effects that apply to both classes
        include acute pancreatitis, severe allergic reaction, gallbladder
        problems, and (in patients with type 2 diabetes) worsening of
        diabetic retinopathy. Suspected side effects should be reported via
        the MHRA{" "}
        <a
          href="https://yellowcard.mhra.gov.uk/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-roots-green underline underline-offset-2"
        >
          Yellow Card scheme
        </a>
        .
      </p>

      <h2 className="text-3xl font-medium text-roots-green">
        Dosing
      </h2>
      <p>
        Both medicines start at a low tolerability step and escalate every
        four weeks. Mounjaro starts at 2.5&nbsp;mg and steps in 2.5&nbsp;mg
        increments to a maximum of 15&nbsp;mg. Wegovy starts at 0.25&nbsp;mg
        and steps through 0.5, 1.0, 1.7 and 2.4&nbsp;mg. In both cases the
        prescriber decides on escalation based on response and tolerability,
        not on patient preference.
      </p>

      <h2 className="text-3xl font-medium text-roots-green">
        UK availability
      </h2>
      <p>
        Both are licensed by the MHRA. Both are available through specialist
        NHS weight-management services where eligibility criteria are met,
        and through private prescribers including online pharmacies regulated
        by the GPhC. Waiting lists in the NHS are long in many areas; many
        patients access tirzepatide privately for that reason.
      </p>

      <h2 className="text-3xl font-medium text-roots-green">
        Which one is right for me?
      </h2>
      <p>
        Choice between Mounjaro and Wegovy depends on your full medical
        history, your previous experience with weight management medicines,
        any contraindications you carry, and the prescriber&apos;s clinical
        judgement. Both are appropriate first-line options for the right
        patient. Neither is suitable for everyone.
      </p>

      <p className="text-sm text-roots-navy/60">
        Sources: SmPC for Mounjaro and Wegovy; NICE TA875 (semaglutide); NICE
        TA1026 (tirzepatide); SURMOUNT-1, SURMOUNT-5 and STEP-1 trial
        publications; BNF tirzepatide and semaglutide monographs.
      </p>
    </GuideLayout>
  );
}
