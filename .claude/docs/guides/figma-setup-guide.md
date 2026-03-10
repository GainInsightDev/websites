---
title: Figma Design Round-Trip Setup Guide
created: 2026-03-05
updated: 2026-03-06
last_checked: 2026-03-06
tags: [guide, figma, design, setup, component-map]
parent: ./README.md
related:
  - ../../skills/af-sync-figma-designs/SKILL.md
  - ../../skills/af-design-ui-components/SKILL.md
---

# Figma Design Round-Trip Setup Guide

Step-by-step guide for adding Figma design round-trip workflows to an AgentFlow project.

**Prerequisites:** Project must have `ui-styling` module installed (Storybook + design tokens).

**Skill reference:** Load `af-sync-figma-designs` for detailed rules and workflows.

---

## Setup Steps

Setup time: ~1-2 hours for full setup including initial library capture.

### Step 1: Figma MCP Server

The Figma MCP server is **pre-configured globally** in AgentFlow's `.mcp.json`. No per-project setup needed.

No API keys needed. On first use, the MCP server opens a browser OAuth flow -- authenticate with your Figma account.

> **Manual setup (non-AgentFlow projects):** Add to `.mcp.json`:
> ```json
> { "figma": { "url": "https://mcp.figma.com/mcp" } }
> ```

### Step 2: Create Figma Project Structure

In Figma, create a project for your product with three files:

```
Figma Project: "{Product Name}"
|-- [Library] Design System          <- Component reference frames from Storybook
|-- [File] Active Work               <- Issue-specific design pages
+-- [File] Shipped Archive           <- Completed designs (reference)
```

Record the file IDs in your project config (e.g., `figma.config.json`):

```json
{
  "figma": {
    "activeWorkFileId": "FILE_ID",
    "designSystemLibraryId": "LIBRARY_FILE_ID",
    "shippedArchiveFileId": "ARCHIVE_FILE_ID"
  }
}
```

### Step 3: Generate Component Map

The component map replaces Code Connect (which requires Figma Enterprise plan). It maps Figma component/frame names to codebase imports so agents can adapt extraction output.

Run the component map generator script:

```bash
npx ts-node .figma/generate-component-map.ts
```

This reads Storybook's `stories.json` and component source files to produce `.figma/component-map.json`:

```json
{
  "Button": {
    "import": "import { Button } from '@/components/ui/button'",
    "variants": {
      "primary": "<Button variant=\"primary\">",
      "secondary": "<Button variant=\"secondary\">"
    }
  },
  "Card": {
    "import": "import { Card, CardContent, CardHeader } from '@/components/ui/card'",
    "usage": "<Card><CardHeader>...</CardHeader><CardContent>...</CardContent></Card>"
  }
}
```

### Step 4: Generate Design System Rules

Run the design system rules generator against your `globals.css`:

```bash
npx ts-node .figma/generate-design-rules.ts
```

This produces `.figma/design-system-rules.md` mapping hex values to CSS variable tokens. Agents read this during the extraction adaptation step to replace hardcoded colors with project tokens.

### Step 5: Initial Library Capture

Capture Storybook component stories to the Figma Library file. This requires a browser session (OAuth).

1. Start your Storybook dev server
2. Use `generate_figma_design` to capture each component story page to the Library file
3. Name frames to match component names (matching Storybook naming)
4. Record the current git commit hash: `git rev-parse HEAD > .figma/last-sync-commit`

The Library file becomes the designer's reference palette in Figma.

### Step 6: Test the Round-Trip

1. Use `generate_figma_design` to capture a page to Figma (requires browser)
2. Verify: editable frames, correct layer structure, not flat screenshots
3. Use `get_metadata` to see the component tree with names
4. Use `get_design_context` to extract code
5. Verify: agent can map extracted component names to `component-map.json` entries
6. Verify: agent can replace hex values using `design-system-rules.md`

**Setup is complete when:** Capture, extract, and adapt all produce usable results.

