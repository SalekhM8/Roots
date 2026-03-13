"use client";

import { useEffect, useRef } from "react";

const BUSINESS_UNIT_ID = "69b3b07e3b40fe30c6e41070";

export function TrustpilotWidget() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If Trustpilot script is loaded, bootstrap the widget
    const tp = (window as Record<string, unknown>).Trustpilot as
      | { loadFromElement: (el: HTMLElement, reinit: boolean) => void }
      | undefined;

    if (tp && ref.current) {
      tp.loadFromElement(ref.current, true);
    }
  }, []);

  return (
    <div
      ref={ref}
      className="trustpilot-widget"
      data-locale="en-GB"
      data-template-id="53aa8912dec7e10d38f59f36"
      data-businessunit-id={BUSINESS_UNIT_ID}
      data-style-height="140px"
      data-style-width="100%"
      data-theme="dark"
      data-stars="4,5"
    >
      <a
        href="https://uk.trustpilot.com/review/rootspharmacy.co.uk"
        target="_blank"
        rel="noopener noreferrer"
      >
        Trustpilot
      </a>
    </div>
  );
}

export function TrustpilotWidgetLight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tp = (window as Record<string, unknown>).Trustpilot as
      | { loadFromElement: (el: HTMLElement, reinit: boolean) => void }
      | undefined;

    if (tp && ref.current) {
      tp.loadFromElement(ref.current, true);
    }
  }, []);

  return (
    <div
      ref={ref}
      className="trustpilot-widget"
      data-locale="en-GB"
      data-template-id="53aa8912dec7e10d38f59f36"
      data-businessunit-id={BUSINESS_UNIT_ID}
      data-style-height="140px"
      data-style-width="100%"
      data-theme="light"
      data-stars="4,5"
    >
      <a
        href="https://uk.trustpilot.com/review/rootspharmacy.co.uk"
        target="_blank"
        rel="noopener noreferrer"
      >
        Trustpilot
      </a>
    </div>
  );
}
