import HeroSlider from "@/components/marketing/hero-slider";
import CategoryHighlight from "@/components/marketing/category-highlight";
import ProductShowcase from "@/components/marketing/product-showcase";
import CollectionBand from "@/components/marketing/collection-band";
import ReviewsSection from "@/components/marketing/reviews-section";
import { OrganizationJsonLd, PharmacyJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <PharmacyJsonLd />
      <WebSiteJsonLd />
      <HeroSlider />
      <CategoryHighlight />
      <ProductShowcase />
      <CollectionBand />
      <ReviewsSection />
    </>
  );
}
