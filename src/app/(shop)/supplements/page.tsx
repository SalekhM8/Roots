import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { CollectionFilter } from "@/components/product/collection-filter";
import { getAllSupplementCollections } from "@/server/queries/products";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Supplements — Buy Online",
  description:
    "Browse our full range of vitamins, supplements, digestive health, stress relief, joint care, and skin care products. Fast UK delivery from a GPhC registered pharmacy.",
  openGraph: {
    title: "Supplements | Roots Pharmacy",
    description:
      "Browse our full range of vitamins, supplements, and health products. Fast UK delivery.",
    url: "https://rootspharmacy.co.uk/supplements",
    type: "website",
  },
  alternates: {
    canonical: "https://rootspharmacy.co.uk/supplements",
  },
};

export default async function SupplementsPage() {
  const collections = await getAllSupplementCollections();

  // Build deduplicated product list with category tags
  const productMap = new Map<
    string,
    {
      slug: string;
      name: string;
      price: string;
      type: "pom" | "supplement";
      imageUrl?: string;
      hasMultipleVariants: boolean;
      categories: string[];
      sortKey: number;
    }
  >();

  for (const collection of collections) {
    for (const cp of collection.collectionProducts) {
      const p = cp.product;
      if (!p.isActive || !p.isVisible) continue;

      const existing = productMap.get(p.slug);
      if (existing) {
        if (!existing.categories.includes(collection.slug)) {
          existing.categories.push(collection.slug);
        }
      } else {
        const lowestVariant = p.variants[0];
        productMap.set(p.slug, {
          slug: p.slug,
          name: p.name,
          price: lowestVariant ? formatPrice(lowestVariant.priceMinor) : "—",
          type: p.productType === "pom" ? "pom" : "supplement",
          imageUrl: p.defaultImageUrl ?? undefined,
          hasMultipleVariants: p._count.variants > 1,
          categories: [collection.slug],
          sortKey: cp.sortOrder,
        });
      }
    }
  }

  const products = Array.from(productMap.values()).sort(
    (a, b) => a.sortKey - b.sortKey
  );

  const categories = collections
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      count: c.collectionProducts.filter(
        (cp) => cp.product.isActive && cp.product.isVisible
      ).length,
    }))
    .filter((c) => c.count > 0);

  return (
    <div className="bg-roots-cream">
      <BreadcrumbJsonLd
        items={[{ name: "Home", href: "/" }, { name: "Supplements" }]}
      />

      {/* Breadcrumb */}
      <div className="page-container py-6">
        <nav
          className="flex items-center gap-2 text-sm text-roots-green/60"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-roots-green">
            Home
          </Link>
          <span aria-hidden="true">&gt;</span>
          <span className="text-roots-green">Supplements</span>
        </nav>
      </div>

      {/* Header */}
      <div className="page-container pb-10 text-center">
        <h1 className="text-[42px] font-medium text-roots-green md:text-[56px]">
          Supplements
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-roots-green/70">
          Vitamins, minerals, and targeted health products from trusted brands.
          Fast UK delivery from a GPhC registered pharmacy.
        </p>
      </div>

      {/* Filters + grid */}
      <div className="page-container pb-20">
        <CollectionFilter categories={categories} products={products} />
      </div>
    </div>
  );
}
