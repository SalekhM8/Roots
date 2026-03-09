"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";

export function OrderSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get("q") ?? "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = inputRef.current?.value.trim() ?? "";
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    // Reset to page 1 on new search
    startTransition(() => {
      router.push(`/admin/orders?${params.toString()}`);
    });
  }

  function handleClear() {
    if (inputRef.current) inputRef.current.value = "";
    startTransition(() => {
      router.push("/admin/orders");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex items-center gap-3">
      <div className="relative flex-1 max-w-md">
        <input
          ref={inputRef}
          name="q"
          type="text"
          defaultValue={currentQuery}
          placeholder="Search by order #, email, name, or tracking #..."
          className="w-full rounded-lg border border-roots-green/15 bg-white px-4 py-2 pr-10 text-sm text-roots-navy placeholder:text-roots-navy/40 focus:border-roots-green/40 focus:outline-none focus:ring-1 focus:ring-roots-green/20"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-roots-green/30 border-t-roots-green" />
          </div>
        )}
      </div>
      <button
        type="submit"
        className="rounded-lg bg-roots-green px-4 py-2 text-sm font-medium text-roots-cream hover:bg-roots-green/90 transition-colors"
      >
        Search
      </button>
      {currentQuery && (
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg border border-roots-green/15 px-4 py-2 text-sm font-medium text-roots-navy/60 hover:bg-roots-green/5 transition-colors"
        >
          Clear
        </button>
      )}
    </form>
  );
}
