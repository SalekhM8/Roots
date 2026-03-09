"use client";

import { useState } from "react";
import { LinkButton } from "@/components/ui/link-button";
import { PaginationDots } from "@/components/ui/pagination-dots";
import { ChevronLeftIcon, ChevronRightIcon, ImagePlaceholderIcon } from "@/components/icons";

interface ShowcaseProduct {
  name: string;
  type: string;
  price: string;
  description: string;
  href: string;
}

const products: ShowcaseProduct[] = [
  {
    name: "Mounjaro Weight Loss Programme",
    type: "Prescription Medicine",
    price: "From £149.99",
    description:
      "A clinician-led weight management programme using tirzepatide. Includes full medical consultation, prescriber review, and ongoing support.",
    href: "/products/mounjaro",
  },
  {
    name: "Magnesium Glycinate",
    type: "Supplement",
    price: "£24.99",
    description:
      "Premium magnesium for muscle recovery, sleep quality, and nervous system support. Highly bioavailable glycinate form.",
    href: "/products/magnesium-glycinate",
  },
  {
    name: "Daily Electrolytes",
    type: "Supplement",
    price: "£19.99",
    description:
      "Balanced electrolyte blend to support hydration, energy, and recovery. Essential during weight management programmes.",
    href: "/products/electrolytes",
  },
];

export default function ProductShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const product = products[activeIndex];

  return (
    <section className="bg-roots-cream py-16 md:py-20">
      <div className="page-container">
        {/* Header row */}
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-[28px] font-medium text-roots-green md:text-[36px] lg:text-[42px]">
            The core products
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
          {/* Image placeholder */}
          <div className="flex min-h-[400px] items-center justify-center rounded-[var(--radius-hero)] bg-roots-cream-2">
            <div className="flex h-48 w-48 items-center justify-center rounded-2xl border border-roots-green/10">
              <ImagePlaceholderIcon size={80} className="text-roots-green/20" />
            </div>
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
