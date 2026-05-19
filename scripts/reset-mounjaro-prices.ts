import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// Canonical Mounjaro prices in pence — match prisma/seed.ts.
// Updated 2026-05-19 to bring prices above cost on every dose.
const PRICES: Record<string, number> = {
  "MNJ-2.5MG": 18000,
  "MNJ-5MG": 19999,
  "MNJ-7.5MG": 28500,
  "MNJ-10MG": 31000,
  "MNJ-12.5MG": 34000,
  "MNJ-15MG": 36000,
};

async function main() {
  const before = await db.productVariant.findMany({
    where: { sku: { in: Object.keys(PRICES) } },
    select: { sku: true, name: true, priceMinor: true },
    orderBy: { priceMinor: "asc" },
  });
  console.log("Before:");
  for (const v of before) {
    console.log(`  ${v.sku.padEnd(14)} ${v.name.padEnd(8)} £${(v.priceMinor / 100).toFixed(2)}`);
  }

  for (const [sku, priceMinor] of Object.entries(PRICES)) {
    await db.productVariant.updateMany({
      where: { sku },
      data: { priceMinor },
    });
  }

  const after = await db.productVariant.findMany({
    where: { sku: { in: Object.keys(PRICES) } },
    select: { sku: true, name: true, priceMinor: true },
    orderBy: { priceMinor: "asc" },
  });
  console.log("\nAfter:");
  for (const v of after) {
    console.log(`  ${v.sku.padEnd(14)} ${v.name.padEnd(8)} £${(v.priceMinor / 100).toFixed(2)}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
