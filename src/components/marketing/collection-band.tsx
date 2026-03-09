import { LinkButton } from "@/components/ui/link-button";

const collections = [
  {
    name: "Mounjaro Programme",
    description: "Clinician-led weight loss with tirzepatide injections",
    href: "/products/mounjaro",
    cta: "Start Consultation",
  },
  {
    name: "Wellness Supplements",
    description: "Premium supplements to support your health journey",
    href: "/collections/supplements",
    cta: "Browse Range",
  },
];

export default function CollectionBand() {
  return (
    <section className="bg-roots-green py-16 md:py-20">
      <div className="page-container">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {collections.map((collection) => (
            <div
              key={collection.name}
              className="relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-[var(--radius-hero)] border border-roots-line-soft p-8 md:p-10"
            >
              {/* Subtle background pattern */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden="true">
                <svg viewBox="0 0 400 300" fill="none" className="h-full w-full">
                  <circle cx="350" cy="50" r="120" stroke="currentColor" strokeWidth="1" className="text-roots-cream" />
                  <circle cx="350" cy="50" r="90" stroke="currentColor" strokeWidth="1" className="text-roots-cream" />
                  <rect x="20" y="180" width="100" height="80" rx="8" stroke="currentColor" strokeWidth="1" className="text-roots-cream" />
                </svg>
              </div>

              <h3 className="relative mb-3 text-[28px] font-medium leading-tight text-roots-cream md:text-[36px]">
                {collection.name}
              </h3>
              <p className="relative mb-6 max-w-md text-base text-roots-cream/70">
                {collection.description}
              </p>
              <LinkButton href={collection.href} variant="outline" className="relative w-fit">
                {collection.cta}
              </LinkButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
