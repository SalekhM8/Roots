"use server";

import { requireAnyRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/security/audit";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma";

interface ActionResult {
  success: boolean;
  error?: string;
}

const updateProductSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().max(5000).optional(),
  isActive: z.boolean().optional(),
  isVisible: z.boolean().optional(),
});

export async function updateProductAction(
  input: z.infer<typeof updateProductSchema>
): Promise<ActionResult> {
  const user = await requireAnyRole("admin");
  const rl = checkRateLimit("admin", user.id);
  if (!rl.allowed) return { success: false, error: "Too many requests." };

  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const { productId, ...data } = parsed.data;

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { name: true, isActive: true, isVisible: true },
  });
  if (!product) return { success: false, error: "Product not found." };

  await db.product.update({
    where: { id: productId },
    data,
  });

  await writeAuditLog({
    actorUserId: user.id,
    actorRole: "admin",
    entityType: "Product",
    entityId: productId,
    action: "product.updated",
    previousState: product as unknown as Prisma.InputJsonValue,
    newState: data as unknown as Prisma.InputJsonValue,
  });

  return { success: true };
}

const updateVariantSchema = z.object({
  variantId: z.string().uuid(),
  priceMinor: z.number().int().min(1).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function updateVariantAction(
  input: z.infer<typeof updateVariantSchema>
): Promise<ActionResult> {
  const user = await requireAnyRole("admin");
  const rl = checkRateLimit("admin", user.id);
  if (!rl.allowed) return { success: false, error: "Too many requests." };

  const parsed = updateVariantSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const { variantId, ...data } = parsed.data;

  const variant = await db.productVariant.findUnique({
    where: { id: variantId },
    select: { priceMinor: true, stockQuantity: true, isActive: true, productId: true },
  });
  if (!variant) return { success: false, error: "Variant not found." };

  await db.productVariant.update({
    where: { id: variantId },
    data,
  });

  await writeAuditLog({
    actorUserId: user.id,
    actorRole: "admin",
    entityType: "ProductVariant",
    entityId: variantId,
    action: "variant.updated",
    previousState: variant as unknown as Prisma.InputJsonValue,
    newState: data as unknown as Prisma.InputJsonValue,
  });

  return { success: true };
}
