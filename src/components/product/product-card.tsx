import Link from "next/link";
import { ImagePlaceholderIcon } from "@/components/icons";

interface ProductCardProps {
  name: string;
  slug: string;
  price: string;
  type: "pom" | "supplement";
  imageUrl?: string;
  hasMultipleVariants?: boolean;
}

export function ProductCard({ name, slug, price, type, imageUrl, hasMultipleVariants }: ProductCardProps) {
  const isPom = type === "pom";
  const showFromPrefix = isPom || hasMultipleVariants;

  return (
    <Link
      href={`/products/${slug}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-roots-cream-2 transition-shadow duration-200 hover:shadow-md"
    >
      {/* Image area */}
      <div className="relative aspect-square overflow-hidden bg-roots-cream-2">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-roots-green/10">
            <ImagePlaceholderIcon className="text-roots-green/20" />
          </div>
        )}
        {isPom && (
          <span className="absolute left-3 top-3 rounded-[var(--radius-card)] bg-roots-navy px-3 py-1 text-xs font-medium text-roots-orange">
            Prescription
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-[112%] font-medium leading-tight text-roots-green">
          {name}
        </h3>
        <p className="mt-auto text-base font-medium text-roots-green/80">
          {showFromPrefix ? "From " : ""}
          {price}
        </p>
      </div>
    </Link>
  );
}
