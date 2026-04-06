import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getSavedPaymentMethodsAction } from "@/app/(shop)/checkout/actions";
import { AccountNav } from "@/components/account/account-nav";
import { SavedCardsList } from "@/components/account/saved-cards-list";

export const metadata: Metadata = {
  title: "Payment Methods",
};

export default async function PaymentMethodsPage() {
  await requireUser();
  const savedCards = await getSavedPaymentMethodsAction();

  return (
    <div className="page-container py-16 md:py-20">
      <h1 className="mb-2 text-[32px] font-medium text-roots-green md:text-[42px]">
        Payment Methods
      </h1>
      <p className="mb-8 text-roots-navy/60">
        Manage your saved cards for faster checkout.
      </p>

      <AccountNav />

      <div className="mt-8">
        <SavedCardsList initialCards={savedCards} />
      </div>
    </div>
  );
}
