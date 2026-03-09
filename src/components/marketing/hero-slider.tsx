"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LinkButton } from "@/components/ui/link-button";

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

const SLIDE_DURATION = 6000;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  const goTo = useCallback(
    (index: number) => {
      if (index === current || isTransitioning) return;
      setIsTransitioning(true);
      setProgress(0);
      progressRef.current = 0;

      // Brief delay for exit animation
      setTimeout(() => {
        setCurrent(index);
        // Allow enter animation
        setTimeout(() => {
          setIsTransitioning(false);
          startTimeRef.current = Date.now();
        }, 50);
      }, 400);
    },
    [current, isTransitioning]
  );

  const next = useCallback(() => {
    const nextIndex = (current + 1) % slides.length;
    goTo(nextIndex);
  }, [current, goTo]);

  // Progress bar animation
  useEffect(() => {
    if (isTransitioning) return;

    startTimeRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(elapsed / SLIDE_DURATION, 1);
      setProgress(p);
      progressRef.current = p;

      if (p >= 1) {
        next();
        return;
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [current, isTransitioning, next]);

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden bg-roots-green">
      {/* Decorative line art — left */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 opacity-[0.07] transition-transform duration-[1200ms] ease-out"
        style={{
          transform: isTransitioning ? "scale(1.15)" : "scale(1)",
        }}
      >
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
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-1/3 opacity-[0.07] transition-transform duration-[1200ms] ease-out"
        style={{
          transform: isTransitioning ? "scale(1.15)" : "scale(1)",
        }}
      >
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
        {/* Subtitle */}
        <div className="overflow-hidden">
          <p
            className="mb-4 text-sm font-medium uppercase tracking-widest text-roots-cream/70 transition-all duration-500 ease-out"
            style={{
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? "translateY(20px)" : "translateY(0)",
            }}
          >
            {slide.subtitle}
          </p>
        </div>

        {/* Headline */}
        <div className="overflow-hidden">
          <h1
            className="mx-auto max-w-3xl text-[38px] font-medium leading-[0.95] text-roots-cream transition-all duration-600 ease-out md:text-[56px] lg:text-[72px]"
            style={{
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning
                ? "translateY(40px) scale(0.95)"
                : "translateY(0) scale(1)",
              transitionDelay: isTransitioning ? "0ms" : "100ms",
            }}
          >
            {slide.headline}
          </h1>
        </div>

        {/* CTA */}
        <div
          className="transition-all duration-500 ease-out"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? "translateY(20px)" : "translateY(0)",
            transitionDelay: isTransitioning ? "0ms" : "200ms",
          }}
        >
          <LinkButton href={slide.cta.href} variant="primary" className="mt-10">
            {slide.cta.label}
          </LinkButton>
        </div>
      </div>

      {/* Progress bar dots */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="relative h-[3px] overflow-hidden rounded-full transition-all duration-500 ease-out"
            style={{
              width: i === current ? 48 : 12,
              backgroundColor:
                i === current
                  ? "rgba(253, 240, 213, 0.3)"
                  : "rgba(253, 240, 213, 0.3)",
            }}
          >
            {/* Progress fill for active dot */}
            {i === current && (
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-roots-cream"
                style={{
                  width: `${progress * 100}%`,
                  transition: "none",
                }}
              />
            )}
            {/* Static fill for inactive dots */}
            {i !== current && (
              <span className="absolute inset-0 rounded-full bg-roots-cream/40" />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
