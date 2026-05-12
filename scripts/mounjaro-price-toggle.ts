/**
 * Temporarily drop all Mounjaro variant prices to £1 for live preauth testing,
 * then restore them afterwards. Persists the original prices to a local file
 * so the restore is deterministic even across separate invocations.
 *
 * Usage:
 *   pnpm tsx scripts/mounjaro-price-toggle.ts down   # save originals, set all to 100p
 *   pnpm tsx scripts/mounjaro-price-toggle.ts up     # restore from snapshot, then delete snapshot
 *   pnpm tsx scripts/mounjaro-price-toggle.ts status # show current prices
 *
 * NEVER leave this in the `down` state. Always `up` immediately after the test.
 */

import "dotenv/config";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";

neonConfig.webSocketConstructor = ws;

const SNAPSHOT_PATH = resolve(process.cwd(), "scripts/.mounjaro-price-snapshot.json");
const TEST_PRICE_MINOR = 100; // £1.00

interface Snapshot {
  takenAt: string;
  variants: Array<{ id: string; sku: string; name: string; priceMinor: number }>;
}

async function main(): Promise<void> {
  const mode = process.argv[2];
  if (!["down", "up", "status"].includes(mode ?? "")) {
    console.error("Usage: pnpm tsx scripts/mounjaro-price-toggle.ts <down|up|status>");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const db = new PrismaClient({ adapter });

  try {
    const product = await db.product.findUniqueOrThrow({
      where: { slug: "mounjaro" },
      select: { id: true, name: true },
    });

    const variants = await db.productVariant.findMany({
      where: { productId: product.id },
      select: { id: true, sku: true, name: true, priceMinor: true },
      orderBy: { priceMinor: "asc" },
    });

    if (mode === "status") {
      console.log(`\n${product.name} — ${variants.length} variants\n`);
      for (const v of variants) {
        console.log(`  ${v.name.padEnd(8)} ${v.sku.padEnd(15)} £${(v.priceMinor / 100).toFixed(2)}`);
      }
      const snapshotExists = existsSync(SNAPSHOT_PATH);
      console.log(`\nSnapshot file present: ${snapshotExists ? "YES (DB is in TEST mode)" : "no"}\n`);
      return;
    }

    if (mode === "down") {
      if (existsSync(SNAPSHOT_PATH)) {
        console.error(`Refusing to overwrite existing snapshot at ${SNAPSHOT_PATH}`);
        console.error("Either run 'up' to restore first, or delete the snapshot file manually.");
        process.exit(1);
      }

      const snapshot: Snapshot = {
        takenAt: new Date().toISOString(),
        variants: variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          name: v.name,
          priceMinor: v.priceMinor,
        })),
      };

      writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));
      console.log(`Snapshot written to ${SNAPSHOT_PATH}`);

      await db.productVariant.updateMany({
        where: { productId: product.id },
        data: { priceMinor: TEST_PRICE_MINOR },
      });

      console.log(`\nAll ${variants.length} Mounjaro variants set to £${(TEST_PRICE_MINOR / 100).toFixed(2)}.`);
      console.log("REMEMBER to run 'up' immediately after testing.\n");
      return;
    }

    if (mode === "up") {
      if (!existsSync(SNAPSHOT_PATH)) {
        console.error(`No snapshot found at ${SNAPSHOT_PATH} — nothing to restore.`);
        console.error("If you know the original prices, restore manually then delete this script's state.");
        process.exit(1);
      }

      const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8")) as Snapshot;
      console.log(`Restoring from snapshot taken ${snapshot.takenAt}`);

      for (const v of snapshot.variants) {
        await db.productVariant.update({
          where: { id: v.id },
          data: { priceMinor: v.priceMinor },
        });
        console.log(`  ${v.name.padEnd(8)} → £${(v.priceMinor / 100).toFixed(2)}`);
      }

      unlinkSync(SNAPSHOT_PATH);
      console.log(`\nSnapshot file deleted. Prices restored.\n`);
      return;
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
