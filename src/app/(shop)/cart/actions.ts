"use server";

import { requireUser } from "@/lib/auth";
import {
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
} from "@/server/services/cart";
import { getCartItemCount } from "@/server/queries/cart";
import { revalidatePath } from "next/cache";

export async function addToCartAction(variantId: string, quantity = 1) {
  const user = await requireUser();
  const result = await addToCart(user.id, variantId, quantity);
  if (result.success) {
    revalidatePath("/cart");
  }
  return result;
}

export async function updateCartItemAction(itemId: string, quantity: number) {
  const user = await requireUser();
  const result = await updateCartItemQuantity(user.id, itemId, quantity);
  if (result.success) {
    revalidatePath("/cart");
  }
  return result;
}

export async function removeCartItemAction(itemId: string) {
  const user = await requireUser();
  const result = await removeCartItem(user.id, itemId);
  if (result.success) {
    revalidatePath("/cart");
  }
  return result;
}

export async function getCartCountAction(): Promise<number> {
  const user = await requireUser();
  return getCartItemCount(user.id);
}
