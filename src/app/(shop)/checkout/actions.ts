"use server";

import { requireUser } from "@/lib/auth";
import { getCartWithItems } from "@/server/queries/cart";
import { createOrder, type CreateOrderResult } from "@/server/services/order";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  listMollieMandates,
  revokeMollieMandate,
} from "@/lib/payments/mollie";
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
    select: { mollieCustomerId: true },
  });

  if (!dbUser?.mollieCustomerId) return [];

  try {
    const mandates = await listMollieMandates(dbUser.mollieCustomerId);

    return Array.from(mandates)
      .filter((m) => m.status === "valid")
      .map((m) => {
        const details = m.details as unknown as Record<string, string> | null;
        const expiryDate = details?.cardExpiryDate ?? "";
        const [yearStr, monthStr] = expiryDate.split("-");

        return {
          id: m.id,
          brand: details?.cardLabel ?? m.method ?? "Card",
          last4: details?.cardNumber ?? "****",
          expMonth: parseInt(monthStr ?? "0", 10),
          expYear: parseInt(yearStr ?? "0", 10),
        };
      });
  } catch {
    return [];
  }
}

export async function deleteSavedPaymentMethodAction(
  mandateId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await requireUser();

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { mollieCustomerId: true },
  });

  if (!dbUser?.mollieCustomerId) {
    return { success: false, error: "No saved payment methods." };
  }

  // Verify the mandate belongs to this customer
  try {
    const mandates = await listMollieMandates(dbUser.mollieCustomerId);
    const owns = Array.from(mandates).some((m) => m.id === mandateId);

    if (!owns) {
      return { success: false, error: "Payment method not found." };
    }

    await revokeMollieMandate(dbUser.mollieCustomerId, mandateId);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to remove payment method." };
  }
}
