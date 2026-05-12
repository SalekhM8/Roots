import { db } from "@/lib/db";
import { type Prisma } from "@/generated/prisma/client";
import { createVivaPayment } from "@/server/services/payment";
import { VivaError } from "@/lib/payments/viva";
import { writeAuditLog } from "@/lib/security/audit";
import { generateOrderNumber } from "@/lib/validation/schemas";
import type { AddressInput } from "@/lib/validation/schemas";
import { calculateShipping } from "@/lib/constants";

export interface GuestOrderItem {
  variantId: string;
  quantity: number;
}

export interface CreateGuestOrderResult {
  success: boolean;
  orderId?: string;
  checkoutUrl?: string;
  error?: string;
}

/**
 * Create an order for a guest (non-authenticated) user. Only supplement/other
 * products are allowed — POM items require an account.
 *
 * Charges immediately on the Viva-hosted checkout (no preauth path for
 * guests, since there's no consultation flow gating capture).
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
  const shippingMinor = calculateShipping(subtotalMinor);
  const totalMinor = subtotalMinor + shippingMinor;

  if (totalMinor <= 0) {
    return { success: false, error: "Order total must be greater than zero." };
  }

  const orderNumber = generateOrderNumber();

  // Step 1: Create the Order. Payment row is written by `createVivaPayment`.
  const order = await db.order.create({
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

  // Step 2: Create the Viva payment. Guests always charge immediately —
  // no preauth path here.
  let viva: { redirectUrl: string };
  try {
    viva = await createVivaPayment({
      orderId: order.id,
      amountMinor: totalMinor,
      preauth: false,
      customer: {
        email,
        phone,
      },
      description: `Order ${orderNumber}`,
      tags: ["supplement", "guest"],
    });
  } catch (err) {
    if (err instanceof VivaError) {
      console.error("[guest-order.create] Viva createOrder failed", {
        orderId: order.id,
        status: err.status,
        errorCode: err.errorCode,
        correlationId: err.correlationId,
      });
    } else {
      console.error("[guest-order.create] Viva createOrder failed (non-VivaError)", err);
    }
    return {
      success: false,
      error: "Could not start payment. Please try again in a moment.",
    };
  }

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

  return { success: true, orderId: order.id, checkoutUrl: viva.redirectUrl };
}
