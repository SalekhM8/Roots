"use client";

import { useState, useEffect, useCallback } from "react";
import { LinkButton } from "@/components/ui/link-button";
import { PaginationDots } from "@/components/ui/pagination-dots";

interface Slide {
  subtitle: string;
  headline: string;
  cta: { label: string; href: string };
}

const slides: Slide[] = [
  {
    subtitle: "Clinician-Led Weight Loss",
    headline: "Your journey to a healthier you starts here",
    cta: { label: "Start Consultation", href: "/consultations/mounjaro" },
  },
  {
    subtitle: "Mounjaro Weight Loss Programme",
    headline: "Effective, medically supervised weight management",
    cta: { label: "Learn More", href: "/products/mounjaro" },
  },
  {
    subtitle: "Premium Wellness",
    headline: "Supplements crafted for real results",
    cta: { label: "Shop Supplements", href: "/collections/supplements" },
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  // Reset interval when user manually selects a slide
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, current]);

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden bg-roots-green">
      {/* Decorative line art — left */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 opacity-[0.07]">
        <svg viewBox="0 0 400 600" fill="none" className="h-full w-full" aria-hidden="true">
          <circle cx="100" cy="150" r="80" stroke="currentColor" strokeWidth="1" className="text-roots-cream" />
          <circle cx="100" cy="150" r="60" stroke="currentColor" strokeWidth="1" className="text-roots-cream" />
          <rect x="200" y="300" width="120" height="120" rx="8" stroke="currentColor" strokeWidth="1" className="text-roots-cream" />
          <circle cx="300" cy="500" r="50" stroke="currentColor" strokeWidth="1" className="text-roots-cream" />
          <path d="M50 400 L150 350 L150 450 Z" stroke="currentColor" strokeWidth="1" className="text-roots-cream" />
          <rect x="50" y="50" width="80" height="80" rx="4" stroke="currentColor" strokeWidth="1" className="text-roots-cream" />
          <circle cx="350" cy="100" r="30" stroke="currentColor" strokeWidth="1" className="text-roots-cream" />
        </svg>
      </div>

      {/* Decorative line art — right */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 opacity-[0.07]">
        <svg viewBox="0 0 400 600" fill="none" className="h-full w-full" aria-hidden="true">
          <circle cx="300" cy="200" r="90" stroke="currentColor" strokeWidth="1" className="text-roots-cream" />
          <circle cx="300" cy="200" r="70" stroke="currentColor" strokeWidth="1" className="text-roots-cream" />
          <rect x="50" y="350" width="100" height="100" rx="8" stroke="currentColor" strokeWidth="1" className="text-roots-cream" />
          <path d="M250 450 L350 400 L350 500 Z" stroke="currentColor" strokeWidth="1" className="text-roots-cream" />
          <circle cx="150" cy="100" r="40" stroke="currentColor" strokeWidth="1" className="text-roots-cream" />
          <rect x="280" y="500" width="80" height="60" rx="4" stroke="currentColor" strokeWidth="1" className="text-roots-cream" />
        </svg>
      </div>

      {/* Content */}
      <div className="page-container relative flex min-h-[540px] flex-col items-center justify-center py-20 text-center md:min-h-[600px] lg:min-h-[640px]">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-roots-cream/70 transition-opacity duration-300">
          {slide.subtitle}
        </p>
        <h1 className="mx-auto max-w-3xl text-[38px] font-medium leading-[0.95] text-roots-cream transition-opacity duration-300 md:text-[56px] lg:text-[72px]">
          {slide.headline}
        </h1>
        <LinkButton href={slide.cta.href} variant="primary" className="mt-10">
          {slide.cta.label}
        </LinkButton>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <PaginationDots count={slides.length} activeIndex={current} onSelect={setCurrent} variant="light" />
      </div>
    </section>
  );
}
