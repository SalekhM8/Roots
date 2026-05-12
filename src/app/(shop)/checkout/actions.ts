"use server";

import { requireUser } from "@/lib/auth";
import { getCartWithItems } from "@/server/queries/cart";
import { createOrder, type CreateOrderResult } from "@/server/services/order";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function createCheckoutAction(
  input: CheckoutInput
): Promise<CreateOrderResult> {
  const user = await requireUser();

  const rl = await checkRateLimit("checkout", user.id);
  if (!rl.allowed) {
    return { success: false, error: "Too many requests. Please try again shortly." };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please check your address details." };
  }

  const cart = await getCartWithItems(user.id);
  if (!cart || cart.items.length === 0) {
    return { success: false, error: "Your cart is empty." };
  }

  const { shippingAddress, billingAddress, useSameForBilling } = parsed.data;

  return createOrder(
    user.id,
    user.email,
    cart,
    shippingAddress,
    useSameForBilling ? undefined : billingAddress
  );
}

export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

/**
 * Saved payment methods are unsupported on Viva v1. Mollie's `mandates` model
 * does not have a like-for-like Viva equivalent that's safe to ship at launch
 * (Viva card tokens require a different consent + storage flow). Returning
 * an empty list keeps the existing UI happy — it will hide the saved-cards
 * section automatically.
 */
export async function getSavedPaymentMethodsAction(): Promise<SavedCard[]> {
  await requireUser();
  return [];
}

export async function deleteSavedPaymentMethodAction(
  _mandateId: string,
): Promise<{ success: boolean; error?: string }> {
  await requireUser();
  return { success: false, error: "Saved payment methods are not available." };
}
