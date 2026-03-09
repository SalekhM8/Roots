"use server";

import { requireAnyRole } from "@/lib/auth";
import { markPacked, markShipped } from "@/server/services/fulfillment";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { revalidatePath } from "next/cache";

export async function markPackedAction(orderId: string) {
  const user = await requireAnyRole("admin", "prescriber");
  const rl = checkRateLimit("admin", user.id);
  if (!rl.allowed) return { success: false, error: "Too many requests." };
  const result = await markPacked(orderId, user.id);
  if (result.success) {
    revalidatePath("/admin/fulfillment");
  }
  return result;
}

export async function markShippedAction(
  orderId: string,
  trackingNumber: string,
  trackingUrl?: string
) {
  const user = await requireAnyRole("admin", "prescriber");
  const rl = checkRateLimit("admin", user.id);
  if (!rl.allowed) return { success: false, error: "Too many requests." };
  const result = await markShipped(orderId, user.id, trackingNumber, trackingUrl);
  if (result.success) {
    revalidatePath("/admin/fulfillment");
    revalidatePath("/admin/orders");
  }
  return result;
}
