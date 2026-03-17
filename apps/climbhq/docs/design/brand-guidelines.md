---
title: ClimbHQ Brand Guidelines
created: 2026-03-17
updated: 2026-03-17
last_checked: 2026-03-17
tags: [design, brand, ux, guidelines]
---

# ClimbHQ Brand Guidelines

> **Purpose:** Enable engineers and AI to make correct UI decisions without designer intervention.
> **Audience:** Engineers, AI agents, designers
> **Phase:** Reverse-engineered from live WordPress site (climbhq.co.uk), refined by Sam Beeny

## 1. Reference Class Declaration

**Primary reference class:** Marketing / Services Website

| Reference Class | Leaders | Key Principles |
|-----------------|---------|----------------|
| B2B Services Marketing Sites | HubSpot, Mailchimp, Basecamp | Clear service tiers, trust signals, professional photography, conversion-focused CTAs |

**Selected:** `B2B Services Marketing Site`

**Why this reference class:**
> ClimbHQ sells B2B services (marketing, accounting, HR) to climbing centres. The site must communicate professional credibility, clear pricing, and an approachable brand that reflects the climbing community.

**What we're borrowing:**
- [x] Clear pricing tier cards with feature comparison
- [x] Trust signals (NICAS partnership, testimonials, team profiles)
- [x] Dark/bold visual theme that conveys authority and energy
- [x] Strong CTAs driving towards contact/consultation

**What we're NOT borrowing:**
- [x] Complex interactive dashboards or product demos
- [x] SaaS onboarding flows

---

## 2. Visual Identity

### Brand Personality

| Attribute | Our Position | Anti-Pattern |
|-----------|--------------|--------------|
| Tone | Professional but community-driven | Not corporate-stuffy, not casual/playful |
| Energy | Bold, active, aspirational (climbing metaphor) | Not quiet/passive, not aggressive |
| Density | Content-rich with visual breathing room | Not marketing-sparse, not information-overloaded |
| Motion | Subtle section reveals, hero slideshow | No flashy animations, no static-only pages |

### Colour Strategy

**Primary Palette:**

| Purpose | Token | Value | Usage |
|---------|-------|-------|-------|
| Cyan accent (primary) | `--accent` | `#1CABD6` | CTAs, links, highlights, nav accents, headings on dark bg |
| Dark navy (bg primary) | `--bg-dark` | `#03071F` | Navigation, mobile menu, darkest sections |
| Navy (bg secondary) | `--bg-navy` | `#071F33` | Hero overlays, deep section backgrounds |
| Dark charcoal | `--bg-charcoal` | `#2B2937` | Alternate dark sections |
| Purple-dark | `--bg-purple` | `#353344` | Card backgrounds, text on light backgrounds |

**Secondary Palette:**

| Purpose | Token | Value | Usage |
|---------|-------|-------|-------|
| Warm orange | `--accent-warm` | `#FFA269` | Accent highlights, decorative elements |
| Light orange | `--accent-light` | `#FFBC7D` | Softer accent variant |
| Coral red | `--danger` | `#FC685B` | Alert/danger states only |

**Neutral Palette:**

| Purpose | Token | Value | Usage |
|---------|-------|-------|-------|
| White | `--white` | `#FFFFFF` | Text on dark, card backgrounds |
| Off-white | `--bg-light` | `#F2F2F2` | Light section backgrounds |
| Light grey | `--text-muted` | `#DBDFE6` | Secondary text, borders |
| Grey | `--text-body` | `#9796A3` | Body text on dark backgrounds |
| Dark charcoal | `--text-dark` | `#353344` | Body text on light backgrounds |

**Colour rules:**
1. Cyan `#1CABD6` is the single brand accent colour. Use for all interactive elements, key headings, and CTAs
2. Maximum 3 colours visible in any section: background + text + accent
3. Dark backgrounds dominate; light sections used sparingly for contrast
4. Hero gradient is 200deg from `#071F33` (20%) to `#2F241BC7` (80%) over photography

### Typography

**Font Families (Self-Hosted, Variable Weights):**

| Role | Font | Weights Used | File |
|------|------|-------------|------|
| Display / Headings | Unbounded | 200-900 (variable) | `unbounded-latin-variable.woff2` |
| Body / UI | Montserrat | 100-900 (variable) | `montserrat-latin-variable.woff2` |

**Type Scale:**

