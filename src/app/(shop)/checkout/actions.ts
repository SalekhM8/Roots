"use server";

import { requireUser } from "@/lib/auth";
import { getCartWithItems } from "@/server/queries/cart";
import { createOrder, type CreateOrderResult } from "@/server/services/order";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  listSavedPaymentMethods,
  detachPaymentMethod,
  getOrCreateStripeCustomer,
} from "@/lib/payments/stripe";
import { db } from "@/lib/db";

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

export async function getSavedPaymentMethodsAction(): Promise<SavedCard[]> {
  const user = await requireUser();

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });

  if (!dbUser?.stripeCustomerId) return [];

  const methods = await listSavedPaymentMethods(dbUser.stripeCustomerId);

  return methods.map((m) => ({
    id: m.id,
    brand: m.card?.brand ?? "unknown",
    last4: m.card?.last4 ?? "****",
    expMonth: m.card?.exp_month ?? 0,
    expYear: m.card?.exp_year ?? 0,
  }));
}

export async function deleteSavedPaymentMethodAction(
  paymentMethodId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await requireUser();

  // Verify the payment method belongs to this user's Stripe customer
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });

  if (!dbUser?.stripeCustomerId) {
    return { success: false, error: "No saved payment methods." };
  }

  const methods = await listSavedPaymentMethods(dbUser.stripeCustomerId);
  const owns = methods.some((m) => m.id === paymentMethodId);

  if (!owns) {
    return { success: false, error: "Payment method not found." };
  }

  await detachPaymentMethod(paymentMethodId);
  return { success: true };
}
