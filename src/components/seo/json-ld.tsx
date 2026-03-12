import { formatPrice } from "@/lib/utils";

interface JsonLdProps {
  data: Record<string, unknown>;
}

function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// --- Organization (homepage) ---
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Roots Pharmacy",
        url: "https://rootspharmacy.co.uk",
        logo: "https://rootspharmacy.co.uk/assets/theme/roots-logo.svg",
        description:
          "UK-based GPhC registered pharmacy offering clinician-led Mounjaro weight loss programmes and premium wellness supplements.",
        contactPoint: {
          "@type": "ContactPoint",
          email: "admin@rootspharmacy.co.uk",
          contactType: "customer service",
          areaServed: "GB",
          availableLanguage: "English",
        },
        sameAs: [],
      }}
    />
  );
}

// --- Pharmacy / LocalBusiness ---
export function PharmacyJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Pharmacy",
        name: "Roots Pharmacy",
        url: "https://rootspharmacy.co.uk",
        description:
          "GPhC registered online pharmacy offering prescription weight loss treatments and wellness supplements across the UK.",
        currenciesAccepted: "GBP",
        paymentAccepted: "Credit Card, Debit Card",
        priceRange: "£",
        areaServed: {
          "@type": "Country",
          name: "United Kingdom",
        },
        isicV4: "4773",
      }}
    />
  );
}

// --- Product ---
interface ProductJsonLdProps {
  name: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
  priceMinor: number;
  currency?: string;
  inStock: boolean;
  sku?: string;
}

export function ProductJsonLd({
  name,
  description,
  slug,
  imageUrl,
  priceMinor,
  currency = "GBP",
  inStock,
  sku,
}: ProductJsonLdProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        url: `https://rootspharmacy.co.uk/products/${slug}`,
        ...(imageUrl && { image: imageUrl.startsWith("http") ? imageUrl : `https://rootspharmacy.co.uk${imageUrl}` }),
        ...(sku && { sku }),
        brand: {
          "@type": "Brand",
          name: "Roots Pharmacy",
        },
        offers: {
          "@type": "Offer",
          url: `https://rootspharmacy.co.uk/products/${slug}`,
          priceCurrency: currency,
          price: (priceMinor / 100).toFixed(2),
          availability: inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: "Roots Pharmacy",
          },
        },
      }}
    />
  );
}

// --- BreadcrumbList ---
interface BreadcrumbItem {
  name: string;
  href?: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          ...(item.href && {
            item: `https://rootspharmacy.co.uk${item.href}`,
          }),
        })),
      }}
    />
  );
}

// --- FAQPage ---
interface FaqItem {
  question: string;
  answer: string;
}

export function FaqJsonLd({ faqs }: { faqs: FaqItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }}
    />
  );
}

// --- Article (blog) ---
interface ArticleJsonLdProps {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  imageUrl?: string;
  authorName?: string;
}

export function ArticleJsonLd({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  imageUrl,
  authorName = "Roots Pharmacy",
}: ArticleJsonLdProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url: `https://rootspharmacy.co.uk/blog/${slug}`,
        datePublished: publishedAt,
        ...(updatedAt && { dateModified: updatedAt }),
        ...(imageUrl && { image: imageUrl }),
        author: {
          "@type": "Organization",
          name: authorName,
        },
        publisher: {
          "@type": "Organization",
          name: "Roots Pharmacy",
          url: "https://rootspharmacy.co.uk",
        },
      }}
    />
  );
}

// --- WebSite (for sitelinks search box) ---
export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Roots Pharmacy",
        url: "https://rootspharmacy.co.uk",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://rootspharmacy.co.uk/collections/vitamins-supplements?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}
