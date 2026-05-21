"use client";

/**
 * Sharps + needles modal — appears after a customer clicks "Continue to
 * Checkout" on the dose-selection screen, before the checkout redirect.
 * Asks one combined question: do they need a sharps box and needles
 * supplied with this order?
 *
 * Behaviour:
 *  - Blocking: there is no close button. The customer MUST answer Yes
 *    or No before the cart-add + checkout redirect runs. The pharmacist
 *    needs a definitive answer per order — defaulting silently is unsafe.
 *  - Default highlight: No. Most refill customers already have a sharps
 *    box at home; first-time customers tend to read carefully and tick
 *    Yes deliberately. Default-Yes would over-supply.
 *  - On No: shows a short reminder that sharps must be disposed of in
 *    an approved sharps container, not household waste. They confirm
 *    again to proceed.
 *  - Sharps + needles are included free of charge. We absorb the unit
 *    cost (pennies) because the value of safe disposal compliance and
 *    the goodwill of "they thought of everything" far exceeds it.
 *
 * Renders inline on the dose-selection screen — no route change, no
 * portal complexity. The fixed overlay covers the page; close is only
 * via answering.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SharpsModalProps {
  onConfirm: (needsSharps: boolean) => void;
  submitting: boolean;
}

export function SharpsModal({ onConfirm, submitting }: SharpsModalProps) {
  // null = not yet answered (initial state, both buttons unhighlighted but
  // No is the default focus). After selection, we show a brief
  // confirmation line so the customer sees what they picked and can
  // change their mind before the final "Continue" press.
  const [choice, setChoice] = useState<boolean | null>(null);

  function handleContinue() {
    if (choice === null || submitting) return;
    onConfirm(choice);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sharps-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-roots-navy/40 px-4 py-6 backdrop-blur-sm sm:items-center sm:py-12"
    >
      <div className="glass-card-strong w-full max-w-md rounded-[var(--radius-hero)] p-6 shadow-2xl sm:p-8">
        <h2
          id="sharps-modal-title"
          className="font-serif-display mb-3 text-roots-green text-2xl sm:text-3xl"
        >
          Do you need a sharps box and needles?
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-roots-navy/70">
          Mounjaro pens contain a built-in needle, but if you would like a
          separate sharps disposal box and additional needles supplied with
          your order, let us know. They are included free of charge.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setChoice(true)}
            disabled={submitting}
            className={[
              "rounded-[var(--radius-input)] border-2 px-4 py-3 text-base font-medium transition-colors",
              choice === true
                ? "border-roots-green bg-roots-green text-roots-cream"
                : "border-roots-green/20 text-roots-navy hover:border-roots-green/50",
              submitting && "cursor-not-allowed opacity-60",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            Yes, please send
          </button>
          <button
            type="button"
            onClick={() => setChoice(false)}
            disabled={submitting}
            className={[
              "rounded-[var(--radius-input)] border-2 px-4 py-3 text-base font-medium transition-colors",
              choice === false
                ? "border-roots-green bg-roots-green text-roots-cream"
                : "border-roots-green/20 text-roots-navy hover:border-roots-green/50",
              submitting && "cursor-not-allowed opacity-60",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            No, I have my own
          </button>
        </div>

        {choice === false && (
          <p className="mt-5 rounded-[var(--radius-input)] border border-roots-orange/30 bg-roots-orange/5 p-4 text-xs leading-relaxed text-roots-navy/80">
            Please make sure you have an approved sharps container at home.
            Used needles must never be placed in household waste.
          </p>
        )}

        {choice === true && (
          <p className="mt-5 rounded-[var(--radius-input)] border border-roots-green/20 bg-roots-green/5 p-4 text-xs leading-relaxed text-roots-navy/80">
            We&rsquo;ll include a sharps box and a small supply of needles
            with your order. No extra charge.
          </p>
        )}

        <Button
          variant="secondary"
          disabled={choice === null || submitting}
          loading={submitting}
          onClick={handleContinue}
          className="mt-6 w-full"
        >
          Continue to Checkout
        </Button>
      </div>
    </div>
  );
}
