---
title: Gain Insight Brand Guidelines
created: 2026-03-10
updated: 2026-03-10
last_checked: 2026-03-10
tags: [design, brand, ux, guidelines]
---

# Gain Insight Brand Guidelines

> **Purpose:** Enable engineers and AI to make correct UI decisions without designer intervention.
> **Audience:** Engineers, AI agents, designers
> **Phase:** Referenced throughout all development

---

## 1. Who We Are

Gain Insight is an **AI venture partner**. We partner with domain experts and ambitious businesses to build AI-powered products. Our brand reflects how we work — precise, considered, and confident without being loud.

### Brand Personality

| Attribute | Our Position | Anti-Pattern |
|-----------|-------------|--------------|
| Tone | Quiet confidence — the work speaks for itself | Not corporate-stuffy, not startup-casual |
| Density | Generous spacing, editorial feel | Not marketing-sparse, not information-dense |
| Motion | Subtle, functional transitions only | No decorative animations, no jarring state changes |
| Colour | Reserved — when colour appears, it means something | Not colourful for its own sake |

**Core principles:**

| Principle | Description |
|-----------|-------------|
| Quiet confidence | We don't need to shout. The work and the people speak for themselves. |
| Precision over decoration | Every design decision earns its place. Nothing is decorative for its own sake. |
| Dark and considered | The brand lives primarily on dark backgrounds — considered, premium, unhurried. |
| Colour with purpose | Colour is reserved. When it appears, it means something. |

### Domain

| Purpose | Value |
|---------|-------|
| Primary | gaininsight.ai |
| Redirect | gaininsight.global -> gaininsight.ai (301) |
| Rationale | The .ai suffix is a deliberate brand signal — not decoration. |

---

## 2. Wordmark

The wordmark operates on three levels simultaneously:
- **GAIN INSIGHT** — the company name
- **GAIN** — the shorthand, which is inherently positive
- **G-AI-N INSIGHT** — AI is embedded in the name, visible but not forced

### Construction

