"use client";

import { useEffect, useRef } from "react";
import { addToCartAction } from "@/app/(shop)/cart/actions";
import { useCartCount } from "@/components/cart/cart-count-provider";

/**
 * Checks sessionStorage for a pending cart item (saved before auth redirect)
 * and replays the add-to-cart action after the user signs in.
 * Renders nothing — purely side-effect.
 */
export function PendingCartReplay() {
  const { refresh } = useCartCount();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem("roots_pending_cart");
    } catch {
      return;
    }
    if (!raw) return;

    try {
      sessionStorage.removeItem("roots_pending_cart");
    } catch {}

    let pending: { variantId: string; quantity: number };
    try {
      pending = JSON.parse(raw);
      if (!pending.variantId) return;
    } catch {
      return;
    }

    addToCartAction(pending.variantId, pending.quantity).then((result) => {
      if (result.success) {
        refresh();
      }
    });
  }, [refresh]);

  return null;
}
