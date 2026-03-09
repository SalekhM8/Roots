import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { getCollectionBySlug } from "@/server/queries/products";
import { formatPrice } from "@/lib/utils";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  return {
    title: collection?.name ?? "Collection",
    description: collection?.description,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) notFound();

  const products = collection.collectionProducts
    .map((cp) => cp.product)
    .filter((p) => p.isActive && p.isVisible);

  return (
    <div className="bg-roots-cream">
      {/* Breadcrumb */}
      <div className="page-container py-6">
        <nav className="flex items-center gap-2 text-sm text-roots-green/60" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-roots-green">Home</Link>
          <span aria-hidden="true">&gt;</span>
          <span className="text-roots-green">{collection.name}</span>
        </nav>
      </div>

      {/* Header */}
      <div className="page-container pb-10 text-center">
        <h1 className="text-[42px] font-medium text-roots-green md:text-[56px]">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="mx-auto mt-4 max-w-xl text-base text-roots-green/70">
            {collection.description}
          </p>
        )}
      </div>

      {/* Product grid */}
      <div className="page-container pb-20">
        <p className="mb-6 text-sm text-roots-green/50">
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const lowestVariant = product.variants[0];
            const price = lowestVariant
              ? formatPrice(lowestVariant.priceMinor)
              : "—";
            return (
              <ProductCard
                key={product.slug}
                name={product.name}
                slug={product.slug}
                price={price}
                type={product.productType === "pom" ? "pom" : "supplement"}
                imageUrl={product.defaultImageUrl ?? undefined}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
