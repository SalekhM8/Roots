"use client";

import { useState, useEffect, useCallback } from "react";

export interface GuestCartItem {
  variantId: string;
  quantity: number;
  /** Snapshot at time of add — may be stale, re-fetched at checkout */
  productName: string;
  variantName: string;
  priceMinor: number;
  productSlug: string;
  imageUrl?: string;
}

const STORAGE_KEY = "roots_guest_cart";

function loadCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: GuestCartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    // Notify cart count provider in same tab
    window.dispatchEvent(new Event("guest-cart-updated"));
  } catch {
    // localStorage unavailable
  }
}

export function clearGuestCart() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function getGuestCartItems(): GuestCartItem[] {
  return loadCart();
}

export function useGuestCart() {
  const [items, setItems] = useState<GuestCartItem[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(loadCart());
  }, []);

  const addItem = useCallback((item: GuestCartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      let next: GuestCartItem[];
      if (existing) {
        next = prev.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, 10) }
            : i
        );
      } else {
        next = [...prev, item];
      }
      saveCart(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((prev) => {
      const next =
        quantity <= 0
          ? prev.filter((i) => i.variantId !== variantId)
          : prev.map((i) =>
              i.variantId === variantId ? { ...i, quantity } : i
            );
      saveCart(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.variantId !== variantId);
      saveCart(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    clearGuestCart();
  }, []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalMinor = items.reduce(
    (sum, i) => sum + i.priceMinor * i.quantity,
    0
  );

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    count,
    subtotalMinor,
  };
}
