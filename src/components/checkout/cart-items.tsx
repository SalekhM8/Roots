"use client";

import { useTransition } from "react";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { formatPrice } from "@/lib/utils";
import {
  updateCartItemAction,
  removeCartItemAction,
} from "@/app/(shop)/cart/actions";
import type { CartWithItems } from "@/server/queries/cart";

interface CartItemsProps {
  items: CartWithItems["items"];
}

export function CartItems({ items }: CartItemsProps) {
  const [isPending, startTransition] = useTransition();

  function handleUpdate(itemId: string, quantity: number) {
    startTransition(async () => {
      if (quantity <= 0) {
        await removeCartItemAction(itemId);
      } else {
        await updateCartItemAction(itemId, quantity);
      }
    });
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 rounded-[var(--radius-card)] border border-roots-green/10 bg-white p-4 md:p-6"
        >
          {/* Product image placeholder */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-roots-cream-2">
            <span className="text-2xl text-roots-green/20">
              {item.productVariant.product.name.charAt(0)}
            </span>
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-roots-navy">
              {item.productVariant.product.name}
            </h3>
            <p className="text-sm text-roots-navy/60">
              {item.productVariant.name}
            </p>
            <p className="mt-1 text-sm font-medium text-roots-green">
              {formatPrice(item.unitPriceMinor)}
            </p>
          </div>

          {/* Quantity controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleUpdate(item.id, item.quantity - 1)}
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-roots-green/15 text-roots-navy/60 transition-colors hover:bg-roots-green/5 disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              <MinusIcon size={14} />
            </button>
            <span className="w-8 text-center text-sm font-medium text-roots-navy">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => handleUpdate(item.id, item.quantity + 1)}
              disabled={isPending || item.quantity >= 10}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-roots-green/15 text-roots-navy/60 transition-colors hover:bg-roots-green/5 disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <PlusIcon size={14} />
            </button>
          </div>

          {/* Line total */}
          <p className="w-20 text-right font-medium text-roots-navy">
            {formatPrice(item.unitPriceMinor * item.quantity)}
          </p>

          {/* Remove */}
          <button
            type="button"
            onClick={() => handleUpdate(item.id, 0)}
            disabled={isPending}
            className="ml-2 text-roots-navy/30 transition-colors hover:text-red-500 disabled:opacity-50"
            aria-label="Remove item"
          >
            <TrashIcon size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
