import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getCartWithItems } from "@/server/queries/cart";
import { CartItems } from "@/components/checkout/cart-items";
import { CartSummary } from "@/components/checkout/cart-summary";
import { LinkButton } from "@/components/ui/link-button";
import { EmptyState } from "@/components/ui/empty-state";
import { CartIcon } from "@/components/icons";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Shopping Cart",
};

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user) {
    // Guest users manage cart client-side — redirect them to guest checkout
    return (
      <div className="page-container py-16 md:py-20">
        <h1 className="mb-6 text-[32px] font-medium text-roots-green md:text-[42px]">
          Shopping Cart
        </h1>
        <EmptyState
          icon={<CartIcon size={48} />}
          message="Your guest cart lives in your browser"
          actionLabel="Proceed to Guest Checkout"
          actionHref="/checkout/guest"
        />
        <p className="mt-4 text-center text-sm text-roots-green/60">
          Or{" "}
          <Link href={ROUTES.signIn} className="underline">
            sign in
          </Link>{" "}
          to use your saved cart and addresses.
        </p>
      </div>
    );
  }

  const cart = await getCartWithItems(user.id);
  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="page-container py-16 md:py-20">
        <h1 className="mb-6 text-[32px] font-medium text-roots-green md:text-[42px]">
          Shopping Cart
        </h1>
        <EmptyState
          icon={<CartIcon size={48} />}
          message="Your cart is empty"
          actionLabel="Browse products"
          actionHref={ROUTES.collection("vitamins-supplements")}
        />
      </div>
    );
  }

  const subtotalMinor = items.reduce(
    (sum, item) => sum + item.unitPriceMinor * item.quantity,
    0
  );
  const totalMinor = subtotalMinor;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const hasPomItems = items.some(
    (i) => i.productVariant.product.productType === "pom"
  );

  return (
    <div className="page-container py-16 md:py-20">
      <h1 className="mb-8 text-[32px] font-medium text-roots-green md:text-[42px]">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CartItems items={items} />

          {hasPomItems && (
            <p className="mt-4 text-sm text-roots-navy/60">
              Prescription items require an approved consultation before checkout.
            </p>
          )}
        </div>

        <div>
          <CartSummary
            subtotalMinor={subtotalMinor}
            totalMinor={totalMinor}
            itemCount={itemCount}
          />

          <LinkButton
            href={ROUTES.checkout}
            variant="primary"
            className="mt-4 w-full text-center"
          >
            Proceed to Checkout
          </LinkButton>

          <Link
            href={ROUTES.collection("vitamins-supplements")}
            className="mt-3 block text-center text-sm text-roots-green/70 underline"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
