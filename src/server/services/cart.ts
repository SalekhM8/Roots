import { db } from "@/lib/db";
import { addToCartSchema, updateCartItemSchema } from "@/lib/validation/schemas";

/**
 * Get or create an active cart for a user.
 */
export async function getOrCreateCart(userId: string) {
  const existing = await db.cart.findFirst({
    where: { userId, status: "active" },
    select: { id: true },
  });

  if (existing) return existing;

  return db.cart.create({
    data: { userId },
    select: { id: true },
  });
}

/**
 * Add an item to the user's cart, or increment quantity if variant already exists.
 */
export async function addToCart(
  userId: string,
  variantId: string,
  quantity: number
) {
  const parsed = addToCartSchema.safeParse({ variantId, quantity });
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input." };
  }

  // Parallelize independent lookups
  const [variant, cart] = await Promise.all([
    db.productVariant.findUnique({
      where: { id: variantId, isActive: true },
      select: { id: true, priceMinor: true, stockQuantity: true },
    }),
    getOrCreateCart(userId),
  ]);

  if (!variant) {
    return { success: false as const, error: "Product variant not found." };
  }

  if (variant.stockQuantity < quantity) {
    return { success: false as const, error: "Insufficient stock." };
  }

  const existingItem = await db.cartItem.findFirst({
    where: { cartId: cart.id, productVariantId: variantId },
    select: { id: true, quantity: true },
  });

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > 10) {
      return { success: false as const, error: "Maximum 10 items per product." };
    }
    await db.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty, unitPriceMinor: variant.priceMinor },
    });
  } else {
    await db.cartItem.create({
      data: {
        cartId: cart.id,
        productVariantId: variantId,
        quantity,
        unitPriceMinor: variant.priceMinor,
      },
    });
  }

  return { success: true as const };
}

/**
 * Update a cart item's quantity. If quantity is 0, remove the item.
 */
export async function updateCartItemQuantity(
  userId: string,
  itemId: string,
  quantity: number
) {
  const parsed = updateCartItemSchema.safeParse({ itemId, quantity });
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input." };
  }

  const item = await db.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: { select: { userId: true } } },
  });

  if (!item || item.cart.userId !== userId) {
    return { success: false as const, error: "Item not found." };
  }

  if (quantity === 0) {
    await db.cartItem.delete({ where: { id: itemId } });
  } else {
    await db.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  return { success: true as const };
}

/**
 * Remove an item from the cart.
 */
export async function removeCartItem(userId: string, itemId: string) {
  return updateCartItemQuantity(userId, itemId, 0);
}

/**
 * Mark a cart as converted after successful checkout.
 */
export async function markCartConverted(cartId: string) {
  return db.cart.update({
    where: { id: cartId },
    data: { status: "converted" },
  });
}
