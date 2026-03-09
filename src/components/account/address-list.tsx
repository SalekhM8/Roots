"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddressCard } from "./address-card";
import { AddressForm } from "./address-form";
import type { AddressInput } from "@/lib/validation/schemas";

interface AddressData {
  id: string;
  label: string | null;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string | null;
  city: string;
  postcode: string;
  countryCode: string;
  phone: string | null;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

interface AddressListProps {
  addresses: AddressData[];
}

export function AddressList({ addresses }: AddressListProps) {
  const [formMode, setFormMode] = useState<"closed" | "add" | "edit">("closed");
  const [editId, setEditId] = useState<string | null>(null);

  function handleEdit(id: string) {
    setEditId(id);
    setFormMode("edit");
  }

  function handleDone() {
    setFormMode("closed");
    setEditId(null);
  }

  const editAddress = addresses.find((a) => a.id === editId);

  return (
    <div className="space-y-4">
      {formMode === "closed" && (
        <Button size="sm" onClick={() => setFormMode("add")}>
          Add Address
        </Button>
      )}

      {formMode === "add" && <AddressForm mode="add" onDone={handleDone} />}

      {formMode === "edit" && editAddress && (
        <AddressForm
          mode="edit"
          addressId={editAddress.id}
          initial={editAddress as Partial<AddressInput>}
          onDone={handleDone}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <AddressCard key={address.id} address={address} onEdit={handleEdit} />
        ))}
      </div>
    </div>
  );
}
