import { db } from "@/lib/db";

export interface CartWithItems {
  id: string;
  items: Array<{
    id: string;
    quantity: number;
    unitPriceMinor: number;
    productVariant: {
      id: string;
      name: string;
      sku: string;
      priceMinor: number;
      stockQuantity: number;
      product: {
        id: string;
        name: string;
        slug: string;
        productType: "pom" | "supplement" | "other";
        defaultImageUrl: string | null;
        requiresConsultation: boolean;
      };
    };
  }>;
}

/**
 * Get the user's active cart with all items and product details.
 */
export async function getCartWithItems(
  userId: string
): Promise<CartWithItems | null> {
  const cart = await db.cart.findFirst({
    where: { userId, status: "active" },
    include: {
      items: {
        include: {
          productVariant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  productType: true,
                  defaultImageUrl: true,
                  requiresConsultation: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return cart as CartWithItems | null;
}

/**
 * Get the total number of items in the user's active cart.
 */
export async function getCartItemCount(userId: string): Promise<number> {
  const result = await db.cartItem.aggregate({
    where: {
      cart: { userId, status: "active" },
    },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}
