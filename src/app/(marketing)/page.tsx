import HeroSlider from "@/components/marketing/hero-slider";
import CategoryHighlight from "@/components/marketing/category-highlight";
import ProductShowcase from "@/components/marketing/product-showcase";
import CollectionBand from "@/components/marketing/collection-band";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <CategoryHighlight />
      <ProductShowcase />
      <CollectionBand />
    </>
  );
}
