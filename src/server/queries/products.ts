import { db } from "@/lib/db";

const PAGE_SIZE = 25;

// ---- Admin Products List ----
export async function getProductsList(page = 1) {
  const skip = (page - 1) * PAGE_SIZE;

  const [products, total] = await Promise.all([
    db.product.findMany({
      include: {
        variants: {
          select: {
            id: true,
            name: true,
            sku: true,
            priceMinor: true,
            stockQuantity: true,
            isActive: true,
          },
          orderBy: { priceMinor: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    db.product.count(),
  ]);

  return { products, total, pageSize: PAGE_SIZE, page };
}

// ---- Admin Product Detail ----
export async function getProductDetail(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      variants: {
        orderBy: { priceMinor: "asc" },
      },
      collectionProducts: {
        include: {
          collection: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });
}

// ---- Shopfront: Product by Slug ----
export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug, isActive: true, isVisible: true },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { priceMinor: "asc" },
      },
    },
  });
}

// ---- Shopfront: All Supplement Collections (non-weight-loss) ----
export async function getAllSupplementCollections() {
  return db.collection.findMany({
    where: {
      isActive: true,
      slug: { not: "weight-loss" },
    },
    include: {
      collectionProducts: {
        include: {
          product: {
            include: {
              variants: {
                where: { isActive: true },
                orderBy: { priceMinor: "asc" },
                take: 1,
              },
              _count: {
                select: { variants: { where: { isActive: true } } },
              },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

// ---- Shopfront: Products by Slugs (for recommendations) ----
export async function getProductsBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];

  return db.product.findMany({
    where: { slug: { in: slugs }, isActive: true, isVisible: true },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { priceMinor: "asc" },
        take: 1,
      },
    },
  });
}

// ---- Shopfront: Collection Products ----
export async function getCollectionBySlug(slug: string) {
  return db.collection.findUnique({
    where: { slug, isActive: true },
    include: {
      collectionProducts: {
        include: {
          product: {
            include: {
              variants: {
                where: { isActive: true },
                orderBy: { priceMinor: "asc" },
                take: 1,
              },
              _count: {
                select: { variants: { where: { isActive: true } } },
              },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}
