"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/admin/section";
import { updateProductAction } from "@/app/(admin)/admin/products/actions";

interface ProductEditFormProps {
  product: {
    id: string;
    name: string;
    shortDescription: string;
    longDescription: string;
    isActive: boolean;
    isVisible: boolean;
  };
}

export function ProductEditForm({ product }: ProductEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState(product.name);
  const [shortDescription, setShortDescription] = useState(product.shortDescription);
  const [longDescription, setLongDescription] = useState(product.longDescription);
  const [isActive, setIsActive] = useState(product.isActive);
  const [isVisible, setIsVisible] = useState(product.isVisible);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateProductAction({
        productId: product.id,
        name,
        shortDescription,
        longDescription,
        isActive,
        isVisible,
      });

      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }

      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <Section title="Product Information">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-roots-navy">
            Short Description
          </label>
          <textarea
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            rows={2}
            className="w-full rounded-[var(--radius-input)] border border-roots-green/20 bg-roots-cream px-4 py-3 text-sm text-roots-navy outline-none focus:border-roots-green focus:ring-2 focus:ring-roots-green/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-roots-navy">
            Long Description
          </label>
          <textarea
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            rows={4}
            className="w-full rounded-[var(--radius-input)] border border-roots-green/20 bg-roots-cream px-4 py-3 text-sm text-roots-navy outline-none focus:border-roots-green focus:ring-2 focus:ring-roots-green/20"
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-roots-navy">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-roots-green/30"
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-roots-navy">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="rounded border-roots-green/30"
            />
            Visible on storefront
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">Product updated.</p>}

        <Button type="submit" loading={isPending} size="sm">
          Save Changes
        </Button>
      </form>
    </Section>
  );
}
