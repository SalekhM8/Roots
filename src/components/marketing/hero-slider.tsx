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

function HeroBackground({ isTransitioning }: { isTransitioning: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 transition-transform duration-[1200ms] ease-out"
      style={{
        transform: isTransitioning ? "scale(1.08)" : "scale(1)",
        backgroundImage: "url(/images/hero-bg.svg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      aria-hidden="true"
    />
  );
}

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  const goTo = useCallback(
    (index: number) => {
      if (index === current || isTransitioning) return;
      setIsTransitioning(true);
      setProgress(0);

      setTimeout(() => {
        setCurrent(index);
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

  useEffect(() => {
    if (isTransitioning) return;

    startTimeRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(elapsed / SLIDE_DURATION, 1);
      setProgress(p);

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
      <HeroBackground isTransitioning={isTransitioning} />

      {/* Content */}
      <div className="page-container relative flex min-h-[540px] flex-col items-center justify-center py-20 text-center md:min-h-[600px] lg:min-h-[640px]">
        <p
          className="mb-4 text-sm font-medium uppercase tracking-widest text-roots-cream/70 transition-opacity duration-500 ease-out"
          style={{ opacity: isTransitioning ? 0 : 1 }}
        >
          {slide.subtitle}
        </p>

        <h1
          className="mx-auto max-w-3xl text-[38px] font-medium leading-[0.95] text-roots-cream transition-opacity duration-600 ease-out md:text-[56px] lg:text-[72px]"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transitionDelay: isTransitioning ? "0ms" : "80ms",
          }}
        >
          {slide.headline}
        </h1>

        <div
          className="transition-opacity duration-500 ease-out"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transitionDelay: isTransitioning ? "0ms" : "160ms",
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
              backgroundColor: "rgba(253, 240, 213, 0.3)",
            }}
          >
            {i === current && (
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-roots-cream"
                style={{ width: `${progress * 100}%`, transition: "none" }}
              />
            )}
            {i !== current && (
              <span className="absolute inset-0 rounded-full bg-roots-cream/40" />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