---

## Custom Mapping Files

These files live in `.figma/` in your project root:

| File | Purpose | How Generated |
|------|---------|---------------|
| `component-map.json` | Maps Figma component names to codebase imports | `generate-component-map.ts` script |
| `design-system-rules.md` | Maps hex values to CSS variable tokens | `generate-design-rules.ts` script |
| `last-sync-commit` | Git commit hash of last Figma library sync | Written by capture script |

### Why Not Code Connect?

Code Connect is Figma's native component mapping feature, but it requires an Enterprise/Organization Figma plan. Our custom mapping achieves the same outcome at the agent layer:

| Aspect | Code Connect (Enterprise) | Custom Mapping |
|--------|--------------------------|----------------|
| Component identification | Automatic in extraction | Agent reads component-map.json |
| Import generation | Built into API output | Agent maps names to imports |
| Token preservation | Automatic | Agent applies design-system-rules |
| Cost | ~$75/seat/month | Free |
| Maintenance | Auto-synced | Regenerate on component changes |

---

## Linear Integration

### needs:design Label

Use the `needs:design` label (workspace-scoped) to signal designer input is needed:
- PM adds `needs:design` when an issue needs design work
- Agent checks library staleness on label addition
- Designer works in Figma
- Designer removes `needs:design` when design work is complete

### Figma Links in Issues

When creating a Figma page for an issue, add the link to the Linear issue description:

```markdown
## Design
Figma: https://figma.com/file/xxx?node-id=yyy
```

Dev agents look for this section to find the relevant Figma design.

---

## Library Staleness & Sync

The Figma Library is kept in sync with Storybook via **lazy sync on demand**:

1. Issue gets `needs:design` label
2. Agent reads `.figma/last-sync-commit` and compares against current HEAD
3. If component files or `stories.json` changed since last sync: library is stale
4. Designer is notified and triggers re-capture in their browser session
5. After capture: `component-map.json` regenerated, `last-sync-commit` updated

This avoids unnecessary captures while ensuring the library is fresh when designers need it.

---

## Naming Conventions

| Element | Format | Example |
|---------|--------|---------|
| Figma page | `{ISSUE-ID} {Short Description}` | `AF-124 Dashboard Layout` |
| Frame within page | `{ISSUE-ID}/Screen Name/State` | `AF-124/Dashboard/Default` |
| Design System Library | `[Library] Design System` | - |
| Active Work file | `[File] Active Work` | - |
| Library component frames | Match Storybook component names | `Button`, `Card`, `NavBar` |

---

## Known Limitations

| Limitation | Workaround |
|-----------|------------|
| Extraction returns absolute positioning | Agent adapts to flexbox/grid using project patterns |
| Tokens lost (hardcoded hex values) | Agent reads design-system-rules.md to map back to CSS variables |
| Component classes lost (inline styles) | Agent reads component-map.json to map to real imports |
| Always outputs React+Tailwind | Agent adapts to target framework |
| Capture requires browser (OAuth) | Human-triggered; designer is already in browser |
| Frame degradation after 3+ cycles | Re-capture from code every 2-3 cycles |
| Annotations break get_design_context | Remove annotations before extraction |
| Code Connect requires Enterprise plan | Custom component-map.json replaces it |
| Library frames are visual references, not native Figma components | Sufficient for ideation + tweaking; evaluate Anima if native variants needed |

---

## Verification Checklist

- [ ] Figma MCP server configured and authenticated (browser OAuth)
- [ ] Figma project structure created (Library + Active Work + Archive)
- [ ] `.figma/component-map.json` generated from Storybook
- [ ] `.figma/design-system-rules.md` generated from globals.css
- [ ] Initial library capture done (Storybook stories -> Figma Library)
- [ ] `.figma/last-sync-commit` recorded
- [ ] Capture cycle tested (capture > edit > extract > adapt > code)
- [ ] `needs:design` label available in Linear
- [ ] Figma file IDs recorded in project config
