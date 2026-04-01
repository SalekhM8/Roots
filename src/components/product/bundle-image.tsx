import { BUNDLE_IMAGES } from "@/data/bundle-contents";

/**
 * Exact background color sampled from the product photography.
 * All product images use this warm cream (~#ece3ca) as their backdrop.
 * Matching it here makes the collage look like one seamless image.
 */
const BG = "bg-[#ece3ca]";

interface BundleImageProps {
  slug: string;
  name: string;
  className?: string;
}

export function BundleImage({ slug, name, className = "" }: BundleImageProps) {
  const images = BUNDLE_IMAGES[slug];
  if (!images || images.length === 0) return null;

  const count = images.length;

  if (count === 2) {
    return (
      <div className={`grid h-full w-full grid-cols-2 ${BG} p-4 ${className}`}>
        {images.map((src, i) => (
          <div key={i} className="flex items-center justify-center p-2">
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
    <div className={`grid h-full w-full grid-cols-2 grid-rows-2 ${BG} p-4 ${className}`}>
      <div className="row-span-2 flex items-center justify-center p-2">
        <img
          src={images[0]}
          alt={`${name} item 1`}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="flex items-center justify-center p-2">
        <img
          src={images[1]}
          alt={`${name} item 2`}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="flex items-center justify-center p-2">
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
