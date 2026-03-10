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
            <stop offset="0%" stopColor="#fdf0d5" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#fdf0d5" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="700" fill="url(#glow)" />

        {/* --- Vivid cream icons on green background — nature + pharmacy --- */}
        <g stroke="#fdf0d5" fill="none" strokeLinecap="round" strokeLinejoin="round">

          {/* Botanical leaf — top left */}
          <g transform="translate(100, 70) rotate(-12)" opacity="0.16" strokeWidth="1.5">
            <path d="M30 60C30 60 2 48 2 24C2 4 20 0 30 0C40 0 58 4 58 24C58 48 30 60 30 60Z" />
            <path d="M30 60V14" />
            <path d="M30 42C22 36 14 37 8 40" />
            <path d="M30 30C38 24 46 25 52 28" />
            <path d="M30 20C24 16 18 17 14 19" />
          </g>

          {/* Capsule pill — top right */}
          <g transform="translate(1240, 100) rotate(30)" opacity="0.14" strokeWidth="1.5">
            <rect x="0" y="0" width="24" height="56" rx="12" />
            <line x1="0" y1="28" x2="24" y2="28" />
            <ellipse cx="12" cy="14" rx="4" ry="6" opacity="0.4" />
          </g>

          {/* Heart with pulse — bottom left */}
          <g transform="translate(60, 490)" opacity="0.15" strokeWidth="1.5">
            <path d="M28 52L4 28C-4 20-4 8 4 2C12-4 22 0 28 10C34 0 44-4 52 2C60 8 60 20 52 28L28 52Z" />
            <path d="M12 28H20L24 20L28 36L32 24H40" />
          </g>

          {/* Shield with cross — right middle */}
          <g transform="translate(1290, 350)" opacity="0.14" strokeWidth="1.5">
            <path d="M28 2L52 14V32C52 46 42 56 28 62C14 56 4 46 4 32V14L28 2Z" />
            <line x1="28" y1="20" x2="28" y2="44" />
            <line x1="16" y1="32" x2="40" y2="32" />
          </g>

          {/* Droplet — top centre-left */}
          <g transform="translate(360, 45)" opacity="0.13" strokeWidth="1.5">
            <path d="M20 2C20 2 2 24 2 34C2 44 10 50 20 50S38 44 38 34C38 24 20 2 20 2Z" />
            <path d="M12 34C12 28 20 16 20 16" opacity="0.5" />
          </g>

          {/* Mortar & pestle — bottom right */}
          <g transform="translate(1120, 510)" opacity="0.16" strokeWidth="1.5">
            <path d="M4 28C4 40 16 50 32 50S60 40 60 28H4Z" />
            <line x1="4" y1="28" x2="60" y2="28" />
            <line x1="32" y1="28" x2="48" y2="6" />
            <circle cx="50" cy="4" r="4" />
            <path d="M16 38C20 42 28 44 36 42" opacity="0.4" />
          </g>

          {/* DNA double helix — left middle */}
          <g transform="translate(45, 270)" opacity="0.13" strokeWidth="1.3">
            <path d="M4 0C4 0 28 14 28 30S4 60 4 60" />
            <path d="M28 0C28 0 4 14 4 30S28 60 28 60" />
            <line x1="7" y1="10" x2="25" y2="10" />
            <line x1="4" y1="20" x2="28" y2="20" />
            <line x1="4" y1="30" x2="28" y2="30" />
            <line x1="4" y1="40" x2="28" y2="40" />
            <line x1="7" y1="50" x2="25" y2="50" />
          </g>

          {/* Botanical branch — top centre-right */}
          <g transform="translate(980, 50)" opacity="0.12" strokeWidth="1.3">
            <path d="M24 56V8" />
            <path d="M24 16C16 10 8 12 4 16" />
            <path d="M24 16C32 10 40 12 44 16" />
            <path d="M24 28C18 22 10 24 6 28" />
            <path d="M24 28C30 22 38 24 42 28" />
            <path d="M24 40C18 34 12 36 8 40" />
            <path d="M24 40C30 34 36 36 40 40" />
            <circle cx="24" cy="6" r="3" />
          </g>

          {/* Molecule / atom — bottom centre */}
          <g transform="translate(650, 560)" opacity="0.12" strokeWidth="1.3">
            <circle cx="24" cy="24" r="6" />
            <circle cx="6" cy="10" r="4" />
            <circle cx="42" cy="10" r="4" />
            <circle cx="6" cy="40" r="4" />
            <circle cx="42" cy="40" r="4" />
            <line x1="20" y1="20" x2="9" y2="13" />
            <line x1="28" y1="20" x2="39" y2="13" />
            <line x1="20" y1="28" x2="9" y2="37" />
            <line x1="28" y1="28" x2="39" y2="37" />
          </g>

          {/* Leaf cluster — right lower */}
          <g transform="translate(1350, 520)" opacity="0.12" strokeWidth="1.3">
            <ellipse cx="16" cy="20" rx="14" ry="20" transform="rotate(-15 16 20)" />
            <path d="M16 40V4" />
            <path d="M16 20C10 16 6 18 4 20" />
          </g>

          {/* Plus signs — scattered, geometric */}
          <g opacity="0.14" strokeWidth="1.5">
            <line x1="920" y1="76" x2="920" y2="100" />
            <line x1="908" y1="88" x2="932" y2="88" />
          </g>
          <g opacity="0.12" strokeWidth="1.5">
            <line x1="480" y1="550" x2="480" y2="574" />
            <line x1="468" y1="562" x2="492" y2="562" />
          </g>
          <g opacity="0.14" strokeWidth="1.5">
            <line x1="1060" y1="190" x2="1060" y2="214" />
            <line x1="1048" y1="202" x2="1072" y2="202" />
          </g>
          <g opacity="0.10" strokeWidth="1.5">
            <line x1="300" y1="420" x2="300" y2="444" />
            <line x1="288" y1="432" x2="312" y2="432" />
          </g>

          {/* Capsule — bottom centre-left */}
          <g transform="translate(400, 580) rotate(-20)" opacity="0.10" strokeWidth="1.3">
            <rect x="0" y="0" width="16" height="36" rx="8" />
            <line x1="0" y1="18" x2="16" y2="18" />
          </g>

          {/* Geometric circles — refined dots */}
          <circle cx="700" cy="620" r="5" opacity="0.12" strokeWidth="1.3" />
          <circle cx="240" cy="190" r="4" opacity="0.10" strokeWidth="1.3" />
          <circle cx="1110" cy="70" r="6" opacity="0.12" strokeWidth="1.3" />
          <circle cx="810" cy="90" r="3.5" opacity="0.10" strokeWidth="1.3" />
          <circle cx="580" cy="480" r="5" opacity="0.10" strokeWidth="1.3" />
          <circle cx="160" cy="440" r="3" opacity="0.10" strokeWidth="1.3" />

          {/* Gentle flowing arcs */}
          <path d="M-20 420Q200 360 440 430" opacity="0.08" strokeWidth="1.2" />
          <path d="M1000 620Q1200 560 1460 640" opacity="0.08" strokeWidth="1.2" />
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
