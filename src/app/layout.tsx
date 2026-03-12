import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { CartCountProvider } from "@/components/cart/cart-count-provider";
import { PendingCartReplay } from "@/components/cart/pending-cart-replay";
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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
      <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
        <body className="min-h-screen bg-roots-cream font-sans text-roots-navy antialiased">
          <CartCountProvider>
            <PendingCartReplay />
            {children}
          </CartCountProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
