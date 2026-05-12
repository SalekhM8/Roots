import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const consultationId = "abda6a57-d553-46c8-9c07-bc25ce58fa91";

  const c = await db.consultation.findUnique({
    where: { id: consultationId },
    select: {
      id: true,
      userId: true,
      productId: true,
      productVariantId: true,
      status: true,
      submittedAt: true,
    },
  });
  console.log("CONSULTATION:", JSON.stringify(c, null, 2));

  if (!c) {
    await db.$disconnect();
    return;
  }

  const carts = await db.cart.findMany({
    where: { userId: c.userId },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      items: {
        include: {
          productVariant: {
            select: {
              sku: true,
              priceMinor: true,
              stockQuantity: true,
              isActive: true,
              product: { select: { productType: true } },
            },
          },
        },
      },
    },
  });
  console.log("\nCARTS:", JSON.stringify(carts, null, 2));

  const orders = await db.order.findMany({
    where: { userId: c.userId },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      orderNumber: true,
      orderType: true,
      paymentStatus: true,
      fulfillmentStatus: true,
      totalMinor: true,
      consultationId: true,
      createdAt: true,
    },
  });
  console.log("\nORDERS:", JSON.stringify(orders, null, 2));

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
