import { formatPrice } from "@/lib/utils";

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
  return (
    <div className="rounded-[var(--radius-card)] border border-roots-green/10 bg-white p-6">
      <h2 className="mb-4 text-lg font-medium text-roots-navy">
        Order Summary
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-roots-navy/70">
          <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span>{formatPrice(subtotalMinor)}</span>
        </div>

        <div className="flex justify-between text-roots-navy/70">
          <span>Shipping</span>
          <span>{shippingMinor === 0 ? "Free" : formatPrice(shippingMinor)}</span>
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
