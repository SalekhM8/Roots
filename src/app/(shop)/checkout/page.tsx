import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCartWithItems } from "@/server/queries/cart";
import { getCustomerAddresses } from "@/server/queries/account";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { ROUTES, SHIPPING_FEE_MINOR } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const user = await requireUser();

  const [cart, savedAddresses] = await Promise.all([
    getCartWithItems(user.id),
    getCustomerAddresses(user.id),
  ]);

  if (!cart || cart.items.length === 0) {
    redirect(ROUTES.cart);
  }

  const subtotalMinor = cart.items.reduce(
    (sum, item) => sum + item.unitPriceMinor * item.quantity,
    0
  );
  const shippingMinor = SHIPPING_FEE_MINOR;
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
      />
    </div>
  );
}
