/**
 * "Frequently Bought Together" mappings.
 * Key = product slug, value = array of recommended product slugs.
 */
export const PRODUCT_RECOMMENDATIONS: Record<string, string[]> = {
  // Digestive health cross-sells
  "gaviscon-double-action": ["dioralyte-relief-blackcurrant", "imodium-instants"],
  "imodium-instants": ["dioralyte-relief-blackcurrant", "gaviscon-double-action"],
  "imodium-instant-melts": ["dioralyte-relief-blackcurrant", "gaviscon-double-action"],
  "dioralyte-relief-blackcurrant": ["gaviscon-double-action", "imodium-instants"],
  "dioralyte-natural": ["gaviscon-double-action", "imodium-instants"],

  // Skin care cross-sells
  "acnecide-gel": ["freederm-gel", "sudocrem"],
  "freederm-gel": ["acnecide-gel", "sudocrem"],
  "sudocrem": ["freederm-gel", "savlon-antiseptic-cream"],
  "savlon-antiseptic-cream": ["sudocrem", "freederm-gel"],

  // Energy & vitamins cross-sells
  "berocca-energy-orange": ["valupak-vitamin-d3", "centrum-advance"],
  "berocca-mango": ["valupak-vitamin-d3", "centrum-advance"],
  "centrum-advance": ["valupak-vitamin-d3", "berocca-energy-orange"],
  "centrum-advance-50-plus": ["valupak-vitamin-d3", "osteocare-original"],
  "valupak-vitamin-d3": ["centrum-advance", "berocca-energy-orange"],

  // Stress & sleep cross-sells
  "kalms-day": ["nytol-herbal", "rescue-pastilles-blackcurrant"],
  "kalms-night": ["nytol-herbal", "rescue-pastilles-blackcurrant"],
  "nytol-herbal": ["kalms-night", "rescue-pastilles-blackcurrant"],
  "rescue-pastilles-blackcurrant": ["kalms-day", "nytol-herbal"],
  "rescue-pastilles-orange-elderflower": ["kalms-day", "nytol-herbal"],

  // Joint support cross-sells
  "valupak-glucosamine": ["seven-seas-cod-liver-oil", "osteocare-original"],
  "osteocare-original": ["valupak-glucosamine", "seven-seas-cod-liver-oil"],

  // Cod liver oil cross-sells
  "seven-seas-cod-liver-oil": ["osteocare-original", "valupak-vitamin-d3"],

  // Bundle cross-sells
  "stomach-relief-kit": ["cold-flu-recovery-kit", "daily-health-stack"],
  "cold-flu-recovery-kit": ["stomach-relief-kit", "daily-health-stack"],
  "sleep-stress-reset-kit": ["daily-health-stack", "skin-rescue-kit"],
  "skin-rescue-kit": ["sleep-stress-reset-kit", "daily-health-stack"],
  "daily-health-stack": ["stomach-relief-kit", "sleep-stress-reset-kit"],
};
