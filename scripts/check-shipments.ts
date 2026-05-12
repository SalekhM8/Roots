import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const shipments = await db.shipment.findMany({
    include: { order: { select: { orderNumber: true } } },
  });
  console.log("Shipments:", shipments.length);
  for (const s of shipments) {
    console.log(
      s.order.orderNumber,
      "| clickDropId:", s.clickDropOrderId,
      "| labelUrl:", s.labelUrl,
      "| status:", s.status
    );
  }

  const jobs = await db.fulfillmentJob.findMany({
    include: {
      order: { select: { orderNumber: true, fulfillmentStatus: true } },
    },
  });
  console.log("\nFulfillment jobs:", jobs.length);
  for (const j of jobs) {
    console.log(
      j.order.orderNumber,
      "| jobStatus:", j.status,
      "| orderStatus:", j.order.fulfillmentStatus
    );
  }

  const orders = await db.order.findMany({
    where: { fulfillmentStatus: { not: "unfulfilled" } },
    select: { orderNumber: true, fulfillmentStatus: true, paymentStatus: true },
  });
  console.log("\nOrders with fulfillment status:");
  for (const o of orders) {
    console.log(o.orderNumber, "| fulfillment:", o.fulfillmentStatus, "| payment:", o.paymentStatus);
  }
}

main().finally(() => db.$disconnect());
