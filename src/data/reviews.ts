export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  product?: string;
  category: "weight-loss" | "supplement" | "service";
  date: string;
  verified: boolean;
}

const reviews: Review[] = [
  {
    id: "rev-001",
    name: "Sarah M.",
    rating: 5,
    text: "Absolutely life-changing. I've lost over two stone in three months on Mounjaro and the support from Roots has been brilliant throughout.",
    product: "Mounjaro",
    category: "weight-loss",
    date: "2026-02-28T10:30:00Z",
    verified: true,
  },
  {
    id: "rev-002",
    name: "James T.",
    rating: 5,
    text: "The consultation was thorough and I felt genuinely cared for. My prescriber answered all my questions before approving my treatment.",
    product: "Mounjaro",
    category: "weight-loss",
    date: "2026-02-20T14:15:00Z",
    verified: true,
  },
  {
    id: "rev-003",
    name: "Rachel K.",
    rating: 5,
    text: "I was nervous about starting but the whole process was so straightforward. Lost 8kg in my first two months and feeling fantastic.",
    product: "Mounjaro",
    category: "weight-loss",
    date: "2026-02-14T09:45:00Z",
    verified: true,
  },
  {
    id: "rev-004",
    name: "David L.",
    rating: 4,
    text: "Quick delivery and the medication arrived well-packaged with clear instructions. Really impressed with the service overall.",
    product: "Mounjaro",
    category: "weight-loss",
    date: "2026-02-05T16:20:00Z",
    verified: true,
  },
  {
    id: "rev-005",
    name: "Emma W.",
    rating: 5,
    text: "Finally found a pharmacy I trust for my weight loss journey. The clinical team are knowledgeable and the follow-up care is excellent.",
    product: "Mounjaro",
    category: "weight-loss",
    date: "2026-01-28T11:00:00Z",
    verified: true,
  },
  {
    id: "rev-006",
    name: "Michael P.",
    rating: 5,
    text: "Three months in and I've gone down two trouser sizes. My blood sugar levels have improved too. Cannot recommend Roots enough.",
    product: "Mounjaro",
    category: "weight-loss",
    date: "2026-01-15T13:30:00Z",
    verified: true,
  },
  {
    id: "rev-007",
    name: "Charlotte H.",
    rating: 4,
    text: "The online consultation was much easier than I expected. Approved within a day and had my pen delivered two days later.",
    product: "Mounjaro",
    category: "weight-loss",
    date: "2026-01-08T08:50:00Z",
    verified: true,
  },
  {
    id: "rev-008",
    name: "Andrew B.",
    rating: 5,
    text: "Switched from another provider to Roots and the difference in care is night and day. Proper pharmacy, proper service.",
    product: "Mounjaro",
    category: "weight-loss",
    date: "2025-12-22T15:10:00Z",
    verified: true,
  },
  {
    id: "rev-009",
    name: "Laura G.",
    rating: 5,
    text: "Great multivitamin at a fair price. Arrived next day and I've set up a regular order. Very happy with Roots.",
    product: "Centrum Advance",
    category: "supplement",
    date: "2026-02-10T12:00:00Z",
    verified: true,
  },
  {
    id: "rev-010",
    name: "Peter N.",
    rating: 4,
    text: "Good range of supplements and competitive prices. The website is easy to navigate and checkout was seamless.",
    product: "Seven Seas JointCare",
    category: "supplement",
    date: "2026-01-20T10:40:00Z",
    verified: true,
  },
  {
    id: "rev-011",
    name: "Hannah F.",
    rating: 5,
    text: "Ordered Kalms Night and it arrived beautifully packaged. Lovely touch having a proper pharmacy behind the website.",
    product: "Kalms Night",
    category: "supplement",
    date: "2026-01-05T17:25:00Z",
    verified: true,
  },
  {
    id: "rev-012",
    name: "Sophie R.",
    rating: 5,
    text: "Berocca and a few other bits arrived really quickly. Nice to support a proper independent pharmacy rather than the big chains.",
    product: "Berocca",
    category: "supplement",
    date: "2025-12-18T14:55:00Z",
    verified: true,
  },
  {
    id: "rev-013",
    name: "Tom C.",
    rating: 5,
    text: "Excellent customer service. Had a query about my order and the team got back to me within the hour. Will definitely be back.",
    category: "service",
    date: "2026-02-25T09:15:00Z",
    verified: true,
  },
  {
    id: "rev-014",
    name: "Claire D.",
    rating: 4,
    text: "Really professional from start to finish. You can tell this is run by actual pharmacists who care about getting it right.",
    category: "service",
    date: "2026-01-30T11:45:00Z",
    verified: true,
  },
  {
    id: "rev-015",
    name: "Mark J.",
    rating: 5,
    text: "Fast dispatch, well-packaged, and genuinely helpful advice when I phoned with a question. This is how pharmacy should be.",
    category: "service",
    date: "2025-12-30T16:00:00Z",
    verified: true,
  },
];

export function getAllReviews(): Review[] {
  return reviews;
}

export function getWeightLossReviews(): Review[] {
  return reviews.filter((r) => r.category === "weight-loss");
}

export function getTopReviews(count: number): Review[] {
  return reviews
    .filter((r) => r.rating === 5)
    .slice(0, count);
}
