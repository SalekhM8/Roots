import { db } from "@/lib/db";
import { OrderType, type Prisma } from "@/generated/prisma/client";
import {
  createMolliePayment,
  getOrCreateMollieCustomer,
} from "@/lib/payments/mollie";
import { writeAuditLog } from "@/lib/security/audit";
import { generateOrderNumber } from "@/lib/validation/schemas";
import { markCartConverted } from "./cart";
import type { CartWithItems } from "@/server/queries/cart";
import type { AddressInput } from "@/lib/validation/schemas";
import { calculateShipping } from "@/lib/constants";

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  checkoutUrl?: string;
  error?: string;
}

/**
 * Determine the order type based on cart items.
 * - All POM → "pom"
 * - All supplement/other → "supplement"
 * - Mix → "mixed"
 */
function determineOrderType(
  items: CartWithItems["items"]
): OrderType {
  const hasPom = items.some(
    (i) => i.productVariant.product.productType === "pom"
  );
  const hasSupplement = items.some(
    (i) => i.productVariant.product.productType !== "pom"
  );

  if (hasPom && hasSupplement) return "mixed";
  if (hasPom) return "pom";
  return "supplement";
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://rootspharmacy.co.uk";
}

/**
 * Create an order from the user's cart.
 *
 * Flow:
 * 1. Create order + payment record in DB (with placeholder molliePaymentId)
 * 2. Create Mollie payment with correct redirect URL containing the real order ID
 * 3. Update payment record with the real Mollie payment ID
 *
 * Payment model:
 * - Supplement-only: capture immediately (default Mollie behavior)
 * - POM/mixed: authorize only (captureMode: "manual")
 *
 * Returns the Mollie checkout URL for client-side redirect.
 */
export async function createOrder(
  userId: string,
  userEmail: string,
  cart: CartWithItems,
  shippingAddress: AddressInput,
  billingAddress?: AddressInput,
  consultationId?: string
): Promise<CreateOrderResult> {
  if (cart.items.length === 0) {
    return { success: false, error: "Cart is empty." };
  }

  // Check POM items have a submitted or approved consultation
  const pomItems = cart.items.filter(
    (i) => i.productVariant.product.requiresConsultation
  );

  let linkedConsultationId = consultationId ?? null;

  if (pomItems.length > 0) {
    const consultation = await db.consultation.findFirst({
      where: {
        userId,
        status: { in: ["submitted", "approved"] },
        productId: { in: pomItems.map((i) => i.productVariant.product.id) },
      },
      select: { id: true },
      orderBy: { submittedAt: "desc" },
    });

    if (!consultation) {
      return {
        success: false,
        error:
          "A consultation must be submitted before ordering prescription items.",
      };
    }

    linkedConsultationId = linkedConsultationId ?? consultation.id;
  }

  const orderType = determineOrderType(cart.items);

  // Calculate totals (all in pence)
  const subtotalMinor = cart.items.reduce(
    (sum, item) => sum + item.unitPriceMinor * item.quantity,
    0
  );
  const shippingMinor = calculateShipping(subtotalMinor);
  const taxMinor = 0; // VAT handled by pharmacy (POM exempt, supplements included in price)
  const totalMinor = subtotalMinor + shippingMinor + taxMinor;

  if (totalMinor <= 0) {
    return { success: false, error: "Order total must be greater than zero." };
  }

  const orderNumber = generateOrderNumber();
  const isManualCapture = orderType !== "supplement";
  const captureBefore =
    isManualCapture
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : null;

  // Step 1: Create order in DB first so we have the real order ID
  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        orderNumber,
        orderType,
        consultationId: linkedConsultationId,
        shippingAddressSnapshot:
          shippingAddress as unknown as Prisma.InputJsonValue,
        billingAddressSnapshot: (billingAddress ??
          shippingAddress) as unknown as Prisma.InputJsonValue,
        paymentStatus: "pending",
        subtotalMinor,
        shippingMinor,
        taxMinor,
        totalMinor,
        placedAt: new Date(),
        items: {
          create: cart.items.map((item) => ({
            productId: item.productVariant.product.id,
            productVariantId: item.productVariant.id,
            productNameSnapshot: item.productVariant.product.name,
            variantNameSnapshot: item.productVariant.name,
            skuSnapshot: item.productVariant.sku,
            quantity: item.quantity,
            unitPriceMinor: item.unitPriceMinor,
            lineTotalMinor: item.unitPriceMinor * item.quantity,
          })),
        },
      },
    });

    // Create payment record with a temporary placeholder — updated below
    await tx.payment.create({
      data: {
        orderId: created.id,
        molliePaymentId: `pending_${created.id}`,
        status: "pending",
        amountMinor: totalMinor,
        captureBefore,
      },
    });

    return created;
  });

  // Step 2: Get or create Mollie Customer
  const mollieCustomerId = await getOrCreateMollieCustomer(userId, userEmail);

  const appUrl = getAppUrl();

  // Step 3: Create Mollie payment with the REAL order ID in the redirect URL
  const molliePayment = await createMolliePayment({
    amountMinor: totalMinor,
    description: `Order ${orderNumber}`,
    redirectUrl: `${appUrl}/checkout/confirmation?order_id=${order.id}`,
    webhookUrl: `${appUrl}/api/mollie/webhook`,
    captureMode: isManualCapture ? "manual" : undefined,
    metadata: {
      order_number: orderNumber,
      order_type: orderType,
      user_id: userId,
    },
    customerId: mollieCustomerId,
    sequenceType: "first",
  });

  // Step 4: Update payment record with real Mollie payment ID
  await db.payment.updateMany({
    where: { orderId: order.id, molliePaymentId: `pending_${order.id}` },
    data: { molliePaymentId: molliePayment.id },
  });

  // Mark cart as converted + audit log + save address in parallel
  await Promise.all([
    markCartConverted(cart.id),
    writeAuditLog({
      actorUserId: userId,
      actorRole: "customer",
      entityType: "Order",
      entityId: order.id,
      action: "order.created",
      newState: {
        orderNumber,
        orderType,
        totalMinor,
        captureMode: isManualCapture ? "manual" : "automatic",
        itemCount: cart.items.length,
      },
    }),
    saveAddressIfNew(userId, shippingAddress),
  ]);

  return {
    success: true,
    orderId: order.id,
    checkoutUrl: molliePayment.getCheckoutUrl() ?? undefined,
  };
}

/**
 * Save a shipping address for future checkouts if the user doesn't
 * already have one with the same postcode + line1.
 */
async function saveAddressIfNew(userId: string, address: AddressInput) {
  try {
    const existing = await db.address.findFirst({
      where: {
        userId,
        postcode: address.postcode,
        line1: address.line1,
      },
      select: { id: true },
    });

    if (existing) return;

    // Check if user has any addresses — if not, make this the default
    const count = await db.address.count({ where: { userId } });
    const isFirst = count === 0;

    await db.address.create({
      data: {
        userId,
        firstName: address.firstName,
        lastName: address.lastName,
        line1: address.line1,
        line2: address.line2 ?? "",
        city: address.city,
        postcode: address.postcode,
        countryCode: address.countryCode,
        phone: address.phone ?? "",
        isDefaultShipping: isFirst,
        isDefaultBilling: isFirst,
      },
    });
  } catch {
    // Non-critical — don't fail the order if address save fails
  }
}
