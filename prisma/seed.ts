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
      update: { name: "Weight Loss", description: "Clinician-led weight management programmes, reviewed and approved by qualified prescribers.", sortOrder: 1 },
      create: { name: "Weight Loss", slug: "weight-loss", description: "Clinician-led weight management programmes, reviewed and approved by qualified prescribers.", sortOrder: 1 },
    }),
    prisma.collection.upsert({
      where: { slug: "vitamins-supplements" },
      update: { name: "Vitamins & Supplements", description: "Daily multivitamins, minerals, and energy supplements from trusted brands.", sortOrder: 2 },
      create: { name: "Vitamins & Supplements", slug: "vitamins-supplements", description: "Daily multivitamins, minerals, and energy supplements from trusted brands.", sortOrder: 2 },
    }),
    prisma.collection.upsert({
      where: { slug: "digestive-health" },
      update: { name: "Digestive Health", description: "Relief from heartburn, indigestion, diarrhoea, and dehydration.", sortOrder: 3 },
      create: { name: "Digestive Health", slug: "digestive-health", description: "Relief from heartburn, indigestion, diarrhoea, and dehydration.", sortOrder: 3 },
    }),
    prisma.collection.upsert({
      where: { slug: "stress-sleep" },
      update: { name: "Stress & Sleep", description: "Traditional herbal remedies and supplements for calmer days and better nights.", sortOrder: 4 },
      create: { name: "Stress & Sleep", slug: "stress-sleep", description: "Traditional herbal remedies and supplements for calmer days and better nights.", sortOrder: 4 },
    }),
    prisma.collection.upsert({
      where: { slug: "joint-support" },
      update: { name: "Joint Support", description: "Supplements for joint comfort, mobility, and bone health.", sortOrder: 5 },
      create: { name: "Joint Support", slug: "joint-support", description: "Supplements for joint comfort, mobility, and bone health.", sortOrder: 5 },
    }),
    prisma.collection.upsert({
      where: { slug: "skin-care" },
      update: { name: "Skin Care", description: "Targeted treatments for acne, blemishes, and skin concerns.", sortOrder: 6 },
      create: { name: "Skin Care", slug: "skin-care", description: "Targeted treatments for acne, blemishes, and skin concerns.", sortOrder: 6 },
    }),
    prisma.collection.upsert({
      where: { slug: "first-aid" },
      update: { name: "First Aid", description: "Everyday antiseptic creams and wound care essentials.", sortOrder: 7 },
      create: { name: "First Aid", slug: "first-aid", description: "Everyday antiseptic creams and wound care essentials.", sortOrder: 7 },
    }),
    prisma.collection.upsert({
      where: { slug: "womens-health" },
      update: { name: "Women's Health", description: "Targeted supplements formulated for women's specific health needs.", sortOrder: 8 },
      create: { name: "Women's Health", slug: "womens-health", description: "Targeted supplements formulated for women's specific health needs.", sortOrder: 8 },
    }),
  ]);

  // Deactivate old collections that have been replaced
  for (const oldSlug of ["supplements", "sleep-recovery", "hydration", "general-health"]) {
    await prisma.collection.updateMany({
      where: { slug: oldSlug },
      data: { isActive: false },
    });
  }

  console.log(`Seeded ${collections.length} collections`);

  // ---- Products ----

  // === EXISTING: Mounjaro ===
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
      create: { productId: mounjaro.id, name: dose.name, slugFragment: dose.name.toLowerCase().replace(".", "-"), sku: dose.sku, priceMinor: dose.priceMinor, stockQuantity: 100, weightGrams: dose.weightGrams },
    });
  }

  // === EXISTING: Magnesium Glycinate ===
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

  // === EXISTING: Daily Electrolytes ===
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

  // === EXISTING: Sleep Support ===
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

  // === EXISTING: Probiotic — Women's Health ===
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

  // ================================================================
  // NEW PRODUCTS
  // ================================================================

  // === Imodium Instants 12 Tablets ===
  const imodiumInstants = await prisma.product.upsert({
    where: { slug: "imodium-instants" },
    update: { defaultImageUrl: "/images/products/imodium-instants-12.png" },
    create: {
      name: "Imodium Instants",
      slug: "imodium-instants",
      shortDescription: "Fast relief from sudden diarrhoea in a convenient melt-on-the-tongue format.",
      longDescription: "Imodium Instants provide fast relief from sudden diarrhoea in a convenient melt on the tongue format. They are designed for quick, on the go symptom control when you need relief without water.\n\nWhat this helps with:\n• Sudden diarrhoea\n• Travel related stomach upset\n• Frequent loose stools\n\nHow it works:\nImodium contains loperamide hydrochloride, which slows bowel movement activity and helps the body absorb more fluid from the gut. This helps stools become firmer and reduces the need to go to the toilet.\n\nHow to use:\nAllow the tablet to dissolve on the tongue and use exactly as directed on the pack or in the leaflet.\n\nSide effects:\n• May cause constipation or mild stomach discomfort.",
      productType: "other",
      defaultImageUrl: "/images/products/imodium-instants-12.png",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "IMO-INST-12" },
    update: {},
    create: { productId: imodiumInstants.id, name: "12 Tablets", slugFragment: "12-tablets", sku: "IMO-INST-12", priceMinor: 499, stockQuantity: 100, weightGrams: 30 },
  });

  // === Imodium Instant Melts 18 Tablets ===
  const imodiumMelts = await prisma.product.upsert({
    where: { slug: "imodium-instant-melts" },
    update: { defaultImageUrl: "/images/products/imodium-instant-melts-18.png" },
    create: {
      name: "Imodium Instant Melts",
      slug: "imodium-instant-melts",
      shortDescription: "Fast-acting diarrhoea relief in a convenient melt-in-the-mouth tablet.",
      longDescription: "Imodium Instant Melts provide fast acting diarrhoea relief in a convenient melt in the mouth tablet. They are ideal when you want effective symptom control without needing water.\n\nWhat this helps with:\n• Acute diarrhoea\n• Digestive upset\n• Travel stomach issues\n\nHow it works:\nThe active ingredient loperamide hydrochloride slows down the movement of the intestines, helping the body reabsorb fluid and reduce diarrhoea.\n\nHow to use:\nAllow the tablet to dissolve on the tongue and follow the directions on the packaging or leaflet.\n\nSide effects:\n• May cause mild constipation or stomach discomfort.",
      productType: "other",
      defaultImageUrl: "/images/products/imodium-instant-melts-18.png",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "IMO-MELT-18" },
    update: {},
    create: { productId: imodiumMelts.id, name: "18 Tablets", slugFragment: "18-tablets", sku: "IMO-MELT-18", priceMinor: 899, stockQuantity: 100, weightGrams: 40 },
  });

  // === Gaviscon Double Action Mint (3 variants) ===
  const gaviscon = await prisma.product.upsert({
    where: { slug: "gaviscon-double-action" },
    update: { defaultImageUrl: "/images/products/gaviscon-double-action-24.jpg" },
    create: {
      name: "Gaviscon Double Action Mint",
      slug: "gaviscon-double-action",
      shortDescription: "Quick relief from heartburn and indigestion with dual-action protection.",
      longDescription: "Gaviscon Double Action Mint Flavour Chewable Tablets provide quick relief from heartburn and indigestion. They are designed to ease discomfort while also helping protect against acid reflux.\n\nWhat this helps with:\n• Heartburn\n• Acid reflux\n• Indigestion\n\nHow it works:\nGaviscon works in two ways. It helps neutralise excess stomach acid and also forms a protective layer over stomach contents to reduce reflux.\n\nHow to use:\nChew thoroughly and use exactly as directed on the pack or in the leaflet.\n\nSide effects:\n• Rarely may cause mild stomach discomfort.",
      productType: "other",
      defaultImageUrl: "/images/products/gaviscon-double-action-24.jpg",
    },
  });
  for (const v of [
    { name: "12 Tablets", slug: "12-tablets", sku: "GAV-DA-12", price: 449, weight: 40 },
    { name: "24 Tablets", slug: "24-tablets", sku: "GAV-DA-24", price: 599, weight: 70 },
    { name: "48 Tablets", slug: "48-tablets", sku: "GAV-DA-48", price: 999, weight: 130 },
  ]) {
    await prisma.productVariant.upsert({
      where: { sku: v.sku },
      update: {},
      create: { productId: gaviscon.id, name: v.name, slugFragment: v.slug, sku: v.sku, priceMinor: v.price, stockQuantity: 100, weightGrams: v.weight },
    });
  }

  // === Dioralyte Relief Blackcurrant (2 variants) ===
  const dioralyteRelief = await prisma.product.upsert({
    where: { slug: "dioralyte-relief-blackcurrant" },
    update: { defaultImageUrl: "/images/products/dioralyte-relief-blackcurrant-6.jpg" },
    create: {
      name: "Dioralyte Relief Blackcurrant",
      slug: "dioralyte-relief-blackcurrant",
      shortDescription: "Replaces fluids and essential salts lost during diarrhoea to support rehydration.",
      longDescription: "Dioralyte Relief Blackcurrant helps replace fluids and essential salts lost during diarrhoea. It is designed to support rehydration and help restore fluid balance quickly.\n\nWhat this helps with:\n• Dehydration\n• Fluid loss from diarrhoea\n• Loss of essential electrolytes\n\nHow it works:\nThe formula contains glucose and electrolyte salts, which help the body absorb water more efficiently and support recovery from dehydration.\n\nHow to use:\nMix with water exactly as directed on the sachet and pack.\n\nSide effects:\n• May occasionally cause mild stomach discomfort.",
      productType: "other",
      defaultImageUrl: "/images/products/dioralyte-relief-blackcurrant-6.jpg",
    },
  });
  for (const v of [
    { name: "6 Sachets", slug: "6-sachets", sku: "DIO-RBC-6", price: 499, weight: 60 },
    { name: "20 Sachets", slug: "20-sachets", sku: "DIO-RBC-20", price: 1499, weight: 180 },
  ]) {
    await prisma.productVariant.upsert({
      where: { sku: v.sku },
      update: {},
      create: { productId: dioralyteRelief.id, name: v.name, slugFragment: v.slug, sku: v.sku, priceMinor: v.price, stockQuantity: 100, weightGrams: v.weight },
    });
  }

  // === Dioralyte Natural 20 Sachets ===
  const dioralyteNatural = await prisma.product.upsert({
    where: { slug: "dioralyte-natural" },
    update: { defaultImageUrl: "/images/products/dioralyte-natural-20.jpg" },
    create: {
      name: "Dioralyte Natural",
      slug: "dioralyte-natural",
      shortDescription: "Oral rehydration treatment to replace fluids and salts lost through diarrhoea.",
      longDescription: "Dioralyte Natural is an oral rehydration treatment designed to replace fluids and salts lost through diarrhoea. It helps support recovery when dehydration is a concern.\n\nWhat this helps with:\n• Dehydration\n• Fluid loss due to illness\n• Electrolyte replacement\n\nHow it works:\nThe glucose and electrolyte formula helps the body absorb water efficiently and restore fluid balance.\n\nHow to use:\nMix with water exactly as instructed on the sachet and pack.\n\nSide effects:\n• May occasionally cause mild stomach discomfort.",
      productType: "other",
      defaultImageUrl: "/images/products/dioralyte-natural-20.jpg",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "DIO-NAT-20" },
    update: {},
    create: { productId: dioralyteNatural.id, name: "20 Sachets", slugFragment: "20-sachets", sku: "DIO-NAT-20", priceMinor: 1549, stockQuantity: 100, weightGrams: 180 },
  });

  // === Kalms Day (2 variants) ===
  const kalmsDay = await prisma.product.upsert({
    where: { slug: "kalms-day" },
    update: { defaultImageUrl: "/images/products/kalms-day-96.png" },
    create: {
      name: "Kalms Day",
      slug: "kalms-day",
      shortDescription: "Traditional herbal medicine to relieve symptoms of stress and mild anxiety.",
      longDescription: "Kalms Day is a traditional herbal medicine used to relieve the symptoms of stress and mild anxiety. It is intended for daytime use and supports a calmer, more balanced feeling.\n\nWhat this helps with:\n• Mild anxiety\n• Stress\n• Nervous tension\n\nHow it works:\nKalms Day contains valerian root extract, a traditional herbal ingredient used to support relaxation and help ease feelings of tension.\n\nHow to use:\nTake exactly as directed on the packaging or leaflet.\n\nSide effects:\n• May cause drowsiness in some people.",
      productType: "other",
      defaultImageUrl: "/images/products/kalms-day-96.png",
    },
  });
  for (const v of [
    { name: "96 Tablets", slug: "96-tablets", sku: "KALM-D-96", price: 699, weight: 80 },
    { name: "168 Tablets", slug: "168-tablets", sku: "KALM-D-168", price: 799, weight: 130 },
  ]) {
    await prisma.productVariant.upsert({
      where: { sku: v.sku },
      update: {},
      create: { productId: kalmsDay.id, name: v.name, slugFragment: v.slug, sku: v.sku, priceMinor: v.price, stockQuantity: 100, weightGrams: v.weight },
    });
  }

  // === Kalms Night 56 Tablets ===
  const kalmsNight = await prisma.product.upsert({
    where: { slug: "kalms-night" },
    update: { defaultImageUrl: "/images/products/kalms-night-56.png" },
    create: {
      name: "Kalms Night",
      slug: "kalms-night",
      shortDescription: "Traditional herbal medicine for temporary sleep disturbances.",
      longDescription: "Kalms Night is a traditional herbal medicine used to relieve temporary sleep disturbances. It is designed to support a more restful night when sleep becomes difficult.\n\nWhat this helps with:\n• Difficulty falling asleep\n• Temporary sleep disturbance\n• Restless nights\n\nHow it works:\nKalms Night contains valerian root extract, traditionally used to support relaxation and natural sleep.\n\nHow to use:\nUse before bedtime exactly as directed on the packaging or leaflet.\n\nSide effects:\n• May cause morning drowsiness in some people.",
      productType: "other",
      defaultImageUrl: "/images/products/kalms-night-56.png",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "KALM-N-56" },
    update: {},
    create: { productId: kalmsNight.id, name: "56 Tablets", slugFragment: "56-tablets", sku: "KALM-N-56", priceMinor: 599, stockQuantity: 100, weightGrams: 60 },
  });

  // === Nytol Herbal 30 Tablets ===
  const nytolHerbal = await prisma.product.upsert({
    where: { slug: "nytol-herbal" },
    update: { defaultImageUrl: "/images/products/nytol-herbal-30.png" },
    create: {
      name: "Nytol Herbal Tablets",
      slug: "nytol-herbal",
      shortDescription: "Traditional herbal remedy to help relieve temporary sleep disturbances.",
      longDescription: "Nytol Herbal Tablets are a traditional herbal remedy used to help relieve temporary sleep disturbances. They are designed to support a more restful night in a gentle, herbal format.\n\nWhat this helps with:\n• Temporary sleep disturbance\n• Difficulty settling at night\n• Restless sleep\n\nHow it works:\nThe herbal formula is designed to support relaxation before bed and encourage a more settled night's sleep.\n\nHow to use:\nTake before bedtime exactly as directed on the packaging.\n\nSide effects:\n• May cause drowsiness.",
      productType: "other",
      defaultImageUrl: "/images/products/nytol-herbal-30.png",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "NYT-HRB-30" },
    update: {},
    create: { productId: nytolHerbal.id, name: "30 Tablets", slugFragment: "30-tablets", sku: "NYT-HRB-30", priceMinor: 599, stockQuantity: 100, weightGrams: 50 },
  });

  // === Centrum Advance (2 variants) ===
  const centrumAdvance = await prisma.product.upsert({
    where: { slug: "centrum-advance" },
    update: { defaultImageUrl: "/images/products/centrum-advance-30.png" },
    create: {
      name: "Centrum Advance",
      slug: "centrum-advance",
      shortDescription: "Daily multivitamin for overall health, immune support, and energy release.",
      longDescription: "Centrum Advance is a daily multivitamin designed to support overall health and wellbeing. It provides a broad range of vitamins and minerals to help support everyday nutritional needs.\n\nWhat this helps with:\n• Daily nutritional support\n• Immune health\n• Energy release\n• General wellbeing\n\nHow it works:\nThe formula provides essential vitamins and minerals that support normal body functions, including energy metabolism and immune function.\n\nHow to use:\nTake daily exactly as directed on the pack.\n\nSide effects:\n• Food supplements are generally well tolerated when used as directed.",
      productType: "supplement",
      defaultImageUrl: "/images/products/centrum-advance-30.png",
    },
  });
  for (const v of [
    { name: "30 Tablets", slug: "30-tablets", sku: "CEN-ADV-30", price: 499, weight: 50 },
    { name: "60 Tablets", slug: "60-tablets", sku: "CEN-ADV-60", price: 799, weight: 90 },
  ]) {
    await prisma.productVariant.upsert({
      where: { sku: v.sku },
      update: {},
      create: { productId: centrumAdvance.id, name: v.name, slugFragment: v.slug, sku: v.sku, priceMinor: v.price, stockQuantity: 100, weightGrams: v.weight },
    });
  }

  // === Centrum Advance 50+ ===
  const centrum50Plus = await prisma.product.upsert({
    where: { slug: "centrum-advance-50-plus" },
    update: { defaultImageUrl: "/images/products/centrum-advance-50-plus-60.png" },
    create: {
      name: "Centrum Advance 50+",
      slug: "centrum-advance-50-plus",
      shortDescription: "Specially formulated multivitamin for adults over 50.",
      longDescription: "Centrum Advance 50 Plus is specially formulated for adults over 50, with a blend of vitamins and minerals designed to support everyday health in later life.\n\nWhat this helps with:\n• Daily nutritional support\n• Immune health\n• Energy release\n• Healthy ageing support\n\nHow it works:\nThe formula provides key nutrients tailored to support normal health and wellbeing in adults aged 50 and over.\n\nHow to use:\nTake daily exactly as directed on the packaging.\n\nSide effects:\n• Food supplements are generally well tolerated when used as directed.",
      productType: "supplement",
      defaultImageUrl: "/images/products/centrum-advance-50-plus-60.png",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "CEN-50P-60" },
    update: {},
    create: { productId: centrum50Plus.id, name: "60 Tablets", slugFragment: "60-tablets", sku: "CEN-50P-60", priceMinor: 999, stockQuantity: 100, weightGrams: 90 },
  });

  // === Berocca Energy Orange 30 Tablets ===
  const beroccaOrange = await prisma.product.upsert({
    where: { slug: "berocca-energy-orange" },
    update: { defaultImageUrl: "/images/products/berocca-orange-30.jpg" },
    create: {
      name: "Berocca Energy Orange",
      slug: "berocca-energy-orange",
      shortDescription: "Effervescent vitamin and mineral supplement for energy release and mental performance.",
      longDescription: "Berocca Energy Release Natural Orange is an effervescent vitamin and mineral supplement designed to support energy release and mental performance in a refreshing drink format.\n\nWhat this helps with:\n• Tiredness and fatigue\n• Daily vitamin support\n• Mental performance\n• Energy release\n\nHow it works:\nBerocca contains B vitamins and other key nutrients that contribute to normal energy yielding metabolism and help reduce tiredness and fatigue.\n\nHow to use:\nDissolve in water exactly as directed on the pack.\n\nSide effects:\n• Food supplements are generally well tolerated when used as directed.",
      productType: "supplement",
      defaultImageUrl: "/images/products/berocca-orange-30.jpg",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "BER-ORG-30" },
    update: {},
    create: { productId: beroccaOrange.id, name: "30 Tablets", slugFragment: "30-tablets", sku: "BER-ORG-30", priceMinor: 1599, stockQuantity: 100, weightGrams: 120 },
  });

  // === Berocca Mango 15 Tablets ===
  const beroccaMango = await prisma.product.upsert({
    where: { slug: "berocca-mango" },
    update: { defaultImageUrl: "/images/products/berocca-mango-15.jpg" },
    create: {
      name: "Berocca Mango",
      slug: "berocca-mango",
      shortDescription: "Energy support formula in a refreshing mango flavour effervescent tablet.",
      longDescription: "Berocca Mango Effervescent Tablets provide the same energy support formula in a refreshing mango flavour, making daily vitamin support easy and convenient.\n\nWhat this helps with:\n• Tiredness and fatigue\n• Daily energy support\n• Mental performance\n\nHow it works:\nIts vitamin and mineral blend helps support normal energy release and reduce tiredness.\n\nHow to use:\nDissolve in water exactly as directed on the pack.\n\nSide effects:\n• Food supplements are generally well tolerated when used as directed.",
      productType: "supplement",
      defaultImageUrl: "/images/products/berocca-mango-15.jpg",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "BER-MNG-15" },
    update: {},
    create: { productId: beroccaMango.id, name: "15 Tablets", slugFragment: "15-tablets", sku: "BER-MNG-15", priceMinor: 599, stockQuantity: 100, weightGrams: 70 },
  });

  // === Valupak Vitamin D3 1000 IU 60 Tablets ===
  const valupakD3 = await prisma.product.upsert({
    where: { slug: "valupak-vitamin-d3" },
    update: { defaultImageUrl: "/images/products/valupak-vitamin-d3-60.png" },
    create: {
      name: "Valupak Vitamin D3 1000 IU",
      slug: "valupak-vitamin-d3",
      shortDescription: "Daily supplement for healthy bones, muscles, and normal immune function.",
      longDescription: "Valupak Vitamin D3 1000 IU is a daily supplement designed to support healthy bones, muscles, and normal immune function.\n\nWhat this helps with:\n• Bone health\n• Muscle function\n• Immune support\n• Daily vitamin D intake\n\nHow it works:\nVitamin D helps the body absorb calcium and supports normal bone maintenance and immune system function.\n\nHow to use:\nTake daily exactly as directed on the packaging.\n\nSide effects:\n• Food supplements are generally well tolerated when used as directed.",
      productType: "supplement",
      defaultImageUrl: "/images/products/valupak-vitamin-d3-60.png",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "VAL-D3-60" },
    update: {},
    create: { productId: valupakD3.id, name: "60 Tablets", slugFragment: "60-tablets", sku: "VAL-D3-60", priceMinor: 129, stockQuantity: 200, weightGrams: 40 },
  });

  // === Valupak Glucosamine Sulphate 500mg 90 Tablets ===
  const valupakGluc = await prisma.product.upsert({
    where: { slug: "valupak-glucosamine" },
    update: { defaultImageUrl: "/images/products/valupak-glucosamine-90.png" },
    create: {
      name: "Valupak Glucosamine Sulphate 500mg",
      slug: "valupak-glucosamine",
      shortDescription: "Joint support supplement for everyday joint comfort and mobility.",
      longDescription: "Valupak Glucosamine Sulphate is a joint support supplement designed for people looking to maintain everyday joint comfort and mobility.\n\nWhat this helps with:\n• Joint support\n• Mobility\n• Everyday joint care\n\nHow it works:\nGlucosamine is commonly used in joint care supplements and is included to support healthy joint function.\n\nHow to use:\nTake exactly as directed on the pack.\n\nSide effects:\n• Food supplements are generally well tolerated when used as directed.",
      productType: "supplement",
      defaultImageUrl: "/images/products/valupak-glucosamine-90.png",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "VAL-GLC-90" },
    update: {},
    create: { productId: valupakGluc.id, name: "90 Tablets", slugFragment: "90-tablets", sku: "VAL-GLC-90", priceMinor: 549, stockQuantity: 100, weightGrams: 100 },
  });

  // === Osteocare Original ===
  const osteocare = await prisma.product.upsert({
    where: { slug: "osteocare-original" },
    update: { defaultImageUrl: "/images/products/osteocare-original.png" },
    create: {
      name: "Osteocare Original",
      slug: "osteocare-original",
      shortDescription: "Calcium-based supplement with magnesium, vitamin D, and zinc for bone health.",
      longDescription: "Osteocare Original is a calcium based supplement with magnesium, vitamin D, and zinc, designed to support normal bone health and daily mineral intake.\n\nWhat this helps with:\n• Bone health\n• Calcium intake\n• Everyday nutritional support\n\nHow it works:\nIts blend of calcium, magnesium, vitamin D, and zinc helps support the maintenance of normal bones.\n\nHow to use:\nTake exactly as directed on the packaging.\n\nSide effects:\n• Food supplements are generally well tolerated when used as directed.",
      productType: "supplement",
      defaultImageUrl: "/images/products/osteocare-original.png",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "OST-ORI-30" },
    update: {},
    create: { productId: osteocare.id, name: "30 Tablets", slugFragment: "30-tablets", sku: "OST-ORI-30", priceMinor: 449, stockQuantity: 100, weightGrams: 60 },
  });

  // === Seven Seas JointCare Essential ===
  const jointcareEssential = await prisma.product.upsert({
    where: { slug: "seven-seas-jointcare-essential" },
    update: { defaultImageUrl: "/images/products/seven-seas-jointcare-essential.jpg" },
    create: {
      name: "Seven Seas JointCare Essential",
      slug: "seven-seas-jointcare-essential",
      shortDescription: "Joint support supplement combining key nutrients for movement and joint health.",
      longDescription: "Seven Seas JointCare Essential is a joint support supplement that combines key nutrients in a convenient daily pack to support movement and everyday joint health.\n\nWhat this helps with:\n• Joint support\n• Mobility\n• Everyday joint care\n\nHow it works:\nThe formula combines joint support ingredients with selected nutrients to help support normal joint health as part of a balanced routine.\n\nHow to use:\nTake exactly as directed on the packaging.\n\nSide effects:\n• Food supplements are generally well tolerated when used as directed.",
      productType: "supplement",
      defaultImageUrl: "/images/products/seven-seas-jointcare-essential.jpg",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "SS-JCE-30" },
    update: {},
    create: { productId: jointcareEssential.id, name: "30 Day Pack", slugFragment: "30-day-pack", sku: "SS-JCE-30", priceMinor: 899, stockQuantity: 100, weightGrams: 80 },
  });

  // === Seven Seas JointCare + Turmeric Duo Pack ===
  const jointcareTurmeric = await prisma.product.upsert({
    where: { slug: "seven-seas-jointcare-turmeric" },
    update: { defaultImageUrl: "/images/products/seven-seas-jointcare-turmeric.jpg" },
    create: {
      name: "Seven Seas JointCare + Turmeric Duo Pack",
      slug: "seven-seas-jointcare-turmeric",
      shortDescription: "Joint comfort and mobility support with turmeric in a daily pack format.",
      longDescription: "Seven Seas JointCare Plus Turmeric Duo Pack is designed to support joint comfort and mobility, combining core joint support ingredients with turmeric in a daily pack format.\n\nWhat this helps with:\n• Joint support\n• Flexibility\n• Everyday movement\n\nHow it works:\nThe formula combines joint support ingredients with turmeric as part of a daily routine for joint wellbeing.\n\nHow to use:\nTake exactly as directed on the packaging.\n\nSide effects:\n• Food supplements are generally well tolerated when used as directed.",
      productType: "supplement",
      defaultImageUrl: "/images/products/seven-seas-jointcare-turmeric.jpg",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "SS-JCT-30" },
    update: {},
    create: { productId: jointcareTurmeric.id, name: "30 Day Pack", slugFragment: "30-day-pack", sku: "SS-JCT-30", priceMinor: 1799, stockQuantity: 100, weightGrams: 100 },
  });

  // === Acnecide 5% Gel (2 variants) ===
  const acnecide = await prisma.product.upsert({
    where: { slug: "acnecide-gel" },
    update: { defaultImageUrl: "/images/products/acnecide-gel-30g.png" },
    create: {
      name: "Acnecide 5% Benzoyl Peroxide Gel",
      slug: "acnecide-gel",
      shortDescription: "Targeted acne treatment to help reduce spots and improve blemish-prone skin.",
      longDescription: "Acnecide 5 Percent Gel is a targeted acne treatment designed to help reduce spots and improve the appearance of blemish prone skin.\n\nWhat this helps with:\n• Acne\n• Spots\n• Inflamed blemishes\n\nHow it works:\nIt contains benzoyl peroxide, which helps kill acne causing bacteria and supports clearer skin.\n\nHow to use:\nApply to affected areas exactly as directed on the pack or in the leaflet.\n\nSide effects:\n• May cause dryness, peeling, or skin irritation.\n• May bleach hair and fabrics.",
      productType: "other",
      defaultImageUrl: "/images/products/acnecide-gel-30g.png",
    },
  });
  for (const v of [
    { name: "30g", slug: "30g", sku: "ACN-5-30G", price: 1199, weight: 50 },
    { name: "60g", slug: "60g", sku: "ACN-5-60G", price: 999, weight: 85 },
  ]) {
    await prisma.productVariant.upsert({
      where: { sku: v.sku },
      update: {},
      create: { productId: acnecide.id, name: v.name, slugFragment: v.slug, sku: v.sku, priceMinor: v.price, stockQuantity: 100, weightGrams: v.weight },
    });
  }

  // === Freederm Gel 10g ===
  const freederm = await prisma.product.upsert({
    where: { slug: "freederm-gel" },
    update: { defaultImageUrl: "/images/products/freederm-gel-10g.png" },
    create: {
      name: "Freederm Gel",
      slug: "freederm-gel",
      shortDescription: "Anti-inflammatory acne treatment to reduce redness and irritation from spots.",
      longDescription: "Freederm Gel is an anti-inflammatory acne treatment designed to help reduce the redness and irritation associated with spots.\n\nWhat this helps with:\n• Inflamed acne\n• Redness\n• Spot prone skin\n\nHow it works:\nIt contains nicotinamide, which helps reduce inflammation and supports calmer looking skin.\n\nHow to use:\nApply to affected areas exactly as directed on the pack or in the leaflet.\n\nSide effects:\n• May occasionally cause mild skin irritation.",
      productType: "other",
      defaultImageUrl: "/images/products/freederm-gel-10g.png",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "FRD-GEL-10" },
    update: {},
    create: { productId: freederm.id, name: "10g", slugFragment: "10g", sku: "FRD-GEL-10", priceMinor: 499, stockQuantity: 100, weightGrams: 25 },
  });

  // === Savlon Antiseptic Cream (2 variants) ===
  const savlon = await prisma.product.upsert({
    where: { slug: "savlon-antiseptic-cream" },
    update: { defaultImageUrl: "/images/products/savlon-antiseptic-30g.jpg" },
    create: {
      name: "Savlon Antiseptic Cream",
      slug: "savlon-antiseptic-cream",
      shortDescription: "First aid essential to protect minor cuts, grazes, and burns from infection.",
      longDescription: "Savlon Antiseptic Cream is a first aid essential designed to help protect minor cuts, grazes, and burns from infection while soothing the skin.\n\nWhat this helps with:\n• Minor cuts\n• Grazes\n• Minor burns\n• Broken skin\n\nHow it works:\nThe antiseptic ingredients help protect damaged skin from infection and support everyday wound care.\n\nHow to use:\nApply gently to the affected area exactly as directed on the pack or in the leaflet.\n\nSide effects:\n• Rarely may cause mild skin irritation.",
      productType: "other",
      defaultImageUrl: "/images/products/savlon-antiseptic-30g.jpg",
    },
  });
  for (const v of [
    { name: "30g", slug: "30g", sku: "SAV-AC-30G", price: 299, weight: 45 },
    { name: "100g", slug: "100g", sku: "SAV-AC-100G", price: 449, weight: 120 },
  ]) {
    await prisma.productVariant.upsert({
      where: { sku: v.sku },
      update: {},
      create: { productId: savlon.id, name: v.name, slugFragment: v.slug, sku: v.sku, priceMinor: v.price, stockQuantity: 100, weightGrams: v.weight },
    });
  }

  // === Rescue Pastilles Blackcurrant ===
  const rescueBlackcurrant = await prisma.product.upsert({
    where: { slug: "rescue-pastilles-blackcurrant" },
    update: { defaultImageUrl: "/images/products/rescue-pastilles-blackcurrant.png" },
    create: {
      name: "Rescue Pastilles Blackcurrant",
      slug: "rescue-pastilles-blackcurrant",
      shortDescription: "Soothing pastilles for moments of everyday stress, convenient and easy to carry.",
      longDescription: "Rescue Pastilles Blackcurrant are designed for moments of everyday stress, offering a convenient and easy to carry option when you want support on the go.\n\nWhat this helps with:\n• Everyday stress\n• Busy days\n• Moments of pressure\n\nHow it works:\nThey are made with the Rescue flower essence blend in a blackcurrant flavoured pastille format for convenient everyday use.\n\nHow to use:\nUse exactly as directed on the packaging.\n\nSide effects:\n• Products of this type are generally well tolerated when used as directed.",
      productType: "other",
      defaultImageUrl: "/images/products/rescue-pastilles-blackcurrant.png",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "RSC-BC-50G" },
    update: {},
    create: { productId: rescueBlackcurrant.id, name: "50g", slugFragment: "50g", sku: "RSC-BC-50G", priceMinor: 649, stockQuantity: 100, weightGrams: 60 },
  });

  // === Rescue Pastilles Orange & Elderflower ===
  const rescueOrange = await prisma.product.upsert({
    where: { slug: "rescue-pastilles-orange-elderflower" },
    update: { defaultImageUrl: "/images/products/rescue-pastilles-orange-elderflower.png" },
    create: {
      name: "Rescue Pastilles Orange & Elderflower",
      slug: "rescue-pastilles-orange-elderflower",
      shortDescription: "Convenient stress support pastilles in a refreshing orange and elderflower flavour.",
      longDescription: "Rescue Pastilles Orange and Elderflower offer the same convenient stress support in a refreshing orange and elderflower flavour.\n\nWhat this helps with:\n• Everyday stress\n• Busy schedules\n• On the go support\n\nHow it works:\nThey contain the Rescue flower essence blend in a convenient flavoured pastille format.\n\nHow to use:\nUse exactly as directed on the packaging.\n\nSide effects:\n• Products of this type are generally well tolerated when used as directed.",
      productType: "other",
      defaultImageUrl: "/images/products/rescue-pastilles-orange-elderflower.png",
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "RSC-OE-50G" },
    update: {},
    create: { productId: rescueOrange.id, name: "50g", slugFragment: "50g", sku: "RSC-OE-50G", priceMinor: 749, stockQuantity: 100, weightGrams: 60 },
  });

  // ================================================================
  // COLLECTION-PRODUCT ASSOCIATIONS
  // ================================================================

  const productMap: Record<string, string> = {
    mounjaro: mounjaro.id,
    magnesium: magnesium.id,
    electrolytes: electrolytes.id,
    sleep: sleepSupport.id,
    probiotic: probiotic.id,
    imodiumInstants: imodiumInstants.id,
    imodiumMelts: imodiumMelts.id,
    gaviscon: gaviscon.id,
    dioralyteRelief: dioralyteRelief.id,
    dioralyteNatural: dioralyteNatural.id,
    kalmsDay: kalmsDay.id,
    kalmsNight: kalmsNight.id,
    nytolHerbal: nytolHerbal.id,
    centrumAdvance: centrumAdvance.id,
    centrum50Plus: centrum50Plus.id,
    beroccaOrange: beroccaOrange.id,
    beroccaMango: beroccaMango.id,
    valupakD3: valupakD3.id,
    valupakGluc: valupakGluc.id,
    osteocare: osteocare.id,
    jointcareEssential: jointcareEssential.id,
    jointcareTurmeric: jointcareTurmeric.id,
    acnecide: acnecide.id,
    freederm: freederm.id,
    savlon: savlon.id,
    rescueBlackcurrant: rescueBlackcurrant.id,
    rescueOrange: rescueOrange.id,
  };

  const collectionMap: Record<string, string> = {};
  for (const c of collections) {
    collectionMap[c.slug] = c.id;
  }

  const associations = [
    // Weight Loss
    { collection: "weight-loss", product: "mounjaro", sort: 1 },

    // Vitamins & Supplements
    { collection: "vitamins-supplements", product: "centrumAdvance", sort: 1 },
    { collection: "vitamins-supplements", product: "centrum50Plus", sort: 2 },
    { collection: "vitamins-supplements", product: "beroccaOrange", sort: 3 },
    { collection: "vitamins-supplements", product: "beroccaMango", sort: 4 },
    { collection: "vitamins-supplements", product: "valupakD3", sort: 5 },
    { collection: "vitamins-supplements", product: "osteocare", sort: 6 },
    { collection: "vitamins-supplements", product: "magnesium", sort: 7 },
    { collection: "vitamins-supplements", product: "electrolytes", sort: 8 },
    { collection: "vitamins-supplements", product: "probiotic", sort: 9 },
    { collection: "vitamins-supplements", product: "jointcareEssential", sort: 10 },
    { collection: "vitamins-supplements", product: "jointcareTurmeric", sort: 11 },
    { collection: "vitamins-supplements", product: "valupakGluc", sort: 12 },

    // Digestive Health
    { collection: "digestive-health", product: "gaviscon", sort: 1 },
    { collection: "digestive-health", product: "imodiumInstants", sort: 2 },
    { collection: "digestive-health", product: "imodiumMelts", sort: 3 },
    { collection: "digestive-health", product: "dioralyteRelief", sort: 4 },
    { collection: "digestive-health", product: "dioralyteNatural", sort: 5 },

    // Stress & Sleep
    { collection: "stress-sleep", product: "kalmsDay", sort: 1 },
    { collection: "stress-sleep", product: "kalmsNight", sort: 2 },
    { collection: "stress-sleep", product: "nytolHerbal", sort: 3 },
    { collection: "stress-sleep", product: "rescueBlackcurrant", sort: 4 },
    { collection: "stress-sleep", product: "rescueOrange", sort: 5 },
    { collection: "stress-sleep", product: "sleep", sort: 6 },

    // Joint Support
    { collection: "joint-support", product: "jointcareEssential", sort: 1 },
    { collection: "joint-support", product: "jointcareTurmeric", sort: 2 },
    { collection: "joint-support", product: "valupakGluc", sort: 3 },

    // Skin Care
    { collection: "skin-care", product: "acnecide", sort: 1 },
    { collection: "skin-care", product: "freederm", sort: 2 },

    // First Aid
    { collection: "first-aid", product: "savlon", sort: 1 },

    // Women's Health
    { collection: "womens-health", product: "probiotic", sort: 1 },
  ];

  for (const assoc of associations) {
    const collId = collectionMap[assoc.collection];
    const prodId = productMap[assoc.product];
    if (!collId || !prodId) {
      console.warn(`Skipping association: collection=${assoc.collection}, product=${assoc.product}`);
      continue;
    }
    await prisma.collectionProduct.upsert({
      where: { collectionId_productId: { collectionId: collId, productId: prodId } },
      update: { sortOrder: assoc.sort },
      create: { collectionId: collId, productId: prodId, sortOrder: assoc.sort },
    });
  }

  console.log("Seeded products and collection associations");

  // ---- Bootstrap Admin User ----
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@rootspharmacy.co.uk";
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { roles: true },
  });

  if (adminUser) {
    const rolesToAssign: Array<"admin" | "prescriber"> = ["admin", "prescriber"];
    for (const role of rolesToAssign) {
      const hasIt = adminUser.roles.some((r) => r.role === role);
      if (!hasIt) {
        await prisma.userRole.create({
          data: { userId: adminUser.id, role },
        });
        console.log(`Assigned ${role} role to ${adminEmail}`);
      } else {
        console.log(`User ${adminEmail} already has ${role} role`);
      }
    }
  } else {
    console.log(
      `Admin user ${adminEmail} not found in database. ` +
      `The user must sign up via Clerk first, then re-run seed or use the admin UI to assign the role.`
    );
  }

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
