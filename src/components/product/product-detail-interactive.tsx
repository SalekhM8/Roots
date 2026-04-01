"use client";

import { useState } from "react";
import { cn, formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/checkout/add-to-cart-button";
import { ImagePlaceholderIcon } from "@/components/icons";

interface Variant {
  id: string;
  name: string;
  priceMinor: number;
  stockQuantity: number;
  imageUrl?: string | null;
}

interface ProductDetailInteractiveProps {
  variants: Variant[];
  productName: string;
  productSlug: string;
  shortDescription: string;
  defaultImageUrl?: string | null;
  isPom: boolean;
  isBundle: boolean;
  bundleImageNode?: React.ReactNode;
  /** Server-rendered collapsible sections etc. */
  children?: React.ReactNode;
}

export function ProductDetailInteractive({
  variants,
  productName,
  productSlug,
  shortDescription,
  defaultImageUrl,
  isPom,
  isBundle,
  bundleImageNode,
  children,
}: ProductDetailInteractiveProps) {
  const hasMultipleVariants = variants.length > 1;
  const lowestVariant = variants[0];
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");

  const selected = variants.find((v) => v.id === selectedId);

  // Use variant-specific image if available, otherwise fall back to product default
  const currentImageUrl = selected?.imageUrl || defaultImageUrl;

  return (
    <>
      {/* Image area — grid column 1 */}
      <div
        className={`aspect-square overflow-hidden rounded-[var(--radius-hero)] ${
          isBundle ? "bg-[#ece3ca]" : isPom ? "bg-roots-green-2/30" : "bg-roots-cream-2"
        }`}
      >
        {isBundle && bundleImageNode ? (
          bundleImageNode
        ) : currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt={productName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-current/10">
            <ImagePlaceholderIcon size={64} className="opacity-20" />
          </div>
        )}
      </div>

      {/* Details — grid column 2 */}
      <div className="flex flex-col justify-center">
        <h1 className="mb-4 text-[32px] font-medium leading-tight md:text-[48px] lg:text-[56px]">
          {productName}
        </h1>

        {lowestVariant && (
          <p className="mb-2 text-2xl font-medium">
            {hasMultipleVariants ? "From " : ""}
            {formatPrice(lowestVariant.priceMinor)}
          </p>
        )}

        <p className="mb-8 whitespace-pre-line text-lg leading-relaxed opacity-80">
          {shortDescription}
        </p>

        {/* Variant selector + Add to Cart */}
        {hasMultipleVariants ? (
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

            {selected && selected.stockQuantity <= 0 ? (
              <p className="text-sm opacity-60">Out of stock</p>
            ) : selected ? (
              <AddToCartButton
                variantId={selectedId}
                className="w-fit"
                productInfo={{
                  productName,
                  variantName: selected.name,
                  priceMinor: selected.priceMinor,
                  productSlug,
                  imageUrl: (selected.imageUrl || defaultImageUrl) ?? undefined,
                }}
              />
            ) : null}
          </div>
        ) : lowestVariant ? (
          <AddToCartButton
            variantId={lowestVariant.id}
            className="w-fit"
            productInfo={{
              productName,
              variantName: lowestVariant.name,
              priceMinor: lowestVariant.priceMinor,
              productSlug,
              imageUrl: (lowestVariant.imageUrl || defaultImageUrl) ?? undefined,
            }}
          />
        ) : null}

        {/* Server-rendered collapsible sections */}
        {children}
      </div>
    </>
  );
}
