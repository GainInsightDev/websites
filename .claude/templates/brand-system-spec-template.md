---
title: Brand System Specification
created: {{DATE}}
updated: {{DATE}}
last_checked: {{DATE}}
tags: [design, brand, ux, tokens, specification, template]
---

# Brand System Specification

> **Purpose:** Define the complete visual language for the product. This document drives token generation, Storybook Brand Page, and component styling.
> **Audience:** Engineers, AI agents, designers
> **Phase:** Created during Setup/Discovery, referenced throughout
> **Output:** `tokens/` directory with DTCG-format JSON, Storybook Brand Page stories

## 1. Reference Class Declaration

**Primary reference class:** [Choose one]

| Reference Class | Leaders | Key Principles |
|-----------------|---------|----------------|
| Data-Dense Internal Tools | Stripe, Snowflake, AWS Console | Tables first, predictable navigation, boring is good |
| Workflow / Inbox-Driven Apps | Linear, Superhuman, Zendesk | Focus discipline, keyboard-first, one dominant next action |
| Decision / Modelling Surfaces | Causal, Figma, Notion | Spatial reasoning, few modals, visible state |
| Desktop Productivity Clients | Slack (desktop), VS Code, Things | Zero latency tolerance, non-modal flows, keyboard + mouse parity |
| ShadCN-Native SaaS Baseline | Vercel, Cal.com, Dub.co | Correct primitive composition, token discipline, visual restraint |

**Selected:** `[reference-class-name]`

**Why this reference class:**
> [1-2 sentences explaining why this reference class fits the product]

**What we're borrowing:**
- [ ] [Specific principle 1]
- [ ] [Specific principle 2]
- [ ] [Specific principle 3]

