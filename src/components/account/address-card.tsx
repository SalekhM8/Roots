"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteAddressAction } from "@/app/(account)/account/addresses/actions";

interface AddressCardProps {
  address: {
    id: string;
    label: string | null;
    firstName: string;
    lastName: string;
    line1: string;
    line2: string | null;
    city: string;
    postcode: string;
    phone: string | null;
    isDefaultShipping: boolean;
    isDefaultBilling: boolean;
  };
  onEdit: (id: string) => void;
}

export function AddressCard({ address, onEdit }: AddressCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(async () => {
      await deleteAddressAction(address.id);
      router.refresh();
    });
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-roots-green/10 bg-white p-5">
      <div className="mb-2 flex items-center gap-2">
        {address.label && (
          <span className="text-sm font-medium text-roots-navy">{address.label}</span>
        )}
        {address.isDefaultShipping && (
          <span className="rounded-full bg-roots-green/10 px-2 py-0.5 text-xs font-medium text-roots-green">
            Default shipping
          </span>
        )}
        {address.isDefaultBilling && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
            Default billing
          </span>
        )}
      </div>

      <p className="text-sm text-roots-navy">
        {address.firstName} {address.lastName}
      </p>
      <p className="text-sm text-roots-navy/70">{address.line1}</p>
      {address.line2 && <p className="text-sm text-roots-navy/70">{address.line2}</p>}
      <p className="text-sm text-roots-navy/70">
        {address.city}, {address.postcode}
      </p>
      {address.phone && (
        <p className="mt-1 text-sm text-roots-navy/50">{address.phone}</p>
      )}

      <div className="mt-4 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(address.id)}
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          loading={isPending}
          className={confirmDelete ? "text-red-600 hover:text-red-700" : ""}
        >
          {confirmDelete ? "Confirm delete" : "Delete"}
        </Button>
      </div>
    </div>
  );
}
