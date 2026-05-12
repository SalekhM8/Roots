import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// One-off: swap Mounjaro hero image from the cartoon SVG to the
// real product photo. Seed.ts is updated too, but the upsert's update
// branch is only hit on next seed run — easier to just push it now.
async function main() {
  const before = await db.product.findUnique({
    where: { slug: "mounjaro" },
    select: { id: true, defaultImageUrl: true },
  });
  console.log("Before:", before);

  const after = await db.product.update({
    where: { slug: "mounjaro" },
    data: { defaultImageUrl: "/images/products/mounjaro.jpg" },
    select: { id: true, defaultImageUrl: true },
  });
  console.log("After: ", after);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
