"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useUser } from "@clerk/nextjs";
import { getCartCountAction } from "@/app/(shop)/cart/actions";

interface CartCountContextValue {
  count: number;
  refresh: () => void;
}

const CartCountContext = createContext<CartCountContextValue>({
  count: 0,
  refresh: () => {},
});

export function CartCountProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const { isSignedIn } = useUser();

  const refresh = useCallback(async () => {
    if (isSignedIn) {
      // Authenticated: DB cart
      try {
        const c = await getCartCountAction();
        setCount(c);
      } catch {
        // silently fail
      }
    } else {
      // Guest: localStorage cart
      try {
        const raw = localStorage.getItem("roots_guest_cart");
        if (raw) {
          const items = JSON.parse(raw) as { quantity: number }[];
          setCount(items.reduce((sum, i) => sum + i.quantity, 0));
        } else {
          setCount(0);
        }
      } catch {
        setCount(0);
      }
    }
  }, [isSignedIn]);

  // Fetch on mount and when auth state changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Listen for storage events (guest cart changes from other components)
  useEffect(() => {
    if (isSignedIn) return;

    function onStorage(e: StorageEvent) {
      if (e.key === "roots_guest_cart") {
        refresh();
      }
    }

    // Also listen for custom event for same-tab updates
    function onCartUpdate() {
      refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("guest-cart-updated", onCartUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("guest-cart-updated", onCartUpdate);
    };
  }, [isSignedIn, refresh]);

  return (
    <CartCountContext.Provider value={{ count, refresh }}>
      {children}
    </CartCountContext.Provider>
  );
}

export function useCartCount() {
  return useContext(CartCountContext);
}
