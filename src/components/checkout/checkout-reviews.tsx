"use client";

import { StarRating } from "@/components/ui/star-rating";

interface MiniReview {
  name: string;
  rating: number;
  text: string;
}

const miniReviews: MiniReview[] = [
  {
    name: "Sarah M.",
    rating: 5,
    text: "Life-changing service. The whole process was seamless and professional.",
  },
  {
    name: "James T.",
    rating: 5,
    text: "Thorough consultation and fast delivery. Could not be happier.",
  },
  {
    name: "Rachel K.",
    rating: 5,
    text: "Trusted pharmacy with genuinely caring staff. Highly recommend.",
  },
];

export function CheckoutReviews() {
  return (
    <div className="rounded-[8px] bg-roots-cream-2 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-roots-navy/50">
        What others say
      </p>

      <div className="space-y-3">
        {miniReviews.map((review) => (
          <div key={review.name} className="rounded-[8px] bg-white p-3">
            <StarRating rating={review.rating} size="sm" />
            <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-roots-navy/80">
              &ldquo;{review.text}&rdquo;
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-roots-navy">
                {review.name}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-roots-green">
                <svg
                  width="10"
                  height="10"
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
