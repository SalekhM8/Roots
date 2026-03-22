import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollapsibleSection } from "@/components/product/collapsible-section";
import { LinkButton } from "@/components/ui/link-button";
import { AddToCartButton } from "@/components/checkout/add-to-cart-button";
import { VariantSelector } from "@/components/product/variant-selector";
import { ImagePlaceholderIcon } from "@/components/icons";
import { ProductJsonLd, BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
// import { TrustpilotWidget, TrustpilotWidgetLight } from "@/components/product/trustpilot-widget";
import { ROUTES } from "@/lib/constants";
import { getProductBySlug } from "@/server/queries/products";
import { formatPrice } from "@/lib/utils";
import { PRODUCT_FAQS } from "@/data/product-faqs";
import { ProductRecommendations } from "@/components/product/product-recommendations";
import { BundleImage, isBundle } from "@/components/product/bundle-image";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

function parseDescriptionSections(longDescription: string | null) {
  const result: { overview: string; sections: { title: string; content: string }[] } = {
    overview: "",
    sections: [],
  };
  if (!longDescription) return result;

  // Split on double newlines to get blocks
  const blocks = longDescription.split("\n\n");

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Check if the first line of this block is a section heading (ends with ":")
    const firstNewline = trimmed.indexOf("\n");
    const firstLine = firstNewline === -1 ? trimmed : trimmed.slice(0, firstNewline).trim();
    const rest = firstNewline === -1 ? "" : trimmed.slice(firstNewline + 1).trim();

    if (firstLine.endsWith(":") && firstLine.length < 80) {
      const title = firstLine.slice(0, -1);
      result.sections.push({ title, content: rest });
    } else {
      // No heading — append to overview
      result.overview += (result.overview ? "\n\n" : "") + trimmed;
    }
  }

  return result;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };

  const imageUrl = product.defaultImageUrl
    ? product.defaultImageUrl.startsWith("http")
      ? product.defaultImageUrl
      : `https://rootspharmacy.co.uk${product.defaultImageUrl}`
    : undefined;

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | Roots Pharmacy`,
      description: product.shortDescription,
      url: `https://rootspharmacy.co.uk/products/${slug}`,
      type: "website",
      ...(imageUrl && { images: [{ url: imageUrl, alt: product.name }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDescription,
      ...(imageUrl && { images: [imageUrl] }),
    },
    alternates: {
      canonical: `https://rootspharmacy.co.uk/products/${slug}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const isPom = product.productType === "pom";
  const lowestVariant = product.variants[0];
  const hasMultipleVariants = product.variants.length > 1;

  const lowestPrice = lowestVariant?.priceMinor ?? 0;
  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
  const faqs = PRODUCT_FAQS[product.slug] ?? [];

  // Parse longDescription into sections: intro paragraph + named sections
  const descriptionSections = parseDescriptionSections(product.longDescription);

  return (
    <div className={isPom ? "bg-roots-green text-roots-cream" : "bg-roots-cream text-roots-green"}>
      <ProductJsonLd
        name={product.name}
        description={product.shortDescription}
        slug={product.slug}
        imageUrl={product.defaultImageUrl}
        priceMinor={lowestPrice}
        inStock={totalStock > 0}
        sku={lowestVariant?.id}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: product.name },
        ]}
      />
      {faqs.length > 0 && <FaqJsonLd faqs={faqs} />}

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
            className={`aspect-square overflow-hidden rounded-[var(--radius-hero)] ${
              isPom ? "bg-roots-green-2/30" : "bg-roots-cream-2"
            }`}
          >
            {isBundle(slug) ? (
              <BundleImage slug={slug} name={product.name} className="rounded-[var(--radius-hero)]" />
            ) : product.defaultImageUrl ? (
              <img
                src={product.defaultImageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
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
                productName={product.name}
                productSlug={product.slug}
                imageUrl={product.defaultImageUrl ?? undefined}
              />
            ) : lowestVariant ? (
              <AddToCartButton
                variantId={lowestVariant.id}
                className="w-fit"
                productInfo={{
                  productName: product.name,
                  variantName: lowestVariant.name,
                  priceMinor: lowestVariant.priceMinor,
                  productSlug: product.slug,
                  imageUrl: product.defaultImageUrl ?? undefined,
                }}
              />
            ) : null}

            {/* TODO: Re-enable Trustpilot widget once ~10+ reviews collected */}
            {/* <div className="mt-10">
              {isPom ? <TrustpilotWidget /> : <TrustpilotWidgetLight />}
            </div> */}

            {/* Collapsible info sections */}
            <div className="mt-12">
              {descriptionSections.overview && (
                <CollapsibleSection title="Overview" defaultOpen>
                  <p className="whitespace-pre-line">{descriptionSections.overview}</p>
                </CollapsibleSection>
              )}
              {descriptionSections.sections.map((section, i) => (
                <CollapsibleSection key={i} title={section.title}>
                  <p className="whitespace-pre-line">{section.content}</p>
                </CollapsibleSection>
              ))}

              {faqs.length > 0 && (
                <CollapsibleSection title="Frequently Asked Questions">
                  <div className="space-y-4">
                    {faqs.map((faq, i) => (
                      <div key={i}>
                        <h3 className="font-medium">{faq.question}</h3>
                        <p className="mt-1 opacity-80">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProductRecommendations currentSlug={slug} isPom={isPom} />
    </div>
  );
}
