"use server";

import {
  createGuestOrder,
  type CreateGuestOrderResult,
} from "@/server/services/guest-order";
import {
  guestCheckoutSchema,
  type GuestCheckoutInput,
} from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function createGuestCheckoutAction(
  input: GuestCheckoutInput
): Promise<CreateGuestOrderResult> {
  // Rate limit by email
  const rl = checkRateLimit("checkout", input.email);
  if (!rl.allowed) {
    return {
      success: false,
      error: "Too many requests. Please try again shortly.",
    };
  }

  const parsed = guestCheckoutSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
    return { success: false, error: firstError };
  }

  const { email, phone, shippingAddress, items, useSameForBilling } =
    parsed.data;

  return createGuestOrder(
    email,
    phone,
    items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    shippingAddress,
    useSameForBilling ? undefined : shippingAddress
  );
}
