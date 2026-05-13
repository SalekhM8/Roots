import type { Metadata } from "next";
import { GuideLayout } from "@/components/seo/guide-layout";

const TITLE = "How Mounjaro works: the science of GLP-1 and GIP";
const DESC =
  "Mounjaro (tirzepatide) is the first dual GLP-1 and GIP receptor agonist licensed in the UK. A plain-English explanation of what that means and why it matters.";

export const metadata: Metadata = {
  title: `${TITLE} | Roots Pharmacy`,
  description: DESC,
  alternates: { canonical: "/guides/how-does-mounjaro-work" },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: "/guides/how-does-mounjaro-work",
    type: "article",
    locale: "en_GB",
    siteName: "Roots Pharmacy",
  },
  robots: { index: true, follow: true },
};

const FAQS = [
  {
    question: "How fast does Mounjaro start working?",
    answer:
      "Most patients notice reduced appetite within the first week or two of starting at 2.5mg. Meaningful weight loss usually becomes apparent after four to eight weeks once you have moved to the 5mg maintenance dose. The full effect of treatment is typically assessed at 6–12 months.",
  },
  {
    question: "Does Mounjaro work without dieting?",
    answer:
      "Mounjaro reduces appetite, which makes a lower calorie intake easier to maintain — but it is licensed as an adjunct to a reduced-calorie diet and increased physical activity. Weight loss is largest when treatment is combined with sustainable lifestyle change. Stopping treatment without behavioural change is associated with weight regain.",
  },
  {
    question: "Why does Mounjaro affect blood sugar?",
    answer:
      "Both GLP-1 and GIP are incretin hormones — they amplify the body's natural insulin response after eating. By activating both receptors, tirzepatide improves glucose-dependent insulin secretion. This is why the same molecule is also licensed for type 2 diabetes.",
  },
];

export default function GuidePage() {
  return (
    <GuideLayout
      slug="how-does-mounjaro-work"
      title={TITLE}
      description={DESC}
      about={["Obesity"]}
      faqs={FAQS}
    >
      <h2 className="text-3xl font-medium text-roots-green">
        The two hormones Mounjaro mimics
      </h2>
      <p>
        Mounjaro contains the active ingredient <strong>tirzepatide</strong>,
        a synthetic peptide designed to activate two natural human gut
        hormone receptors at the same time: <strong>GLP-1</strong>{" "}
        (glucagon-like peptide 1) and <strong>GIP</strong>{" "}
        (glucose-dependent insulinotropic polypeptide). Both hormones are
        released after eating and play a role in appetite regulation, gastric
        emptying and the body&apos;s post-meal insulin response.
      </p>

      <h2 className="text-3xl font-medium text-roots-green">
        What activating the GLP-1 receptor does
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Slows the rate at which food leaves the stomach.</li>
        <li>Increases the feeling of fullness after eating.</li>
        <li>Reduces appetite signalling in the brain.</li>
        <li>
          Improves glucose-dependent insulin secretion — insulin is released
          in response to a meal, not at random.
        </li>
      </ul>

      <h2 className="text-3xl font-medium text-roots-green">
        What activating the GIP receptor adds
      </h2>
      <p>
        GIP works alongside GLP-1 in the body&apos;s natural incretin response.
        Activating GIP appears to enhance the appetite-suppressing effect of
        GLP-1, improve how the body handles fats and lipids, and may reduce
        some of the gastrointestinal side effects that come with high-dose
        GLP-1-only treatment. The dual receptor activation is what makes
        tirzepatide pharmacologically distinct from semaglutide.
      </p>

      <h2 className="text-3xl font-medium text-roots-green">
        Why this matters in practice
      </h2>
      <p>
        For most patients, the combined effect of GLP-1 and GIP activation is
        a meaningful reduction in calorie intake without conscious dieting,
        better post-meal blood sugar control, and a degree of satiety that
        lifestyle change alone is rarely able to produce.
      </p>
      <p>
        Mounjaro is not a metabolism booster, not a fat burner and not a
        cosmetic medicine. It is a pharmacological tool that makes
        sustainable dietary change easier to achieve and easier to maintain.
        The long-term outcomes depend on what happens during treatment, not
        only on the medicine itself.
      </p>

      <h2 className="text-3xl font-medium text-roots-green">
        What it does not do
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>It does not directly burn fat.</li>
        <li>It does not change your basal metabolic rate.</li>
        <li>It does not treat the psychological drivers of eating.</li>
        <li>
          It does not maintain weight loss after it is stopped — appetite
          tends to return to its pre-treatment level.
        </li>
      </ul>

      <p className="text-sm text-roots-navy/60">
        Sources: SmPC for Mounjaro (eMC); NICE TA1026; BNF tirzepatide
        monograph; Frias et&nbsp;al. SURPASS-2 trial publication; Jastreboff
        et&nbsp;al. SURMOUNT-1 trial publication.
      </p>
    </GuideLayout>
  );
}
