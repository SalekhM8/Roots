import type { Metadata } from "next";
import { GuestCheckoutClient } from "@/components/checkout/guest-checkout-form";

export const metadata: Metadata = {
  title: "Guest Checkout",
  robots: { index: false, follow: false },
};

export default function GuestCheckoutPage() {
  return (
    <div className="page-container py-16 md:py-20">
      <h1 className="mb-8 text-[32px] font-medium text-roots-green md:text-[42px]">
        Guest Checkout
      </h1>
      <GuestCheckoutClient />
    </div>
  );
}
