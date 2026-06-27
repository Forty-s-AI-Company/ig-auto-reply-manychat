# Design System: InboxPilot
**Project ID:** local-codebase

## 1. Visual Theme & Atmosphere

InboxPilot currently uses two connected but different visual registers. The authenticated product UI is restrained, light, teal-accented, and operations-focused. It should feel calm, scan-friendly, and reliable, similar to a compact SaaS control room for Instagram conversations. The public `/official` homepage is louder and more campaign-like, using yellow hero surfaces, black typography, playful motion, and bold rounded cards to communicate speed and social energy.

For a production-ready system, the shared design language should prioritize the dashboard register: clean light surfaces, clear teal action states, compact information hierarchy, and product proof through real UI states. Marketing pages may be more expressive, but should still point back to the same Instagram-first product identity.

## 2. Color Palette & Roles

- **InboxPilot Cyan (#19D3D8):** Primary product accent for key actions, selected states, progress indicators, and focus affordances.
- **Deep Operational Teal (#073D3F):** Sidebar and persistent navigation background; conveys stability and platform depth.
- **Dark Teal Ink (#0D5C63):** Strong supporting accent for product labels and icon emphasis.
- **Soft Cyan Surface (#DDF8FA):** Low-emphasis selected or highlighted background.
- **Product Canvas (#F6FBFC):** Default authenticated app background.
- **Card White (#FFFFFF):** Main content cards and dashboard panels.
- **Primary Text (#0F172A):** Main dashboard text and high-emphasis UI labels.
- **Secondary Text (#64748B):** Supporting descriptions, metadata, and lower-priority labels.
- **Muted Text (#94A3B8):** Use sparingly for timestamps and tertiary metadata; avoid on colored backgrounds.
- **Marketing Yellow (#FFDD35):** Public homepage campaign accent. Use for landing CTAs and brand-energy sections, not as a dashboard foundation.
- **Marketing Ink (#111111):** High-contrast text and CTA background on marketing surfaces.

## 3. Typography Rules

Use a single modern sans-serif interface family through the project token `--font-sans`, currently mapped to Geist/system sans fallbacks. Product UI should use a tight fixed scale: small labels, readable body text, medium section headings, and restrained page titles. Dashboard text should favor 14-16px for operational scanning, with tabular numbers for metrics when possible.

Marketing pages may use heavier weights and larger headings, but display tracking should not go tighter than `-0.04em`. Current homepage values such as `tracking-[-0.06em]` should be relaxed to avoid cramped Chinese/English mixed headlines on smaller screens.

## 4. Component Stylings

- **Buttons:** Product buttons should be 40-44px tall, medium radius, and token-driven. Primary actions use InboxPilot Cyan with dark teal text. Secondary actions use white surfaces with soft borders. Marketing CTAs may use pill shapes and stronger contrast, but should not introduce a second unrelated component vocabulary.
- **Cards/Containers:** Dashboard cards use white surfaces, 12px radius, soft borders, and light teal-tinted shadows. Avoid stacking heavy border plus large decorative shadow on every panel. Marketing cards may be bolder, but should avoid 28-30px radii as the default.
- **Inputs/Forms:** Inputs use white background, soft border, visible labels, 40px minimum height, and strong focus outlines using the cyan focus token.
- **Navigation:** Product navigation uses a fixed dark teal sidebar on desktop and mobile sheet navigation. Active state combines text, icon, and background; do not rely on color alone.
- **Status Badges:** Health, enabled/disabled, and warning states must include text labels and semantic color. Avoid gray text on colored backgrounds.

## 5. Layout Principles

Dashboard pages should use dense but readable spacing: 20-24px page gutters, 12-20px card gaps, and clear section grouping. Use grid for metric layouts and two-column dashboard sections, but avoid nested cards where a simple list or table would scan better.

Marketing pages should make the product visible in the first viewport, but the visual system should favor real product screens and concrete Instagram workflows over abstract decorative bubbles. Long lists of features should be chunked into 3-5 meaningful groups. Mobile layouts need explicit overflow handling for large headings, tables, and recent-message rows.
