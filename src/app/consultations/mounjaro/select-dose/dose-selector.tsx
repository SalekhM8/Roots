"use client";

import { useState, useTransition } from "react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SharpsModal } from "@/components/consultation/sharps-modal";
import { addDoseToCartAction } from "./actions";

interface Variant {
  id: string;
  name: string;
  priceMinor: number;
  stockQuantity: number;
}

interface DoseSelectorProps {
  variants: Variant[];
  consultationId: string;
}

export function DoseSelector({ variants, consultationId }: DoseSelectorProps) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Sharps modal is opened by "Continue to Checkout" click and is the
  // gate between dose-selection and the cart-add + checkout redirect.
  // Cannot be dismissed without answering — the answer is required so
  // the dispensing pharmacist knows whether to include sharps + needles
  // in the parcel.
  const [showSharpsModal, setShowSharpsModal] = useState(false);

  const selected = variants.find((v) => v.id === selectedId);
  const outOfStock = selected ? selected.stockQuantity <= 0 : true;

  function handleContinue() {
    if (!selectedId || outOfStock || isPending) return;
    setError(null);
    setShowSharpsModal(true);
  }

  function handleSharpsConfirm(needsSharps: boolean) {
    // The server action redirects to /checkout on success. It only returns
    // here if there's an error to surface inline. Keep the modal open
    // while submitting so the customer sees the loading state in context
    // rather than the modal vanishing first and looking like a no-op.
    startTransition(async () => {
      const result = await addDoseToCartAction(
        selectedId,
        consultationId,
        needsSharps,
      );
      if (result && !result.success) {
        setError(result.error);
        setShowSharpsModal(false);
      }
      // On success the server-side redirect supersedes everything below;
      // no explicit modal close needed.
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-base font-medium text-roots-navy">
          Select your dose
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {variants.map((variant) => {
            const isSelected = variant.id === selectedId;
            const isDisabled = variant.stockQuantity <= 0;

            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedId(variant.id)}
                disabled={isDisabled}
                className={cn(
                  "flex items-center justify-between rounded-[var(--radius-card)] border-2 px-5 py-4 text-left transition-colors",
                  isSelected
                    ? "border-roots-green bg-roots-green/5"
                    : "border-roots-green/15 hover:border-roots-green/40",
                  isDisabled && "cursor-not-allowed opacity-40"
                )}
              >
                <span className="text-base font-medium text-roots-navy">
                  {variant.name}
                </span>
                <span className="text-base font-medium text-roots-green">
                  {formatPrice(variant.priceMinor)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {outOfStock && (
        <p className="text-sm text-roots-navy/60">
          This dose is currently out of stock. Please select another.
        </p>
      )}

      {error && (
        <div className="glass-error rounded-[var(--radius-input)] p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        variant="secondary"
        disabled={!selectedId || outOfStock || isPending}
        loading={isPending && !showSharpsModal}
        onClick={handleContinue}
        className="w-full"
      >
        Continue to Checkout
      </Button>

      <p className="text-center text-sm text-roots-navy/50">
        Your consultation has been submitted. A prescriber will review it before
        your medication is dispatched.
      </p>

      {showSharpsModal && (
        <SharpsModal
          onConfirm={handleSharpsConfirm}
          submitting={isPending}
        />
      )}
    </div>
  );
}
