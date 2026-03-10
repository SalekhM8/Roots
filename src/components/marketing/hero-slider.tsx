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
        <defs>
          <radialGradient id="glow" cx="50%" cy="45%" r="40%">
            <stop offset="0%" stopColor="#fdf0d5" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#fdf0d5" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="700" fill="url(#glow)" />

        <g stroke="#fdf0d5" fill="none" strokeLinecap="round" strokeLinejoin="round">

          {/* Leaf — top left */}
          <g transform="translate(80, 60) scale(2.8)" opacity="0.16" strokeWidth="0.7">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </g>

          {/* Pill — top right */}
          <g transform="translate(1220, 80) scale(2.8) rotate(30)" opacity="0.15" strokeWidth="0.7">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </g>

          {/* Heart Pulse — bottom left */}
          <g transform="translate(50, 480) scale(2.8)" opacity="0.16" strokeWidth="0.7">
            <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
            <path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
          </g>

          {/* Shield Plus — right middle */}
          <g transform="translate(1280, 320) scale(2.8)" opacity="0.15" strokeWidth="0.7">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="M9 12h6" />
            <path d="M12 9v6" />
          </g>

          {/* Droplets — top centre-left */}
          <g transform="translate(340, 35) scale(2.5)" opacity="0.14" strokeWidth="0.7">
            <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
            <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
          </g>

          {/* Pharmacy Cross — bottom right */}
          <g transform="translate(1100, 500) scale(2.8)" opacity="0.16" strokeWidth="0.7">
            <path d="M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 1 1 1v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a1 1 0 0 1 1-1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a1 1 0 0 1-1-1V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a1 1 0 0 1-1 1z" />
          </g>

          {/* DNA — left middle */}
          <g transform="translate(35, 260) scale(2.5)" opacity="0.13" strokeWidth="0.7">
            <path d="M2 15c6.667-6 13.333 0 20-6" />
            <path d="M9 3.236s6.667-1.57 13.333 0" />
            <path d="M16 21.764s-6.667 1.57-13.333 0" />
            <path d="M2 3c6.667 6 13.333 0 20 6" />
          </g>

          {/* Flower — top centre-right */}
          <g transform="translate(960, 40) scale(2.5)" opacity="0.13" strokeWidth="0.7">
            <path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1" />
            <circle cx="12" cy="8" r="2" />
            <path d="M12 10v12" />
            <path d="M12 22c4.2 0 7-1.667 7-5" />
            <path d="M12 22c-4.2 0-7-1.667-7-5" />
          </g>

          {/* Sparkles — bottom centre */}
          <g transform="translate(640, 550) scale(2.5)" opacity="0.12" strokeWidth="0.7">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            <path d="M20 3v4" />
            <path d="M22 5h-4" />
            <path d="M4 17v2" />
            <path d="M5 18H3" />
          </g>

          {/* Leaf cluster — right lower */}
          <g transform="translate(1340, 510) scale(2.5)" opacity="0.13" strokeWidth="0.7">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </g>

          {/* Small accent circles */}
          <circle cx="700" cy="620" r="5" opacity="0.12" strokeWidth="1.3" />
          <circle cx="240" cy="190" r="4" opacity="0.10" strokeWidth="1.3" />
          <circle cx="1110" cy="70" r="6" opacity="0.12" strokeWidth="1.3" />
          <circle cx="810" cy="90" r="3.5" opacity="0.10" strokeWidth="1.3" />
          <circle cx="580" cy="480" r="5" opacity="0.10" strokeWidth="1.3" />
          <circle cx="160" cy="440" r="3" opacity="0.10" strokeWidth="1.3" />
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
