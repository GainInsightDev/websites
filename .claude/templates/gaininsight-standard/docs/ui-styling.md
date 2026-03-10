---
title: UI & Styling Quick Reference
created: {{DATE}}
updated: {{DATE}}
last_checked: {{DATE}}
tags: [ui, styling, shadcn, storybook, quick-reference, gaininsight-standard]
parent: ./README.md
---

# UI & Styling Quick Reference

## Components

| Component | Import | Use case |
|-----------|--------|----------|
| Button | `@/components/ui/button` | Actions, form submission |
| Badge | `@/components/ui/badge` | Status, tags, counts |
| Card | `@/components/ui/card` | Content containers |
| Input | `@/components/ui/input` | Text entry, forms |
| Dialog | `@/components/ui/dialog` | Modals, confirmations |

## Commands

| Command | Purpose |
|---------|---------|
| `npm run storybook` | Start Storybook dev server |
| `npm run build-storybook` | Build static Storybook |
| `npm run add-component` | Add new shadcn component |

## Add More Components

```bash
npx shadcn@latest add [component]
```

Browse available: [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components)

## Storybook

- **Local:** See `STORYBOOK_PORT` in `PORT_INFO.md`
- **Stories:** `stories/*.stories.tsx`
- **Build output:** `reports/storybook/`

## Theming with tweakcn

1. Visit [tweakcn.com/editor/theme](https://tweakcn.com/editor/theme)
2. Customize colors, typography, spacing
3. Export CSS variables
4. Paste into `src/app/globals.css`

## Theme Variables

CSS variables in `globals.css`:

| Variable | Purpose |
|----------|---------|
| `--background` | Page background |
| `--foreground` | Default text |
| `--primary` | Primary actions |
| `--secondary` | Secondary actions |
| `--accent` | Highlights |
| `--destructive` | Danger/delete |
| `--border` | Borders |
| `--radius` | Border radius |

## Learn More

- shadcn/ui expertise: `.claude/skills/af-design-ui-components/SKILL.md`
- GainInsight setup: `.claude/skills/af-setup-gaininsight-stack/layer-3-ui-styling.md`
