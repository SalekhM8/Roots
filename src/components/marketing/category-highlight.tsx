import Link from "next/link";

const categories = [
  {
    name: "Weight Loss",
    slug: "weight-loss",
    description: "Clinician-led programmes",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
        <path d="M16 4L10 14H22L16 4Z" />
        <path d="M8 18C8 24 11.6 28 16 28S24 24 24 18H8Z" />
      </svg>
    ),
  },
  {
    name: "Women's Health",
    slug: "womens-health",
    description: "Targeted support",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
        <circle cx="16" cy="12" r="8" />
        <line x1="16" y1="20" x2="16" y2="30" />
        <line x1="12" y1="26" x2="20" y2="26" />
      </svg>
    ),
  },
  {
    name: "Sleep & Recovery",
    slug: "sleep-recovery",
    description: "Rest better, recover faster",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
        <path d="M26 16C26 22 21 28 14 28C8 28 4 23 4 16C10 16 14 12 14 6C20 6 26 10 26 16Z" />
      </svg>
    ),
  },
  {
    name: "Hydration",
    slug: "hydration",
    description: "Electrolytes & balance",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
        <path d="M16 3C16 3 6 15 6 21C6 27 10.5 29 16 29S26 27 26 21C26 15 16 3 16 3Z" />
      </svg>
    ),
  },
  {
    name: "General Health",
    slug: "general-health",
    description: "Daily wellness essentials",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
        <path d="M16 3L20 11H28L22 17L24 26L16 21L8 26L10 17L4 11H12L16 3Z" />
      </svg>
    ),
  },
];

export default function CategoryHighlight() {
  return (
    <section className="bg-roots-cream py-16 md:py-20">
      <div className="page-container">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-roots-green/60">
          Care For Your Health
        </h2>
        <p className="text-display mb-10 text-[30px] font-medium leading-tight text-roots-green md:text-[42px] lg:text-[56px]">
          Natural self-care
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/collections/${cat.slug}`}
              className="group flex flex-col items-center justify-end rounded-[var(--radius-card)] bg-roots-cream-2 p-6 pb-8 transition-all duration-200 hover:shadow-sm"
              style={{ minHeight: "220px" }}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-roots-green/10 text-roots-green/40" aria-hidden="true">
                {cat.icon}
              </div>
              <span className="text-center text-base font-medium text-roots-green transition-opacity group-hover:opacity-80">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
