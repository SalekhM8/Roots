"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  markPackedAction,
  markShippedAction,
} from "@/app/(admin)/admin/fulfillment/actions";

interface FulfillmentActionsProps {
  orderId: string;
  status: string;
}

export function FulfillmentActions({
  orderId,
  status,
}: FulfillmentActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handlePack() {
    setError(null);
    startTransition(async () => {
      const result = await markPackedAction(orderId);
      if (!result.success) {
        setError(result.error ?? "Failed.");
      } else {
        router.refresh();
      }
    });
  }

  function handleShip() {
    if (!trackingNumber.trim()) {
      setError("Tracking number is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await markShippedAction(orderId, trackingNumber.trim());
      if (!result.success) {
        setError(result.error ?? "Failed.");
      } else {
        router.refresh();
      }
    });
  }

  if (status === "ready_to_pack") {
    return (
      <div>
        <Button size="sm" variant="secondary" onClick={handlePack} loading={isPending}>
          Mark Packed
        </Button>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (status === "packed" || status === "labels_created" || status === "exported_for_labels") {
    if (!showTrackingForm) {
      return (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setShowTrackingForm(true)}
        >
          Ship
        </Button>
      );
    }

    return (
      <div className="space-y-2">
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Tracking number"
          className="w-32 rounded-lg border border-roots-green/15 px-2 py-1 text-xs outline-none focus:border-roots-green"
        />
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={handleShip} loading={isPending}>
            Confirm
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowTrackingForm(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return <span className="text-xs text-roots-navy/40">—</span>;
}
