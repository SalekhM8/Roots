import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants";
import { ChecklistIcon } from "@/components/icons";
import { ClearGuestCart } from "@/components/checkout/clear-guest-cart";
import { MetaPixelEvent } from "@/components/observability/meta-pixel-event";
import {
  consultationNeedsPhotos,
  photosComplete,
} from "@/lib/consultation/photos";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
};

// Re-fetch on every request — the payment status is racing the webhook and
// caching this page would freeze the user on the pending screen.
export const dynamic = "force-dynamic";

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
      paymentStatus: true,
      totalMinor: true,
      currency: true,
      payments: {
        select: { status: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      // Drive the post-payment "Upload your photos" CTA on the POM success
      // screen. Refill detection (answersJson) + completeness (uploads).
      consultation: {
        select: {
          id: true,
          status: true,
          answers: { select: { answersJson: true } },
          uploads: { select: { uploadType: true, status: true } },
        },
      },
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
  const paymentStatus = order.payments[0]?.status ?? order.paymentStatus;

  // First-time POM orders now collect photos AFTER payment. On the success
  // screen, prompt the upload as the primary next step when photos are still
  // outstanding. Refills are excluded (consultationNeedsPhotos).
  const consultation = order.consultation;
  const awaitingPhotos =
    isPom &&
    !!consultation &&
    consultationNeedsPhotos(consultation.answers?.answersJson) &&
    !photosComplete(consultation.uploads) &&
    (consultation.status === "submitted" ||
      consultation.status === "action_required");

  // ---- Failed / expired: tell the customer what happened + offer a retry path
  if (paymentStatus === "failed" || paymentStatus === "expired") {
    return (
      <div className="page-container py-16 md:py-20">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="mb-3 text-[32px] font-medium text-roots-navy">
            Payment didn&apos;t complete
          </h1>
          <p className="mb-2 text-roots-navy/70">
            Order <strong className="text-roots-navy">{order.orderNumber}</strong>
          </p>
          <p className="mb-8 text-roots-navy/60">
            Your card was not charged. This usually happens when the card was
            declined or 3-D Secure was cancelled. You can try again — your
            consultation answers are still on file.
          </p>
          <div className="flex flex-col items-center gap-3">
            {!isGuest && (
              <Link
                href={ROUTES.accountOrders}
                className="text-sm font-medium text-roots-green underline"
              >
                Go to my orders
              </Link>
            )}
            <Link
              href={ROUTES.home}
              className="text-sm text-roots-navy/50 underline"
            >
              Return home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- Pending: webhook hasn't landed yet. Auto-refresh every 3s.
  if (paymentStatus === "pending") {
    return (
      <div className="page-container py-16 md:py-20">
        {/* Refresh until we see a terminal status. Server component, so
            client-side state isn't an option here. */}
        <meta httpEquiv="refresh" content="3" />
        <div className="mx-auto max-w-lg text-center">
          <h1 className="mb-3 text-[32px] font-medium text-roots-navy">
            Confirming your payment…
          </h1>
          <p className="mb-2 text-roots-navy/70">
            Order <strong className="text-roots-navy">{order.orderNumber}</strong>
          </p>
          <p className="text-roots-navy/60">
            This usually takes a few seconds. Please don&apos;t close this page.
          </p>
        </div>
      </div>
    );
  }

  // ---- Success path: authorized (POM preauth) or captured (charge)
  // Meta Pixel Purchase event. For POM/mixed orders the card has only been
  // authorised (capture happens on prescriber approval), but Meta still
  // counts an authorisation as a Purchase for attribution — and matches
  // standard practice for pharmacies on Shopify, who fire Purchase at the
  // same point. The `value` is in MAJOR units (£), order number is the
  // only identifier we attach (never PII / consultation answers).
  return (
    <div className="page-container py-16 md:py-20">
      <MetaPixelEvent
        event="Purchase"
        value={order.totalMinor / 100}
        currency={order.currency}
        contentIds={[order.orderNumber]}
      />
      {isGuest && <ClearGuestCart />}
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-roots-green/10">
          <ChecklistIcon size={40} className="text-roots-green" />
        </div>

        <h1 className="mb-3 text-[32px] font-medium text-roots-green">
          {awaitingPhotos
            ? "Almost there — one last step"
            : isPom
              ? "Order Placed"
              : "Payment Confirmed"}
        </h1>

        <p className="mb-2 text-lg text-roots-navy/70">
          Order <strong className="text-roots-navy">{order.orderNumber}</strong>
        </p>

        {isPom ? (
          awaitingPhotos && consultation ? (
            <div className="mb-8">
              <p className="mb-6 text-roots-navy/70">
                Your payment is secured — and you&apos;re not charged until a
                prescriber approves you. <strong className="text-roots-navy">Upload your
                photos now</strong> so we can review and approve your
                consultation and get your treatment on its way to you.
              </p>
              <Link
                href={`/consultations/mounjaro/upload-photos?consultation=${consultation.id}`}
                className="inline-flex items-center rounded-full bg-roots-green px-7 py-3.5 text-base font-medium text-white shadow-sm hover:bg-roots-green/90"
              >
                Upload my photos now
              </Link>
              <p className="mt-4 text-xs text-roots-navy/45">
                Your review only begins once we&apos;ve received your photos.
              </p>
            </div>
          ) : (
            <p className="mb-8 text-roots-navy/60">
              Your payment has been authorised. We will charge your card once a
              prescriber has reviewed and approved your consultation. You will
              receive an email update shortly.
            </p>
          )
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
