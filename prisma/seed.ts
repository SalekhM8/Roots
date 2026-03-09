import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";

// WebSocket polyfill for Node.js (needed outside Vercel edge runtime)
neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ---- Collections ----
  const collections = await Promise.all([
    prisma.collection.upsert({
      where: { slug: "weight-loss" },
      update: {},
      create: { name: "Weight Loss", slug: "weight-loss", description: "Clinician-led weight management programmes, reviewed and approved by qualified prescribers.", sortOrder: 1 },
    }),
    prisma.collection.upsert({
      where: { slug: "womens-health" },
      update: {},
      create: { name: "Women's Health", slug: "womens-health", description: "Targeted supplements formulated for women's specific health needs.", sortOrder: 2 },
    }),
    prisma.collection.upsert({
      where: { slug: "sleep-recovery" },
      update: {},
      create: { name: "Sleep & Recovery", slug: "sleep-recovery", description: "Support restful sleep and faster recovery with our curated range.", sortOrder: 3 },
    }),
    prisma.collection.upsert({
      where: { slug: "hydration" },
      update: {},
      create: { name: "Hydration", slug: "hydration", description: "Stay balanced and energised with our hydration range.", sortOrder: 4 },
    }),
    prisma.collection.upsert({
      where: { slug: "general-health" },
      update: {},
      create: { name: "General Health", slug: "general-health", description: "Daily essentials for overall wellness and vitality.", sortOrder: 5 },
    }),
    prisma.collection.upsert({
      where: { slug: "supplements" },
      update: {},
      create: { name: "Supplements", slug: "supplements", description: "Premium wellness supplements to support your health journey.", sortOrder: 6 },
    }),
  ]);

  console.log(`Seeded ${collections.length} collections`);

  // ---- Products ----
  const mounjaro = await prisma.product.upsert({
    where: { slug: "mounjaro" },
    update: { defaultImageUrl: "/images/products/mounjaro.svg" },
    create: {
      name: "Mounjaro Weight Loss Programme",
      slug: "mounjaro",
      shortDescription: "A clinician-led weight management programme using tirzepatide (Mounjaro).",
      longDescription: "Mounjaro (tirzepatide) is a once-weekly injectable prescription medicine for weight management. Our programme includes a full clinical consultation reviewed by a qualified prescriber, personalised dosing, and ongoing pharmacy support.",
      productType: "pom",
      requiresConsultation: true,
      defaultImageUrl: "/images/products/mounjaro.svg",
    },
  });

  // Mounjaro dose variants
  const mounjaroDoses = [
    { name: "2.5mg", sku: "MNJ-2.5MG", priceMinor: 14999, weightGrams: 150 },
    { name: "5mg", sku: "MNJ-5MG", priceMinor: 16999, weightGrams: 150 },
    { name: "7.5mg", sku: "MNJ-7.5MG", priceMinor: 18999, weightGrams: 150 },
    { name: "10mg", sku: "MNJ-10MG", priceMinor: 20999, weightGrams: 150 },
    { name: "12.5mg", sku: "MNJ-12.5MG", priceMinor: 22999, weightGrams: 150 },
    { name: "15mg", sku: "MNJ-15MG", priceMinor: 24999, weightGrams: 150 },
  ];

  for (const dose of mounjaroDoses) {
    await prisma.productVariant.upsert({
      where: { sku: dose.sku },
      update: {},
      create: {
        productId: mounjaro.id,
        name: dose.name,
        slugFragment: dose.name.toLowerCase().replace(".", "-"),
        sku: dose.sku,
        priceMinor: dose.priceMinor,
        stockQuantity: 100,
        weightGrams: dose.weightGrams,
      },
    });
  }

  const magnesium = await prisma.product.upsert({
    where: { slug: "magnesium-glycinate" },
    update: { defaultImageUrl: "/images/products/magnesium-glycinate.svg" },
    create: {
      name: "Magnesium Glycinate",
      slug: "magnesium-glycinate",
      shortDescription: "Premium magnesium for muscle recovery, sleep quality, and nervous system support.",
      longDescription: "Our Magnesium Glycinate uses the highly bioavailable glycinate form, gentle on the stomach and efficiently absorbed. Supports over 300 enzymatic reactions in the body.",
      productType: "supplement",
      defaultImageUrl: "/images/products/magnesium-glycinate.svg",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "MAG-GLY-60" },
    update: {},
    create: { productId: magnesium.id, name: "60 Capsules", slugFragment: "60-capsules", sku: "MAG-GLY-60", priceMinor: 2499, stockQuantity: 200, weightGrams: 120 },
  });

  const electrolytes = await prisma.product.upsert({
    where: { slug: "electrolytes" },
    update: { defaultImageUrl: "/images/products/electrolytes.svg" },
    create: {
      name: "Daily Electrolytes",
      slug: "electrolytes",
      shortDescription: "Balanced electrolyte blend for hydration, energy, and recovery.",
      longDescription: "A precise blend of sodium, potassium, magnesium, and zinc designed to support optimal hydration. Particularly beneficial during weight management programmes.",
      productType: "supplement",
      defaultImageUrl: "/images/products/electrolytes.svg",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "ELEC-30" },
    update: {},
    create: { productId: electrolytes.id, name: "30 Sachets", slugFragment: "30-sachets", sku: "ELEC-30", priceMinor: 1999, stockQuantity: 300, weightGrams: 200 },
  });

  const sleepSupport = await prisma.product.upsert({
    where: { slug: "sleep-support" },
    update: { defaultImageUrl: "/images/products/sleep-support.svg" },
    create: {
      name: "Sleep Support",
      slug: "sleep-support",
      shortDescription: "Natural sleep formula for deeper, more restorative rest.",
      longDescription: "A carefully formulated blend of magnesium, L-theanine, and botanical extracts to promote relaxation and support healthy sleep patterns without next-day drowsiness.",
      productType: "supplement",
      defaultImageUrl: "/images/products/sleep-support.svg",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "SLP-60" },
    update: {},
    create: { productId: sleepSupport.id, name: "60 Capsules", slugFragment: "60-capsules", sku: "SLP-60", priceMinor: 2299, stockQuantity: 150, weightGrams: 100 },
  });

  const probiotic = await prisma.product.upsert({
    where: { slug: "probiotic-womens" },
    update: { defaultImageUrl: "/images/products/probiotic-womens.svg" },
    create: {
      name: "Probiotic — Women's Health",
      slug: "probiotic-womens",
      shortDescription: "Targeted probiotic blend formulated specifically for women's gut and intimate health.",
      longDescription: "A multi-strain probiotic formula featuring Lactobacillus strains clinically studied for women's health, supporting digestive comfort, immune function, and intimate flora balance.",
      productType: "supplement",
      defaultImageUrl: "/images/products/probiotic-womens.svg",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "PRB-WH-30" },
    update: {},
    create: { productId: probiotic.id, name: "30 Capsules", slugFragment: "30-capsules", sku: "PRB-WH-30", priceMinor: 2799, stockQuantity: 180, weightGrams: 80 },
  });

  // ---- Collection-Product associations ----
  const productMap: Record<string, string> = {
    mounjaro: mounjaro.id,
    magnesium: magnesium.id,
    electrolytes: electrolytes.id,
    sleep: sleepSupport.id,
    probiotic: probiotic.id,
  };

  const collectionMap: Record<string, string> = {};
  for (const c of collections) {
    collectionMap[c.slug] = c.id;
  }

  const associations = [
    { collection: "weight-loss", product: "mounjaro", sort: 1 },
    { collection: "supplements", product: "magnesium", sort: 1 },
    { collection: "supplements", product: "electrolytes", sort: 2 },
    { collection: "supplements", product: "sleep", sort: 3 },
    { collection: "supplements", product: "probiotic", sort: 4 },
    { collection: "womens-health", product: "probiotic", sort: 1 },
    { collection: "sleep-recovery", product: "sleep", sort: 1 },
    { collection: "sleep-recovery", product: "magnesium", sort: 2 },
    { collection: "hydration", product: "electrolytes", sort: 1 },
    { collection: "general-health", product: "magnesium", sort: 1 },
    { collection: "general-health", product: "electrolytes", sort: 2 },
    { collection: "general-health", product: "probiotic", sort: 3 },
    { collection: "general-health", product: "sleep", sort: 4 },
  ];

  for (const assoc of associations) {
    const collId = collectionMap[assoc.collection];
    const prodId = productMap[assoc.product];
    await prisma.collectionProduct.upsert({
      where: { collectionId_productId: { collectionId: collId, productId: prodId } },
      update: {},
      create: { collectionId: collId, productId: prodId, sortOrder: assoc.sort },
    });
  }

  console.log("Seeded products and collection associations");
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
