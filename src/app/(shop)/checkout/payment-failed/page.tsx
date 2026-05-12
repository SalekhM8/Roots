import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Payment unsuccessful",
  robots: { index: false, follow: false },
};

/**
 * Friendly landing page for a declined / cancelled / 3DS-failed Viva
 * payment. Reached via `/api/viva/return` when `processVivaReturn` resolves
 * to outcome `"failure"`. The cart is left in `active` state by the payment
 * service so the customer can hit "Try again" and re-submit checkout
 * without re-adding items.
 */
export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const { eventId } = await searchParams;

  return (
    <div className="page-container py-16 md:py-20">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="mb-4 text-[32px] font-medium text-roots-green md:text-[42px]">
          Payment unsuccessful
        </h1>
        <p className="mb-8 text-base text-roots-navy/80">
          Your card was declined and the payment was not taken. This can
          happen if the security code (CVV) is incorrect, the card has
          insufficient funds, or your bank blocked the transaction.
        </p>

        <p className="mb-8 text-base text-roots-navy/80">
          Your basket is still saved — please try again, or use a different
          card.
        </p>

        <div className="flex flex-col items-center gap-3">
          <LinkButton
            href={ROUTES.checkout}
            variant="primary"
            className="w-full max-w-xs"
          >
            Try again
          </LinkButton>
          <Link
            href={ROUTES.cart}
            className="text-sm text-roots-green/80 underline"
          >
            Back to basket
          </Link>
        </div>

        <p className="mt-12 text-sm text-roots-navy/50">
          Need help? Email{" "}
          <a
            href="mailto:support@rootspharmacy.co.uk"
            className="underline"
          >
            support@rootspharmacy.co.uk
          </a>
          {eventId ? <span className="block mt-2 text-xs">Ref: {eventId}</span> : null}
        </p>
      </div>
    </div>
  );
}
