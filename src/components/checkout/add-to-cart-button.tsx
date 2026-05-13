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

type FbqFunction = (...args: unknown[]) => void;
declare global {
  interface Window {
    fbq?: FbqFunction;
  }
}

function generateEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

/**
 * Meta AddToCart on successful add. Browser + CAPI share an event_id
 * for deduplication. PHI rule: only product slug + value + currency
 * leaves the page — never the user's email, name, or anything from
 * the clinical questionnaire. The CAPI endpoint additionally enforces
 * the route blocklist.
 */
function fireAddToCartPixel(args: {
  productSlug: string;
  productName: string;
  priceMajor: number;
  category: string;
}) {
  if (typeof window === "undefined") return;
  const eventId = generateEventId();

  const params = {
    content_ids: [args.productSlug],
    content_name: args.productName,
    content_category: args.category,
    content_type: "product",
    value: args.priceMajor,
    currency: "GBP",
  };

  const fbq = window.fbq;
  if (typeof fbq === "function") {
    fbq("track", "AddToCart", params, { eventID: eventId });
  }

  fetch("/api/meta/capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "AddToCart",
      event_id: eventId,
      event_source_url: window.location.href,
      fbp: readCookie("_fbp"),
      fbc: readCookie("_fbc"),
      custom_data: params,
    }),
    keepalive: true,
  }).catch(() => {});
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
          if (productInfo) {
            fireAddToCartPixel({
              productSlug: productInfo.productSlug,
              productName: productInfo.productName,
              priceMajor: productInfo.priceMinor / 100,
              category: "Wellness Supplements",
            });
          }
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

      fireAddToCartPixel({
        productSlug: productInfo.productSlug,
        productName: productInfo.productName,
        priceMajor: productInfo.priceMinor / 100,
        category: "Wellness Supplements",
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
