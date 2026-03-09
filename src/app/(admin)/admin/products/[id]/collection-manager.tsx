"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignCollectionAction, removeCollectionAction } from "../actions";

interface CollectionManagerProps {
  productId: string;
  allCollections: Array<{ id: string; name: string; slug: string }>;
  assignedCollectionIds: string[];
}

export function CollectionManager({
  productId,
  allCollections,
  assignedCollectionIds,
}: CollectionManagerProps) {
  const router = useRouter();
  const [assigned, setAssigned] = useState<Set<string>>(new Set(assignedCollectionIds));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle(collectionId: string) {
    setPendingId(collectionId);
    setError(null);

    const isAssigned = assigned.has(collectionId);

    startTransition(async () => {
      const result = isAssigned
        ? await removeCollectionAction({ productId, collectionId })
        : await assignCollectionAction({ productId, collectionId });

      if (result.success) {
        setAssigned((prev) => {
          const next = new Set(prev);
          if (isAssigned) {
            next.delete(collectionId);
          } else {
            next.add(collectionId);
          }
          return next;
        });
        router.refresh();
      } else {
        setError(result.error ?? "Failed to update collection.");
      }
      setPendingId(null);
    });
  }

  return (
    <div>
      <p className="mb-3 text-xs text-roots-navy/50">
        Click a collection to assign or remove this product.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {allCollections.map((collection) => {
          const isAssigned = assigned.has(collection.id);
          const isThisPending = pendingId === collection.id && isPending;

          return (
            <button
              key={collection.id}
              onClick={() => handleToggle(collection.id)}
              disabled={isThisPending}
              className={`rounded-[var(--radius-btn)] border px-4 py-3 text-left text-sm transition-colors ${
                isAssigned
                  ? "border-roots-green bg-roots-green/5 font-medium text-roots-green"
                  : "border-roots-green/10 bg-white text-roots-navy/50 hover:border-roots-green/30"
              } disabled:opacity-50`}
            >
              {collection.name}
              <span className="ml-2 text-xs font-normal">
                {isThisPending ? "..." : isAssigned ? "(assigned)" : ""}
              </span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
