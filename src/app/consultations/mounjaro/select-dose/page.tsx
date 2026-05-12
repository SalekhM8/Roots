import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ImagePlaceholderIcon } from "@/components/icons";
import { formatPrice } from "@/lib/utils";
import { DoseSelector } from "./dose-selector";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Select Your Dose — Mounjaro",
};

interface SelectDosePageProps {
  searchParams: Promise<{ consultation?: string }>;
}

export default async function SelectDosePage({ searchParams }: SelectDosePageProps) {
  const user = await requireUser();
  const { consultation: consultationId } = await searchParams;

  if (!consultationId) {
    redirect(ROUTES.consultation);
  }

  // Verify the consultation belongs to this user and is valid
  const consultation = await db.consultation.findFirst({
    where: {
      id: consultationId,
      userId: user.id,
      status: { in: ["submitted", "approved"] },
    },
    select: {
      id: true,
      productId: true,
      // Pull existing orders so we can short-circuit a double checkout.
      // Without this, a customer hitting back/forward could create a
      // second order against the same consultation — we saw it happen
      // on 2026-05-12 and the prescriber's reject silently voided the
      // wrong payment because the orders had no ordering guarantee.
      orders: {
        select: {
          id: true,
          paymentStatus: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!consultation) {
    redirect(ROUTES.consultation);
  }

  // If a paid (authorized / captured) order already exists, send the
  // customer to the order page instead of letting them initiate a second
  // checkout. Failed / expired / pending orders are fair game to retry.
  const livePaidOrder = consultation.orders.find(
    (o) =>
      o.paymentStatus === "authorized" ||
      o.paymentStatus === "captured" ||
      o.paymentStatus === "pending",
  );
  if (livePaidOrder) {
    redirect(`/account/orders/${livePaidOrder.id}`);
  }

  // Fetch the Mounjaro product with all active variants
  const product = await db.product.findUnique({
    where: { id: consultation.productId, isActive: true },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { priceMinor: "asc" },
      },
    },
  });

  if (!product || product.variants.length === 0) {
    redirect(ROUTES.consultation);
  }

  const lowestPrice = product.variants[0].priceMinor;
  const highestPrice = product.variants[product.variants.length - 1].priceMinor;
  const priceRange =
    lowestPrice === highestPrice
      ? formatPrice(lowestPrice)
      : `${formatPrice(lowestPrice)} — ${formatPrice(highestPrice)}`;

  return (
    <div className="bg-roots-cream text-roots-green">
      <div className="page-container py-12 md:py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-roots-green/60">
            Consultation submitted
          </p>
          <h1 className="font-serif-display mb-4 text-roots-green text-[40px] md:text-[56px]">
            Select your dose
          </h1>
          <p className="mx-auto max-w-lg text-base text-roots-navy/70">
            Choose the Mounjaro dose you would like to order. Your prescriber
            will confirm the appropriate dose during their review.
          </p>
        </div>

        {/* Product + selector */}
        <div className="mx-auto max-w-3xl">
          <div className="glass-card-strong overflow-hidden rounded-[var(--radius-hero)]">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product image */}
              <div className="flex aspect-square items-center justify-center bg-roots-cream-2">
                {product.defaultImageUrl ? (
                  <img
                    src={product.defaultImageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-roots-green/10">
                    <ImagePlaceholderIcon size={64} className="opacity-20" />
                  </div>
                )}
              </div>

              {/* Product details + selector */}
              <div className="flex flex-col justify-center p-6 md:p-8">
                <h2 className="font-serif-display-medium mb-1 text-roots-green text-3xl">
                  {product.name}
                </h2>
                <p className="mb-4 text-lg font-medium text-roots-green/70">
                  {priceRange}
                </p>

                {product.shortDescription && (
                  <p className="mb-6 text-sm leading-relaxed text-roots-navy/70">
                    {product.shortDescription}
                  </p>
                )}

                <DoseSelector
                  variants={product.variants.map((v) => ({
                    id: v.id,
                    name: v.name,
                    priceMinor: v.priceMinor,
                    stockQuantity: v.stockQuantity,
                  }))}
                  consultationId={consultation.id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
