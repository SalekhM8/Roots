"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { refundOrderAction } from "@/app/(admin)/admin/orders/actions";
import { formatPrice } from "@/lib/utils";

interface RefundButtonProps {
  orderId: string;
  maxRefundMinor: number;
}

export function RefundButton({ orderId, maxRefundMinor }: RefundButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullRefund, setIsFullRefund] = useState(true);
  const [partialAmount, setPartialAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);

    const amountMinor = isFullRefund
      ? undefined
      : Math.round(parseFloat(partialAmount) * 100);

    if (!isFullRefund) {
      if (!amountMinor || isNaN(amountMinor) || amountMinor <= 0) {
        setError("Please enter a valid amount.");
        return;
      }
      if (amountMinor > maxRefundMinor) {
        setError(`Maximum refund is ${formatPrice(maxRefundMinor)}.`);
        return;
      }
    }

    startTransition(async () => {
      const result = await refundOrderAction(
        orderId,
        amountMinor,
        reason || undefined
      );

      if (!result.success) {
        setError(result.error ?? "Refund failed.");
        return;
      }

      setIsOpen(false);
      router.refresh();
    });
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        Issue Refund
      </Button>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-red-200 bg-red-50/50 p-4">
      <h4 className="mb-3 text-sm font-medium text-roots-navy">
        Issue Refund — Max {formatPrice(maxRefundMinor)}
      </h4>

      <div className="mb-3 space-y-2">
        <label className="flex items-center gap-2 text-sm text-roots-navy">
          <input
            type="radio"
            name="refund-type"
            checked={isFullRefund}
            onChange={() => setIsFullRefund(true)}
            className="accent-roots-green"
          />
          Full refund ({formatPrice(maxRefundMinor)})
        </label>
        <label className="flex items-center gap-2 text-sm text-roots-navy">
          <input
            type="radio"
            name="refund-type"
            checked={!isFullRefund}
            onChange={() => setIsFullRefund(false)}
            className="accent-roots-green"
          />
          Partial refund
        </label>
      </div>

      {!isFullRefund && (
        <div className="mb-3">
          <label className="mb-1 block text-xs text-roots-navy/60">
            Amount (£)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={(maxRefundMinor / 100).toFixed(2)}
            value={partialAmount}
            onChange={(e) => setPartialAmount(e.target.value)}
            placeholder="0.00"
            className="w-32 rounded-lg border border-roots-navy/20 px-3 py-2 text-sm text-roots-navy outline-none focus:border-roots-green focus:ring-1 focus:ring-roots-green"
          />
        </div>
      )}

      <div className="mb-3">
        <label className="mb-1 block text-xs text-roots-navy/60">
          Reason (optional)
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Customer request, damaged item"
          className="w-full rounded-lg border border-roots-navy/20 px-3 py-2 text-sm text-roots-navy outline-none focus:border-roots-green focus:ring-1 focus:ring-roots-green"
        />
      </div>

      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          loading={isPending}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          Confirm Refund
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false);
            setError(null);
          }}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
