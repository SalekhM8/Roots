/**
 * One-off: bring Mounjaro variant prices in line with target sheet.
 * Old prices were below cost on 5/6 doses — see chat 2026-05-19.
 *
 *   2.5mg   £149.99 → £180.00
 *   5mg     £169.99 → £199.99
 *   7.5mg   £189.99 → £285.00
 *   10mg    £209.99 → £310.00
 *   12.5mg  £229.99 → £340.00
 *   15mg    £249.99 → £360.00
 *
 * Snapshots the BEFORE state to a dated file so the change is
 * reversible. Reports the AFTER state.
 *
 * Run with:  npx tsx scripts/update-mounjaro-prices-2026-05-19.ts
 */
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const NEW_PRICES: Record<string, number> = {
  "MNJ-2.5MG": 18000,
  "MNJ-5MG": 19999,
  "MNJ-7.5MG": 28500,
  "MNJ-10MG": 31000,
  "MNJ-12.5MG": 34000,
  "MNJ-15MG": 36000,
};

async function main() {
  // Snapshot BEFORE — dated, distinct from the existing snapshot so
  // both are preserved.
  const before = await db.productVariant.findMany({
    where: { sku: { in: Object.keys(NEW_PRICES) } },
    select: { id: true, sku: true, name: true, priceMinor: true },
    orderBy: { priceMinor: "asc" },
  });

  const snapshotPath = join(
    process.cwd(),
    "scripts",
    ".mounjaro-price-snapshot-2026-05-19-before.json",
  );
  writeFileSync(
    snapshotPath,
    JSON.stringify({ takenAt: new Date().toISOString(), variants: before }, null, 2),
  );
  console.log(`Snapshot written: ${snapshotPath}`);

  console.log("\nBefore:");
  for (const v of before) {
    console.log(
      `  ${v.sku.padEnd(14)} ${v.name.padEnd(8)} £${(v.priceMinor / 100).toFixed(2)}`,
    );
  }

  // Apply new prices.
  for (const [sku, priceMinor] of Object.entries(NEW_PRICES)) {
    const result = await db.productVariant.updateMany({
      where: { sku },
      data: { priceMinor },
    });
    if (result.count !== 1) {
      console.warn(`  WARN: ${sku} matched ${result.count} rows (expected 1)`);
    }
  }

  const after = await db.productVariant.findMany({
    where: { sku: { in: Object.keys(NEW_PRICES) } },
    select: { sku: true, name: true, priceMinor: true },
    orderBy: { priceMinor: "asc" },
  });

  console.log("\nAfter:");
  for (const v of after) {
    console.log(
      `  ${v.sku.padEnd(14)} ${v.name.padEnd(8)} £${(v.priceMinor / 100).toFixed(2)}`,
    );
  }

  // Sanity diff — confirm every SKU is at the target value.
  let mismatches = 0;
  for (const v of after) {
    if (v.priceMinor !== NEW_PRICES[v.sku]) {
      console.error(
        `  MISMATCH: ${v.sku} is ${v.priceMinor}, expected ${NEW_PRICES[v.sku]}`,
      );
      mismatches += 1;
    }
  }
  if (mismatches > 0) {
    process.exitCode = 1;
  } else {
    console.log("\nAll prices match target. Done.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
