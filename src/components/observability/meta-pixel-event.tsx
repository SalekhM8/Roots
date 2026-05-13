"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isMetaPixelAllowed } from "./meta-pixel-allowed";

/**
 * Fires one Meta (Facebook) Pixel conversion event on mount and sends
 * the matching server-side event via /api/meta/capi for deduplication.
 *
 * Both sides share an `event_id` generated client-side per mount —
 * Meta uses that to merge browser + server hits into a single logical
 * conversion. This is what survives ad-blockers, iOS ITP, etc.
 *
 * PHI rule: never pass email, name, DOB, address, consultation answers
 * or any free-text user input into `params`. Numeric value, currency,
 * own order numbers and product slugs are all fine. The endpoint
 * additionally enforces a route blocklist as defence in depth.
 *
 * Render-time guard: if the current pathname is in the blocklist
 * (`/consultations/*`, `/account*`, `/admin*`, …) this component is a
 * no-op even if a page accidentally mounts it.
 */

export type MetaConversionEvent =
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Lead"
  | "CompleteRegistration";

interface MetaPixelEventProps {
  event: MetaConversionEvent;
  /** Value in MAJOR units (e.g. 89.99 for £89.99). Convert from pence before passing. */
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentName?: string;
  contentCategory?: string;
  contentType?: "product" | "product_group";
  numItems?: number;
  /** Domain order id — only ever passed for Purchase. Helps Meta dedupe across sessions. */
  orderId?: string;
}

type FbqParams = {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_category?: string;
  content_type?: string;
  num_items?: number;
};

type FbqFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: FbqFunction;
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

function generateEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function MetaPixelEvent({
  event,
  value,
  currency,
  contentIds,
  contentName,
  contentCategory,
  contentType,
  numItems,
  orderId,
}: MetaPixelEventProps) {
  const fired = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    if (fired.current) return;
    if (!isMetaPixelAllowed(pathname)) return;
    fired.current = true;

    const eventId = generateEventId();

    const params: FbqParams = {};
    if (value !== undefined) params.value = value;
    if (currency) params.currency = currency;
    if (contentIds && contentIds.length > 0) params.content_ids = contentIds;
    if (contentName) params.content_name = contentName;
    if (contentCategory) params.content_category = contentCategory;
    if (contentType) params.content_type = contentType;
    if (numItems !== undefined) params.num_items = numItems;

    // Browser side — wait briefly for fbq if the base script hasn't loaded yet.
    const tryFire = (attempt: number) => {
      const fbq = window.fbq;
      if (typeof fbq === "function") {
        // The `eventID` key (camelCase, capital ID) is the documented dedup hook.
        fbq("track", event, params, { eventID: eventId });
        return;
      }
      if (attempt < 20) {
        setTimeout(() => tryFire(attempt + 1), 250);
      }
    };
    tryFire(0);

    // Server side — fire-and-forget echo to our CAPI endpoint with the
    // same event_id. Errors are swallowed; we never want a tracking
    // failure to surface to the user.
    const capiBody = {
      event,
      event_id: eventId,
      event_source_url: typeof window !== "undefined" ? window.location.href : undefined,
      fbp: readCookie("_fbp"),
      fbc: readCookie("_fbc"),
      custom_data: {
        ...(value !== undefined ? { value } : {}),
        ...(currency ? { currency } : {}),
        ...(contentIds && contentIds.length > 0 ? { content_ids: contentIds } : {}),
        ...(contentName ? { content_name: contentName } : {}),
        ...(contentCategory ? { content_category: contentCategory } : {}),
        ...(contentType ? { content_type: contentType } : {}),
        ...(numItems !== undefined ? { num_items: numItems } : {}),
        ...(orderId ? { order_id: orderId } : {}),
      },
    };

    fetch("/api/meta/capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(capiBody),
      keepalive: true,
    }).catch(() => {
      // Swallow — tracking must never break the page.
    });
  }, [
    event,
    value,
    currency,
    contentIds,
    contentName,
    contentCategory,
    contentType,
    numItems,
    orderId,
    pathname,
  ]);

  return null;
}
