import { ProductCard } from "@/components/product/product-card";
import { LinkButton } from "@/components/ui/link-button";
import { formatPrice } from "@/lib/utils";
import { getProductsBySlugs } from "@/server/queries/products";

interface CuratedSectionProps {
  heading: string;
  slugs: string[];
  viewAllHref?: string;
  viewAllLabel?: string;
}

export async function CuratedSection({
  heading,
  slugs,
  viewAllHref,
  viewAllLabel = "View All",
}: CuratedSectionProps) {
  const products = await getProductsBySlugs(slugs);
  if (products.length === 0) return null;

  // Maintain the order from the slugs array
  const ordered = slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(Boolean) as typeof products;

  return (
    <section className="bg-roots-cream py-16 md:py-20">
      <div className="page-container">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-[28px] font-medium text-roots-green md:text-[36px]">
            {heading}
          </h2>
          {viewAllHref && (
            <LinkButton href={viewAllHref} variant="secondary" className="hidden md:inline-flex">
              {viewAllLabel}
            </LinkButton>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {ordered.map((product) => {
            const lowestVariant = product.variants[0];
            return (
              <ProductCard
                key={product.id}
                name={product.name}
                slug={product.slug}
                price={lowestVariant ? formatPrice(lowestVariant.priceMinor) : "—"}
                type={product.productType === "pom" ? "pom" : "supplement"}
                imageUrl={product.defaultImageUrl ?? undefined}
                hasMultipleVariants={product.variants.length > 1}
              />
            );
          })}
        </div>

        {viewAllHref && (
          <div className="mt-6 text-center md:hidden">
            <LinkButton href={viewAllHref} variant="secondary">
              {viewAllLabel}
            </LinkButton>
          </div>
        )}
      </div>
    </section>
  );
}
