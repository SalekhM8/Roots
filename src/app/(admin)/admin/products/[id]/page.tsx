import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductDetail } from "@/server/queries/products";
import { Section, Field } from "@/components/admin/section";
import { StatusPill } from "@/components/ui/status-pill";
import { ProductEditForm } from "@/components/admin/product-edit-form";
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

          {/* Variants */}
          <Section title="Variants">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-roots-green/10 text-xs font-medium uppercase tracking-wider text-roots-navy/50">
                    <th className="pb-2 pr-4">Variant</th>
                    <th className="pb-2 pr-4">SKU</th>
                    <th className="pb-2 pr-4">Price</th>
                    <th className="pb-2 pr-4">Stock</th>
                    <th className="pb-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant) => (
                    <tr key={variant.id} className="border-b border-roots-green/5 last:border-0">
                      <td className="py-2 pr-4 font-medium text-roots-navy">{variant.name}</td>
                      <td className="py-2 pr-4 text-roots-navy/50">{variant.sku}</td>
                      <td className="py-2 pr-4 text-roots-navy">{formatPrice(variant.priceMinor)}</td>
                      <td className="py-2 pr-4">
                        <span className={variant.stockQuantity <= 10 ? "font-medium text-red-600" : "text-roots-navy"}>
                          {variant.stockQuantity}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <StatusPill variant={variant.isActive ? "success" : "neutral"}>
                          {variant.isActive ? "active" : "inactive"}
                        </StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            </div>
          </Section>

          {product.collectionProducts.length > 0 && (
            <Section title="Collections">
              <div className="space-y-1">
                {product.collectionProducts.map((cp) => (
                  <p key={cp.collection.id} className="text-sm text-roots-navy">
                    {cp.collection.name}
                  </p>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
