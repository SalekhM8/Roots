"use server";

import { requireAnyRole } from "@/lib/auth";
import { markPacked, markShipped, bulkGenerateLabels } from "@/server/services/fulfillment";
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

export async function bulkGenerateLabelsAction(orderIds: string[]) {
  const user = await requireAnyRole("admin");
  const rl = checkRateLimit("admin", user.id);
  if (!rl.allowed) return { success: false as const, error: "Too many requests.", results: [] };

  if (orderIds.length === 0) {
    return { success: false as const, error: "No orders selected.", results: [] };
  }

  if (orderIds.length > 50) {
    return { success: false as const, error: "Maximum 50 orders per batch.", results: [] };
  }

  const results = await bulkGenerateLabels(orderIds, user.id);

  revalidatePath("/admin/fulfillment");
  revalidatePath("/admin/orders");

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return {
    success: failed === 0,
    error: failed > 0 ? `${failed} of ${results.length} order(s) failed.` : undefined,
    results,
    summary: { succeeded, failed, total: results.length },
  };
}
