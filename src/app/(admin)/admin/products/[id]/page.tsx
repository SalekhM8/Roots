import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductDetail } from "@/server/queries/products";
import { db } from "@/lib/db";
import { Section, Field } from "@/components/admin/section";
import { StatusPill } from "@/components/ui/status-pill";
import { ProductEditForm } from "@/components/admin/product-edit-form";
import { VariantEditForm } from "./variant-edit-form";
import { CollectionManager } from "./collection-manager";
import { ArchiveButton } from "./archive-button";
import { formatPrice, formatDateTime, humanizeStatus } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Edit Product",
};

interface AdminProductDetailProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProductDetailPage({ params }: AdminProductDetailProps) {
  const { id } = await params;
  const product = await getProductDetail(id);

  if (!product) notFound();

  // Fetch all collections for the assignment UI
  const allCollections = await db.collection.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  const assignedCollectionIds = product.collectionProducts.map((cp) => cp.collection.id);

  return (
    <div className="p-6 md:p-10">
      <div className="mb-4">
        <Link href="/admin/products" className="text-sm text-roots-green underline">
          &larr; Back to products
        </Link>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-medium text-roots-green">{product.name}</h1>
        <StatusPill variant={product.isActive ? "success" : "neutral"}>
          {product.isActive ? "active" : "inactive"}
        </StatusPill>
        <StatusPill variant={product.productType === "pom" ? "warning" : "info"}>
          {humanizeStatus(product.productType)}
        </StatusPill>
        {product.archivedAt && (
          <StatusPill variant="neutral">Archived</StatusPill>
        )}
      </div>
      <p className="mb-8 text-sm text-roots-navy/50">
        Slug: {product.slug} · Created {formatDateTime(product.createdAt)}
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Edit form */}
          <ProductEditForm
            product={{
              id: product.id,
              name: product.name,
              shortDescription: product.shortDescription,
              longDescription: product.longDescription,
              isActive: product.isActive,
              isVisible: product.isVisible,
            }}
          />

          {/* Variants — now editable */}
          <Section title={`Variants (${product.variants.length})`}>
            {product.variants.length === 0 ? (
              <p className="text-sm text-roots-navy/30">No variants.</p>
            ) : (
              <div className="space-y-4">
                {product.variants.map((variant) => (
                  <VariantEditForm
                    key={variant.id}
                    variantId={variant.id}
                    initialName={variant.name}
                    initialSku={variant.sku}
                    initialPriceMinor={variant.priceMinor}
                    initialStockQuantity={variant.stockQuantity}
                    initialIsActive={variant.isActive}
                  />
                ))}
              </div>
            )}
          </Section>

          {/* Collections */}
          <Section title="Collections">
            <CollectionManager
              productId={product.id}
              allCollections={allCollections}
              assignedCollectionIds={assignedCollectionIds}
            />
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Section title="Details">
            <div className="space-y-3">
              <Field label="Type" value={humanizeStatus(product.productType)} />
              <Field label="Requires consultation" value={product.requiresConsultation ? "Yes" : "No"} />
              <Field label="Visible" value={product.isVisible ? "Yes" : "No"} />
              <Field label="Variants" value={`${product.variants.length}`} />
              {product.defaultImageUrl && (
                <Field label="Image URL" value={product.defaultImageUrl} />
              )}
              {product.archivedAt && (
                <Field label="Archived" value={formatDateTime(product.archivedAt)} />
              )}
            </div>
          </Section>

          {/* Archive / Unarchive */}
          <Section title="Actions">
            <ArchiveButton productId={product.id} isArchived={!!product.archivedAt} />
          </Section>
        </div>
      </div>
    </div>
  );
}
