import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: {
    default: "Roots Pharmacy | Premium Weight Loss & Wellness",
    template: "%s | Roots Pharmacy",
  },
  description:
    "UK-based pharmacy offering clinician-led Mounjaro weight loss programmes and premium wellness supplements. GPhC registered.",
  metadataBase: new URL("https://rootspharmacy.co.uk"),
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
