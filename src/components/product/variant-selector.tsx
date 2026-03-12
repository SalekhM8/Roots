"use client";

import { useState } from "react";
import { cn, formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/checkout/add-to-cart-button";

interface Variant {
  id: string;
  name: string;
  priceMinor: number;
  stockQuantity: number;
}

interface VariantSelectorProps {
  variants: Variant[];
  productName?: string;
  productSlug?: string;
  imageUrl?: string;
}

export function VariantSelector({ variants, productName, productSlug, imageUrl }: VariantSelectorProps) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");

  const selected = variants.find((v) => v.id === selectedId);
  const outOfStock = selected ? selected.stockQuantity <= 0 : true;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <button
            key={variant.id}
            type="button"
            onClick={() => setSelectedId(variant.id)}
            className={cn(
              "rounded-[var(--radius-btn)] border px-4 py-2 text-sm font-medium transition-colors",
              variant.id === selectedId
                ? "border-current bg-current/10"
                : "border-current/20 hover:border-current/40",
              variant.stockQuantity <= 0 && "opacity-40"
            )}
            disabled={variant.stockQuantity <= 0}
          >
            {variant.name} — {formatPrice(variant.priceMinor)}
          </button>
        ))}
      </div>

      {outOfStock ? (
        <p className="text-sm opacity-60">Out of stock</p>
      ) : (
        <AddToCartButton
          variantId={selectedId}
          className="w-fit"
          productInfo={
            selected && productName && productSlug
              ? {
                  productName,
                  variantName: selected.name,
                  priceMinor: selected.priceMinor,
                  productSlug,
                  imageUrl,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
