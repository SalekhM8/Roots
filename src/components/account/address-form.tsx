"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addAddressAction, updateAddressAction } from "@/app/(account)/account/addresses/actions";
import type { AddressInput } from "@/lib/validation/schemas";

interface AddressFormProps {
  mode: "add" | "edit";
  addressId?: string;
  initial?: Partial<AddressInput>;
  onDone: () => void;
}

export function AddressForm({ mode, addressId, initial, onDone }: AddressFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<AddressInput>({
    label: initial?.label ?? "",
    firstName: initial?.firstName ?? "",
    lastName: initial?.lastName ?? "",
    line1: initial?.line1 ?? "",
    line2: initial?.line2 ?? "",
    city: initial?.city ?? "",
    postcode: initial?.postcode ?? "",
    countryCode: initial?.countryCode ?? "GB",
    phone: initial?.phone ?? "",
    isDefaultShipping: initial?.isDefaultShipping ?? false,
    isDefaultBilling: initial?.isDefaultBilling ?? false,
  });

  function update(field: keyof AddressInput, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result =
        mode === "edit" && addressId
          ? await updateAddressAction(addressId, form)
          : await addAddressAction(form);

      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }

      router.refresh();
      onDone();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[var(--radius-card)] border border-roots-green/10 bg-white p-6">
      <h3 className="text-lg font-medium text-roots-navy">
        {mode === "edit" ? "Edit Address" : "Add Address"}
      </h3>

      <Input
        label="Label (optional)"
        placeholder="e.g. Home, Work"
        value={form.label ?? ""}
        onChange={(e) => update("label", e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          value={form.firstName}
          onChange={(e) => update("firstName", e.target.value)}
          required
        />
        <Input
          label="Last name"
          value={form.lastName}
          onChange={(e) => update("lastName", e.target.value)}
          required
        />
      </div>

      <Input
        label="Address line 1"
        value={form.line1}
        onChange={(e) => update("line1", e.target.value)}
        required
      />
      <Input
        label="Address line 2 (optional)"
        value={form.line2 ?? ""}
        onChange={(e) => update("line2", e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
          required
        />
        <Input
          label="Postcode"
          value={form.postcode}
          onChange={(e) => update("postcode", e.target.value)}
          required
        />
      </div>

      <Input
        label="Phone (optional)"
        type="tel"
        value={form.phone ?? ""}
        onChange={(e) => update("phone", e.target.value)}
      />

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-roots-navy">
          <input
            type="checkbox"
            checked={form.isDefaultShipping}
            onChange={(e) => update("isDefaultShipping", e.target.checked)}
            className="rounded border-roots-green/30"
          />
          Default shipping
        </label>
        <label className="flex items-center gap-2 text-sm text-roots-navy">
          <input
            type="checkbox"
            checked={form.isDefaultBilling}
            onChange={(e) => update("isDefaultBilling", e.target.checked)}
            className="rounded border-roots-green/30"
          />
          Default billing
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" loading={isPending} size="sm">
          {mode === "edit" ? "Update" : "Add Address"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
