import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD_MINOR } from "@/lib/constants";

interface CartSummaryProps {
  subtotalMinor: number;
  shippingMinor?: number;
  totalMinor: number;
  itemCount: number;
}

export function CartSummary({
  subtotalMinor,
  shippingMinor = 0,
  totalMinor,
  itemCount,
}: CartSummaryProps) {
  const isFreeShipping = subtotalMinor >= FREE_SHIPPING_THRESHOLD_MINOR;
  const remainingMinor = FREE_SHIPPING_THRESHOLD_MINOR - subtotalMinor;
  const progressPercent = Math.min(
    100,
    Math.round((subtotalMinor / FREE_SHIPPING_THRESHOLD_MINOR) * 100)
  );

  return (
    <div className="rounded-[var(--radius-card)] border border-roots-green/10 bg-white p-6">
      <h2 className="mb-4 text-lg font-medium text-roots-navy">
        Order Summary
      </h2>

      {/* Free delivery progress bar */}
      <div className="mb-4 rounded-lg bg-roots-cream/60 p-3">
        {isFreeShipping ? (
          <p className="text-center text-sm font-medium text-roots-green">
            You&apos;ve unlocked free delivery!
          </p>
        ) : (
          <p className="mb-2 text-center text-sm text-roots-navy/70">
            Add{" "}
            <span className="font-semibold text-roots-green">
              {formatPrice(remainingMinor)}
            </span>{" "}
            more for free delivery
          </p>
        )}
        <div className="h-2 overflow-hidden rounded-full bg-roots-green/10">
          <div
            className="h-full rounded-full bg-roots-green transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-roots-navy/70">
          <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span>{formatPrice(subtotalMinor)}</span>
        </div>

        <div className="flex justify-between text-roots-navy/70">
          <span>Shipping</span>
          <span>
            {shippingMinor === 0 ? (
              <span className="font-medium text-roots-green">Free</span>
            ) : (
              formatPrice(shippingMinor)
            )}
          </span>
        </div>

        <div className="border-t border-roots-green/10 pt-3">
          <div className="flex justify-between text-base font-medium text-roots-navy">
            <span>Total</span>
            <span>{formatPrice(totalMinor)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
