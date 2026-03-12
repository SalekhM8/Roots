import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants";
import { ChecklistIcon } from "@/components/icons";
import { ClearGuestCart } from "@/components/checkout/clear-guest-cart";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
};

interface ConfirmationPageProps {
  searchParams: Promise<{ order_id?: string }>;
}

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const user = await getCurrentUser();
  const { order_id: orderId } = await searchParams;

  if (!orderId) {
    return (
      <div className="page-container py-16 text-center md:py-20">
        <p className="text-roots-navy/60">No order found.</p>
        <Link href={ROUTES.home} className="mt-4 inline-block text-roots-green underline">
          Return home
        </Link>
      </div>
    );
  }

  // Find order — match by userId for authenticated users, or allow guest orders (userId is null)
  const order = await db.order.findFirst({
    where: {
      id: orderId,
      ...(user ? { userId: user.id } : { userId: null }),
    },
    select: {
      id: true,
      orderNumber: true,
      orderType: true,
      guestEmail: true,
      payments: { select: { status: true } },
    },
  });

  if (!order) {
    return (
      <div className="page-container py-16 text-center md:py-20">
        <p className="text-roots-navy/60">Order not found.</p>
        <Link href={ROUTES.home} className="mt-4 inline-block text-roots-green underline">
          Return home
        </Link>
      </div>
    );
  }

  const isPom = order.orderType === "pom" || order.orderType === "mixed";
  const isGuest = !user;

  return (
    <div className="page-container py-16 md:py-20">
      {isGuest && <ClearGuestCart />}
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-roots-green/10">
          <ChecklistIcon size={40} className="text-roots-green" />
        </div>

        <h1 className="mb-3 text-[32px] font-medium text-roots-green">
          {isPom ? "Order Placed" : "Payment Confirmed"}
        </h1>

        <p className="mb-2 text-lg text-roots-navy/70">
          Order <strong className="text-roots-navy">{order.orderNumber}</strong>
        </p>

        {isPom ? (
          <p className="mb-8 text-roots-navy/60">
            Your payment has been authorised. We will charge your card once a
            prescriber has reviewed and approved your consultation. You will
            receive an email update shortly.
          </p>
        ) : (
          <p className="mb-8 text-roots-navy/60">
            Your payment has been processed. We are preparing your order for
            dispatch.{" "}
            {order.guestEmail
              ? `A confirmation email will be sent to ${order.guestEmail}.`
              : "You will receive a confirmation email shortly."}
          </p>
        )}

        <div className="flex flex-col items-center gap-3">
          {!isGuest && (
            <Link
              href={ROUTES.accountOrders}
              className="text-sm font-medium text-roots-green underline"
            >
              View my orders
            </Link>
          )}
          {isGuest && (
            <p className="text-sm text-roots-navy/50">
              <Link href={ROUTES.signUp} className="text-roots-green underline">
                Create an account
              </Link>{" "}
              to track your orders and save your details for next time.
            </p>
          )}
          <Link
            href={ROUTES.home}
            className="text-sm text-roots-navy/50 underline"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
