import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const BASE_URL = "https://rootspharmacy.co.uk";

// Revalidate every 6 hours — Google Merchant Center typically fetches once/day
export const revalidate = 21600;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatPrice(priceMinor: number, currency: string): string {
  return `${(priceMinor / 100).toFixed(2)} ${currency}`;
}

function getGoogleCategory(productType: string): string {
  switch (productType) {
    case "supplement":
      return "Health &amp; Beauty &gt; Health Care &gt; Vitamins &amp; Supplements";
    case "pom":
    case "other":
      return "Health &amp; Beauty &gt; Health Care &gt; Medicine &amp; Drugs";
    default:
      return "Health &amp; Beauty &gt; Health Care";
  }
}

export async function GET() {
  const products = await db.product.findMany({
    where: {
      isActive: true,
      isVisible: true,
    },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { priceMinor: "asc" },
      },
    },
  });

  const items = products.flatMap((product) =>
    product.variants.map((variant) => {
      const title =
        product.variants.length > 1
          ? `${product.name} - ${variant.name}`
          : product.name;

      const imageUrl = product.defaultImageUrl
        ? `${BASE_URL}${product.defaultImageUrl}`
        : `${BASE_URL}/images/roots-logo.png`;

      const availability =
        variant.stockQuantity > 0 || product.productType === "pom"
          ? "in_stock"
          : "out_of_stock";

      return `    <item>
      <g:id>${escapeXml(variant.sku)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(product.shortDescription)}</g:description>
      <g:link>${BASE_URL}/products/${escapeXml(product.slug)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:price>${formatPrice(variant.priceMinor, variant.currency)}</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Roots Pharmacy</g:brand>
      <g:google_product_category>${getGoogleCategory(product.productType)}</g:google_product_category>
      <g:item_group_id>${escapeXml(product.slug)}</g:item_group_id>
    </item>`;
    })
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Roots Pharmacy</title>
    <link>${BASE_URL}</link>
    <description>UK pharmacy and wellness products from Roots Pharmacy</description>
${items.join("\n")}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=21600, s-maxage=21600",
    },
  });
}
