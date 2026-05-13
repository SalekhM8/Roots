import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { DM_Sans, Fraunces, Instrument_Serif } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { CartCountProvider } from "@/components/cart/cart-count-provider";
import { PendingCartReplay } from "@/components/cart/pending-cart-replay";
import NewsletterPopup from "@/components/marketing/newsletter-popup";
import { PostHogBootstrap } from "@/components/observability/posthog-bootstrap";
import { MetaPixelBase } from "@/components/observability/meta-pixel-base";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["900"],
  variable: "--font-display",
  display: "swap",
});

// Editorial thin serif used for Voy-style consultation headings
// ("Select your dose", "Upload your photos"). GT Super Display lookalike.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif-thin",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#045c4b",
};

export const metadata: Metadata = {
  title: {
    default: "Roots Pharmacy | Mounjaro Weight Loss & Wellness Supplements UK",
    template: "%s | Roots Pharmacy",
  },
  description:
    "GPhC registered UK online pharmacy. Buy Mounjaro weight loss injections with clinician-led consultations. Premium vitamins, supplements & pharmacy essentials delivered to your door.",
  metadataBase: new URL("https://rootspharmacy.co.uk"),
  keywords: [
    "Mounjaro UK",
    "buy Mounjaro online",
    "weight loss pharmacy UK",
    "online pharmacy UK",
    "tirzepatide UK",
    "GPhC registered pharmacy",
    "wellness supplements UK",
    "vitamins online UK",
    "Roots Pharmacy",
  ],
  authors: [{ name: "Roots Pharmacy" }],
  creator: "Roots Pharmacy",
  publisher: "Roots Pharmacy",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://rootspharmacy.co.uk",
    siteName: "Roots Pharmacy",
    title: "Roots Pharmacy | Mounjaro Weight Loss & Wellness Supplements UK",
    description:
      "GPhC registered UK online pharmacy. Buy Mounjaro weight loss injections with clinician-led consultations. Premium vitamins, supplements & pharmacy essentials.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Roots Pharmacy — Premium Weight Loss & Wellness",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Roots Pharmacy | Mounjaro Weight Loss & Wellness UK",
    description:
      "GPhC registered UK online pharmacy. Clinician-led Mounjaro consultations & premium wellness supplements.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://rootspharmacy.co.uk",
  },
  // Icons are auto-detected from src/app/icon.svg and src/app/apple-icon.svg
  // by the Next.js file-based metadata convention — see those files.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      <html lang="en" className={`${dmSans.variable} ${fraunces.variable} ${instrumentSerif.variable}`}>
        <head>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=AW-18012492286"
            strategy="afterInteractive"
          />
          <Script id="google-ads" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-18012492286');
            `}
          </Script>
          <Script
            src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
            strategy="afterInteractive"
          />
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src="https://www.facebook.com/tr?id=1010067568024762&ev=PageView&noscript=1"
            />
          </noscript>
        </head>
        <body className="min-h-screen bg-roots-cream font-sans text-roots-navy antialiased">
          <PostHogBootstrap />
          {/* Meta Pixel base loader + auto-PageView with PHI route
              blocklist and CAPI deduplication. See meta-pixel-base.tsx. */}
          <MetaPixelBase />
          <CartCountProvider>
            <PendingCartReplay />
            {children}
            <NewsletterPopup />
          </CartCountProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
