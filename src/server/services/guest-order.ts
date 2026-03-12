import { db } from "@/lib/db";
import { type Prisma } from "@/generated/prisma/client";
import { createPaymentIntent } from "@/lib/payments/stripe";
import { writeAuditLog } from "@/lib/security/audit";
import { generateOrderNumber } from "@/lib/validation/schemas";
import type { AddressInput } from "@/lib/validation/schemas";
import { randomUUID } from "crypto";
import { SHIPPING_FEE_MINOR } from "@/lib/constants";

export interface GuestOrderItem {
  variantId: string;
  quantity: number;
}

export interface CreateGuestOrderResult {
  success: boolean;
  orderId?: string;
  clientSecret?: string;
  error?: string;
}

/**
 * Create an order for a guest (non-authenticated) user.
 * Only supplement/other products allowed — no POM items.
 */
export async function createGuestOrder(
  email: string,
  phone: string | undefined,
  items: GuestOrderItem[],
  shippingAddress: AddressInput,
  billingAddress?: AddressInput
): Promise<CreateGuestOrderResult> {
  if (items.length === 0) {
    return { success: false, error: "Cart is empty." };
  }

  // Fetch all variants with their product info
  const variants = await db.productVariant.findMany({
    where: {
      id: { in: items.map((i) => i.variantId) },
      isActive: true,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          productType: true,
          requiresConsultation: true,
        },
      },
    },
  });

  // Validate: all variants found
  if (variants.length !== items.length) {
    return { success: false, error: "One or more products are no longer available." };
  }

  // Validate: no POM items in guest checkout
  const hasPom = variants.some((v) => v.product.productType === "pom");
  if (hasPom) {
    return {
      success: false,
      error: "Prescription items require an account. Please sign in to continue.",
    };
  }

  // Validate stock
  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (variant && variant.stockQuantity < item.quantity) {
      return {
        success: false,
        error: `Insufficient stock for ${variant.product.name} (${variant.name}).`,
      };
    }
  }

  // Calculate totals
  const orderItems = items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId)!;
    return {
      productId: variant.product.id,
      productVariantId: variant.id,
      productNameSnapshot: variant.product.name,
      variantNameSnapshot: variant.name,
      skuSnapshot: variant.sku,
      quantity: item.quantity,
      unitPriceMinor: variant.priceMinor,
      lineTotalMinor: variant.priceMinor * item.quantity,
    };
  });

  const subtotalMinor = orderItems.reduce((sum, i) => sum + i.lineTotalMinor, 0);
  const shippingMinor = SHIPPING_FEE_MINOR;
  const totalMinor = subtotalMinor + shippingMinor;

  if (totalMinor <= 0) {
    return { success: false, error: "Order total must be greater than zero." };
  }

  const orderNumber = generateOrderNumber();
  const idempotencyKey = randomUUID();

  // Guest orders are always supplement-only → immediate capture
  const paymentIntent = await createPaymentIntent({
    amountMinor: totalMinor,
    captureMethod: "automatic",
    metadata: {
      order_number: orderNumber,
      order_type: "supplement",
      guest_email: email,
    },
    idempotencyKey,
  });

  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: null,
        guestEmail: email,
        guestPhone: phone ?? null,
        orderNumber,
        orderType: "supplement",
        shippingAddressSnapshot:
          shippingAddress as unknown as Prisma.InputJsonValue,
        billingAddressSnapshot: (billingAddress ??
          shippingAddress) as unknown as Prisma.InputJsonValue,
        paymentStatus: "pending",
        subtotalMinor,
        shippingMinor,
        taxMinor: 0,
        totalMinor,
        placedAt: new Date(),
        items: { create: orderItems },
      },
    });

    await tx.payment.create({
      data: {
        orderId: created.id,
        stripePaymentIntentId: paymentIntent.id,
        status: "pending",
        amountMinor: totalMinor,
        idempotencyKey,
      },
    });

    return created;
  });

  await writeAuditLog({
    actorUserId: null,
    actorRole: "guest",
    entityType: "Order",
    entityId: order.id,
    action: "order.created.guest",
    newState: {
      orderNumber,
      guestEmail: email,
      totalMinor,
      itemCount: items.length,
    },
  });

  return {
    success: true,
    orderId: order.id,
    clientSecret: paymentIntent.client_secret ?? undefined,
  };
}
