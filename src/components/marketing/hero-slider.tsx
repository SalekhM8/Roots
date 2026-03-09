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
      style={{ transform: isTransitioning ? "scale(1.08)" : "scale(1)" }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Soft radial glow behind centre text */}
        <defs>
          <radialGradient id="glow" cx="50%" cy="45%" r="40%">
            <stop offset="0%" stopColor="#fdf0d5" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#fdf0d5" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="700" fill="url(#glow)" />

        {/* --- Scattered wellness icons — cream outlines, very subtle --- */}
        <g stroke="#fdf0d5" fill="none" strokeLinecap="round" strokeLinejoin="round">

          {/* Leaf — top left */}
          <g transform="translate(120, 90) rotate(-15)" opacity="0.10" strokeWidth="1.2">
            <path d="M0 28C0 28 6-2 28-2S56 28 56 28C56 28 50 58 28 58S0 28 0 28Z" />
            <path d="M28 58V10" />
            <path d="M28 30C20 24 12 26 8 28" />
            <path d="M28 20C36 14 44 16 48 18" />
          </g>

          {/* Pill capsule — top right */}
          <g transform="translate(1250, 120) rotate(25)" opacity="0.08" strokeWidth="1.2">
            <rect x="0" y="0" width="20" height="48" rx="10" />
            <line x1="0" y1="24" x2="20" y2="24" />
          </g>

          {/* Heart — bottom left */}
          <g transform="translate(80, 520)" opacity="0.07" strokeWidth="1.2">
            <path d="M24 44L4 24C-2 18-2 8 4 4C10-1 18 0 24 8C30 0 38-1 44 4C50 8 50 18 44 24L24 44Z" />
          </g>

          {/* Shield/cross — right middle */}
          <g transform="translate(1300, 380)" opacity="0.08" strokeWidth="1.2">
            <path d="M24 2L44 12V28C44 40 36 48 24 54C12 48 4 40 4 28V12L24 2Z" />
            <line x1="24" y1="18" x2="24" y2="38" />
            <line x1="14" y1="28" x2="34" y2="28" />
          </g>

          {/* Droplet — top centre-left */}
          <g transform="translate(380, 60)" opacity="0.07" strokeWidth="1.1">
            <path d="M16 2C16 2 2 20 2 28C2 36 8 42 16 42S30 36 30 28C30 20 16 2 16 2Z" />
          </g>

          {/* Mortar & pestle — bottom right */}
          <g transform="translate(1150, 540)" opacity="0.09" strokeWidth="1.2">
            <path d="M4 24C4 34 14 42 28 42S52 34 52 24H4Z" />
            <line x1="28" y1="24" x2="42" y2="4" />
            <circle cx="44" cy="2" r="3" />
            <line x1="4" y1="24" x2="52" y2="24" />
          </g>

          {/* DNA helix — left middle */}
          <g transform="translate(60, 300)" opacity="0.06" strokeWidth="1">
            <path d="M4 0C4 0 20 12 20 24S4 48 4 48" />
            <path d="M24 0C24 0 8 12 8 24S24 48 24 48" />
            <line x1="6" y1="12" x2="22" y2="12" />
            <line x1="6" y1="24" x2="22" y2="24" />
            <line x1="6" y1="36" x2="22" y2="36" />
          </g>

          {/* Small plus signs scattered */}
          <g opacity="0.06" strokeWidth="1">
            <line x1="920" y1="80" x2="920" y2="96" />
            <line x1="912" y1="88" x2="928" y2="88" />
          </g>
          <g opacity="0.05" strokeWidth="1">
            <line x1="500" y1="560" x2="500" y2="576" />
            <line x1="492" y1="568" x2="508" y2="568" />
          </g>
          <g opacity="0.07" strokeWidth="1">
            <line x1="1050" y1="200" x2="1050" y2="216" />
            <line x1="1042" y1="208" x2="1058" y2="208" />
          </g>

          {/* Small circles — dots of life */}
          <circle cx="700" cy="620" r="4" opacity="0.06" strokeWidth="1" />
          <circle cx="250" cy="200" r="3" opacity="0.05" strokeWidth="1" />
          <circle cx="1100" cy="80" r="5" opacity="0.06" strokeWidth="1" />
          <circle cx="800" cy="100" r="3" opacity="0.04" strokeWidth="1" />
          <circle cx="600" cy="500" r="4" opacity="0.05" strokeWidth="1" />

          {/* Gentle arcs */}
          <path d="M-20 400Q200 350 400 420" opacity="0.04" strokeWidth="1" />
          <path d="M1040 600Q1200 550 1460 620" opacity="0.04" strokeWidth="1" />
        </g>
      </svg>
    </div>
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
