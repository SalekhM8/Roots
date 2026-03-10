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
              {/* Background pattern — cream Lucide icons on green */}
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <svg viewBox="0 0 400 300" fill="none" className="h-full w-full" stroke="#fdf0d5" strokeLinecap="round" strokeLinejoin="round">
                  {/* Leaf — top right */}
                  <g transform="translate(320, 30) scale(2)" opacity="0.15" strokeWidth="0.8">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </g>
                  {/* Heart Pulse — bottom left */}
                  <g transform="translate(30, 210) scale(2)" opacity="0.14" strokeWidth="0.8">
                    <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
                    <path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
                  </g>
                  {/* Pill — top left */}
                  <g transform="translate(30, 20) scale(1.8) rotate(20)" opacity="0.13" strokeWidth="0.8">
                    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                    <path d="m8.5 8.5 7 7" />
                  </g>
                  {/* Shield Plus — right middle */}
                  <g transform="translate(330, 150) scale(1.8)" opacity="0.13" strokeWidth="0.8">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="M9 12h6" />
                    <path d="M12 9v6" />
                  </g>
                  {/* Accent circles */}
                  <circle cx="380" cy="130" r="4" opacity="0.12" strokeWidth="1.3" />
                  <circle cx="200" cy="40" r="3" opacity="0.10" strokeWidth="1.3" />
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
