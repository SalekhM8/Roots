"use server";

import { requireAnyRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/security/audit";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

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

// ---- Archive / Unarchive ----

const archiveSchema = z.object({
  productId: z.string().uuid(),
});

export async function archiveProductAction(
  input: z.infer<typeof archiveSchema>
): Promise<ActionResult> {
  const user = await requireAnyRole("admin");
  const rl = checkRateLimit("admin", user.id);
  if (!rl.allowed) return { success: false, error: "Too many requests." };

  const parsed = archiveSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const { productId } = parsed.data;

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { archivedAt: true },
  });
  if (!product) return { success: false, error: "Product not found." };
  if (product.archivedAt) return { success: false, error: "Product is already archived." };

  await db.product.update({
    where: { id: productId },
    data: { archivedAt: new Date(), isActive: false, isVisible: false },
  });

  await writeAuditLog({
    actorUserId: user.id,
    actorRole: "admin",
    entityType: "Product",
    entityId: productId,
    action: "product.archived",
  });

  return { success: true };
}

export async function unarchiveProductAction(
  input: z.infer<typeof archiveSchema>
): Promise<ActionResult> {
  const user = await requireAnyRole("admin");
  const rl = checkRateLimit("admin", user.id);
  if (!rl.allowed) return { success: false, error: "Too many requests." };

  const parsed = archiveSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const { productId } = parsed.data;

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { archivedAt: true },
  });
  if (!product) return { success: false, error: "Product not found." };
  if (!product.archivedAt) return { success: false, error: "Product is not archived." };

  await db.product.update({
    where: { id: productId },
    data: { archivedAt: null, isActive: true },
  });

  await writeAuditLog({
    actorUserId: user.id,
    actorRole: "admin",
    entityType: "Product",
    entityId: productId,
    action: "product.unarchived",
  });

  return { success: true };
}

// ---- Collection Assignment ----

const collectionSchema = z.object({
  productId: z.string().uuid(),
  collectionId: z.string().uuid(),
});

export async function assignCollectionAction(
  input: z.infer<typeof collectionSchema>
): Promise<ActionResult> {
  const user = await requireAnyRole("admin");
  const rl = checkRateLimit("admin", user.id);
  if (!rl.allowed) return { success: false, error: "Too many requests." };

  const parsed = collectionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const { productId, collectionId } = parsed.data;

  const existing = await db.collectionProduct.findUnique({
    where: { collectionId_productId: { collectionId, productId } },
  });
  if (existing) return { success: false, error: "Product is already in this collection." };

  const maxSort = await db.collectionProduct.findFirst({
    where: { collectionId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await db.collectionProduct.create({
    data: {
      collectionId,
      productId,
      sortOrder: (maxSort?.sortOrder ?? 0) + 1,
    },
  });

  await writeAuditLog({
    actorUserId: user.id,
    actorRole: "admin",
    entityType: "CollectionProduct",
    entityId: productId,
    action: "collection.product_assigned",
    newState: { productId, collectionId } as unknown as Prisma.InputJsonValue,
  });

  return { success: true };
}

export async function removeCollectionAction(
  input: z.infer<typeof collectionSchema>
): Promise<ActionResult> {
  const user = await requireAnyRole("admin");
  const rl = checkRateLimit("admin", user.id);
  if (!rl.allowed) return { success: false, error: "Too many requests." };

  const parsed = collectionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const { productId, collectionId } = parsed.data;

  const existing = await db.collectionProduct.findUnique({
    where: { collectionId_productId: { collectionId, productId } },
  });
  if (!existing) return { success: false, error: "Product is not in this collection." };

  await db.collectionProduct.delete({
    where: { id: existing.id },
  });

  await writeAuditLog({
    actorUserId: user.id,
    actorRole: "admin",
    entityType: "CollectionProduct",
    entityId: productId,
    action: "collection.product_removed",
    previousState: { productId, collectionId } as unknown as Prisma.InputJsonValue,
  });

  return { success: true };
}
