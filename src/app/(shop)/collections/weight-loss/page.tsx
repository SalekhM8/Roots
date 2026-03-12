import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { PRODUCT_FAQS } from "@/data/product-faqs";
import { getProductBySlug } from "@/server/queries/products";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { WeightLossFaqSection } from "./faq-section";

/* ==========================================================================
   SEO Metadata
   ========================================================================== */

export const metadata: Metadata = {
  title: "Mounjaro Weight Loss Programme — Clinician-Led | Roots Pharmacy",
  description:
    "Start your clinician-led Mounjaro (tirzepatide) weight loss programme. Once-weekly injection, prescribed by qualified UK prescribers, delivered to your door. From £149.99.",
  openGraph: {
    title: "Mounjaro Weight Loss Programme — Clinician-Led | Roots Pharmacy",
    description:
      "Start your clinician-led Mounjaro (tirzepatide) weight loss programme. Once-weekly injection, prescribed by qualified UK prescribers, delivered to your door.",
    url: "https://rootspharmacy.co.uk/collections/weight-loss",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mounjaro Weight Loss Programme | Roots Pharmacy",
    description:
      "Clinician-led Mounjaro weight loss. Once-weekly injection, UK prescriber reviewed, discreet delivery.",
  },
  alternates: {
    canonical: "https://rootspharmacy.co.uk/collections/weight-loss",
  },
};

/* ==========================================================================
   SVG Background Patterns
   ========================================================================== */

function DarkGreenBgPattern({ id }: { id: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 1440 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id={`glow-${id}`} cx="50%" cy="45%" r="40%">
            <stop offset="0%" stopColor="#fdf0d5" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#fdf0d5" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="700" fill={`url(#glow-${id})`} />

        <g stroke="#fdf0d5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Leaf - top left */}
          <g transform="translate(80, 60) scale(2.8)" opacity="0.12" strokeWidth="0.7">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </g>

          {/* Pill - top right */}
          <g transform="translate(1220, 80) scale(2.8) rotate(30)" opacity="0.10" strokeWidth="0.7">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </g>

          {/* Heart Pulse - bottom left */}
          <g transform="translate(50, 480) scale(2.8)" opacity="0.12" strokeWidth="0.7">
            <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
            <path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
          </g>

          {/* Shield Plus - right middle */}
          <g transform="translate(1280, 320) scale(2.8)" opacity="0.10" strokeWidth="0.7">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="M9 12h6" />
            <path d="M12 9v6" />
          </g>

          {/* Droplets - top centre-left */}
          <g transform="translate(340, 35) scale(2.5)" opacity="0.10" strokeWidth="0.7">
            <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
            <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
          </g>

          {/* Pharmacy Cross - bottom right */}
          <g transform="translate(1100, 500) scale(2.8)" opacity="0.12" strokeWidth="0.7">
            <path d="M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 1 1 1v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a1 1 0 0 1 1-1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a1 1 0 0 1-1-1V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a1 1 0 0 1-1 1z" />
          </g>

          {/* Sparkles - bottom centre */}
          <g transform="translate(640, 550) scale(2.5)" opacity="0.08" strokeWidth="0.7">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          </g>

          {/* Accent circles */}
          <circle cx="700" cy="620" r="5" opacity="0.08" strokeWidth="1.3" />
          <circle cx="240" cy="190" r="4" opacity="0.07" strokeWidth="1.3" />
          <circle cx="1110" cy="70" r="6" opacity="0.08" strokeWidth="1.3" />
          <circle cx="810" cy="90" r="3.5" opacity="0.07" strokeWidth="1.3" />
        </g>
      </svg>
    </div>
  );
}

function CreamBgPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 1440 500"
        fill="none"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        stroke="#045c4b"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform="translate(60, 40) scale(2.5)" opacity="0.05" strokeWidth="0.7">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </g>
        <g transform="translate(1280, 50) scale(2.5)" opacity="0.05" strokeWidth="0.7">
          <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
          <path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
        </g>
        <g transform="translate(100, 360) scale(2.5)" opacity="0.05" strokeWidth="0.7">
          <path d="M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 1 1 1v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a1 1 0 0 1 1-1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a1 1 0 0 1-1-1V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a1 1 0 0 1-1 1z" />
        </g>
        <g transform="translate(1300, 350) scale(2.5)" opacity="0.05" strokeWidth="0.7">
          <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
          <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
        </g>
        <circle cx="400" cy="80" r="4" opacity="0.04" strokeWidth="1.3" />
        <circle cx="1050" cy="420" r="5" opacity="0.04" strokeWidth="1.3" />
        <circle cx="200" cy="250" r="3" opacity="0.04" strokeWidth="1.3" />
      </svg>
    </div>
  );
}

