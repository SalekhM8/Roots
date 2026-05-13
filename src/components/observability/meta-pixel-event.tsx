"use client";

import { useEffect, useRef } from "react";

/**
 * Fires a Meta (Facebook) Pixel event exactly once on mount. The base
 * pixel + PageView is loaded site-wide in the root layout — this helper
 * is only for the conversion events the marketing team optimises ads
 * against (InitiateCheckout, Purchase, etc).
 *
 * Why a component and not a hook called inline:
 *   - keeps the StrictMode double-invoke guard in one place
 *   - mounts at the page boundary so the event fires after the page
 *     content is in the DOM (parity with `next/script afterInteractive`)
 *   - means a page only needs to render `<MetaPixelEvent .../>` to opt in
 *
 * PHI rule: never pass email, name, DOB, address, consultation answers
 * or any free-text user input into `params`. Numeric value, currency
 * code, and your own order number are all fine.
 */

interface MetaPixelEventProps {
  event:
    | "InitiateCheckout"
    | "AddPaymentInfo"
    | "Purchase"
    | "Lead"
    | "ViewContent"
    | "AddToCart"
    | "CompleteRegistration";
  /** Value in MAJOR units (e.g. 89.99 for £89.99). Convert from pence before passing. */
  value?: number;
  currency?: string;
  /** Stable IDs (e.g. order number, product slug). Never PII. */
  contentIds?: string[];
  contentType?: "product" | "product_group";
  /** Number of items in the transaction — only useful for cart events. */
  numItems?: number;
}

interface FbqParams {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
}

type FbqFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: FbqFunction;
  }
}

export function MetaPixelEvent({
  event,
  value,
  currency,
  contentIds,
  contentType,
  numItems,
}: MetaPixelEventProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // fbq is loaded by `next/script` in the root layout with strategy
    // "afterInteractive", so by the time this client effect runs it is
    // almost always defined. Poll briefly for the rare race.
    const tryFire = (attempt: number) => {
      const fbq = window.fbq;
      if (typeof fbq === "function") {
        const params: FbqParams = {};
        if (value !== undefined) params.value = value;
        if (currency) params.currency = currency;
        if (contentIds && contentIds.length > 0) params.content_ids = contentIds;
        if (contentType) params.content_type = contentType;
        if (numItems !== undefined) params.num_items = numItems;
        fbq("track", event, params);
        return;
      }
      if (attempt < 20) {
        setTimeout(() => tryFire(attempt + 1), 250);
      }
    };
    tryFire(0);
  }, [event, value, currency, contentIds, contentType, numItems]);

  return null;
}
