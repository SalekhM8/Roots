import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/security/audit";
import { inngest } from "@/server/workflows/inngest";

interface FulfillmentResult {
  success: boolean;
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
