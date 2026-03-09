"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { archiveProductAction, unarchiveProductAction } from "../actions";
import { Button } from "@/components/ui/button";

interface ArchiveButtonProps {
  productId: string;
  isArchived: boolean;
}

export function ArchiveButton({ productId, isArchived }: ArchiveButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const action = isArchived ? "unarchive" : "archive";
    if (!confirm(`Are you sure you want to ${action} this product?`)) return;

    startTransition(async () => {
      const result = isArchived
        ? await unarchiveProductAction({ productId })
        : await archiveProductAction({ productId });

      if (result.success) {
        router.refresh();
      } else {
        alert(result.error ?? `Failed to ${action}.`);
      }
    });
  }

  return (
    <Button
      onClick={handleClick}
      loading={isPending}
      variant={isArchived ? "secondary" : "ghost"}
      size="sm"
      className={
        isArchived
          ? ""
          : "border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      }
    >
      {isArchived ? "Unarchive Product" : "Archive Product"}
    </Button>
  );
}
