import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/security/audit";
import { inngest } from "@/server/workflows/inngest";
import { createClickDropOrder } from "@/lib/shipping/click-drop";

interface FulfillmentResult {
  success: boolean;
  error?: string;
}

interface BulkLabelResult {
  orderId: string;
  orderNumber: string;
  success: boolean;
  trackingNumber?: string;
  error?: string;
}

/**
 * Mark an order as packed.
 */
export async function markPacked(
  orderId: string,
  packedByUserId: string
): Promise<FulfillmentResult> {
  const job = await db.fulfillmentJob.findUnique({
    where: { orderId },
  });

  if (!job) {
    return { success: false, error: "Fulfillment job not found." };
  }

  if (job.status !== "ready_to_pack") {
    return { success: false, error: "Order is not in ready_to_pack state." };
  }

  await db.$transaction(async (tx) => {
    await tx.fulfillmentJob.update({
      where: { id: job.id },
      data: {
        status: "packed",
        packedByUserId,
        packedAt: new Date(),
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { fulfillmentStatus: "packed" },
    });
  });

  await writeAuditLog({
    actorUserId: packedByUserId,
    actorRole: "admin",
    entityType: "Order",
    entityId: orderId,
    action: "fulfillment.packed",
    previousState: { fulfillmentStatus: "ready_to_pack" },
    newState: { fulfillmentStatus: "packed" },
  });

  return { success: true };
}

/**
 * Attach tracking info and mark as shipped.
 */
export async function markShipped(
  orderId: string,
  actorUserId: string,
  trackingNumber: string,
  trackingUrl?: string
): Promise<FulfillmentResult> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { fulfillmentStatus: true, userId: true, orderNumber: true },
  });

  if (!order) {
    return { success: false, error: "Order not found." };
  }

  if (
    order.fulfillmentStatus !== "packed" &&
    order.fulfillmentStatus !== "labels_created"
  ) {
    return { success: false, error: "Order must be packed before shipping." };
  }

  await db.$transaction(async (tx) => {
    // Create or update shipment
    const existingShipment = await tx.shipment.findFirst({
      where: { orderId },
      select: { id: true },
    });

    if (existingShipment) {
      await tx.shipment.update({
        where: { id: existingShipment.id },
        data: {
          trackingNumber,
          trackingUrl,
          status: "tracking_attached",
          shippedAt: new Date(),
        },
      });
    } else {
      await tx.shipment.create({
        data: {
          orderId,
          trackingNumber,
          trackingUrl,
          status: "tracking_attached",
          shippedAt: new Date(),
        },
      });
    }

    await tx.fulfillmentJob.update({
      where: { orderId },
      data: { status: "shipped" },
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        fulfillmentStatus: "shipped",
        shippingStatus: "in_transit",
      },
    });
  });

  await Promise.all([
    writeAuditLog({
      actorUserId,
      actorRole: "admin",
      entityType: "Order",
      entityId: orderId,
      action: "fulfillment.shipped",
      newState: { trackingNumber, fulfillmentStatus: "shipped" },
    }),
    inngest.send({
      name: "order/shipped",
      data: {
        userId: order.userId,
        orderId,
        orderNumber: order.orderNumber,
        trackingUrl: trackingUrl ?? "",
      },
    }),
  ]);

  return { success: true };
}

/**
 * Bulk-push orders to Click & Drop for label generation.
 * Processes each order independently so one failure does not block others.
 */
export async function bulkGenerateLabels(
  orderIds: string[],
  actorUserId: string,
): Promise<BulkLabelResult[]> {
  const orders = await db.order.findMany({
    where: {
      id: { in: orderIds },
      fulfillmentStatus: { in: ["ready_to_pack", "packed"] },
      paymentStatus: "captured",
    },
    include: {
      items: {
        include: {
          productVariant: { select: { weightGrams: true } },
        },
      },
    },
  });

  const results: BulkLabelResult[] = [];

  for (const order of orders) {
    try {
      const address = order.shippingAddressSnapshot as {
        firstName: string;
        lastName: string;
        line1: string;
        line2?: string;
        city: string;
        postcode: string;
        countryCode: string;
      };

      const totalWeight = order.items.reduce(
        (sum, item) =>
          sum + (item.productVariant.weightGrams ?? 100) * item.quantity,
        0,
      );

      const clickDropResult = await createClickDropOrder({
        orderReference: order.orderNumber,
        recipientAddress: {
          name: `${address.firstName} ${address.lastName}`,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          postcode: address.postcode,
          countryCode: address.countryCode ?? "GB",
        },
        weightGrams: totalWeight,
        items: order.items.map((item) => ({
          description: item.productNameSnapshot,
          quantity: item.quantity,
          value: item.unitPriceMinor / 100,
        })),
      });

      // Update DB in a transaction
      await db.$transaction(async (tx) => {
        const existingShipment = await tx.shipment.findFirst({
          where: { orderId: order.id },
          select: { id: true },
        });

        if (existingShipment) {
          await tx.shipment.update({
            where: { id: existingShipment.id },
            data: {
              clickDropOrderId: clickDropResult.orderId,
              trackingNumber: clickDropResult.trackingNumber,
              status: "label_generated",
              labelGeneratedAt: new Date(),
            },
          });
        } else {
          await tx.shipment.create({
            data: {
              orderId: order.id,
              clickDropOrderId: clickDropResult.orderId,
              trackingNumber: clickDropResult.trackingNumber,
              status: "label_generated",
              labelGeneratedAt: new Date(),
            },
          });
        }

        await tx.fulfillmentJob.update({
          where: { orderId: order.id },
          data: { status: "exported_for_labels" },
        });

        await tx.order.update({
          where: { id: order.id },
          data: {
            fulfillmentStatus: "labels_created",
            shippingStatus: "label_generated",
          },
        });
      });

      await writeAuditLog({
        actorUserId,
        actorRole: "admin",
        entityType: "Order",
        entityId: order.id,
        action: "fulfillment.labels_created",
        newState: {
          fulfillmentStatus: "labels_created",
          clickDropOrderId: clickDropResult.orderId,
          trackingNumber: clickDropResult.trackingNumber,
        },
      });

      results.push({
        orderId: order.id,
        orderNumber: order.orderNumber,
        success: true,
        trackingNumber: clickDropResult.trackingNumber,
      });
    } catch (err) {
      results.push({
        orderId: order.id,
        orderNumber: order.orderNumber,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  // Report any order IDs that were not found or not in correct status
  const processedIds = new Set(orders.map((o) => o.id));
  for (const id of orderIds) {
    if (!processedIds.has(id)) {
      results.push({
        orderId: id,
        orderNumber: "N/A",
        success: false,
        error: "Order not found or not in ready_to_pack/packed status.",
      });
    }
  }

  return results;
}
