"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateCart } from "@/server/services/cart";
import { ROUTES } from "@/lib/constants";

/**
 * Link the selected Mounjaro dose variant to the consultation and ensure the
 * cart contains exactly one item: the chosen dose. Any other Mounjaro variants
 * left over from a previous dose selection are removed so the customer never
 * checks out for two doses by accident.
 *
 * On success we issue a server-side `redirect()` to /checkout. This is
 * deliberate: returning a success result + calling `router.push()` on the
 * client races against Next.js's automatic post-action revalidation of the
 * current route, which would bounce the customer back to /select-dose. A
 * server-side redirect supersedes that auto-refresh.
 *
 * On failure we still return a result object so the dose-selector can render
 * the error inline.
 */
export async function addDoseToCartAction(
  variantId: string,
  consultationId: string,
): Promise<{ success: false; error: string }> {
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
    return { success: false, error: "Consultation not found or not in a valid state." };
  }

  // Verify the variant belongs to the consultation's product and is in stock.
  const variant = await db.productVariant.findFirst({
    where: {
      id: variantId,
      productId: consultation.productId,
      isActive: true,
    },
    select: { id: true, priceMinor: true, stockQuantity: true },
  });

  if (!variant) {
    return { success: false, error: "Invalid dose selection." };
  }

  if (variant.stockQuantity < 1) {
    return { success: false, error: "This dose is currently out of stock." };
  }

  // Resolve the user's active cart (create if missing).
  const cart = await getOrCreateCart(user.id);

  // Replace any existing Mounjaro variants in the cart with exactly one of the
  // selected dose. The customer may have clicked Continue with one dose
  // selected, returned, and chosen another — we want the most recent choice to
  // be the only Mounjaro item present. There is no @@unique on
  // (cartId, productVariantId), so we cannot use Prisma's upsert here.
  await db.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productVariant: { productId: consultation.productId },
        NOT: { productVariantId: variantId },
      },
    });

    const existing = await tx.cartItem.findFirst({
      where: { cartId: cart.id, productVariantId: variantId },
      select: { id: true },
    });

    if (existing) {
      await tx.cartItem.update({
        where: { id: existing.id },
        data: { quantity: 1, unitPriceMinor: variant.priceMinor },
      });
    } else {
      await tx.cartItem.create({
        data: {
          cartId: cart.id,
          productVariantId: variantId,
          quantity: 1,
          unitPriceMinor: variant.priceMinor,
        },
      });
    }

    await tx.consultation.update({
      where: { id: consultationId },
      data: { productVariantId: variantId },
    });
  });

  revalidatePath("/cart");
  redirect(ROUTES.checkout);
}
