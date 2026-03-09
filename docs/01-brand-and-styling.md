# 01-brand-and-styling.md

## Purpose
Visual source of truth for ROOTS. The coded site must visually match the Shopify theme as closely as possible. Same layout rhythm, card structure, spacing density, typography, color system, motion, and visual hierarchy.

## 1. Exactness Protocol
1. Export Shopify theme assets into `public/assets/theme/`
2. Inspect live Shopify with DevTools for exact spacing, type sizes, colors
3. This document = design rules. Shopify CSS values = final tie-breaker for pixel-parity.

## 2. Visual Direction
Feel: premium, editorial, soft, modern, clinical, confident, calm, high-trust, slightly lifestyle-led.
NOT: loud, startup-generic, harsh, cramped, over-decorated, marketplace-like.

## 3. Typography

### Logo: ROOTS
Font: Fraunces (Google Font), weight 900, `tracking-tighter uppercase`. On dark header: cream. On light: navy.

### Logo subtitle: PHARMACY
Plus Jakarta Sans, 8-10px, bold, uppercase, `tracking-[0.3em]`

### All page content (headings + body): DM Sans
The actual Shopify theme uses DM Sans (not Plus Jakarta Sans as previously assumed). Body weight 400, bolder weight 500, heading weight 500. Fraunces is logo-only.

### Type Scale
| Element | Desktop | Tablet | Mobile | Line-height | Weight |
|---------|---------|--------|--------|-------------|--------|
| Hero heading | 72px | 56px | 38px | 0.95-1.0 | 500-600 |
| Section title | 56px | 42px | 30px | 1.0 | 500-600 |
| Product title | 60-64px | 42px | 28px | 0.98 | 500-600 |
| Body | 18px | 18px | 16px | 1.65-1.75 | 400 |
| Labels | 12-15px | — | — | 1.4 | 500 |

## 4. Color System
```css
:root {
  --roots-green: #045c4b;
  --roots-green-2: #0b6a57;
  --roots-navy: #003049;
  --roots-orange: #f77f00;
  --roots-cream: #fdf0d5;
  --roots-cream-2: #f3e8c8;
  --roots-text-dark: #0b6a57;
  --roots-text-light: #fdf0d5;
  --roots-overlay: rgba(0, 48, 41, 0.55);
  --roots-line-soft: rgba(253, 240, 213, 0.45);
}
```
- Dark green: header, hero, deep showcase sections, major anchors
- Cream: announcement bar, light sections, cards, product list backgrounds
- Navy: sparingly for text on light backgrounds, inputs
- Orange: accent only — promotional chips, small highlights. Do NOT overuse.

## 5. Spacing
```css
:root {
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px; --space-9: 96px;
}
```
Most sections: 64px vertical padding minimum. Cards: 16-24px internal. Product text blocks: generous breathing room.

## 6. Radius
Buttons: 8px. Inputs: 10-12px. Cards: 16px. Hero tiles/collection cards: 16-22px. No hard corners on public pages.

## 7. Shadows and Borders
No dramatic shadows. Prefer soft contrast, spacing, muted outlines. 1px soft line, low-opacity cream/green.

## 8. Layout
Full-bleed section backgrounds, centered content, max-width **1410px** (from theme config). Padding: 48px desktop, 24px tablet, 16px mobile. Button height: 60px.

## 9. Header
- Announcement bar: cream bg, ~40px, dark green text, trust copy, medium weight
- Main header: dark green bg, ~80px, left logo, center nav, right icons (cream, 22-24px, thin line style)

## 10. Homepage Anatomy (in order)
AnnouncementBar → Header → HeroSlider → Category highlight → ProductShowcase → Additional collection band → Footer

## 11. Hero Slider
Left illustration + center large hero + right illustration. Dark green cards, rounded corners, pale line-art, huge cream headline, soft CTA. Dots: centered, active = elongated pill.

## 12. Buttons
Primary: green/overlay-dark, cream text, 8px radius, medium weight, no aggressive shadow. Secondary: outline/muted fill.

## 13. Status Pills
Consistent everywhere. Rounded full pill, small/medium, low-clutter color coding.

## 14. Motion
200-300ms transitions. Opacity fade, slight translateY, gentle carousel. No springy animations or excessive parallax.

## 15. Inputs
Cream/soft white bg, dark green/navy text, 10-12px radius, medium padding, strong focus ring. Selects: soft, not browser-default.

## 16. Assets
All in `public/assets/theme/`: logos, icons, illustrations, backgrounds, product-placeholders.
