import { ProductCard } from "./product-card";
import { formatPrice } from "@/lib/utils";
import { getProductsBySlugs } from "@/server/queries/products";
import { PRODUCT_RECOMMENDATIONS } from "@/data/product-recommendations";

interface ProductRecommendationsProps {
  currentSlug: string;
  isPom?: boolean;
}

export async function ProductRecommendations({
  currentSlug,
  isPom = false,
}: ProductRecommendationsProps) {
  const recommendedSlugs = PRODUCT_RECOMMENDATIONS[currentSlug];
  if (!recommendedSlugs || recommendedSlugs.length === 0) return null;

  const products = await getProductsBySlugs(recommendedSlugs);
  if (products.length === 0) return null;

  return (
    <section
      className={`py-16 ${isPom ? "bg-roots-green text-roots-cream" : "bg-roots-cream"}`}
    >
      <div className="page-container">
        <h2
          className={`mb-8 text-2xl font-medium md:text-3xl ${
            isPom ? "text-roots-cream" : "text-roots-green"
          }`}
        >
          Frequently Bought Together
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            const lowestVariant = product.variants[0];
            return (
              <ProductCard
                key={product.id}
                name={product.name}
                slug={product.slug}
                price={lowestVariant ? formatPrice(lowestVariant.priceMinor) : "—"}
                type={product.productType === "pom" ? "pom" : "supplement"}
                imageUrl={product.defaultImageUrl ?? undefined}
                hasMultipleVariants={(product.variants as unknown[]).length > 1}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
