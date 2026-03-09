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
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* ---- LEFT SIDE ---- */}
        {/* Pill capsule */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.09">
          <rect x="40" y="80" width="90" height="40" rx="20" />
          <line x1="85" y1="80" x2="85" y2="120" />
        </g>
        {/* Mortar & pestle */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.08">
          <path d="M60 280 Q60 320 100 320 Q140 320 140 280" />
          <ellipse cx="100" cy="280" rx="42" ry="12" />
          <line x1="75" y1="260" x2="55" y2="220" strokeLinecap="round" strokeWidth="2" />
        </g>
        {/* Leaf / botanical */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.07">
          <path d="M180 160 Q210 120 240 160 Q210 200 180 160Z" />
          <line x1="210" y1="130" x2="210" y2="195" />
          <line x1="195" y1="150" x2="210" y2="165" />
          <line x1="225" y1="150" x2="210" y2="165" />
        </g>
        {/* Syringe / injection pen */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.08" transform="rotate(-25 100 450)">
          <rect x="80" y="400" width="30" height="120" rx="6" />
          <rect x="88" y="380" width="14" height="25" rx="3" />
          <rect x="92" y="520" width="6" height="30" rx="2" />
          <rect x="86" y="440" width="18" height="30" rx="3" fill="none" />
        </g>
        {/* DNA helix strand */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.06">
          <path d="M280 50 Q310 100 280 150 Q250 200 280 250 Q310 300 280 350" />
          <path d="M310 50 Q280 100 310 150 Q340 200 310 250 Q280 300 310 350" />
          <line x1="283" y1="100" x2="307" y2="100" />
          <line x1="283" y1="150" x2="307" y2="150" />
          <line x1="283" y1="200" x2="307" y2="200" />
          <line x1="283" y1="250" x2="307" y2="250" />
          <line x1="283" y1="300" x2="307" y2="300" />
        </g>
        {/* Bottle */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.08">
          <rect x="30" y="480" width="60" height="110" rx="8" />
          <rect x="42" y="460" width="36" height="25" rx="4" />
          <rect x="38" y="445" width="44" height="18" rx="6" />
          <rect x="40" y="530" width="40" height="30" rx="3" opacity="0.5" />
        </g>
        {/* Stethoscope */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.07">
          <path d="M200 400 Q200 480 240 500 Q280 520 280 460" />
          <path d="M240 400 Q240 470 260 490" />
          <circle cx="280" cy="450" r="12" />
          <circle cx="280" cy="450" r="5" />
          <circle cx="200" cy="395" r="5" />
          <circle cx="240" cy="395" r="5" />
        </g>
        {/* Heart rate line */}
        <g stroke="#fdf0d5" strokeWidth="1.5" opacity="0.06">
          <polyline points="20,620 60,620 75,620 85,590 95,650 105,610 115,625 130,625 180,625" />
        </g>
        {/* Molecular structure */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.06">
          <circle cx="340" cy="500" r="8" />
          <circle cx="380" cy="480" r="8" />
          <circle cx="370" cy="540" r="8" />
          <circle cx="410" cy="520" r="8" />
          <line x1="346" y1="494" x2="374" y2="486" />
          <line x1="345" y1="507" x2="365" y2="534" />
          <line x1="377" y1="540" x2="404" y2="524" />
          <line x1="386" y1="484" x2="406" y2="514" />
        </g>
        {/* Scale / weight */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.07">
          <ellipse cx="160" cy="620" rx="50" ry="15" />
          <line x1="160" y1="605" x2="160" y2="560" />
          <line x1="130" y1="560" x2="190" y2="560" />
          <path d="M130 560 Q130 540 145 540 L150 540 L150 560" />
          <path d="M190 560 Q190 540 175 540 L170 540 L170 560" />
        </g>

        {/* ---- RIGHT SIDE ---- */}
        {/* Pill capsule large */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.09">
          <rect x="1300" y="100" width="100" height="45" rx="22" />
          <line x1="1350" y1="100" x2="1350" y2="145" />
        </g>
        {/* Supplement bottle tall */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.08">
          <rect x="1320" y="460" width="70" height="130" rx="10" />
          <rect x="1336" y="435" width="38" height="30" rx="5" />
          <rect x="1332" y="418" width="46" height="20" rx="8" />
          <rect x="1335" y="510" width="40" height="40" rx="4" opacity="0.5" />
          <text x="1355" y="536" textAnchor="middle" fontSize="14" fill="#fdf0d5" opacity="0.4" fontFamily="system-ui">Mg</text>
        </g>
        {/* Dropper / pipette */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.07" transform="rotate(15 1200 200)">
          <rect x="1185" y="160" width="20" height="80" rx="4" />
          <path d="M1190 240 Q1195 260 1200 240" />
          <ellipse cx="1195" cy="155" rx="14" ry="18" />
          <circle cx="1195" cy="270" r="3" opacity="0.5" />
        </g>
        {/* Leaf cluster */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.07">
          <path d="M1240 300 Q1270 260 1300 300 Q1270 340 1240 300Z" />
          <path d="M1260 280 Q1290 250 1310 280 Q1290 310 1260 280Z" />
          <line x1="1270" y1="270" x2="1270" y2="335" />
        </g>
        {/* Rx symbol */}
        <g stroke="#fdf0d5" strokeWidth="1.5" opacity="0.06">
          <text x="1130" y="130" fontSize="48" fill="none" stroke="#fdf0d5" fontFamily="serif" strokeWidth="1">Rx</text>
        </g>
        {/* Water drop */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.08">
          <path d="M1150 400 Q1150 360 1170 340 Q1190 360 1190 400 Q1190 425 1170 435 Q1150 425 1150 400Z" />
          <path d="M1160 405 Q1160 395 1170 390" opacity="0.5" />
        </g>
        {/* Heartbeat line */}
        <g stroke="#fdf0d5" strokeWidth="1.5" opacity="0.06">
          <polyline points="1100,620 1140,620 1160,620 1170,590 1180,650 1190,610 1200,625 1230,625 1300,625" />
        </g>
        {/* Measuring cup */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.07">
          <path d="M1080 470 L1070 540 Q1070 555 1085 555 L1135 555 Q1150 555 1150 540 L1140 470Z" />
          <line x1="1078" y1="490" x2="1095" y2="490" opacity="0.5" />
          <line x1="1080" y1="510" x2="1095" y2="510" opacity="0.5" />
          <line x1="1082" y1="530" x2="1095" y2="530" opacity="0.5" />
        </g>
        {/* Molecular ring */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.06">
          <polygon points="1100,300 1130,280 1160,300 1160,340 1130,360 1100,340" />
          <circle cx="1100" cy="300" r="5" />
          <circle cx="1130" cy="280" r="5" />
          <circle cx="1160" cy="300" r="5" />
          <circle cx="1160" cy="340" r="5" />
          <circle cx="1130" cy="360" r="5" />
          <circle cx="1100" cy="340" r="5" />
        </g>
        {/* Thermometer */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.07">
          <rect x="1410" y="250" width="16" height="80" rx="8" />
          <circle cx="1418" cy="345" r="14" />
          <circle cx="1418" cy="345" r="6" />
          <line x1="1418" y1="340" x2="1418" y2="280" strokeWidth="2" opacity="0.4" />
        </g>
        {/* Shield / trust icon */}
        <g stroke="#fdf0d5" strokeWidth="1" opacity="0.07">
          <path d="M1230 500 L1230 540 Q1230 570 1260 580 Q1290 570 1290 540 L1290 500 L1260 490Z" />
          <polyline points="1248,535 1258,545 1275,525" strokeWidth="1.5" />
        </g>

        {/* ---- CENTER SUBTLE ACCENTS ---- */}
        {/* Concentric circles top */}
        <g stroke="#fdf0d5" strokeWidth="0.5" opacity="0.04">
          <circle cx="720" cy="80" r="60" />
          <circle cx="720" cy="80" r="45" />
          <circle cx="720" cy="80" r="30" />
        </g>
        {/* Compass / dosage dial bottom */}
        <g stroke="#fdf0d5" strokeWidth="0.5" opacity="0.04">
          <circle cx="720" cy="620" r="50" />
          <circle cx="720" cy="620" r="35" />
          <line x1="720" y1="570" x2="720" y2="585" />
          <line x1="720" y1="655" x2="720" y2="670" />
          <line x1="670" y1="620" x2="685" y2="620" />
          <line x1="755" y1="620" x2="770" y2="620" />
        </g>
        {/* Tiny floating dots */}
        <g fill="#fdf0d5" opacity="0.06">
          <circle cx="480" cy="120" r="2" />
          <circle cx="960" cy="140" r="2.5" />
          <circle cx="520" cy="550" r="2" />
          <circle cx="900" cy="520" r="2" />
          <circle cx="620" cy="200" r="1.5" />
          <circle cx="820" cy="180" r="1.5" />
          <circle cx="550" cy="400" r="2" />
          <circle cx="880" cy="380" r="2" />
          <circle cx="680" cy="500" r="1.5" />
          <circle cx="760" cy="480" r="1.5" />
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
