"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateVariantAction } from "../actions";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";

interface VariantEditFormProps {
  variantId: string;
  initialName: string;
  initialSku: string;
  initialPriceMinor: number;
  initialStockQuantity: number;
  initialIsActive: boolean;
}

export function VariantEditForm({
  variantId,
  initialName,
  initialSku,
  initialPriceMinor,
  initialStockQuantity,
  initialIsActive,
}: VariantEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [priceMinor, setPriceMinor] = useState(initialPriceMinor);
  const [stockQuantity, setStockQuantity] = useState(initialStockQuantity);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateVariantAction({
        variantId,
        priceMinor,
        stockQuantity,
        isActive,
      });

      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }

      setSuccess(true);
      router.refresh();
    });
  }

  const priceDisplay = (priceMinor / 100).toFixed(2);

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-roots-green/5 bg-roots-cream/30 p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="font-medium text-roots-navy">{initialName}</span>
        <span className="text-xs text-roots-navy/40">{initialSku}</span>
        <StatusPill variant={isActive ? "success" : "neutral"}>
          {isActive ? "active" : "inactive"}
        </StatusPill>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-roots-navy/60">
            Price (pence)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={priceMinor}
              onChange={(e) => setPriceMinor(parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-[var(--radius-input)] border border-roots-green/20 bg-roots-cream px-3 py-2 text-sm text-roots-navy outline-none focus:border-roots-green focus:ring-2 focus:ring-roots-green/20"
            />
            <span className="whitespace-nowrap text-xs text-roots-navy/40">
              = £{priceDisplay}
            </span>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-roots-navy/60">
            Stock Quantity
          </label>
          <input
            type="number"
            min={0}
            value={stockQuantity}
            onChange={(e) => setStockQuantity(parseInt(e.target.value, 10) || 0)}
            className="w-full rounded-[var(--radius-input)] border border-roots-green/20 bg-roots-cream px-3 py-2 text-sm text-roots-navy outline-none focus:border-roots-green focus:ring-2 focus:ring-roots-green/20"
          />
        </div>

        <div className="flex items-end gap-3">
          <label className="flex items-center gap-2 text-sm text-roots-navy">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-roots-green/30"
            />
            Active
          </label>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Button type="submit" loading={isPending} size="sm">
          Save Variant
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">Variant updated.</p>}
      </div>
    </form>
  );
}
