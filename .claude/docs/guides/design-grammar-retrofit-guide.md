---
title: Design Grammar Retrofit Guide
created: 2026-03-09
updated: 2026-03-09
last_checked: 2026-03-09
tags: [guide, design-grammar, retrofit, tokens, brownfield, style-dictionary]
parent: ./README.md
related:
  - ../../skills/af-retrofit-design-grammar/SKILL.md
  - ../../skills/af-design-ui-components/SKILL.md
  - ../../../.design-grammar/README.md
---

# Design Grammar Retrofit Guide

How to add the AgentFlow Design Grammar to an existing project. This guide covers creating project tokens, setting up the build pipeline, mapping existing components, and aligning Storybook.

**For quick rules and directives, load the `af-retrofit-design-grammar` skill.**

## Prerequisites

- Node.js 18+ (for Style Dictionary)
- An existing project with components (React, Flutter, or both)
- AgentFlow synced to the project (`.design-grammar/` available)

## Overview

The Design Grammar defines WHAT UI components exist and HOW they compose. Your project provides the specific values (colors, fonts, spacing) and implementations (React components, Flutter widgets).

```
Shared Grammar (read-only)          Your Project (writable)
─────────────────────────          ───────────────────────
.design-grammar/                    tokens/
├── tokens-schema/  ──────────►    ├── colors.json
├── primitives/                     ├── typography.json
├── organisms/                      └── spacing.json
├── schemas/                        src/components/
└── pipeline/       ──────────►    ├── organisms/Hero.tsx
                                    └── views/PricingView.tsx
```

---

## Step 1: Audit Existing Design Values

Before creating tokens, find where your design values currently live.

**Common locations:**
- `tailwind.config.ts` → `theme.extend.colors`, `theme.extend.spacing`
- `src/styles/globals.css` → CSS custom properties
- `src/lib/theme.ts` → JavaScript theme object
- Scattered inline values → `bg-[#1a1a2e]`, `text-[14px]`

**What to capture:**
- All colors (including light/dark mode variants)
- Typography (font families, sizes, weights, line heights)
- Spacing scale (padding, margin, gap values)
- Border radii
- Shadows
- Breakpoints

**Output:** A list of design values with their current locations.

## Step 2: Create Project Tokens

Create a `tokens/` directory at your project root with JSON files in W3C DTCG format.

### Example: `tokens/colors.json`

```json
{
  "color": {
    "primary": {
      "$value": "#6366f1",
      "$type": "color",
      "$description": "Primary brand color"
    },
    "surface": {
      "primary": {
        "$value": "{color.neutral.50}",
        "$type": "color",
        "$extensions": {
          "mode": {
            "dark": "{color.neutral.900}"
          }
        }
      },
      "secondary": {
        "$value": "{color.neutral.100}",
        "$type": "color",
        "$extensions": {
          "mode": {
            "dark": "{color.neutral.800}"
          }
        }
      }
    },
    "text": {
      "primary": {
        "$value": "{color.neutral.900}",
        "$type": "color",
        "$extensions": {
          "mode": {
            "dark": "{color.neutral.50}"
          }
        }
      }
    }
  }
}
```

**Key rules:**
- Use `$value` and `$type` (DTCG format) — not plain values
- Token names MUST match the grammar schema at `.design-grammar/tokens-schema/`
- Use references (`{color.neutral.50}`) for derived values
- Use `$extensions.mode.dark` for dark mode overrides

**Reference:** `.design-grammar/examples/tokens/` for complete examples.

### Example: `tokens/typography.json`

```json
{
  "typography": {
    "fontFamily": {
      "sans": { "$value": "Inter, system-ui, sans-serif", "$type": "fontFamily" },
      "mono": { "$value": "JetBrains Mono, monospace", "$type": "fontFamily" }
    },
    "fontSize": {
      "xs": { "$value": "0.75rem", "$type": "dimension" },
      "sm": { "$value": "0.875rem", "$type": "dimension" },
      "base": { "$value": "1rem", "$type": "dimension" },
      "lg": { "$value": "1.125rem", "$type": "dimension" },
      "xl": { "$value": "1.25rem", "$type": "dimension" },
      "2xl": { "$value": "1.5rem", "$type": "dimension" },
      "3xl": { "$value": "1.875rem", "$type": "dimension" },
      "4xl": { "$value": "2.25rem", "$type": "dimension" }
    }
  }
}
```

### Example: `tokens/spacing.json`

```json
{
  "spacing": {
    "xs": { "$value": "0.25rem", "$type": "dimension" },
    "sm": { "$value": "0.5rem", "$type": "dimension" },
    "md": { "$value": "1rem", "$type": "dimension" },
    "lg": { "$value": "1.5rem", "$type": "dimension" },
    "xl": { "$value": "2rem", "$type": "dimension" },
    "2xl": { "$value": "3rem", "$type": "dimension" },
    "section": { "$value": "4rem", "$type": "dimension" }
  },
  "radius": {
    "sm": { "$value": "0.25rem", "$type": "dimension" },
    "md": { "$value": "0.5rem", "$type": "dimension" },
    "lg": { "$value": "0.75rem", "$type": "dimension" },
    "full": { "$value": "9999px", "$type": "dimension" }
  }
}
```

## Step 3: Set Up Build Pipeline

The build pipeline transforms your token JSON into CSS custom properties and Tailwind config.

### Install Dependencies

