import { BUNDLE_IMAGES } from "@/data/bundle-contents";

interface BundleImageProps {
  slug: string;
  name: string;
  className?: string;
}

/**
 * Renders a composite collage of component product images for bundle products.
 * Falls back to null if the slug isn't a known bundle.
 */
export function BundleImage({ slug, name, className = "" }: BundleImageProps) {
  const images = BUNDLE_IMAGES[slug];
  if (!images || images.length === 0) return null;

  const count = images.length;

  if (count === 2) {
    return (
      <div className={`grid h-full w-full grid-cols-2 gap-1 bg-roots-cream-2 p-3 ${className}`}>
        {images.map((src, i) => (
          <div key={i} className="flex items-center justify-center overflow-hidden rounded-lg bg-white p-2">
            <img
              src={src}
              alt={`${name} item ${i + 1}`}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    );
  }

  // 3 items: one large left, two stacked right
  return (
    <div className={`grid h-full w-full grid-cols-2 grid-rows-2 gap-1 bg-roots-cream-2 p-3 ${className}`}>
      <div className="row-span-2 flex items-center justify-center overflow-hidden rounded-lg bg-white p-2">
        <img
          src={images[0]}
          alt={`${name} item 1`}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="flex items-center justify-center overflow-hidden rounded-lg bg-white p-2">
        <img
          src={images[1]}
          alt={`${name} item 2`}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="flex items-center justify-center overflow-hidden rounded-lg bg-white p-2">
        <img
          src={images[2]}
          alt={`${name} item 3`}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
}

/** Check if a slug is a known bundle */
export function isBundle(slug: string): boolean {
  return slug in BUNDLE_IMAGES;
}
