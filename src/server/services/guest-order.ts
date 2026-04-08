import { db } from "@/lib/db";
import { type Prisma } from "@/generated/prisma/client";
import { createMolliePayment } from "@/lib/payments/mollie";
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

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://rootspharmacy.co.uk";
}

/**
 * Create an order for a guest (non-authenticated) user.
 * Only supplement/other products allowed — no POM items.
 *
 * Flow:
 * 1. Create order in DB first to get the real order ID
 * 2. Create Mollie payment with correct redirect URL
 * 3. Update payment record with real Mollie payment ID
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
  const appUrl = getAppUrl();

  // Step 1: Create order in DB first to get real order ID
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
        molliePaymentId: `pending_${created.id}`,
        status: "pending",
        amountMinor: totalMinor,
      },
    });

    return created;
  });

  // Step 2: Create Mollie payment with the REAL order ID in redirect URL
  const molliePayment = await createMolliePayment({
    amountMinor: totalMinor,
    description: `Order ${orderNumber}`,
    redirectUrl: `${appUrl}/checkout/confirmation?order_id=${order.id}`,
    webhookUrl: `${appUrl}/api/mollie/webhook`,
    metadata: {
      order_number: orderNumber,
      order_type: "supplement",
      guest_email: email,
    },
  });

  // Step 3: Update payment record with real Mollie payment ID
  await db.payment.updateMany({
    where: { orderId: order.id, molliePaymentId: `pending_${order.id}` },
    data: { molliePaymentId: molliePayment.id },
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

  const checkoutUrl = molliePayment.getCheckoutUrl();
  if (!checkoutUrl) {
    return { success: false, error: "Failed to generate payment URL. Please try again." };
  }

  return { success: true, orderId: order.id, checkoutUrl };
}
