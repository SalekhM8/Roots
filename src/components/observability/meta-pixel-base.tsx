"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { isMetaPixelAllowed } from "./meta-pixel-allowed";

/**
 * Base Meta Pixel loader. Replaces the inline `<Script>` block we
 * previously had in the root layout, because:
 *
 *   1. We need to fire PageView on every client-side route change in
 *      Next.js App Router (the inline `fbq('track', 'PageView')` only
 *      runs at initial load).
 *   2. We need to honour the PHI route blocklist — never fire on
 *      /consultations/*, /account*, /admin*.
 *   3. We need each PageView to carry an `eventID` shared with a CAPI
 *      echo so Meta dedupes the two.
 *
 * Pixel ID is intentionally inlined here (not env-driven) because
 * baking it into the bundle is required for the script to do its job
 * — and the pixel ID is public anyway (Meta's docs even tell you to
 * put it in HTML). The CAPI access token, however, is server-only and
 * read from env.
 */

const PIXEL_ID = "1010067568024762";

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

export function MetaPixelBase() {
  const pathname = usePathname();
  // Track the last path we fired PageView for so React 18 StrictMode + nav
  // re-renders don't double-fire on the same page.
  const lastFiredPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (!isMetaPixelAllowed(pathname)) {
      // Even if we navigate FROM an allowed page INTO a blocked one, we
      // don't fire anything. The previous page's PageView already fired.
      return;
    }
    if (lastFiredPath.current === pathname) return;
    lastFiredPath.current = pathname;

    const eventId = generateEventId();

    const tryFire = (attempt: number) => {
      const fbq = window.fbq;
      if (typeof fbq === "function") {
        fbq("track", "PageView", {}, { eventID: eventId });
        return;
      }
      if (attempt < 20) {
        setTimeout(() => tryFire(attempt + 1), 250);
      }
    };
    tryFire(0);

    // CAPI echo for PageView. The marketing brief explicitly asked for
    // PageView via CAPI; if attribution volume becomes a concern we can
    // demote this to browser-only later by deleting the fetch below.
    fetch("/api/meta/capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "PageView",
        event_id: eventId,
        event_source_url: typeof window !== "undefined" ? window.location.href : undefined,
        fbp: readCookie("_fbp"),
        fbc: readCookie("_fbc"),
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return (
    <Script id="meta-pixel-base" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${PIXEL_ID}');
        // Initial PageView fires from the React effect above with an
        // eventID so it can be deduped against the CAPI echo. Do NOT
        // call fbq('track', 'PageView') here — it would race and double
        // count.
      `}
    </Script>
  );
}
