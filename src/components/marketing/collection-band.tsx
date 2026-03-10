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
              {/* Vivid background pattern — cream on green */}
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <svg viewBox="0 0 400 300" fill="none" className="h-full w-full" stroke="#fdf0d5" strokeLinecap="round" strokeLinejoin="round">
                  {/* Plus sign — top right */}
                  <g opacity="0.15" strokeWidth="1.5">
                    <line x1="340" y1="36" x2="340" y2="60" />
                    <line x1="328" y1="48" x2="352" y2="48" />
                  </g>
                  {/* Botanical leaf — right middle */}
                  <g transform="translate(310, 170) rotate(-10)" opacity="0.14" strokeWidth="1.4">
                    <path d="M20 40C20 40 2 32 2 16C2 2 14 0 20 0C26 0 38 2 38 16C38 32 20 40 20 40Z" />
                    <path d="M20 40V6" />
                    <path d="M20 26C15 22 10 23 7 26" />
                    <path d="M20 16C25 12 30 13 33 16" />
                  </g>
                  {/* Droplet — top left */}
                  <g transform="translate(40, 30)" opacity="0.12" strokeWidth="1.4">
                    <path d="M14 2C14 2 2 16 2 22C2 30 7 34 14 34S26 30 26 22C26 16 14 2 14 2Z" />
                  </g>
                  {/* Capsule — bottom left */}
                  <g transform="translate(60, 220) rotate(-25)" opacity="0.12" strokeWidth="1.4">
                    <rect x="0" y="0" width="16" height="36" rx="8" />
                    <line x1="0" y1="18" x2="16" y2="18" />
                  </g>
                  {/* Circles */}
                  <circle cx="380" cy="130" r="4" opacity="0.12" strokeWidth="1.3" />
                  <circle cx="200" cy="40" r="3" opacity="0.10" strokeWidth="1.3" />
                  {/* Flowing arc */}
                  <path d="M-10 260Q120 210 260 270" opacity="0.08" strokeWidth="1.2" />
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
