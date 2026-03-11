import Link from "next/link";
import { notFound } from "next/navigation";
import { CollapsibleSection } from "@/components/product/collapsible-section";
import { LinkButton } from "@/components/ui/link-button";
import { AddToCartButton } from "@/components/checkout/add-to-cart-button";
import { VariantSelector } from "@/components/product/variant-selector";
import { ImagePlaceholderIcon } from "@/components/icons";
import { ROUTES } from "@/lib/constants";
import { getProductBySlug } from "@/server/queries/products";
import { formatPrice } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product?.name ?? "Product",
    description: product?.shortDescription,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const isPom = product.productType === "pom";
  const lowestVariant = product.variants[0];
  const hasMultipleVariants = product.variants.length > 1;

  return (
    <div className={isPom ? "bg-roots-green text-roots-cream" : "bg-roots-cream text-roots-green"}>
      {/* Breadcrumb */}
      <div className="page-container py-6">
        <nav
          className={`flex items-center gap-2 text-sm ${isPom ? "text-roots-cream/60" : "text-roots-green/60"}`}
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:opacity-80">Home</Link>
          <span aria-hidden="true">&gt;</span>
          <span className={isPom ? "text-roots-cream" : "text-roots-green"}>{product.name}</span>
        </nav>
      </div>

      {/* Product content */}
      <div className="page-container pb-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Image area */}
          <div
            className={`flex aspect-square items-center justify-center rounded-[var(--radius-hero)] p-8 ${
              isPom ? "bg-roots-green-2/30" : "bg-roots-cream-2"
            }`}
          >
            {product.defaultImageUrl ? (
              <img
                src={product.defaultImageUrl}
                alt={product.name}
                className="max-h-full max-w-full rounded-xl object-contain"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-current/10">
                <ImagePlaceholderIcon size={64} className="opacity-20" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <h1 className="mb-4 text-[32px] font-medium leading-tight md:text-[48px] lg:text-[56px]">
              {product.name}
            </h1>

            {!isPom && lowestVariant && (
              <p className="mb-2 text-2xl font-medium">
                {hasMultipleVariants ? "From " : ""}
                {formatPrice(lowestVariant.priceMinor)}
              </p>
            )}

            {isPom && (
              <p className="mb-2 text-2xl font-medium">
                From {lowestVariant ? formatPrice(lowestVariant.priceMinor) : "—"}
              </p>
            )}

            <p className="mb-8 whitespace-pre-line text-lg leading-relaxed opacity-80">
              {product.shortDescription}
            </p>

            {isPom ? (
              <LinkButton href={ROUTES.consultation} variant="primary" className="w-fit">
                Start Consultation
              </LinkButton>
            ) : hasMultipleVariants ? (
              <VariantSelector
                variants={product.variants.map((v) => ({
                  id: v.id,
                  name: v.name,
                  priceMinor: v.priceMinor,
                  stockQuantity: v.stockQuantity,
                }))}
              />
            ) : lowestVariant ? (
              <AddToCartButton variantId={lowestVariant.id} className="w-fit" />
            ) : null}

            {/* Collapsible info sections */}
            <div className="mt-12">
              <CollapsibleSection title="Full Details" defaultOpen>
                <p className="whitespace-pre-line">{product.longDescription}</p>
              </CollapsibleSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
