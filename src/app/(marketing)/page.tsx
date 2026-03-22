import HeroSlider from "@/components/marketing/hero-slider";
import CategoryHighlight from "@/components/marketing/category-highlight";
import { CuratedSection } from "@/components/marketing/curated-section";
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

      <CuratedSection
        heading="Most Popular Bundles"
        slugs={[
          "stomach-relief-kit",
          "cold-flu-recovery-kit",
          "sleep-stress-reset-kit",
          "skin-rescue-kit",
          "daily-health-stack",
        ]}
        viewAllHref="/collections/bundles"
        viewAllLabel="View All Bundles"
      />

      <CuratedSection
        heading="Quick Relief Essentials"
        slugs={[
          "imodium-instants",
          "gaviscon-double-action",
          "dioralyte-relief-blackcurrant",
          "dioralyte-natural",
        ]}
        viewAllHref="/collections/digestive-health"
        viewAllLabel="View All"
      />

      <CuratedSection
        heading="Daily Health"
        slugs={[
          "centrum-advance",
          "valupak-vitamin-d3",
          "seven-seas-jointcare-essential",
          "berocca-energy-orange",
          "osteocare-original",
        ]}
        viewAllHref="/collections/vitamins-supplements"
        viewAllLabel="View All"
      />

      <CollectionBand />
      <ReviewsSection />
    </>
  );
}