```bash
npm install -D style-dictionary @tokens-studio/sd-transforms
```

### Create Config

Create `tokens/sd.config.js` (adapt from `.design-grammar/pipeline/sd.config.js`):

```javascript
import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';

register(StyleDictionary);

const sd = new StyleDictionary({
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'tokens-studio',
      buildPath: 'build/css/',
      files: [
        { destination: 'variables.css', format: 'css/variables' },
      ],
    },
    tailwind: {
      transformGroup: 'tokens-studio',
      buildPath: 'build/tailwind/',
      files: [
        { destination: 'theme.js', format: 'javascript/es6' },
      ],
    },
  },
});

await sd.buildAllPlatforms();
```

### Add Scripts to `package.json`

```json
{
  "scripts": {
    "tokens:validate": "node .design-grammar/pipeline/validate-tokens.js tokens",
    "tokens:build": "node tokens/sd.config.js",
    "tokens:all": "npm run tokens:validate && npm run tokens:build"
  }
}
```

### Test

```bash
npm run tokens:all
# Should create:
#   build/css/variables.css
#   build/tailwind/theme.js
```

### Wire Into Tailwind

In `tailwind.config.ts`:

```typescript
import tokenTheme from './build/tailwind/theme.js';

export default {
  theme: {
    extend: {
      ...tokenTheme,
    },
  },
};
```

## Step 4: Map Existing Components

Create a mapping document that records how your existing components align with the grammar.

### Create `docs/design/component-mapping.md`

```markdown
# Component Mapping

Maps existing project components to Design Grammar types.

| Existing Component | Grammar Level | Grammar Name | Status |
|-------------------|---------------|-------------|--------|
| `Button.tsx` | atom | Button | Aligned |
| `Card.tsx` | atom | Card | Needs prop rename |
| `LoginForm.tsx` | organism | AuthForm | Needs restructure |
| `Navbar.tsx` | organism | Header | Aligned |
| `PricingSection.tsx` | organism | Pricing | Missing from grammar |
| `PageLayout.tsx` | template | (custom) | No grammar match |
```

**Status values:**
- **Aligned** — Already matches grammar definition
- **Needs prop rename** — Structure matches but props differ
- **Needs restructure** — Significant changes needed
- **Missing from grammar** — No grammar definition exists (propose one)
- **No grammar match** — Project-specific, no grammar equivalent needed

### Restructure Folders (if ready)

Move components into atomic folders:

```
src/components/
├── primitives/    ← Unstyled wrappers: Pressable, Slot, Stack, Grid
├── atoms/         ← Single-purpose: Button, Badge, Input, Avatar
├── molecules/     ← Small groups: FormField, NavItem, SearchBar
├── organisms/     ← Page sections: Hero, Pricing, DataTable
├── templates/     ← Page layouts: LandingTemplate, DashboardTemplate
└── views/         ← Rendering logic: PricingView, DashboardView
```

Update imports across the codebase. Use your IDE's refactoring tools or search-and-replace.

## Step 5: Align Storybook

### Update Story Titles

Before:
```typescript
export default {
  title: 'Components/Button',
} satisfies Meta<typeof Button>;
```

After:
```typescript
export default {
  title: 'Atoms/Button',
} satisfies Meta<typeof Button>;
```

### Create View Components

For page-level stories, extract rendering logic into view components:

```typescript
// src/components/views/PricingView.tsx
interface PricingViewProps {
  tiers: PricingTier[];
  billingPeriod: 'monthly' | 'annual';
}

export function PricingView({ tiers, billingPeriod }: PricingViewProps) {
  return (/* JSX */);
}
```

```typescript
// stories/PricingView.stories.tsx
import { PricingView } from '@/components/views/PricingView';
// Story uses mock data → passes to PricingView
```

```typescript
// src/app/pricing/page.tsx
import { PricingView } from '@/components/views/PricingView';
// Page fetches real data → passes to PricingView
```

## Step 6: (Optional) Set Up Tokens Studio

For Figma ↔ repo token sync:

1. Follow the setup guide at `.design-grammar/tokens-studio/README.md`
2. Install the Tokens Studio Figma plugin
3. Configure git sync pointing to your `tokens/` directory
4. Generate a Figma personal access token, store in Doppler
5. Test: change a color in Figma → Tokens Studio creates PR → merge → `npm run tokens:build`

## Verification Checklist

After retrofit, verify:

- [ ] `tokens/` exists with DTCG-format JSON files
- [ ] `npm run tokens:validate` passes
- [ ] `npm run tokens:build` generates CSS + Tailwind output
- [ ] Tailwind config uses generated theme
- [ ] Components are in atomic folders (or mapping doc exists for gradual migration)
- [ ] Storybook titles use atomic prefixes
- [ ] View components exist for page-level UI
- [ ] No hard-coded design values that have token equivalents

## Lightweight vs Full Retrofit

| Aspect | Lightweight | Full |
|--------|-------------|------|
| Tokens | Yes — create `tokens/` | Yes |
| Build pipeline | Yes — Style Dictionary | Yes |
| Component mapping | Document only | Restructure folders |
| Storybook alignment | Gradual | Immediate |
| Tokens Studio | Optional | Optional |
| Effort | 1-2 days | 3-5 days |

Choose **lightweight** when the project is actively shipping features and can't pause for restructuring. Choose **full** when there's a natural break (new phase, sprint boundary) or the project is small enough.
