import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Roots Pharmacy — a GPhC-registered pharmacy offering clinician-led weight loss and premium wellness supplements.",
};

export default function AboutPage() {
  return (
    <div className="bg-roots-cream">
      <section className="bg-roots-green py-20 text-center text-roots-cream md:py-28">
        <div className="page-container">
          <h1 className="text-[38px] font-medium leading-tight md:text-[56px]">About Roots Pharmacy</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-roots-cream/80">
            We believe effective healthcare should be accessible, personal, and delivered with care.
          </p>
        </div>
      </section>

      <section className="page-container py-16 md:py-20">
        <div className="mx-auto max-w-3xl space-y-8 text-lg leading-relaxed text-roots-navy/80">
          <p>
            Roots Pharmacy is a GPhC-registered UK pharmacy specialising in clinician-led weight
            management programmes and premium wellness supplements. We combine clinical expertise
            with a modern, patient-first approach.
          </p>
          <p>
            Every Mounjaro consultation is reviewed by a qualified prescriber who assesses your
            medical history, current medications, and suitability for treatment. We never
            auto-approve — your safety is our priority.
          </p>
          <p>
            Our supplement range is curated for quality and efficacy. We stock only products we
            believe in, sourced from trusted manufacturers with transparent ingredient lists.
          </p>
          <p>
            Based in the UK, we deliver nationwide with tracked shipping through Royal Mail. Every
            order is handled with care, discretion, and attention to detail.
          </p>
        </div>
      </section>
    </div>
  );
}
