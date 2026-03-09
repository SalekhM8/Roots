import type { Metadata } from "next";
import Link from "next/link";
import { getProductsList } from "@/server/queries/products";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/ui/status-pill";
import { formatPrice, parsePage, humanizeStatus } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Products",
};

interface ProductsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const { page: pageStr } = await searchParams;
  const page = parsePage(pageStr);
  const { products, total, pageSize } = await getProductsList(page);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 md:p-10">
      <h1 className="mb-2 text-2xl font-medium text-roots-green">Products</h1>
      <p className="mb-8 text-sm text-roots-navy/50">
        {total} products · manage variants, pricing, and stock.
      </p>

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-roots-green/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-roots-green/10 text-xs font-medium uppercase tracking-wider text-roots-navy/50">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Variants</th>
              <th className="px-4 py-3">Price Range</th>
              <th className="px-4 py-3">Total Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td className="px-4 py-12 text-center text-roots-navy/30" colSpan={7}>
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const activeVariants = product.variants.filter((v) => v.isActive);
                const totalStock = product.variants.reduce((s, v) => s + v.stockQuantity, 0);
                const minPrice = product.variants[0]?.priceMinor;
                const maxPrice = product.variants[product.variants.length - 1]?.priceMinor;
                const priceRange =
                  minPrice && maxPrice
                    ? minPrice === maxPrice
                      ? formatPrice(minPrice)
                      : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
                    : "—";

                return (
                  <tr
                    key={product.id}
                    className="border-b border-roots-green/5 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-roots-navy">{product.name}</p>
                      <p className="text-xs text-roots-navy/50">{product.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill
                        variant={product.productType === "pom" ? "warning" : "info"}
                      >
                        {humanizeStatus(product.productType)}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3 text-roots-navy/70">
                      {activeVariants.length}/{product.variants.length}
                    </td>
                    <td className="px-4 py-3 text-roots-navy/70">{priceRange}</td>
                    <td className="px-4 py-3 text-roots-navy/70">
                      <span className={totalStock <= 10 ? "font-medium text-red-600" : ""}>
                        {totalStock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill variant={product.isActive ? "success" : "neutral"}>
                        {product.isActive ? "active" : "inactive"}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-sm font-medium text-roots-green underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination basePath="/admin/products" page={page} totalPages={totalPages} />
    </div>
  );
}
