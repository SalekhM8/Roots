import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCartWithItems } from "@/server/queries/cart";
import { getCustomerAddresses } from "@/server/queries/account";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getSavedPaymentMethodsAction } from "./actions";
import { ROUTES, calculateShipping } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const user = await requireUser();

  const [cart, savedAddresses, savedCards] = await Promise.all([
    getCartWithItems(user.id),
    getCustomerAddresses(user.id),
    getSavedPaymentMethodsAction(),
  ]);

  if (!cart || cart.items.length === 0) {
    redirect(ROUTES.cart);
  }

  const subtotalMinor = cart.items.reduce(
    (sum, item) => sum + item.unitPriceMinor * item.quantity,
    0
  );
  const shippingMinor = calculateShipping(subtotalMinor);
  const totalMinor = subtotalMinor + shippingMinor;
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const hasPomItems = cart.items.some(
    (i) => i.productVariant.product.productType === "pom"
  );

  return (
    <div className="page-container py-16 md:py-20">
      <h1 className="mb-8 text-[32px] font-medium text-roots-green md:text-[42px]">
        Checkout
      </h1>

      <CheckoutForm
        subtotalMinor={subtotalMinor}
        shippingMinor={shippingMinor}
        totalMinor={totalMinor}
        itemCount={itemCount}
        hasPomItems={hasPomItems}
        savedAddresses={savedAddresses}
        savedCards={savedCards}
      />
    </div>
  );
}
