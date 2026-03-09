"use server";

import { requireUser } from "@/lib/auth";
import { addToCart } from "@/server/services/cart";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Add the selected Mounjaro dose variant to cart and link the consultation
 * to that variant. Then redirect user to checkout.
 */
export async function addDoseToCartAction(
  variantId: string,
  consultationId: string
) {
  const user = await requireUser();

  // Verify the consultation belongs to this user and is in a valid state
  const consultation = await db.consultation.findFirst({
    where: {
      id: consultationId,
      userId: user.id,
      status: { in: ["submitted", "approved"] },
    },
    select: { id: true, productId: true },
  });

  if (!consultation) {
    return { success: false as const, error: "Consultation not found or not in a valid state." };
  }

  // Verify the variant belongs to the consultation's product
  const variant = await db.productVariant.findFirst({
    where: {
      id: variantId,
      productId: consultation.productId,
      isActive: true,
    },
    select: { id: true },
  });

  if (!variant) {
    return { success: false as const, error: "Invalid dose selection." };
  }

  // Update the consultation with the selected variant
  await db.consultation.update({
    where: { id: consultationId },
    data: { productVariantId: variantId },
  });

  // Add to cart
  const result = await addToCart(user.id, variantId, 1);

  if (result.success) {
    revalidatePath("/cart");
  }

  return result;
}
