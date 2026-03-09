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

  const rl = checkRateLimit("checkout", user.id);
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
    cart,
    shippingAddress,
    useSameForBilling ? undefined : billingAddress
  );
}
