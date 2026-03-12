import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getAllBlogPosts } from "@/data/blog-posts";

const BASE_URL = "https://rootspharmacy.co.uk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/delivery`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/refunds`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/supplements`, changeFrequency: "weekly", priority: 0.9 },
  ];

  // Blog posts
  const blogPosts = getAllBlogPosts();
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Dynamic product pages
  const products = await db.product.findMany({
    where: { isActive: true, isVisible: true },
    select: { slug: true, updatedAt: true },
  });

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic collection pages
  const collections = await db.collection.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const collectionPages: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${BASE_URL}/collections/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...collectionPages, ...productPages];
}
