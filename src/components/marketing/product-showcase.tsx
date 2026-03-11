"use client";

import { useState } from "react";
import { LinkButton } from "@/components/ui/link-button";
import { PaginationDots } from "@/components/ui/pagination-dots";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

interface ShowcaseProduct {
  name: string;
  type: string;
  price: string;
  description: string;
  href: string;
  imageUrl: string;
}

const products: ShowcaseProduct[] = [
  {
    name: "Mounjaro Weight Loss Programme",
    type: "Prescription Medicine",
    price: "From £149.99",
    description:
      "A clinician-led weight management programme using tirzepatide. Includes full medical consultation, prescriber review, and ongoing support.",
    href: "/products/mounjaro",
    imageUrl: "/images/products/mounjaro.svg",
  },
  {
    name: "Centrum Advance",
    type: "Multivitamin",
    price: "From £4.99",
    description:
      "A daily multivitamin designed to support overall health and wellbeing. Provides a broad range of vitamins and minerals for everyday nutritional needs.",
    href: "/products/centrum-advance",
    imageUrl: "/images/products/centrum-advance-30.png",
  },
  {
    name: "Gaviscon Double Action",
    type: "Digestive Relief",
    price: "From £4.49",
    description:
      "Quick relief from heartburn and indigestion. Works in two ways — neutralises excess stomach acid and forms a protective barrier against reflux.",
    href: "/products/gaviscon-double-action",
    imageUrl: "/images/products/gaviscon-double-action-24.jpg",
  },
  {
    name: "Kalms Day",
    type: "Stress Relief",
    price: "From £6.99",
    description:
      "A traditional herbal medicine with valerian root to relieve symptoms of stress and mild anxiety. Supports a calmer, more balanced feeling during the day.",
    href: "/products/kalms-day",
    imageUrl: "/images/products/kalms-day-96.png",
  },
];

export default function ProductShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const product = products[activeIndex];

  return (
    <section className="relative bg-roots-cream py-16 md:py-20 overflow-hidden">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <svg viewBox="0 0 1440 600" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice" stroke="#045c4b" strokeLinecap="round" strokeLinejoin="round">
          <g transform="translate(1300, 40) scale(2.5)" opacity="0.06" strokeWidth="0.7">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="M9 12h6" />
            <path d="M12 9v6" />
          </g>
          <g transform="translate(60, 60) scale(2.5) rotate(20)" opacity="0.06" strokeWidth="0.7">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </g>
          <g transform="translate(1280, 420) scale(2.5)" opacity="0.06" strokeWidth="0.7">
            <path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1" />
            <circle cx="12" cy="8" r="2" />
            <path d="M12 10v12" />
            <path d="M12 22c4.2 0 7-1.667 7-5" />
            <path d="M12 22c-4.2 0-7-1.667-7-5" />
          </g>
          <g transform="translate(80, 440) scale(2.5)" opacity="0.06" strokeWidth="0.7">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </g>
          <circle cx="500" cy="100" r="4" opacity="0.05" strokeWidth="1.3" />
          <circle cx="900" cy="500" r="5" opacity="0.05" strokeWidth="1.3" />
          <circle cx="300" cy="350" r="3" opacity="0.05" strokeWidth="1.3" />
        </svg>
      </div>
      <div className="page-container relative">
        {/* Header row */}
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-[28px] font-medium text-roots-green md:text-[36px] lg:text-[42px]">
            Popular products
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev - 1 + products.length) % products.length)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-roots-green/20 text-roots-green transition-colors duration-200 hover:bg-roots-green hover:text-roots-cream"
              aria-label="Previous product"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev + 1) % products.length)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-roots-green/20 text-roots-green transition-colors duration-200 hover:bg-roots-green hover:text-roots-cream"
              aria-label="Next product"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>

        {/* Product showcase card */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Image */}
          <div className="flex min-h-[400px] items-center justify-center rounded-[var(--radius-hero)] bg-roots-cream-2 p-8">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-[360px] w-auto max-w-full rounded-xl object-contain"
              loading="lazy"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center py-4 lg:px-8">
            <span className="mb-2 text-sm font-medium uppercase tracking-wider text-roots-green/60">
              {product.type}
            </span>
            <h3 className="text-display mb-4 text-[32px] font-medium leading-tight text-roots-green md:text-[42px] lg:text-[52px]">
              {product.name}
            </h3>
            <p className="mb-2 text-xl font-medium text-roots-green">
              {product.price}
            </p>
            <p className="mb-8 text-base leading-relaxed text-roots-green/80">
              {product.description}
            </p>
            <LinkButton href={product.href} variant="secondary" className="w-fit">
              Shop This Product
            </LinkButton>
          </div>
        </div>

        {/* Progress dots */}
        <div className="mt-8">
          <PaginationDots count={products.length} activeIndex={activeIndex} onSelect={setActiveIndex} variant="dark" />
        </div>
      </div>
    </section>
  );
}