| Level | Font | Size | Weight | Line Height | Usage |
|-------|------|------|--------|-------------|-------|
| Display | Unbounded | 40px (2.5rem) | 500 | 1.3em | Hero headings only |
| H1 | Unbounded | 40px (2.5rem) | 500 | 1.3em | Page titles |
| H2 | Unbounded | 32px (2rem) | 500 | 1.3em | Section titles |
| H3 | Unbounded | 28px (1.75rem) | 500 | 1.3em | Subsection titles |
| H4 | Unbounded | 24px (1.5rem) | 500 | 1.4em | Card titles |
| Subheading | Unbounded | 20px (1.25rem) | 500 | 1.4em | Category labels |
| Body | Montserrat | 16px (1rem) | 400 | 1.5 | Default paragraph text |
| Button | Montserrat | 15px | 500 | normal | Letter-spacing: 4px, uppercase |
| Small/Label | Unbounded | 12px | 400 | 1em | Letter-spacing: 3px, labels |
| Caption | Montserrat | 14px | 500 | normal | Meta text, dates |

**Typography rules:**
1. Unbounded is ONLY for headings and labels. Never use for body text
2. Montserrat is ONLY for body text, buttons, and UI. Never use for headings
3. Body text minimum 16px for readability
4. Buttons always uppercase with 4px letter-spacing
5. Labels use 3px letter-spacing with Unbounded

### Spacing

| Level | Value | Usage |
|-------|-------|-------|
| xs | 8px | Tight grouping (icon + label) |
| sm | 16px | Related elements (list items) |
| md | 24px | Default component spacing |
| lg | 48px | Section internal padding |
| xl | 80px | Section vertical padding (desktop) |
| 2xl | 120-200px | Hero section padding |

**Section padding pattern:** Hero sections use 200px top / 170px bottom. Standard content sections use 60-80px vertical padding.

---

## 3. Component Patterns

### Navigation

| Property | Desktop | Mobile |
|----------|---------|--------|
| Background | `#03071F` (dark navy) | `#03071F` slide-out drawer |
| Logo | ClimbHQ SVG, left-aligned | ClimbHQ SVG, left-aligned |
| Links | White Montserrat, bold | `#1CABD6` Unbounded 16px/500 |
| Active state | Underline pointer animation | Current item highlight |
| Mobile trigger | N/A | Burger icon 42x42px |
| Mobile width | N/A | 280px slide from right |
| Mobile overlay | N/A | `rgba(0,0,0,0.5)` |
| Z-index | Header layer | Menu: 100000, Overlay: 99999 |

### Buttons

| Variant | Background | Text | Border | Radius |
|---------|------------|------|--------|--------|
| Primary CTA | `#1CABD6` | White | None | 0 (square) |
| Secondary | Transparent | `#1CABD6` | 1px `#1CABD6` | 0 |
| Ghost | Transparent | White | None | 0 |

All buttons: Montserrat 15px, weight 500, uppercase, letter-spacing 4px.

### Cards (Service/Icon Box)

- Background: Dark (`#2B2937` or `#353344`)
- Hover effect: `hover-from-left` slide animation
- Icon position: Top or left-aligned
- Title: Unbounded, white
- Description: Montserrat, `#9796A3`
- Optional CTA button at bottom

### Pricing Tiers

- 3-tier layout: Base / Mid / Premium
- Card background: Dark with accent border on featured tier
- Price: Large Unbounded display
- Feature list: Montserrat with check/cross indicators
- CTA button at bottom of each card

### Testimonials

- Style: Quote card with 5-star rating
- Author info: Name + role
- Single-item carousel (manual or auto)
- Dark background section

### Footer

- 3-column layout on dark background
- Column 1: Logo + about text + NICAS partner logo + social icons
- Column 2: Contact info with email
- Column 3: Newsletter signup (Mailchimp)
- Social icons: Facebook, Instagram, LinkedIn (Font Awesome)
- Copyright with dynamic year

### Anti-Patterns (Avoid)

| Anti-Pattern | Why | Instead |
|--------------|-----|---------|
| Google Fonts CDN | Causes FOUT (Flash of Unstyled Text) | Self-host in `/public/fonts/` |
| Rounded buttons | Not part of brand; too soft for the bold aesthetic | Square corners (border-radius: 0) |
| Light/pastel colour schemes | Contradicts the dark, bold brand energy | Dark backgrounds with cyan accent |
| Multiple accent colours in one section | Dilutes brand recognition | Single cyan accent per section |
| Decorative animations | Distracts from content | Subtle reveal-on-scroll only |

---

## 4. Imagery

### Photography Style

| Attribute | Guideline |
|-----------|-----------|
| Subject | Indoor climbing, bouldering, athletes on walls |
| Mood | Active, aspirational, community-focused |
| Lighting | Warm gym lighting, natural feel |
| Diversity | Mixed demographics, various body types, men and women |
| Treatment | Full-colour photography, dark gradient overlays for text legibility |

### Image Usage Rules

