"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { bulkGenerateLabelsAction } from "@/app/(admin)/admin/fulfillment/actions";

interface BulkLabelsProps {
  /** Orders eligible for label generation (ready_to_pack or packed). */
  eligibleOrders: Array<{
    id: string;
    orderNumber: string;
  }>;
}

export function BulkLabels({ eligibleOrders }: BulkLabelsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "partial";
    message: string;
    details?: Array<{ orderNumber: string; error?: string }>;
  } | null>(null);

  function toggleOrder(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === eligibleOrders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(eligibleOrders.map((o) => o.id)));
    }
  }

  function handleGenerateLabels() {
    if (selected.size === 0) return;

    setFeedback(null);
    startTransition(async () => {
      const result = await bulkGenerateLabelsAction(Array.from(selected));

      if (!result.results || result.results.length === 0) {
        setFeedback({ type: "error", message: result.error ?? "Failed." });
        return;
      }

      const failures = result.results.filter((r) => !r.success);

      if (failures.length === 0) {
        setFeedback({
          type: "success",
          message: `Labels generated for ${result.summary!.succeeded} order(s).`,
        });
        setSelected(new Set());
      } else if (result.summary!.succeeded > 0) {
        setFeedback({
          type: "partial",
          message: `${result.summary!.succeeded} succeeded, ${result.summary!.failed} failed.`,
          details: failures.map((f) => ({
            orderNumber: f.orderNumber,
            error: f.error,
          })),
        });
      } else {
        setFeedback({
          type: "error",
          message: "All orders failed.",
          details: failures.map((f) => ({
            orderNumber: f.orderNumber,
            error: f.error,
          })),
        });
      }

      router.refresh();
    });
  }

  if (eligibleOrders.length === 0) return null;

  return (
    <div className="mb-6 rounded-[var(--radius-card)] border border-roots-green/10 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-roots-navy/70">
            <input
              type="checkbox"
              checked={selected.size === eligibleOrders.length}
              onChange={toggleAll}
              className="rounded border-roots-green/30"
            />
            Select all ({eligibleOrders.length})
          </label>
          <span className="text-xs text-roots-navy/40">
            {selected.size} selected
          </span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleGenerateLabels}
          loading={isPending}
          disabled={selected.size === 0}
        >
          Generate Labels ({selected.size})
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {eligibleOrders.map((order) => (
          <label
            key={order.id}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              selected.has(order.id)
                ? "border-roots-green bg-roots-green/10 text-roots-green"
                : "border-roots-green/10 text-roots-navy/50 hover:border-roots-green/30"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.has(order.id)}
              onChange={() => toggleOrder(order.id)}
              className="sr-only"
            />
            {order.orderNumber}
          </label>
        ))}
      </div>

      {feedback && (
        <div
          className={`mt-3 rounded-lg p-3 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800"
              : feedback.type === "partial"
                ? "bg-amber-50 text-amber-800"
                : "bg-red-50 text-red-800"
          }`}
        >
          <p className="font-medium">{feedback.message}</p>
          {feedback.details && feedback.details.length > 0 && (
            <ul className="mt-1 list-inside list-disc text-xs">
              {feedback.details.map((d) => (
                <li key={d.orderNumber}>
                  {d.orderNumber}: {d.error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
