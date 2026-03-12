import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAllBlogPosts } from "@/data/blog-posts";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase();
  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], collections: [], posts: [] });
  }

  // Search products
  const products = await db.product.findMany({
    where: {
      isActive: true,
      isVisible: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      name: true,
      slug: true,
      shortDescription: true,
      defaultImageUrl: true,
      productType: true,
      variants: {
        where: { isActive: true },
        orderBy: { priceMinor: "asc" },
        take: 1,
        select: { priceMinor: true },
      },
    },
    take: 6,
  });

  // Search collections
  const collections = await db.collection.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { name: true, slug: true, description: true },
    take: 4,
  });

  // Search blog posts (in-memory since they're static data)
  const allPosts = getAllBlogPosts();
  const posts = allPosts
    .filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.toLowerCase().includes(q))
    )
    .slice(0, 4)
    .map((p) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      category: p.category,
    }));

  return NextResponse.json({
    products: products.map((p) => ({
      name: p.name,
      slug: p.slug,
      description: p.shortDescription,
      imageUrl: p.defaultImageUrl,
      type: p.productType,
      price: p.variants[0]?.priceMinor ?? null,
    })),
    collections: collections.map((c) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
    })),
    posts,
  });
}
