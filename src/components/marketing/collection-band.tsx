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
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <svg viewBox="0 0 400 300" fill="none" className="h-full w-full" stroke="#fdf0d5" strokeLinecap="round" strokeLinejoin="round">
                  {/* Small plus */}
                  <g opacity="0.06" strokeWidth="1">
                    <line x1="340" y1="40" x2="340" y2="56" />
                    <line x1="332" y1="48" x2="348" y2="48" />
                  </g>
                  {/* Leaf */}
                  <g transform="translate(320, 200) scale(0.6)" opacity="0.07" strokeWidth="1.2">
                    <path d="M0 28C0 28 6-2 28-2S56 28 56 28C56 28 50 58 28 58S0 28 0 28Z" />
                    <path d="M28 58V10" />
                  </g>
                  {/* Dots */}
                  <circle cx="60" cy="60" r="3" opacity="0.05" strokeWidth="1" />
                  <circle cx="380" cy="140" r="2" opacity="0.05" strokeWidth="1" />
                  {/* Arc */}
                  <path d="M-10 250Q100 200 200 260" opacity="0.04" strokeWidth="1" />
                </svg>
              </div>

              <h3 className="text-display relative mb-3 text-[28px] font-medium leading-tight text-roots-cream md:text-[36px]">
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