/* ==========================================================================
   Inline SVG Icons (Lucide-style, for section content)
   ========================================================================== */

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}

function StethoscopeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function UserCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="m16 11 2 2 4-4" />
    </svg>
  );
}

function PillIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" />
      <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ==========================================================================
   Page Component
   ========================================================================== */

export default async function WeightLossLandingPage() {
  // Fetch Mounjaro product and variants from the database
  const product = await getProductBySlug("mounjaro");
  const variants = product?.variants ?? [];
  const lowestPrice = variants.length > 0 ? variants[0].priceMinor : 14999;
  const faqs = PRODUCT_FAQS.mounjaro ?? [];

  return (
    <>
      {/* Structured Data */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Weight Loss" },
        ]}
      />
      <FaqJsonLd faqs={faqs} />

      {/* ================================================================
          SECTION 1 — Hero
          ================================================================ */}
      <section className="relative overflow-hidden bg-roots-green">
        <DarkGreenBgPattern id="hero" />

        <div className="page-container relative flex flex-col items-center justify-center py-20 text-center md:py-28 lg:py-32">
          {/* Breadcrumb */}
          <nav
            className="mb-10 flex items-center gap-2 text-sm text-roots-cream/50"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors duration-200 hover:text-roots-cream/80">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-roots-cream/70">Weight Loss</span>
          </nav>

          <p className="mb-5 text-sm font-medium uppercase tracking-widest text-roots-cream/60">
            Mounjaro (Tirzepatide)
          </p>

          <h1 className="mx-auto max-w-4xl text-[38px] font-medium leading-[0.95] text-roots-cream md:text-[56px] lg:text-[72px]">
            Clinician-Led Weight Loss Programme
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-roots-cream/70 md:text-xl">
            Mounjaro (tirzepatide) — a once-weekly injection, prescribed by
            qualified UK prescribers and delivered to your door.
          </p>

          <LinkButton
            href={ROUTES.consultation}
            variant="primary"
            className="mt-10"
          >
            Start Consultation
          </LinkButton>

          {/* Stat nuggets */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {[
              "21.5% average weight loss",
              "Once-weekly injection",
              "UK prescriber reviewed",
            ].map((stat) => (
              <span
                key={stat}
                className="inline-flex items-center rounded-full border border-roots-cream/20 bg-roots-cream/5 px-5 py-2.5 text-sm font-medium text-roots-cream/80 backdrop-blur-sm"
              >
                {stat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 2 — How It Works
          ================================================================ */}
      <section className="relative overflow-hidden bg-roots-cream py-20 md:py-28">
        <CreamBgPattern />

        <div className="page-container relative">
          <p className="mb-3 text-center text-sm font-medium uppercase tracking-wider text-roots-green/50">
            Simple Process
          </p>
          <h2 className="mx-auto mb-16 max-w-2xl text-center text-[30px] font-medium leading-tight text-roots-green md:text-[42px] lg:text-[52px]">
            How it works
          </h2>

          <div className="relative mx-auto max-w-5xl">
            {/* Connecting line (desktop) */}
            <div
              className="absolute left-0 right-0 top-[60px] hidden h-px bg-roots-green/10 md:block"
              aria-hidden="true"
              style={{ marginLeft: "16.67%", marginRight: "16.67%" }}
            />

            <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
              {[
                {
                  step: 1,
                  title: "Complete Your Consultation",
                  description:
                    "Answer a 5-minute online health questionnaire from the comfort of your home. Your information is kept strictly confidential.",
                  icon: <ClipboardIcon />,
                },
                {
                  step: 2,
                  title: "Prescriber Review",
                  description:
                    "A qualified UK prescriber reviews your consultation within 24 hours and, if clinically appropriate, issues your prescription.",
                  icon: <StethoscopeIcon />,
                },
                {
                  step: 3,
                  title: "Delivered to Your Door",
                  description:
                    "Your medication is dispatched in discreet, temperature-controlled packaging via tracked Royal Mail delivery.",
                  icon: <PackageIcon />,
                },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center">
                  {/* Numbered circle */}
                  <div className="relative z-10 mb-6 flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full bg-roots-cream-2">
                    <div className="mb-1 text-roots-green/70">{item.icon}</div>
                    <span className="text-xs font-medium uppercase tracking-wider text-roots-green/40">
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-medium text-roots-green">
                    {item.title}
                  </h3>
                  <p className="max-w-xs text-base leading-relaxed text-roots-green/60">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 3 — Stats / Social Proof
          ================================================================ */}
      <section className="relative overflow-hidden bg-roots-green py-20 md:py-28">
        <DarkGreenBgPattern id="stats" />

        <div className="page-container relative">
          <p className="mb-3 text-center text-sm font-medium uppercase tracking-wider text-roots-cream/50">
            Clinically Proven
          </p>
          <h2 className="mx-auto mb-16 max-w-2xl text-center text-[30px] font-medium leading-tight text-roots-cream md:text-[42px] lg:text-[52px]">
            The results speak for themselves
          </h2>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                value: "21.5%",
                label: "Average body weight loss in clinical trials",
              },
              {
                value: "72",
                suffix: "weeks",
                label: "Of sustained, clinically proven results",
              },
              {
                value: "1x",
                label: "Weekly injection — simple and convenient",
              },
              {
                value: "GPhC",
                label: "Registered pharmacy you can trust",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center rounded-[var(--radius-hero)] border border-roots-cream/10 bg-roots-cream/5 p-8 text-center backdrop-blur-sm"
              >
                <span className="text-display text-[48px] font-medium leading-none text-roots-cream md:text-[56px]">
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className="mt-1 text-lg font-medium text-roots-cream/60">
                    {stat.suffix}
                  </span>
                )}
                <p className="mt-4 text-sm leading-relaxed text-roots-cream/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 4 — Pricing
          ================================================================ */}
      <section className="relative overflow-hidden bg-roots-cream py-20 md:py-28">
        <CreamBgPattern />

        <div className="page-container relative">
          <p className="mb-3 text-center text-sm font-medium uppercase tracking-wider text-roots-green/50">
            Transparent Pricing
          </p>
          <h2 className="mx-auto mb-4 max-w-2xl text-center text-[30px] font-medium leading-tight text-roots-green md:text-[42px] lg:text-[52px]">
            Choose your treatment
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-base text-roots-green/60">
            Your prescriber will recommend the right dose for you based on your
            consultation. All prices include free clinical review.
          </p>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {variants.length > 0
              ? variants.map((variant) => {
                  const isPopular = variant.name.toLowerCase().includes("5mg");
                  return (
                    <div
                      key={variant.id}
                      className={`relative flex flex-col items-center rounded-[var(--radius-card)] border p-8 text-center transition-shadow duration-200 hover:shadow-md ${
                        isPopular
                          ? "border-roots-orange/30 bg-white shadow-sm"
                          : "border-roots-green/10 bg-roots-cream-2"
                      }`}
                    >
                      {isPopular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-roots-orange px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                          Most Popular
                        </span>
                      )}
                      <h3 className="mb-2 text-xl font-medium text-roots-green">
                        {variant.name}
                      </h3>
                      <p className="text-display text-[32px] font-medium text-roots-navy">
                        {formatPrice(variant.priceMinor)}
                      </p>
                      <p className="mt-1 text-sm text-roots-green/50">
                        per pen
                      </p>
                    </div>
                  );
                })
              : /* Fallback if no variants in DB */
                [
                  { name: "Mounjaro 2.5mg", price: 14999 },
                  { name: "Mounjaro 5mg", price: 17999, popular: true },
                  { name: "Mounjaro 7.5mg", price: 19999 },
                  { name: "Mounjaro 10mg", price: 22999 },
                  { name: "Mounjaro 12.5mg", price: 25999 },
                  { name: "Mounjaro 15mg", price: 27999 },
                ].map((item) => (
                  <div
                    key={item.name}
                    className={`relative flex flex-col items-center rounded-[var(--radius-card)] border p-8 text-center transition-shadow duration-200 hover:shadow-md ${
                      item.popular
                        ? "border-roots-orange/30 bg-white shadow-sm"
                        : "border-roots-green/10 bg-roots-cream-2"
                    }`}
                  >
                    {item.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-roots-orange px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                        Most Popular
                      </span>
                    )}
                    <h3 className="mb-2 text-xl font-medium text-roots-green">
                      {item.name}
                    </h3>
                    <p className="text-display text-[32px] font-medium text-roots-navy">
                      {formatPrice(item.price)}
                    </p>
                    <p className="mt-1 text-sm text-roots-green/50">per pen</p>
                  </div>
                ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-4">
            <LinkButton href={ROUTES.consultation} variant="primary">
              Start Consultation — From {formatPrice(lowestPrice)}
            </LinkButton>
            <p className="text-sm text-roots-green/50">
              Free consultation. No obligation. Your prescriber will guide your
              dosing.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 5 — Trust & Safety
          ================================================================ */}
      <section className="relative overflow-hidden bg-roots-cream-2 py-20 md:py-28">
        <div className="page-container relative">
          <p className="mb-3 text-center text-sm font-medium uppercase tracking-wider text-roots-green/50">
            Safe & Trusted
          </p>
          <h2 className="mx-auto mb-14 max-w-2xl text-center text-[30px] font-medium leading-tight text-roots-green md:text-[42px] lg:text-[52px]">
            Your safety is our priority
          </h2>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <ShieldCheckIcon />,
                title: "GPhC Registered Pharmacy",
                description:
                  "We are registered with the General Pharmaceutical Council, the UK pharmacy regulator.",
              },
              {
                icon: <UserCheckIcon />,
                title: "Qualified UK Prescribers",
                description:
                  "Every consultation is reviewed by a GMC/GPhC registered clinician based in the United Kingdom.",
              },
              {
                icon: <PillIcon />,
                title: "Genuine Eli Lilly Mounjaro",
                description:
                  "All Mounjaro pens are genuine Eli Lilly products sourced from authorised UK wholesalers.",
              },
              {
                icon: <TruckIcon />,
                title: "Tracked & Discreet Delivery",
                description:
                  "Your medication arrives in plain, discreet packaging with full Royal Mail tracking.",
              },
              {
                icon: <HeadsetIcon />,
                title: "Ongoing Clinical Support",
                description:
                  "Our pharmacy team is available to answer questions throughout your treatment journey.",
              },
              {
                icon: <LockIcon />,
                title: "Secure Payment",
                description:
                  "All transactions are encrypted and processed securely via Stripe with bank-level security.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col rounded-[var(--radius-card)] border border-roots-green/8 bg-roots-cream p-7 transition-shadow duration-200 hover:shadow-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-roots-green/5 text-roots-green">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-lg font-medium text-roots-green">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-roots-green/60">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 6 — FAQs
          ================================================================ */}
      <section className="relative overflow-hidden bg-roots-green py-20 md:py-28">
        <DarkGreenBgPattern id="faq" />

        <div className="page-container relative">
          <p className="mb-3 text-center text-sm font-medium uppercase tracking-wider text-roots-cream/50">
            Common Questions
          </p>
          <h2 className="mx-auto mb-14 max-w-2xl text-center text-[30px] font-medium leading-tight text-roots-cream md:text-[42px] lg:text-[52px]">
            Frequently asked questions
          </h2>

          <div className="mx-auto max-w-3xl">
            <WeightLossFaqSection faqs={faqs} />
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 7 — Final CTA
          ================================================================ */}
      <section className="relative overflow-hidden bg-roots-cream py-20 md:py-28">
        <CreamBgPattern />

        <div className="page-container relative flex flex-col items-center text-center">
          <h2 className="mx-auto max-w-3xl text-[30px] font-medium leading-tight text-roots-green md:text-[42px] lg:text-[52px]">
            Ready to start your weight loss journey?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-roots-green/60">
            Join thousands of people across the UK who have transformed their
            health with our clinician-led Mounjaro programme.
          </p>

          <LinkButton
            href={ROUTES.consultation}
            variant="primary"
            className="mt-10"
          >
            Start Your Consultation
          </LinkButton>

          <p className="mt-6 text-sm text-roots-green/40">
            Questions? Email us at{" "}
            <a
              href="mailto:admin@rootspharmacy.co.uk"
              className="text-roots-green/60 underline underline-offset-2 transition-colors duration-200 hover:text-roots-green"
            >
              admin@rootspharmacy.co.uk
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
