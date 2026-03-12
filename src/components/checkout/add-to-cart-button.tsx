"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { addToCartAction } from "@/app/(shop)/cart/actions";
import { useCartCount } from "@/components/cart/cart-count-provider";
import { useGuestCart, type GuestCartItem } from "@/hooks/use-guest-cart";

interface AddToCartButtonProps {
  variantId: string;
  className?: string;
  /** Required for guest cart — provide product info so we can store it client-side */
  productInfo?: {
    productName: string;
    variantName: string;
    priceMinor: number;
    productSlug: string;
    imageUrl?: string;
  };
}

export function AddToCartButton({
  variantId,
  className,
  productInfo,
}: AddToCartButtonProps) {
  const { isSignedIn } = useUser();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { refresh } = useCartCount();
  const { addItem } = useGuestCart();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleClick() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback(null);

    if (isSignedIn) {
      // Authenticated user → server action (DB cart)
      try {
        sessionStorage.setItem(
          "roots_pending_cart",
          JSON.stringify({ variantId, quantity: 1 })
        );
      } catch {}

      startTransition(async () => {
        const result = await addToCartAction(variantId);
        if (result.success) {
          try {
            sessionStorage.removeItem("roots_pending_cart");
          } catch {}
          refresh();
          setFeedback({ message: "Added to cart", isError: false });
          timerRef.current = setTimeout(() => setFeedback(null), 2000);
        } else {
          try {
            sessionStorage.removeItem("roots_pending_cart");
          } catch {}
          setFeedback({ message: result.error, isError: true });
        }
      });
    } else {
      // Guest user → localStorage cart
      if (!productInfo) {
        // Fallback: redirect to sign-in if no product info provided
        try {
          sessionStorage.setItem(
            "roots_pending_cart",
            JSON.stringify({ variantId, quantity: 1 })
          );
        } catch {}
        window.location.href = "/sign-in";
        return;
      }

      addItem({
        variantId,
        quantity: 1,
        productName: productInfo.productName,
        variantName: productInfo.variantName,
        priceMinor: productInfo.priceMinor,
        productSlug: productInfo.productSlug,
        imageUrl: productInfo.imageUrl,
      });

      setFeedback({ message: "Added to cart", isError: false });
      timerRef.current = setTimeout(() => setFeedback(null), 2000);
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleClick}
        loading={isPending}
        className={className}
      >
        Add to Cart
      </Button>
      {feedback && (
        <p
          className={`mt-2 text-sm ${feedback.isError ? "text-red-600" : "text-roots-green/80"}`}
        >
          {feedback.message}
        </p>
      )}
    </>
  );
}
