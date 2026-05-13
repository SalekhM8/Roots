import type { Metadata } from "next";
import Link from "next/link";

/**
 * Guides index. Topical cluster hub for clinical / decision-support
 * content surrounding the Mounjaro consultation service. Each guide is a
 * standalone MedicalWebPage with its own schema stack and is linked to
 * from the main /treatments/mounjaro hub.
 */

const GUIDES = [
  {
    slug: "mounjaro-vs-wegovy",
    title: "Mounjaro vs Wegovy: a UK comparison",
    description:
      "How tirzepatide (Mounjaro) and semaglutide (Wegovy) differ in mechanism, weight-loss data, side-effect profile and UK availability.",
  },
  {
    slug: "mounjaro-vs-ozempic",
    title: "Mounjaro vs Ozempic: what's actually different",
    description:
      "Ozempic is licensed for type 2 diabetes, not weight loss. Here is what that means in practice, and why Mounjaro is the licensed weight-management option.",
  },
  {
    slug: "how-does-mounjaro-work",
    title: "How Mounjaro works: the science of GLP-1 and GIP",
    description:
      "Mounjaro is the first dual GLP-1/GIP receptor agonist licensed in the UK. A plain-English explanation of what that means.",
  },
  {
    slug: "mounjaro-side-effects-uk",
    title: "Mounjaro side effects: a UK clinical guide",
    description:
      "A complete, SmPC-sourced list of Mounjaro side effects — common, less common and serious — with practical guidance on what to do about each.",
  },
];

export const metadata: Metadata = {
  title: "Mounjaro & weight loss guides | Roots Pharmacy",
  description:
    "Clinical guides on Mounjaro (tirzepatide), comparisons with other weight loss medicines, and what to expect on treatment. Reviewed by a UK GPhC-registered pharmacist.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Mounjaro & weight loss guides | Roots Pharmacy",
    description:
      "Clinical guides on Mounjaro (tirzepatide), comparisons with other weight loss medicines, and what to expect on treatment.",
    url: "/guides",
    type: "website",
    locale: "en_GB",
    siteName: "Roots Pharmacy",
  },
  robots: { index: true, follow: true },
};

export default function GuidesIndexPage() {
  return (
    <div className="bg-roots-cream">
      <section className="bg-roots-green text-roots-cream">
        <div className="page-container py-20 md:py-28">
          <h1 className="text-[38px] font-medium leading-tight md:text-[56px]">
            Clinical guides
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-roots-cream/85">
            Independent, sourced information about Mounjaro and weight
            management treatments in the UK. Reviewed by a GPhC-registered
            pharmacist.
          </p>
        </div>
      </section>

      <section className="page-container py-12 md:py-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="glass-card-strong group rounded-[var(--radius-card)] p-6 transition-shadow hover:shadow-lg"
            >
              <h2 className="text-2xl font-medium text-roots-navy">
                {g.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-roots-navy/80">
                {g.description}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-roots-green underline-offset-2 group-hover:underline">
                Read the guide →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
