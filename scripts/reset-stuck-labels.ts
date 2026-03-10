import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

/**
 * Reset orders that are stuck in "labels_created" status but have no
 * actual Click & Drop data (no clickDropOrderId on their shipment).
 * Sets them back to "packed" so labels can be re-generated.
 */
async function main() {
  // Find orders stuck in labels_created
  const stuckOrders = await db.order.findMany({
    where: { fulfillmentStatus: "labels_created" },
    include: {
      shipments: { select: { id: true, clickDropOrderId: true } },
      fulfillmentJob: { select: { id: true, status: true } },
    },
  });

  console.log(`Found ${stuckOrders.length} orders with labels_created status`);

  let resetCount = 0;
  for (const order of stuckOrders) {
    const hasRealLabel = order.shipments.some((s) => s.clickDropOrderId);
    if (hasRealLabel) {
      console.log(`  ${order.orderNumber} — has real Click & Drop ID, skipping`);
      continue;
    }

    console.log(`  ${order.orderNumber} — no Click & Drop data, resetting to packed`);

    await db.$transaction(async (tx) => {
      // Delete empty shipments (no clickDropOrderId)
      await tx.shipment.deleteMany({
        where: { orderId: order.id, clickDropOrderId: null },
      });

      // Reset fulfillment job to packed
      if (order.fulfillmentJob) {
        await tx.fulfillmentJob.update({
          where: { id: order.fulfillmentJob.id },
          data: { status: "packed" },
        });
      }

      // Reset order to packed
      await tx.order.update({
        where: { id: order.id },
        data: {
          fulfillmentStatus: "packed",
          shippingStatus: "pending",
        },
      });
    });

    resetCount++;
  }

  console.log(`\nReset ${resetCount} stuck orders back to packed.`);
}

main().finally(() => db.$disconnect());
