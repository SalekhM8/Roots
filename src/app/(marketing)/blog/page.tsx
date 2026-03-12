import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Health & Wellness Blog",
  description:
    "Expert pharmacy advice on weight loss, supplements, joint health, and wellness. Written by UK pharmacists at Roots Pharmacy.",
  openGraph: {
    title: "Health & Wellness Blog | Roots Pharmacy",
    description:
      "Expert pharmacy advice on weight loss, supplements, joint health, and wellness.",
    url: "https://rootspharmacy.co.uk/blog",
    type: "website",
  },
  alternates: {
    canonical: "https://rootspharmacy.co.uk/blog",
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="bg-roots-cream">
      <div className="page-container py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-[42px] font-medium text-roots-green md:text-[56px]">
            Health &amp; Wellness Blog
          </h1>
          <p className="mt-4 text-lg text-roots-green/70">
            Expert advice from UK pharmacists on weight loss, supplements, and
            everyday wellness.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-white transition-shadow duration-200 hover:shadow-md"
            >
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <span className="mb-3 w-fit rounded-full bg-roots-green/10 px-3 py-1 text-xs font-medium text-roots-green">
                  {post.category}
                </span>
                <h2 className="mb-2 text-xl font-medium leading-tight text-roots-green group-hover:text-roots-green/80">
                  {post.title}
                </h2>
                <p className="mb-4 text-sm leading-relaxed text-roots-green/60">
                  {post.excerpt}
                </p>
                <time
                  dateTime={post.publishedAt}
                  className="mt-auto text-xs text-roots-green/40"
                >
                  {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
