import { getAllReviews, type Review } from "@/data/reviews";
import { StarRating } from "@/components/ui/star-rating";

function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "1 month ago";
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return "Over a year ago";
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex min-w-[300px] max-w-[360px] shrink-0 snap-start flex-col rounded-[16px] bg-white p-6 shadow-sm md:p-8">
      <StarRating rating={review.rating} size="md" />

      <p className="mt-4 flex-1 text-base leading-relaxed text-roots-navy">
        &ldquo;{review.text}&rdquo;
      </p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-roots-navy">
            {review.name}
          </p>
          {review.product && (
            <p className="mt-0.5 truncate text-xs text-roots-green/60">
              {review.product}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          {review.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-roots-green/8 px-2.5 py-0.5 text-xs font-medium text-roots-green">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Verified
            </span>
          )}
          <span className="text-[11px] text-roots-navy/40">
            {formatRelativeDate(review.date)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsSection() {
  const reviews = getAllReviews();

  /* Aggregate stats */
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const totalCount = reviews.length;

  return (
    <section className="relative overflow-hidden bg-roots-cream py-16 md:py-20">
      {/* Decorative SVG background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <svg
          viewBox="0 0 1440 600"
          fill="none"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          stroke="#045c4b"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Star — top left */}
          <g
            transform="translate(80, 50) scale(2.5)"
            opacity="0.05"
            strokeWidth="0.7"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </g>

          {/* Heart — top right */}
          <g
            transform="translate(1280, 60) scale(2.5)"
            opacity="0.05"
            strokeWidth="0.7"
          >
            <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
          </g>

          {/* Shield — bottom left */}
          <g
            transform="translate(120, 420) scale(2.5)"
            opacity="0.05"
            strokeWidth="0.7"
          >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="M9 12h6" />
            <path d="M12 9v6" />
          </g>

          {/* Sparkle — centre right */}
          <g
            transform="translate(1300, 380) scale(2)"
            opacity="0.05"
            strokeWidth="0.7"
          >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          </g>

          {/* Accent circles */}
          <circle cx="420" cy="100" r="4" opacity="0.05" strokeWidth="1.3" />
          <circle cx="950" cy="500" r="5" opacity="0.05" strokeWidth="1.3" />
          <circle cx="700" cy="280" r="3" opacity="0.04" strokeWidth="1.3" />
        </svg>
      </div>

      <div className="page-container relative">
        {/* Section header */}
        <div className="mb-10 md:mb-12">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-roots-green/60">
            What Our Customers Say
          </h2>
          <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
            <p className="text-display text-[30px] font-medium leading-tight text-roots-green md:text-[42px] lg:text-[56px]">
              Trusted by thousands
            </p>
            <div className="mb-1 flex items-center gap-2 md:mb-2">
              <StarRating rating={Math.round(avgRating)} size="md" />
              <span className="text-sm font-medium text-roots-navy/70">
                {avgRating.toFixed(1)} from {totalCount}+ reviews
              </span>
            </div>
          </div>
        </div>

        {/* Scrolling review cards */}
        <div
          className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide md:-mx-6 md:px-6"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
