import type { Metadata } from "next";
import { GuideLayout } from "@/components/seo/guide-layout";

const TITLE = "Mounjaro side effects: a UK clinical guide";
const DESC =
  "A complete, SmPC-sourced list of Mounjaro (tirzepatide) side effects — very common, common, less common and serious — with guidance on what to do about each.";

export const metadata: Metadata = {
  title: `${TITLE} | Roots Pharmacy`,
  description: DESC,
  alternates: { canonical: "/guides/mounjaro-side-effects-uk" },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: "/guides/mounjaro-side-effects-uk",
    type: "article",
    locale: "en_GB",
    siteName: "Roots Pharmacy",
  },
  robots: { index: true, follow: true },
};

const FAQS = [
  {
    question: "When do Mounjaro side effects usually start?",
    answer:
      "Most side effects appear during the first one to two weeks at any new dose, including the very first 2.5mg starter dose and each subsequent dose increase. They usually settle within 7–14 days as the body adjusts.",
  },
  {
    question: "What should I do if nausea is severe?",
    answer:
      "Eat smaller, more frequent meals, avoid greasy or very rich foods, stay well hydrated, and consider taking your dose in the evening so the worst of any nausea coincides with sleep. If nausea is persistent, severe, or accompanied by vomiting that prevents fluid intake, contact your prescriber.",
  },
  {
    question: "What are the warning signs I should not ignore?",
    answer:
      "Seek urgent medical advice for severe upper abdominal pain (especially if it radiates to the back), persistent vomiting, signs of an allergic reaction (swelling of the face, lips, tongue or throat; difficulty breathing), severe or persistent yellow stools or jaundice, or any new visual disturbance if you have type 2 diabetes.",
  },
  {
    question: "Will side effects get worse at higher doses?",
    answer:
      "Side effects tend to recur briefly after each dose increase and are dose-dependent in frequency — higher doses carry a higher risk. Most patients tolerate higher doses better than the first 2.5mg step because the body has already adjusted to tirzepatide by then.",
  },
];

export default function GuidePage() {
  return (
    <GuideLayout
      slug="mounjaro-side-effects-uk"
      title={TITLE}
      description={DESC}
      about={["Obesity"]}
      faqs={FAQS}
    >
      <h2 className="text-3xl font-medium text-roots-green">
        How to read this guide
      </h2>
      <p>
        Side effects in the UK Summary of Product Characteristics (SmPC) are
        categorised by frequency:{" "}
        <strong>very common</strong> (more than 1 in 10 patients),{" "}
        <strong>common</strong> (1 in 10 to 1 in 100),{" "}
        <strong>uncommon</strong> (1 in 100 to 1 in 1000), and{" "}
        <strong>rare</strong> (1 in 1000 to 1 in 10&nbsp;000). The list below
        is summarised. The full and authoritative list is in the SmPC and
        the Patient Information Leaflet supplied with every pen.
      </p>

      <h2 className="text-3xl font-medium text-roots-green">
        Very common side effects
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Nausea</li>
        <li>Diarrhoea</li>
        <li>Vomiting</li>
        <li>Constipation</li>
        <li>Reduced appetite</li>
      </ul>
      <p>
        These are mostly mild to moderate and most pronounced during the
        first weeks at each new dose. Practical management: eat smaller and
        more frequent meals, hydrate steadily through the day, avoid alcohol
        and very rich foods, and time your dose so any peak nausea
        coincides with sleep.
      </p>

      <h2 className="text-3xl font-medium text-roots-green">
        Common side effects
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Abdominal pain</li>
        <li>Indigestion, reflux, bloating, belching, flatulence</li>
        <li>Fatigue</li>
        <li>Injection-site reactions (redness, itching)</li>
        <li>Dizziness</li>
        <li>Headache</li>
        <li>Hair loss (uncommonly reported)</li>
        <li>Hypoglycaemia — particularly when combined with insulin or sulfonylureas in patients with type 2 diabetes</li>
        <li>Heart rate increase of around 1–3 beats per minute on average</li>
      </ul>

      <h2 className="text-3xl font-medium text-roots-green">
        Less common but serious — seek urgent medical advice
      </h2>
      <p>
        These effects are uncommon, but each is potentially serious. If you
        experience any of them, stop the medicine and contact 111, your GP,
        or A&amp;E depending on severity.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Acute pancreatitis</strong> — severe, persistent upper
          abdominal pain that may radiate to the back, often with nausea or
          vomiting. Treat as an emergency.
        </li>
        <li>
          <strong>Severe allergic reaction (anaphylaxis)</strong> — swelling
          of the face, lips, tongue or throat; difficulty breathing; severe
          rash. Call 999.
        </li>
        <li>
          <strong>Gallbladder problems</strong> — including gallstones and
          inflammation of the gallbladder. Symptoms: pain in the upper right
          abdomen, jaundice, pale stools.
        </li>
        <li>
          <strong>Severe dehydration</strong> — from persistent vomiting or
          diarrhoea. In severe cases this can affect kidney function.
        </li>
        <li>
          <strong>Worsening of diabetic retinopathy</strong> — in patients
          with type 2 diabetes. Any new visual change should be assessed.
        </li>
        <li>
          <strong>Suicidal thoughts or worsening mental health</strong> — a
          regulatory review is ongoing for GLP-1-based medicines. Any new or
          worsening mental health symptom should prompt contact with your GP
          or 111.
        </li>
      </ul>

      <h2 className="text-3xl font-medium text-roots-green">
        Reporting side effects
      </h2>
      <p>
        Suspected side effects should be reported to the MHRA via the{" "}
        <a
          href="https://yellowcard.mhra.gov.uk/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-roots-green underline underline-offset-2"
        >
          Yellow Card scheme
        </a>
        . Reporting helps the MHRA monitor the ongoing safety profile of the
        medicine. Reports can be made by patients, carers, or healthcare
        professionals.
      </p>

      <h2 className="text-3xl font-medium text-roots-green">
        When to stop the medicine and contact your prescriber
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Any symptom of a serious adverse effect listed above.</li>
        <li>Persistent vomiting or diarrhoea preventing fluid intake.</li>
        <li>Sudden or severe abdominal pain.</li>
        <li>Signs of pregnancy.</li>
        <li>Any side effect that is not settling after the first two weeks at a given dose.</li>
      </ul>

      <p className="text-sm text-roots-navy/60">
        Sources: eMC SmPC for Mounjaro; BNF tirzepatide monograph; NHS — About
        tirzepatide; MHRA Drug Safety Update on GLP-1 receptor agonists.
      </p>
    </GuideLayout>
  );
}
