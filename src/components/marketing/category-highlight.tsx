import Link from "next/link";

const categories = [
  {
    name: "Weight Loss",
    slug: "weight-loss",
    description: "Clinician-led programmes",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
        {/* Downward trending arrow with figure silhouette */}
        <path d="M6 8C6 8 10 6 16 6C20 6 22 8 22 12C22 16 20 22 18 26" />
        <path d="M14 26L18 26L16 30" />
        <path d="M4 20L10 16L16 18L26 10" />
        <path d="M22 10H26V14" />
      </svg>
    ),
  },
  {
    name: "Women's Health",
    slug: "womens-health",
    description: "Targeted support",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
        {/* Flower / bloom */}
        <circle cx="16" cy="13" r="4" />
        <ellipse cx="16" cy="6" rx="3" ry="4" />
        <ellipse cx="22" cy="10" rx="3" ry="4" transform="rotate(60 22 10)" />
        <ellipse cx="22" cy="17" rx="3" ry="4" transform="rotate(120 22 17)" />
        <ellipse cx="16" cy="20" rx="3" ry="4" />
        <ellipse cx="10" cy="17" rx="3" ry="4" transform="rotate(60 10 17)" />
        <ellipse cx="10" cy="10" rx="3" ry="4" transform="rotate(120 10 10)" />
        <line x1="16" y1="22" x2="16" y2="30" />
        <path d="M13 26C13 26 14 24 16 24C18 24 19 26 19 26" />
      </svg>
    ),
  },
  {
    name: "Sleep & Recovery",
    slug: "sleep-recovery",
    description: "Rest better, recover faster",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
        {/* Crescent moon with stars */}
        <path d="M24 18C24 24 19 28 13 28C7 28 3 24 3 18C3 12 7 8 13 8C8 12 8 22 13 26C17 22 20 18 24 18Z" />
        <line x1="24" y1="6" x2="24" y2="12" />
        <line x1="21" y1="9" x2="27" y2="9" />
        <circle cx="28" cy="16" r="1" />
        <circle cx="20" cy="4" r="1" />
      </svg>
    ),
  },
  {
    name: "Hydration",
    slug: "hydration",
    description: "Electrolytes & balance",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
        {/* Water droplet with inner ripple */}
        <path d="M16 3C16 3 5 16 5 22C5 28 10 30 16 30S27 28 27 22C27 16 16 3 16 3Z" />
        <path d="M11 22C11 19 16 12 16 12" opacity="0.5" />
        <path d="M10 24C12 26 14 27 16 27" opacity="0.4" />
      </svg>
    ),
  },
  {
    name: "General Health",
    slug: "general-health",
    description: "Daily wellness essentials",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
        {/* Shield with heart inside */}
        <path d="M16 3L27 8V16C27 23 22 28 16 30C10 28 5 23 5 16V8L16 3Z" />
        <path d="M16 22L11 17C9 15 9 12 11 11C13 10 15 11 16 13C17 11 19 10 21 11C23 12 23 15 21 17L16 22Z" />
      </svg>
    ),
  },
];

export default function CategoryHighlight() {
  return (
    <section className="relative bg-roots-cream py-16 md:py-20 overflow-hidden">
      {/* Background pattern — green Lucide icons on cream */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <svg viewBox="0 0 1440 500" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice" stroke="#045c4b" strokeLinecap="round" strokeLinejoin="round">
          {/* Leaf — top left */}
          <g transform="translate(60, 40) scale(2.5)" opacity="0.06" strokeWidth="0.7">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </g>
          {/* Heart Pulse — top right */}
          <g transform="translate(1280, 50) scale(2.5)" opacity="0.06" strokeWidth="0.7">
            <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
            <path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
          </g>
          {/* Pharmacy Cross — bottom left */}
          <g transform="translate(100, 360) scale(2.5)" opacity="0.06" strokeWidth="0.7">
            <path d="M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 1 1 1v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a1 1 0 0 1 1-1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a1 1 0 0 1-1-1V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a1 1 0 0 1-1 1z" />
          </g>
          {/* Droplets — bottom right */}
          <g transform="translate(1300, 350) scale(2.5)" opacity="0.06" strokeWidth="0.7">
            <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
            <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
          </g>
          {/* Sparkles — centre */}
          <g transform="translate(700, 200) scale(2)" opacity="0.05" strokeWidth="0.7">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          </g>
          {/* Accent circles */}
          <circle cx="400" cy="80" r="4" opacity="0.05" strokeWidth="1.3" />
          <circle cx="1050" cy="420" r="5" opacity="0.05" strokeWidth="1.3" />
          <circle cx="200" cy="250" r="3" opacity="0.05" strokeWidth="1.3" />
        </svg>
      </div>
      <div className="page-container relative">
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
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-roots-green/15 bg-roots-green/5 text-roots-green/70 transition-colors group-hover:bg-roots-green/10 group-hover:text-roots-green" aria-hidden="true">
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
