"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Faq {
  question: string;
  answer: string;
}

interface WeightLossFaqSectionProps {
  faqs: Faq[];
}

export function WeightLossFaqSection({ faqs }: WeightLossFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-roots-cream/10">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-6 text-left transition-colors duration-200"
              aria-expanded={isOpen}
            >
              <span className="text-lg font-medium text-roots-cream">
                {faq.question}
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-roots-cream/20">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={cn(
                    "text-roots-cream/60 transition-transform duration-200",
                    isOpen && "rotate-45"
                  )}
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-out",
                isOpen ? "max-h-96 pb-6" : "max-h-0"
              )}
            >
              <p className="max-w-2xl text-base leading-relaxed text-roots-cream/60">
                {faq.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
