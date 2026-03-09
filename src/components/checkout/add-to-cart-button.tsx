"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { addToCartAction } from "@/app/(shop)/cart/actions";
import { useCartCount } from "@/components/cart/cart-count-provider";

interface AddToCartButtonProps {
  variantId: string;
  className?: string;
}

export function AddToCartButton({ variantId, className }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { refresh } = useCartCount();

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  function handleClick() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback(null);
    startTransition(async () => {
      const result = await addToCartAction(variantId);
      if (result.success) {
        refresh();
        setFeedback({ message: "Added to cart", isError: false });
        timerRef.current = setTimeout(() => setFeedback(null), 2000);
      } else {
        setFeedback({ message: result.error, isError: true });
      }
    });
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
        <p className={`mt-2 text-sm ${feedback.isError ? "text-red-600" : "text-roots-green/80"}`}>
          {feedback.message}
        </p>
      )}
    </>
  );
}
