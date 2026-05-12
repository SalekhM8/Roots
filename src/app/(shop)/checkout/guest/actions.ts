"use server";

import { headers } from "next/headers";
import {
  createGuestOrder,
  type CreateGuestOrderResult,
} from "@/server/services/guest-order";
import {
  guestCheckoutSchema,
  type GuestCheckoutInput,
} from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { clientIpFromHeaders } from "@/lib/security/ip-allowlist";

export async function createGuestCheckoutAction(
  input: GuestCheckoutInput
): Promise<CreateGuestOrderResult> {
  // IP-based limit FIRST — before touching the input. Previously this
  // limited by raw `input.email`, which (a) keyed the limiter on a
  // user-controlled untrusted string and (b) let attackers rotate emails
  // to evade the per-actor cap. IP gates abuse at the source.
  const ip = clientIpFromHeaders(await headers()) ?? "unknown";
  const ipRl = await checkRateLimit("checkout", `ip:${ip}`);
  if (!ipRl.allowed) {
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

  // Secondary per-email limit, now on a Zod-validated email so we know it
  // parses as a real address. Defends against single-IP many-email scenarios
  // (e.g. proxy farms hitting many burner inboxes).
  const emailRl = await checkRateLimit("checkout", `email:${email.toLowerCase()}`);
  if (!emailRl.allowed) {
    return {
      success: false,
      error: "Too many requests. Please try again shortly.",
    };
  }

  return createGuestOrder(
    email,
    phone,
    items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    shippingAddress,
    useSameForBilling ? undefined : shippingAddress
  );
}
