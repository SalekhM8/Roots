"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";

const STORAGE_KEY = "roots_newsletter_dismissed";
const SHOW_DELAY_MS = 3000;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Decorative SVG background with pharmacy/wellness icons
 * at low opacity, matching the hero-slider pattern style.
 */
function DecorativeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 480 560"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="#fdf0d5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Leaf -- top left */}
          <g transform="translate(20, 30) scale(2)" opacity="0.08" strokeWidth="0.7">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </g>

          {/* Pill -- top right */}
          <g transform="translate(380, 20) scale(2) rotate(30)" opacity="0.07" strokeWidth="0.7">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </g>

          {/* Sparkles -- bottom left */}
          <g transform="translate(10, 420) scale(2)" opacity="0.06" strokeWidth="0.7">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            <path d="M20 3v4" />
            <path d="M22 5h-4" />
          </g>

          {/* Shield Plus -- bottom right */}
          <g transform="translate(380, 440) scale(2)" opacity="0.07" strokeWidth="0.7">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="M9 12h6" />
            <path d="M12 9v6" />
          </g>

          {/* Heart Pulse -- middle right */}
          <g transform="translate(400, 220) scale(1.8)" opacity="0.06" strokeWidth="0.7">
            <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
            <path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
          </g>

          {/* Droplets -- middle left */}
          <g transform="translate(-10, 240) scale(1.8)" opacity="0.07" strokeWidth="0.7">
            <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
            <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
          </g>

          {/* Small accent circles */}
          <circle cx="240" cy="510" r="4" opacity="0.06" strokeWidth="1.2" />
          <circle cx="60" cy="160" r="3" opacity="0.06" strokeWidth="1.2" />
          <circle cx="430" cy="130" r="3.5" opacity="0.06" strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
}

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Do not show if already dismissed
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    const timer = setTimeout(() => {
      setMounted(true);
      // Small RAF delay so the initial opacity-0 state renders before transitioning
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    // Wait for fade-out to complete before unmounting
    setTimeout(() => {
      setMounted(false);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // localStorage unavailable
      }
    }, 300);
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      setError("");

      const trimmed = email.trim();
      if (!trimmed) {
        setError("Please enter your email address.");
        return;
      }
      if (!isValidEmail(trimmed)) {
        setError("Please enter a valid email address.");
        return;
      }

      // Store in localStorage (no backend yet)
      try {
        localStorage.setItem("roots_newsletter_email", trimmed);
      } catch {
        // silent
      }

      setSubmitted(true);

      // Auto-dismiss after success
      setTimeout(() => {
        dismiss();
      }, 2500);
    },
    [email, dismiss]
  );

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter signup"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[480px] overflow-hidden rounded-[16px] bg-roots-green shadow-2xl transition-all duration-300 ease-out"
        style={{
          transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
        }}
      >
        <DecorativeBackground />

        {/* Close button */}
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-roots-cream/60 transition-colors duration-200 hover:bg-roots-cream/10 hover:text-roots-cream"
          aria-label="Close newsletter popup"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="relative z-[1] px-8 pb-10 pt-12 sm:px-10">
          {!submitted ? (
            <>
              {/* Badge */}
              <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-roots-cream/20 bg-roots-cream/10 px-4 py-1.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f77f00"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                </svg>
                <span className="text-xs font-medium uppercase tracking-wider text-roots-cream/80">
                  Exclusive Offer
                </span>
              </div>

              {/* Headline */}
              <h2 className="mb-3 text-[32px] font-medium leading-[1.1] tracking-tight text-roots-cream sm:text-[36px]">
                Get up to 30% off
              </h2>

              {/* Subtitle */}
              <p className="mb-8 max-w-[340px] text-base leading-relaxed text-roots-cream/70">
                Join the Roots community for exclusive deals, wellness tips and early access to new products.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-3">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    className={`h-[60px] w-full rounded-[20px] border bg-roots-cream px-5 text-base text-roots-navy outline-none transition-all duration-200 placeholder:text-roots-navy/40 ${
                      error
                        ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/30"
                        : "border-roots-green/20 focus:border-roots-green focus:ring-2 focus:ring-roots-green/20"
                    }`}
                    aria-label="Email address"
                    aria-invalid={error ? "true" : "false"}
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-300">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex h-[60px] w-full items-center justify-center rounded-[8px] bg-roots-navy text-base font-medium capitalize text-roots-cream transition-colors duration-200 hover:bg-roots-cream hover:text-roots-navy"
                >
                  Sign Up
                </button>
              </form>

              {/* Privacy note */}
              <p className="mt-5 text-center text-xs leading-relaxed text-roots-cream/40">
                By signing up you agree to our{" "}
                <a
                  href="/privacy-policy"
                  className="underline underline-offset-2 transition-colors duration-200 hover:text-roots-cream/70"
                >
                  Privacy Policy
                </a>
                . Unsubscribe at any time.
              </p>
            </>
          ) : (
            /* Success state */
            <div className="flex flex-col items-center py-8 text-center">
              {/* Checkmark circle */}
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-roots-cream/10">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f77f00"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              <h2 className="mb-2 text-[28px] font-medium leading-tight tracking-tight text-roots-cream">
                You&apos;re in!
              </h2>
              <p className="max-w-[300px] text-base leading-relaxed text-roots-cream/70">
                Welcome to the Roots community. Check your inbox for your exclusive discount.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
