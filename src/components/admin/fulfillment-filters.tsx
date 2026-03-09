"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "ready_to_pack", label: "Ready to Pack" },
  { value: "packed", label: "Packed" },
  { value: "labels_created", label: "Labels Created" },
  { value: "shipped", label: "Shipped" },
] as const;

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "pom", label: "POM" },
  { value: "supplement", label: "Supplement" },
  { value: "mixed", label: "Mixed" },
] as const;

export function FulfillmentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get("status") ?? "";
  const currentType = searchParams.get("type") ?? "";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams();
    // Preserve existing filters except the one being changed
    const currentFilters: Record<string, string> = {
      status: currentStatus,
      type: currentType,
    };
    currentFilters[key] = value;

    for (const [k, v] of Object.entries(currentFilters)) {
      if (v) params.set(k, v);
    }
    // Reset to page 1 on filter change
    startTransition(() => {
      router.push(`/admin/fulfillment?${params.toString()}`);
    });
  }

  function handleClear() {
    startTransition(() => {
      router.push("/admin/fulfillment");
    });
  }

  const hasFilters = currentStatus || currentType;

  const selectClasses =
    "rounded-lg border border-roots-green/15 bg-white px-3 py-2 text-sm text-roots-navy focus:border-roots-green/40 focus:outline-none focus:ring-1 focus:ring-roots-green/20 appearance-none cursor-pointer pr-8";

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <label className="text-xs font-medium uppercase tracking-wider text-roots-navy/50">
        Filters
      </label>

      <div className="relative">
        <select
          value={currentStatus}
          onChange={(e) => updateFilter("status", e.target.value)}
          className={selectClasses}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-roots-navy/40">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="relative">
        <select
          value={currentType}
          onChange={(e) => updateFilter("type", e.target.value)}
          className={selectClasses}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-roots-navy/40">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg border border-roots-green/15 px-3 py-2 text-sm font-medium text-roots-navy/60 hover:bg-roots-green/5 transition-colors"
        >
          Clear filters
        </button>
      )}

      {isPending && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-roots-green/30 border-t-roots-green" />
      )}
    </div>
  );
}