**What we're NOT borrowing:**
- [ ] [Aspect we're intentionally diverging from]

---

## 2. Brand Personality

| Attribute | Our Position | Anti-Pattern |
|-----------|--------------|--------------|
| Tone | [e.g., Professional but approachable] | [e.g., Not corporate-stuffy, not startup-casual] |
| Density | [e.g., Information-rich, power-user focused] | [e.g., Not marketing-sparse, not overwhelming] |
| Motion | [e.g., Subtle, functional transitions] | [e.g., No decorative animations, no jarring state changes] |

---

## 3. Colour System

### Architecture

The colour system follows a strict hierarchy. Components must **never reference palette colours directly** — all components use semantic tokens.

```
Brand colours → Generated colour ramps → Semantic tokens → Theme mappings → Component styling
```

Correct: `bg-primary`, `text-foreground`, `border-border`
Incorrect: `bg-blue-600`, `text-gray-900`

### 3.1 Palette Ramps

Each palette uses an 11-step ramp (Tailwind convention):

| Step | Intensity | Typical Usage |
|------|-----------|---------------|
| 50 | Lightest | Subtle backgrounds |
| 100 | | Hover states (light mode) |
| 200 | | Active states (light mode), borders |
| 300 | | |
| 400 | | |
| 500 | Mid | Icon defaults, placeholder |
| 600 | | Primary actions (light mode) |
| 700 | | Hover states (dark base) |
| 800 | | Active states (dark base) |
| 900 | | Text on light backgrounds |
| 950 | Darkest | Near-black |

#### Primary Palette

Main brand identity colour.

| Token | Value |
|-------|-------|
| `color.palette.primary.50` | [value] |
| `color.palette.primary.100` | [value] |
| ... | ... |
| `color.palette.primary.950` | [value] |

**Generation method:** [e.g., "Start from brand hex #6366f1, generate ramp using OKLCH perceptual model"]

#### Secondary Palette

Supporting brand colour for UI variation.

| Token | Value |
|-------|-------|
| `color.palette.secondary.50` | [value] |
| ... | ... |
| `color.palette.secondary.950` | [value] |

#### Accent Palette

Highlights, badges, emphasis.

#### Neutral Palette

UI surfaces, text, borders, backgrounds.

| Token | Value |
|-------|-------|
| `color.palette.neutral.50` | [value] |
| ... | ... |
| `color.palette.neutral.950` | [value] |

### 3.2 Semantic Status Colours

Each must have a full ramp and maintain WCAG AA contrast.

| Status | Base Step (light) | Base Step (dark) | Usage |
|--------|-------------------|------------------|-------|
| `success` | 600 | 500 | Confirmation, completion |
| `warning` | 600 | 500 | Caution, pending actions |
| `destructive` | 600 | 500 | Delete, dangerous actions |
| `info` | 600 | 500 | Informational states |

### 3.3 Surface Stack

Surface hierarchy defines elevation and layering. Maps directly to shadow tokens.

| Surface | Light Mode | Dark Mode | Usage |
|---------|-----------|-----------|-------|
| `background` | neutral-50 | neutral-950 | Application background |
| `surface` | white | neutral-900 | Default component surfaces |
| `panel` | neutral-100 | neutral-900 | Grouped sections, sidebars |
| `elevated` | white | neutral-850 | Cards, floating UI |
| `overlay` | white | neutral-900 | Modals, popovers |

### 3.4 Semantic Colour Tokens

These are the tokens components actually use:

**Surfaces:**
- `background` / `foreground`
- `surface` / `panel` / `elevated` / `overlay`

**Brand:**
- `primary` / `primary-hover` / `primary-active` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `accent` / `accent-foreground`
- `muted` / `muted-foreground`

**Interactive:**
- `border` / `input` / `ring`

**Status:**
- `success` / `success-foreground`
- `warning` / `warning-foreground`
- `destructive` / `destructive-foreground`
- `info` / `info-foreground`

### 3.5 Theme Mapping

#### Light Theme

| Semantic Token | Maps To |
|---------------|---------|
| background | neutral-50 |
| foreground | neutral-950 |
| surface | white |
| panel | neutral-100 |
| elevated | white |
| overlay | white |
| primary | primary-600 |
| primary-hover | primary-700 |
| primary-active | primary-800 |
| primary-foreground | white |
| border | neutral-200 |
| input | neutral-200 |
| ring | primary-500 |

#### Dark Theme

| Semantic Token | Maps To |
|---------------|---------|
| background | neutral-950 |
| foreground | neutral-50 |
| surface | neutral-900 |
| panel | neutral-900 |
| elevated | neutral-850 |
| overlay | neutral-900 |
| primary | primary-500 |
| primary-hover | primary-400 |
| primary-active | primary-300 |
| border | neutral-800 |
| input | neutral-800 |
| ring | primary-400 |

### 3.6 Chart / Data Visualisation

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `chart-1` | [value] | [value] | Primary data series |
| `chart-2` | [value] | [value] | Secondary series |
| `chart-3` | [value] | [value] | Tertiary series |
| `chart-4` | [value] | [value] | Quaternary series |
| `chart-5` | [value] | [value] | Quinary series |

Rules:
- Must work in both light and dark mode
- Must remain distinguishable (not just hue variation)
- Avoid semantic colours unless intentional (e.g., green for positive, red for negative)

### 3.7 Marketing Tokens (Optional)

Marketing pages share the palette but may use decorative tokens:

| Token | Purpose |
|-------|---------|
| `hero-background` | Hero section background |
| `hero-foreground` | Hero section text |
| `cta-background` | Call-to-action sections |
| `cta-foreground` | CTA text |
| `gradient-start` | Decorative gradient start |
| `gradient-end` | Decorative gradient end |

---

## 4. Typography

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `fontFamily.sans` | [e.g., Inter, system-ui, sans-serif] | Primary text |
| `fontFamily.serif` | [e.g., Georgia, serif] | Optional: editorial content |
| `fontFamily.mono` | [e.g., JetBrains Mono, monospace] | Code, technical values |
| `fontFamily.display` | [e.g., same as sans or distinctive] | Optional: hero headings |

### Size Scale

| Token | Value | Usage |
|-------|-------|-------|
| `fontSize.xs` | 0.75rem (12px) | Captions, badges |
| `fontSize.sm` | 0.875rem (14px) | Secondary text, labels |
| `fontSize.base` | 1rem (16px) | Body text |
| `fontSize.lg` | 1.125rem (18px) | Lead paragraphs |
| `fontSize.xl` | 1.25rem (20px) | Section headings |
| `fontSize.2xl` | 1.5rem (24px) | Page sub-headings |
| `fontSize.3xl` | 1.875rem (30px) | Page headings |
| `fontSize.4xl` | 2.25rem (36px) | Hero headings |
| `fontSize.5xl` | 3rem (48px) | Display text |

### Weight Scale

| Token | Value | Usage |
|-------|-------|-------|
| `fontWeight.normal` | 400 | Body text |
| `fontWeight.medium` | 500 | Labels, emphasis |
| `fontWeight.semibold` | 600 | Headings, buttons |
| `fontWeight.bold` | 700 | Strong emphasis |

### Line Height

| Token | Value | Usage |
|-------|-------|-------|
| `lineHeight.tight` | 1.25 | Headings |
| `lineHeight.normal` | 1.5 | Body text |
| `lineHeight.relaxed` | 1.75 | Long-form reading |

### Typography Rules

1. Maximum 2 heading levels per view
2. Body text minimum 14px for readability
3. Monospace for all numeric data and code
4. [Project-specific rule]

---

## 5. Spacing

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `spacing.px` | 1px | Borders, hairlines |
| `spacing.0.5` | 0.125rem (2px) | Micro adjustments |
| `spacing.1` | 0.25rem (4px) | Tight grouping |
| `spacing.2` | 0.5rem (8px) | Related elements |
| `spacing.3` | 0.75rem (12px) | Component padding |
| `spacing.4` | 1rem (16px) | Default spacing |
| `spacing.6` | 1.5rem (24px) | Section internal gaps |
| `spacing.8` | 2rem (32px) | Section separation |
| `spacing.12` | 3rem (48px) | Major divisions |
| `spacing.16` | 4rem (64px) | Page sections |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius.none` | 0 | Sharp corners |
| `radius.sm` | 0.25rem | Subtle rounding |
| `radius.md` | 0.5rem | Default (buttons, inputs) |
| `radius.lg` | 0.75rem | Cards, panels |
| `radius.xl` | 1rem | Large containers |
| `radius.full` | 9999px | Circles, pills |

---

## 6. Shadows & Elevation

Shadows map to the surface stack — each elevation level has a corresponding shadow.

| Token | Value | Surface Level |
|-------|-------|---------------|
| `shadow.none` | none | background |
| `shadow.sm` | 0 1px 2px rgba(0,0,0,0.05) | surface |
| `shadow.md` | 0 4px 6px rgba(0,0,0,0.07) | elevated |
| `shadow.lg` | 0 10px 15px rgba(0,0,0,0.1) | overlay |
| `shadow.xl` | 0 20px 25px rgba(0,0,0,0.15) | Dropdowns, tooltips |

---

## 7. Motion

| Token | Value | Usage |
|-------|-------|-------|
| `duration.fast` | 100ms | Hover, focus states |
| `duration.normal` | 200ms | Transitions, toggles |
| `duration.slow` | 300ms | Panels, accordions |
| `duration.slower` | 500ms | Page-level transitions |
| `easing.default` | cubic-bezier(0.4, 0, 0.2, 1) | General transitions |
| `easing.in` | cubic-bezier(0.4, 0, 1, 1) | Elements entering |
| `easing.out` | cubic-bezier(0, 0, 0.2, 1) | Elements exiting |
| `easing.bounce` | cubic-bezier(0.34, 1.56, 0.64, 1) | Playful feedback |

### Motion Rules

1. All animations respect `prefers-reduced-motion`
2. No animation longer than 500ms
3. Functional transitions only — no decorative motion
4. [Project-specific rule]

---

## 8. Iconography

| Property | Value |
|----------|-------|
| Icon library | [e.g., Lucide] |
| Default size | [e.g., 16px (sm), 20px (md), 24px (lg)] |
| Stroke width | [e.g., 2px] |
| Style | [e.g., Outlined, consistent stroke] |

### Icon Rules

1. Use one icon library consistently — do not mix sets
2. Icons must have accessible labels (aria-label or sr-only text)
3. Colour inherits from `currentColor` (never hard-coded)
4. [Project-specific rule]

---

## 9. Component Usage Rules

### Buttons

| Property | Token |
|----------|-------|
| Background | primary |
| Text | primary-foreground |
| Hover | primary-hover |
| Active | primary-active |

### Cards

| Property | Token |
|----------|-------|
| Background | elevated |
| Border | border |
| Text | foreground |
| Shadow | shadow.md |

### Inputs

| Property | Token |
|----------|-------|
| Background | surface |
| Border | input |
| Focus ring | ring |
| Label | foreground |
| Placeholder | muted-foreground |

### Alerts / Status

Use the semantic status tokens: `success`, `warning`, `destructive`, `info` — each with foreground variant.

---

## 10. Interaction Patterns

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move forward through interactive elements |
| `Shift+Tab` | Move backward |
| `Enter` / `Space` | Activate focused element |
| `Escape` | Close modal/popover, cancel action |
| `Arrow keys` | Navigate within lists, menus |
| [Custom shortcut] | [Custom action] |

### State Communication

| State | Visual Treatment | Feedback |
|-------|-----------------|----------|
| Loading | [e.g., Skeleton, spinner on action] | Show within 100ms |
| Empty | [e.g., Illustration + CTA] | Guide to first action |
| Error | [e.g., Inline red message] | Explain why, suggest fix |
| Success | [e.g., Green check, brief toast] | Confirm action completed |
| Disabled | [e.g., Reduced opacity + tooltip] | Explain why disabled |

---

## 11. Accessibility Requirements (WCAG 2.1 AA)

### Mandatory Compliance

- [ ] Colour contrast minimum 4.5:1 for normal text
- [ ] Colour contrast minimum 3:1 for large text and UI components
- [ ] Touch targets minimum 44x44px
- [ ] Focus indicators visible on all interactive elements
- [ ] All images have alt text (or aria-hidden if decorative)
- [ ] Form inputs have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Colour is not the only indicator of status

### Testing Checklist

- [ ] Keyboard-only navigation works for all flows
- [ ] Screen reader announces all important state changes
- [ ] No content is conveyed by colour alone
- [ ] Animations can be disabled (prefers-reduced-motion)
- [ ] Borders remain visible on all surfaces

---

## 12. Platform-Specific Notes

### Web (React + ShadCN/UI)

- Design system: ShadCN/UI with Radix primitives
- Styling: Tailwind CSS with CSS variable tokens
- Documentation: Storybook for component catalogue

### Mobile (Flutter) — If Applicable

- Design system: Material 3 or custom widget library
- Documentation: Widgetbook for component catalogue
- Token bridge: Style Dictionary generates both CSS and Dart

---

## 13. Anti-Guidelines (Phrases to Avoid)

| Anti-Guideline | Problem | Rewrite As |
|----------------|---------|------------|
| "Use sparingly" | No clear threshold | "Maximum N per view" |
| "When appropriate" | No decision criteria | "Use when [specific condition]" |
| "Clean and modern" | Subjective | "Maximum N colours, M font sizes" |
| "Feel premium" | Unmeasurable | "[Specific spacing, type, colour rules]" |
| "As needed" | No guidance | "Always/never in [context]" |

---

## 14. Storybook Brand Page

Once this spec is filled in, generate the Brand Page as the first Storybook entry:

```
Brand/
├── Colour Palette       ← All ramps + semantic tokens, light/dark toggle
├── Typography Scale     ← Font samples at each size/weight
├── Spacing & Layout     ← Visual spacing scale with examples
├── Shadows & Elevation  ← Surface stack visualised
├── Motion               ← Transition previews
└── Icons                ← Icon inventory with sizes
```

The Brand Page stories are auto-generated from `tokens/` files. When tokens change, stories update automatically.

---

## 15. Token Export Targets

| Target | Format | Build Tool |
|--------|--------|------------|
| CSS custom properties | `build/css/variables.css` | Style Dictionary |
| Tailwind config | `build/tailwind/theme.js` | Style Dictionary |
| TypeScript constants | `build/ts/tokens.ts` | Style Dictionary |
| Dart theme | `build/dart/theme.dart` | Style Dictionary (if Flutter) |

---

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| {{DATE}} | [Name] | Initial creation |

---

*This document is the source of truth for all visual decisions. If in doubt, reference this before making UI choices.*