1. All `<img>` tags MUST have explicit `width` and `height` attributes (prevents CLS)
2. Below-fold images MUST use `loading="lazy"`
3. Hero images use `fetchpriority="high"`
4. Stock photos stored in `/public/images/stock/`
5. Background images stored in `/public/images/bg/`
6. Team portraits in `/public/images/team/`
7. Logos in `/public/images/logos/`

### Icon System

- **Primary:** Font Awesome (Solid + Brands) — self-hosted woff2
- **Elementor:** JKit icons, Elementor icons — self-hosted
- Social icons: `fab fa-facebook-f`, `fab fa-instagram`, `fab fa-linkedin-in`

---

## 5. Section Layout Patterns

### Dark/Light Alternation

The site follows a predominantly dark theme with occasional light sections for contrast:

| Section Type | Background | Text Colour |
|--------------|------------|-------------|
| Hero | Gradient over photography | White |
| Services overview | `#2B2937` | White headings, `#9796A3` body |
| Social proof | `#F2F2F2` or white | `#353344` |
| Pricing | `#03071F` or `#071F33` | White headings, `#DBDFE6` body |
| CTA | `#1CABD6` or dark with accent | White |
| Footer | `#03071F` | `#DBDFE6` body, white headings |

### Hero Pattern

- Full-width background slideshow (4 images, 5s per slide)
- Ken Burns zoom effect (out direction)
- Fade transition (500ms)
- Gradient overlay: 200deg, `#071F33` 20% → `#2F241BC7` 80%
- Large Unbounded heading + Montserrat subtext
- CTA button below

---

## 6. Blog Post Design

### Layout Structure

1. **Hero area:** Post title (Unbounded), date, reading time, category tag
2. **Article body:** Max-width 720px, centred
3. **Headings:** Cyan `#1CABD6` with bottom border separators
4. **Body text:** `#D0D4DC` on dark background, line-height 1.8
5. **Pull quotes:** Large cyan text with left accent border
6. **Insight boxes:** Dark card with cyan border for key takeaways
7. **Images:** Full-width within content area, rounded corners, captions
8. **CTA footer:** "Book a call" card + newsletter signup + related posts

### Blog Typography Overrides

| Element | Style |
|---------|-------|
| Article headings | Cyan `#1CABD6`, bottom border |
| Bold text | White `#FFFFFF` |
| Italic text | Cyan `#1CABD6` |
| Blockquotes | Left cyan border, larger font |
| Lists | Custom cyan bullet markers |

---

## 7. Accessibility Requirements (WCAG 2.1 AA)

### Mandatory Compliance

- [x] Colour contrast minimum 4.5:1 for normal text
- [x] Colour contrast minimum 3:1 for large text and UI components
- [x] Touch targets minimum 44x44px (mobile nav burger: 42x42 — needs bump to 44)
- [x] Focus indicators visible on all interactive elements
- [x] All images have alt text (or aria-hidden if decorative)
- [x] Form inputs have associated labels
- [ ] Error messages announced to screen readers (forms need audit)

### Known Issues

- Mobile burger button is 42x42px — should be 44x44px minimum
- Form validation relies on HTML5 native; no custom screen reader announcements
- Some decorative images may need `aria-hidden="true"`

---

## 8. Technical Notes

### Font Loading

```css
@font-face {
  font-family: 'Unbounded';
  src: url('/fonts/unbounded-latin-variable.woff2') format('woff2');
  font-weight: 200 900;
  font-display: swap;
}

@font-face {
  font-family: 'Montserrat';
  src: url('/fonts/montserrat-latin-variable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}
```

### CSS Architecture

- Elementor CSS consolidated into `elementor.css` (ported from WordPress)
- Tailwind CSS available via Astro Vite integration
- Custom overrides in `global.css`

### Dev Server Port

- Allocated: **18003** (from project registry)
- Preview URL: `https://wbs-16.gaininsight.co.uk`

---

## 9. Brand Assets Inventory

| Asset | Path | Format |
|-------|------|--------|
| ClimbHQ logo | `/public/images/logos/climbhq-logo.svg` | SVG |
| NICAS partner logo | `/public/images/logos/nicas-logo.png` | PNG |
| Font Awesome | `/public/fonts/fa-solid-900.woff2`, `fa-brands-400.woff2` | WOFF2 |
| Unbounded | `/public/fonts/unbounded-latin-variable.woff2` | WOFF2 |
| Montserrat | `/public/fonts/montserrat-latin-variable.woff2` | WOFF2 |

---

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2026-03-17 | Holly (AI) | Initial creation — reverse-engineered from live WordPress site |

---

*This document is the source of truth for visual decisions. If in doubt, reference this before making UI choices.*
