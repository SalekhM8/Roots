"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { addDoseToCartAction } from "./actions";
import { ROUTES } from "@/lib/constants";

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
  const router = useRouter();

  const selected = variants.find((v) => v.id === selectedId);
  const outOfStock = selected ? selected.stockQuantity <= 0 : true;

  function handleContinue() {
    if (!selectedId || outOfStock) return;
    setError(null);

    startTransition(async () => {
      const result = await addDoseToCartAction(selectedId, consultationId);

      if (result.success) {
        router.push(ROUTES.checkout);
      } else {
        setError(result.error);
      }
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
        <div className="rounded-[var(--radius-input)] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        variant="secondary"
        disabled={!selectedId || outOfStock || isPending}
        loading={isPending}
        onClick={handleContinue}
        className="w-full"
      >
        Continue to Checkout
      </Button>

      <p className="text-center text-sm text-roots-navy/50">
        Your consultation has been submitted. A prescriber will review it before
        your medication is dispatched.
      </p>
    </div>
  );
}
