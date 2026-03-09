import Link from "next/link";

const categories = [
  {
    name: "Weight Loss",
    slug: "weight-loss",
    description: "Clinician-led programmes",
  },
  {
    name: "Women's Health",
    slug: "womens-health",
    description: "Targeted support",
  },
  {
    name: "Sleep & Recovery",
    slug: "sleep-recovery",
    description: "Rest better, recover faster",
  },
  {
    name: "Hydration",
    slug: "hydration",
    description: "Electrolytes & balance",
  },
  {
    name: "General Health",
    slug: "general-health",
    description: "Daily wellness essentials",
  },
];

export default function CategoryHighlight() {
  return (
    <section className="bg-roots-cream py-16 md:py-20">
      <div className="page-container">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-roots-green/60">
          Care For Your Health
        </h2>
        <p className="mb-10 text-[30px] font-medium leading-tight text-roots-green md:text-[42px] lg:text-[56px]">
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
              {/* Placeholder illustration area */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-roots-green/10">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-roots-green/30"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
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
