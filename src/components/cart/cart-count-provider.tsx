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
    if (!isSignedIn) {
      setCount(0);
      return;
    }
    try {
      const c = await getCartCountAction();
      setCount(c);
    } catch {
      // silently fail — user may have signed out
    }
  }, [isSignedIn]);

  // Fetch on mount and when auth state changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <CartCountContext.Provider value={{ count, refresh }}>
      {children}
    </CartCountContext.Provider>
  );
}

export function useCartCount() {
  return useContext(CartCountContext);
}
