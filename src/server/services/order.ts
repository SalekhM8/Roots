import { db } from "@/lib/db";
import { OrderType, type Prisma } from "@/generated/prisma/client";
import { createVivaPayment } from "@/server/services/payment";
import { VivaError } from "@/lib/payments/viva";
import { writeAuditLog } from "@/lib/security/audit";
import { generateOrderNumber } from "@/lib/validation/schemas";
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

/**
 * Create an order from the user's cart.
 *
 * Flow:
 * 1. Create the Order row.
 * 2. Call `createVivaPayment` — issues the Viva order, persists the Payment row,
 *    returns the Viva-hosted checkout redirect URL.
 * 3. Mark cart converted, write audit log, save shipping address.
 *
 * Payment model:
 * - Supplement-only: charge immediately (`preauth: false`).
 * - POM/mixed: authorize only (`preauth: true`); capture happens on
 *   prescriber approval via `captureVivaPayment`.
 *
 * Returns the Viva checkout URL for client-side redirect.
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

  // Idempotency guard: if a paid (authorized/captured) order already
  // exists for this consultation, refuse to create a duplicate. A
  // consultation ended up with TWO orders in prod (2026-05-12) because
  // the customer bounced through checkout twice — the second order's
  // preauth survived, the first was a failed stub, and the prescriber's
  // reject silently voided the wrong one.
  //
  // We allow `pending` to fall through: the customer may legitimately
  // be retrying a checkout where the first Viva URL never completed.
  // The duplicate-pending risk is low because the select-dose page
  // also redirects them away in that case.
  if (linkedConsultationId) {
    const liveOrder = await db.order.findFirst({
      where: {
        consultationId: linkedConsultationId,
        paymentStatus: { in: ["authorized", "captured"] },
      },
      select: { id: true },
    });
    if (liveOrder) {
      return {
        success: false,
        error:
          "This consultation already has an active order. Please visit your account to view it.",
      };
    }
  }

  const orderNumber = generateOrderNumber();
  const isPreauth = orderType !== "supplement";

  // Step 1: Create the Order row. We do NOT pre-create a Payment row —
  // `createVivaPayment` writes one with the canonical Viva identifiers
  // (vivaOrderCode + merchantTrns) once Viva accepts the order. This
  // avoids the "placeholder id" dance the Mollie path used.
  const order = await db.order.create({
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

  // Step 2: Create the Viva payment order. If this fails, the Order is
  // orphaned in pending state — the customer can retry checkout, and any
  // unpaid `pending` orders aged > 30 min can be reaped by a maintenance
  // cron. Same risk profile as the prior Mollie flow.
  let viva: { redirectUrl: string };
  try {
    viva = await createVivaPayment({
      orderId: order.id,
      amountMinor: totalMinor,
      preauth: isPreauth,
      customer: {
        email: userEmail,
      },
      description: `Order ${orderNumber}`,
      tags: [orderType, `user_${userId}`],
    });
  } catch (err) {
    if (err instanceof VivaError) {
      console.error("[order.create] Viva createOrder failed", {
        orderId: order.id,
        status: err.status,
        errorCode: err.errorCode,
        correlationId: err.correlationId,
      });
    } else {
      console.error("[order.create] Viva createOrder failed (non-VivaError)", err);
    }
    return {
      success: false,
      error: "Could not start payment. Please try again in a moment.",
    };
  }

  // Audit log + save address in parallel.
  //
  // Note: the cart is intentionally NOT marked converted here. If we did,
  // a failed Viva payment would leave the customer with an empty cart on
  // return (no way to retry without re-adding items). Cart conversion is
  // owned by the payment success paths: `processVivaReturn` (statusId
  // F/C/A) and the 1796 webhook (`handlePaymentCreated`). Either signal
  // calls `markUserActiveCartsConverted(userId)` — idempotent, so the race
  // between webhook and return URL is safe.
  await Promise.all([
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
        preauth: isPreauth,
        itemCount: cart.items.length,
      },
    }),
    saveAddressIfNew(userId, shippingAddress),
  ]);

  return { success: true, orderId: order.id, checkoutUrl: viva.redirectUrl };
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