| Element | Specification |
|---------|--------------|
| Font | Barlow Condensed Bold (700) — exclusively for the wordmark, never in site content |
| GAIN letters | G and N in primary text colour. AI in Steel blue (#6090BA). Consistent across all contexts. |
| INSIGHT | Same font, same weight. Tracked to match the width of GAIN exactly — forming a square. |
| Divider | 1px horizontal rule between GAIN and INSIGHT. 2px gap either side. |
| Divider colour | border-subtle (#2A2F42) on dark, border-light (#E0E2EA) on light |

### Scale

| Size | Usage |
|------|-------|
| 72px | Primary — hero, footer |
| 48px | Large — presentations |
| 36px | Nav — 80px header |
| 24px | Compact — small contexts |

### Shorthand — GAIN

The shorthand mark (GAIN only) is used where the full stacked mark is impractical. Not used in the nav; the nav always uses the full stacked mark.

### Nav Usage

| Rule | Value |
|------|-------|
| Header height | 80px — tall enough to carry the stacked mark comfortably |
| Mark size | 36px GAIN / 11px INSIGHT at nav scale |
| Background | Always on dark (#09090C), even on pages with white sections |

### Wordmark Rules

**Do:**
- Use Barlow Condensed Bold at all times for the wordmark
- Maintain the 2px gap between GAIN and the rule, and rule and INSIGHT
- Use on dark or light — with sufficient contrast
- Maintain minimum clear space equal to the height of the INSIGHT row on all sides
- Use the shorthand GAIN mark where the full mark is too small to be legible

**Don't:**
- Recreate the mark in any other typeface — including the site body fonts
- Stretch, skew, outline, or apply drop shadows to the mark
- Change the colour of the AI letters — they are always Steel blue (#6090BA)
- Add drop shadows, gradients, or glows to the wordmark
- Place on patterned or photographic backgrounds without sufficient contrast

---

## 3. Colour

Steel blue primary. Four curated accents. Used sparingly.

### Dark Backgrounds

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-bg` | Background | `#09090C` | Primary page background — hero, nav, footer, dark sections |
| `--color-surface` | Surface | `#0F1118` | Cards, panels, elevated containers on dark |
| `--color-elevated` | Elevated | `#181B26` | Tooltips, dropdowns, secondary elevated elements |
| `--color-border-subtle` | Border Subtle | `#2A2F42` | Dividers within dark sections, rule in wordmark |
| `--color-border` | Border | `#1E2230` | Card borders, section dividers on dark |

### Light Backgrounds

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-bg-light` | White | `#FFFFFF` | Hero sections, partners section — alternating with dark |
| `--color-bg-offwhite` | Off-white | `#F7F7F5` | Approach sections, subtle alternation within white areas |
| `--color-bg-subtle` | Subtle | `#F2F2F6` | Cards and panels within white sections |
| `--color-border-light` | Border Light | `#E0E2EA` | Borders within light sections, rule in wordmark on light |

### Text

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-text` | Text Primary (dark bg) | `#E8EAF0` | Headings, body text on dark backgrounds |
| `--color-text-muted` | Text Muted (dark bg) | `#485070` | Labels, nav links, supporting text on dark |
| `--color-text-dark` | Text Primary (light bg) | `#0F1118` | Headings, body text on light backgrounds |
| `--color-text-light` | Text Muted (light bg) | `#8090B0` | Labels, supporting text on light backgrounds |

### Steel — Primary Accent

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-steel` | `#6090BA` | AI letters in wordmark, nav CTA button, interactive elements, links |
| `--color-steel-dim` | `rgba(96,144,186,0.12)` | Subtle backgrounds, hover states |
| `--color-steel-mid` | `rgba(96,144,186,0.30)` | Borders on highlighted elements |

Steel is the primary and most-used accent. It appears on the wordmark AI letters on every page. All primary navigation CTAs use Steel. The secondary accents are used sparingly alongside Steel, never instead of it.

### Secondary Accents — The Portfolio Palette

Four curated accents used for differentiation across portfolio ventures, CTAs on white sections, and specific brand moments. Each is assigned a semantic role — they are not interchangeable.

| Name | Hex | Semantic Role |
|------|-----|---------------|
| Ember | `#D4622A` | High-conviction moments, founding partners, primary CTAs on white |
| Sage | `#4A9E7A` | Health, impact, sustainability ventures |
| Violet | `#7B62C8` | Tech-heavy, data, deep-tech ventures |
| Coral | `#D45C6A` | Energy, events, calls to action |

### Colour Rules

**Do:**
- Use accents sparingly — hero CTA, one key phrase per section maximum
- Keep the nav CTA in Steel blue always — consistent regardless of page accent
- Portfolio tags use Steel only — no accent colours on tags
- Use accent colours at low opacity for backgrounds — full saturation for text and buttons only

**Don't:**
- Use more than one secondary accent on the same page section
- Use secondary accents on body text, headings, or large background areas

### Page Colour Rhythm

The site alternates dark and light sections. This rhythm creates visual breathing room.

| Section | Background | Hex |
|---------|-----------|-----|
| Nav | Dark | `#09090C` |
| Hero | White | `#FFFFFF` |
| Portfolio | Dark | `#09090C` |
| Partners | Off-white | `#F7F7F5` |
| Approach | Dark surface | `#0F1118` |
| Footer | Dark | `#09090C` |

---

## 4. Typography

Three typefaces. Each with a distinct role. None interchangeable.

### Font Families

| Font | Role | Weight | Usage |
|------|------|--------|-------|
| Barlow Condensed | Wordmark only | 700 (Bold) | Wordmark exclusively. Never used in site content. |
| DM Serif Display | Headings & display | 400 (Regular) | H1, H2, hero text, large editorial headings. Letter-spacing: -0.02em. |
| DM Sans | Body & UI | 300-600 | All UI text, body copy, labels, buttons, nav. |
| JetBrains Mono | Monospace | 400-500 | Code snippets, hex values, technical labels (documentation only). |

### Type Scale

| Role | Size Range | Font | Weight | Usage |
|------|-----------|------|--------|-------|
| Hero heading | 56-80px | DM Serif Display | 400 | Main page hero |
| Section heading | 40-48px | DM Serif Display | 400 | Section titles (h2) |
| Sub-heading | 22-28px | DM Sans | 600 | Sub-sections (h3) |
| Body large | 16-18px | DM Sans | 300 | Lead paragraphs, descriptions |
| Body | 14-15px | DM Sans | 400 | Default body copy |
| Label / UI | 11-13px | DM Sans | 500 | Section labels, tags, nav items |

### Typography Rules

**Do:**
- Use DM Serif Display for all major headings — it creates warmth against the dark backgrounds
- Use DM Sans Light (300) for body copy — the lighter weight reads as considered, not weak
- Apply -0.02em letter-spacing on DM Serif Display headings

**Don't:**
- Use Barlow Condensed for anything other than the wordmark
- Set body text heavier than 500 weight — semibold and above is for headings only
- Use italic DM Serif Display for emphasis in body text (use `<em>` within headings only)

### Font Hosting

Self-host all fonts in `public/fonts/` with `@font-face` in `global.css`. Do NOT use Google Fonts CDN — it causes visible FOUT (Flash of Unstyled Text).

---

## 5. Layout

Generous space. Alternating sections. Content-led structure.

### Page Structure

| Rule | Value |
|------|-------|
| Max content width | 1040px with 48px horizontal padding at desktop |
| Section rhythm | Alternate dark and light sections. Minimum 80px vertical padding, 120px preferred. |
| Nav height | 80px fixed — allows the full stacked wordmark at comfortable scale |
| Grid | 12-column desktop, 4-column tablet, single column mobile |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| sp-2 | 8px | Tight gaps — icon to text, tag internal |
| sp-3 | 12px | Small padding — compact elements |
| sp-4 | 16px | Standard padding — cards, inputs |
| sp-6 | 24px | Medium gaps — between related elements |
| sp-8 | 32px | Large gaps — between unrelated elements |
| sp-12 | 48px | Section internal padding |
| sp-16 | 64px | Section-to-section spacing, footer padding |
| sp-24 | 96px+ | Hero section vertical padding |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 4px | Subtle rounding |
| md | 6px | Buttons, inputs |
| lg | 8px | Cards, panels |
| xl | 12px | Large containers |
| 2xl | 16px | Hero elements |
| pill | 9999px | Tags, badges |

---

## 6. Components

### Buttons

| Variant | Background | Text | Border | Usage |
|---------|-----------|------|--------|-------|
| Primary | Steel (#6090BA) | White | None | Nav CTA — consistent across all pages |
| Hero CTA | Accent colour | White | None | Secondary accent for the current page/section context |
| Ghost (dark) | Transparent | Text Primary | 1px border | Secondary actions on dark backgrounds |
| Ghost (light) | Transparent | Text Dark | 1px border-light | Secondary actions on light backgrounds |

### Portfolio Tags

Small pill-shaped labels using Steel colour. No accent colours — tags are uniform across all ventures.

| Element | Specification |
|---------|--------------|
| Shape | Pill (border-radius: 9999px) |
| Padding | 4px 12px |
| Background | Steel at 10% opacity |
| Border | Steel at 19% opacity |
| Text | Steel colour, 11px, semibold, 0.06em tracking |
| Placement | Below card description, right-aligned |

Tags use a single colour (Steel) for visual consistency. No coloured dots, no per-category accent colours.

### Section Labels

Small uppercase label with a short rule/dash prefix. Used to introduce sections.

| Element | Specification |
|---------|--------------|
| Rule | 28px wide, 1px height |
| Rule colour | Steel at 40% opacity |
| Text | 11px, uppercase, 0.14em letter-spacing, medium weight |
| Text colour | text-muted on dark, text-light on light |

### Phase Cards

Used in methodology/approach sections to present sequential steps with clear visual separation.

| Element | Specification |
|---------|--------------|
| Left border | 3px solid Steel |
| Background | Elevated (#181B26) |
| Border radius | 0 on left, lg (8px) on right |
| Padding | 24px right/top/bottom, 28px left |
| Phase label | 12px, semibold, Steel, uppercase, 0.08em tracking |
| Title | 18px, medium weight, text primary |
| Body | 14px, light (300), text-muted, 1.7 line-height |
| Spacing | 16px between cards |

### Result Cards

Used to highlight key outcomes or impact statements. 3-column grid on desktop, single column on mobile.

| Element | Specification |
|---------|--------------|
| Background | Elevated (#181B26) |
| Border | 1px solid border (#1E2230) |
| Border radius | xl (12px) |
| Padding | 28px |
| Label | 18px, medium weight, text primary |
| Body | 14px, light (300), text-muted, 1.65 line-height |

### Timeline Cards

Used for chronological milestones. 2-column grid on desktop.

| Element | Specification |
|---------|--------------|
| Background | Elevated (#181B26) |
| Border | 1px solid border-subtle (#2A2F42) |
| Left border | 3px solid Steel |
| Border radius | xl (12px) |
| Padding | 24px |
| Week label | 14px, medium, Steel, uppercase, wider tracking |
| Title | 16px, medium, text primary |
| Body | 14px, light (300), text-muted |

### Testimonial

Blockquote with decorative opening quote mark and highlighted key phrase.

| Element | Specification |
|---------|--------------|
| Quote mark | DM Serif Display, 80px, Steel at 30% opacity, centred above text |
| Body | DM Sans, 18px, light (300), text-muted, roman (not italic), 1.75 line-height |
| Highlight phrase | Steel colour, regular (400) weight, applied to the single most quotable sentence |
| Attribution | 14px, text-muted; name in text primary at medium weight |
| Max width | 640px, centred |

### Bullet Lists (in prose)

| Element | Specification |
|---------|--------------|
| Marker | 7px circle, Steel, 80% opacity |
| Item spacing | 0.85em between items |
| List bottom margin | 1.5em |
| Bold lead phrases | Use `<strong>` with medium (500) weight for scannable anchor points |

---

## 7. Voice & Tone

### Character

Gain Insight speaks like a **senior partner you trust** — not a startup pitching you, not a consultancy with boilerplate language. Warm, direct, and specific. We don't use vague superlatives. We let the people and the work speak.

**Voice traits:** Precise, Warm, Direct, Considered, Confident, Specific

### In Practice

**Do:**
- "We partner with domain experts to build AI-powered products."
- "Aurelius reduces M&A due diligence time by 40%."
- "Partner with us — for people ready to build something that lasts."

**Don't:**
- "We leverage cutting-edge AI to supercharge your business outcomes."
- "Aurelius is a revolutionary, game-changing platform for the legal sector."
- "Get in touch today and unlock the power of AI for your business!"

### Naming

| Context | Format |
|---------|--------|
| Full name | Gain Insight — two words, title case always |
| Shorthand | GAIN — acceptable in wordmark context and informal use |
| Domain | gaininsight.ai — always lowercase |
| Never | GainInsight, gain insight, GAIN INSIGHT (in copy), Gain insight |

---

## 8. Photography & Imagery

The site uses three categories of imagery, each with distinct rules. Every image must earn its place — if a section communicates clearly through typography and spacing alone, do not add an image.

### 8.1 Portrait Photography (Partner Headshots)

| Rule | Specification |
|------|--------------|
| Background | Always white or off-white. Never on dark. |
| Style | Clean, natural light. Editorial — not stock. People as themselves, not posed corporate. |
| Consistency | All partner photos must use the same crop, same background, same format. |
| Size | 128px circular crop with 2px `border-border-subtle` on dark cards. |
| Missing portraits | Use initials fallback (same dimensions, elevated background). Never leave empty space. |

### 8.2 Editorial People Photography

Full-colour photographs of people working, collaborating, or discussing. These humanise the site and are **not** bound by the portrait rules above.

| Rule | Specification |
|------|--------------|
| Best on | White or off-white background sections. Can also work as full-width banners with overlays. |
| Overlay (on dark) | When placed between dark sections, use horizontal gradient: `rgba(15,17,24,0.5)` edges → `rgba(15,17,24,0.15)` centre. |
| Dimensions (banner) | Full-width, 160–220px tall. `object-fit: cover`. |
| Dimensions (inline) | Within a grid column at natural aspect ratio. `rounded-xl`. Hidden on mobile if in a side column. |
| Style | Candid, editorial quality. Warm natural tones preferred. Avoid posed corporate stock. |
| Limit | Maximum 1 editorial people image per page. |

### 8.3 Palette Imagery (AI-Generated Abstract)

Abstract or atmospheric images AI-generated to match the Steel blue (#6090BA) brand palette. These blend seamlessly between dark sections as visual breathers.

| Rule | Specification |
|------|--------------|
| Colour | Must be colour-matched to the brand palette — Steel blue, dark backgrounds (#0F1118), muted tones. |
| Role | Section breaks between content blocks on longer pages. Never as hero images or inline illustrations. |
| Dimensions | Full-width, 160–220px tall. `object-fit: cover`. |
| Overlay | Horizontal gradient: `rgba(15,17,24,0.5)` at edges → `rgba(15,17,24,0.15)` at centre. |
| Alt text | Empty (`alt=""`) — these are decorative and should be hidden from screen readers. |
| Reuse | Each image should appear on no more than 2 pages. Generate variations to avoid repetition. |
| Generation | Use Freepik Mystic with "realism" model for photorealistic, "flexible" for abstract. Include brand colours as styling weights. |

### 8.4 Landscape / Location Photography

Full-colour place-specific photographs that communicate something concrete about Gain Insight (e.g., where the company is based).

| Rule | Specification |
|------|--------------|
| Purpose | Must communicate something specific — a location, a place. Never purely decorative. |
| Overlay | Vertical gradient: `rgba(15,17,24,0.3)` top → `rgba(15,17,24,0.7)` bottom (for text overlay). |
| Dimensions | Full-width, 200–280px tall. `object-fit: cover`. |
| Tone | Warm tones preferred — complement the cool Steel palette rather than competing with it. |
| Limit | Maximum 1 landscape image across the entire site. |

### 8.5 Image Placement Rules

| Rule | Specification |
|------|--------------|
| Max per page | 0–2 images for standard pages. Up to 3 for long-form content (case studies). |
| Section breaks | Palette imagery only. Place between major content blocks to prevent text fatigue. |
| Heroes | Text-only preferred. The headline is always the primary focus. |
| CTAs | Never add images to CTA sections — typography carries these. |
| Cards | Project cards use venture logos (functional). Do not add decorative images to card grids. |
| Earning placement | If removing an image leaves the section communicating just as clearly, the image shouldn't be there. |

### 8.6 Technical Requirements

| Rule | Specification |
|------|--------------|
| Format | PNG for AI-generated, JPEG for photography. Optimise for web. |
| Resolution | 2K (2744×1528) source files. Displayed at full-width responsive. |
| Attributes | All `<img>` tags must have explicit `width` and `height` to prevent CLS. |
| Lazy loading | `loading="lazy"` for all images below the fold. |
| Alt text | Descriptive for meaningful images, empty (`alt=""`) for decorative section breaks. |
| Object fit | `object-fit: cover` with appropriate `object-position` for cropping control. |
| Directory | All editorial images in `public/images/editorial/`. Portraits in `public/images/partners/`. |

---

## 9. Accessibility (WCAG 2.1 AA)

- Colour contrast minimum 4.5:1 for normal text
- Colour contrast minimum 3:1 for large text and UI components
- Touch targets minimum 44x44px
- Focus indicators visible on all interactive elements
- All images have alt text (or aria-hidden if decorative)
- All `<img>` tags must have explicit `width` and `height` attributes to prevent CLS
- Use `loading="lazy"` for below-the-fold images
- No content conveyed by colour alone

---

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2026-03-10 | Holly (AI) | Initial creation — converted from React reference component |

---

*This document is the source of truth for Gain Insight visual decisions. If in doubt, reference this before making UI choices.*
