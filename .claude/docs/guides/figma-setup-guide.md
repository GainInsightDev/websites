---
title: Figma Design Round-Trip Setup Guide
created: 2026-03-05
updated: 2026-03-05
last_checked: 2026-03-05
tags: [guide, figma, design, setup, code-connect, anima]
parent: ./README.md
related:
  - ../../skills/af-figma-design-expertise/SKILL.md
  - ../../skills/af-ux-design-expertise/SKILL.md
---

# Figma Design Round-Trip Setup Guide

Step-by-step guide for adding Figma design round-trip workflows to an AgentFlow project.

**Prerequisites:** Project must have `ui-styling` module installed (Storybook + design tokens).

**Skill reference:** Load `af-figma-design-expertise` for detailed rules and workflows.

---

## Flow A Setup: Direct Code <> Figma Round-Trip

Setup time: ~30 minutes. Use for tweaking existing screens, layout adjustments, responsive checks.

### Step 1: Figma MCP Server

The Figma MCP server is **pre-configured globally** in AgentFlow's `.mcp.json`. No per-project setup needed.

No API keys needed. On first use, the MCP server opens a browser OAuth flow — authenticate with your Figma account.

> **Manual setup (non-AgentFlow projects):** Add to `.mcp.json`:
> ```json
> { "figma": { "command": "npx", "args": ["-y", "mcp-remote", "https://mcp.figma.com/mcp"] } }
> ```

### Step 2: Create Figma Project Structure

In Figma, create a project for your product with three files:

```
Figma Project: "{Product Name}"
├── [Library] Design System          <- Tokens + components
├── [File] Active Work               <- Issue-specific design pages
└── [File] Shipped Archive           <- Completed designs (reference)
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

### Step 3: Set Up Code Connect

Code Connect maps Figma components to your codebase imports so `get_design_context` produces real component references instead of inline code.

```bash
npm install -D @figma/code-connect
```

Map frequently-used components:
- shadcn/ui atoms (Button, Input, Card, Badge, etc.)
- Project-specific molecules and organisms

Run the Code Connect CLI wizard to create mappings.

### Step 4: Generate Design System Rules

Run `create_design_system_rules` via the Figma MCP against your project's CSS variables (from `globals.css`). This generates rule files so Claude Code generates code using your project tokens, not raw Tailwind utilities.

### Step 5: Test the Capture Cycle

1. Start your dev server (or use staging URL)
2. Use `generate_figma_design` to capture a page to Figma
3. Verify the result: editable frames, correct layer structure, not flat screenshots
4. Use `get_design_context` to extract code back
5. Verify: output uses Code Connect component references and project tokens

**Flow A is ready when:** Capture and extract both produce usable results.

---

## Flow B Setup: Storybook > Figma Library > Code

Setup time: ~2-4 hours. Use for new screen assembly, complex compositions, onboarding designers.

**Includes all of Flow A setup, plus:**

### Step 6: Install Anima CLI

```bash
npm install -D @animaapp/anima-cli
```

### Step 7: Configure Anima

1. Install the Anima Figma plugin from the Figma Community
2. In the plugin, get your team token
3. Configure the CLI with the token

### Step 8: Build and Sync Storybook

```bash
npm run build-storybook
npx anima sync
```

This creates/updates a Figma component library from your Storybook. Verify in Figma:
- Components appear with correct variants
- Design tokens (colors, spacing, typography) are preserved
- Interactive states are represented

### Step 9: Set Up Code Connect for Synced Components

Anima-synced components need manual Code Connect mapping (Anima does not embed Code Connect metadata automatically). Map each synced Figma component back to its codebase origin.

### Step 10: Test the Assembly Cycle

1. Designer assembles a screen from library components in Figma
2. Use `get_design_context` on the assembled design
3. Verify: output references actual components via Code Connect, not inline code
4. Generate code and verify it uses real codebase imports

**Flow B is ready when:** Designer can assemble from library and extraction produces component-based code.

---

## Linear Integration

### needs:design Label

Use the `needs:design` label (workspace-scoped, already created) to signal designer input is needed:
- Add `needs:design` when an issue needs design work
- Remove `needs:design` when design work is complete
- Designers filter their view by this label to find work

### Figma Links in Issues

When creating a Figma page for an issue, add the link to the Linear issue description:

```markdown
## Design
Figma: https://figma.com/file/xxx?node-id=yyy
```

Dev agents look for this section to find the relevant Figma design.

---

## Naming Conventions

| Element | Format | Example |
|---------|--------|---------|
| Figma page | `{ISSUE-ID} {Short Description}` | `AF-124 Dashboard Layout` |
| Frame within page | `{ISSUE-ID}/Screen Name/State` | `AF-124/Dashboard/Default` |
| Design System Library | `[Library] Design System` | - |
| Active Work file | `[File] Active Work` | - |

---

## Known Limitations

| Limitation | Workaround |
|-----------|------------|
| Auto-layout not preserved on round-trip | Use Code Connect for structural components |
| Frame degradation after 3+ cycles | Re-capture from code every 2-3 cycles |
| Only DEFAULT variable mode extracted | Use design system rules for token enforcement |
| Annotations break get_design_context | Remove annotations before extraction |
| Anima free tier ~5 syncs/day | Batch changes, sync at end of session |

---

## Verification Checklist

- [ ] Figma MCP server configured and authenticated
- [ ] Figma project structure created (Library + Active Work + Archive)
- [ ] Code Connect installed and key components mapped
- [ ] Design system rules generated from project tokens
- [ ] Capture cycle tested (capture > edit > extract > code)
- [ ] `needs:design` label available in Linear
- [ ] (Flow B) Anima CLI installed and configured
- [ ] (Flow B) Storybook synced to Figma library
- [ ] (Flow B) Code Connect mapped for synced components
- [ ] (Flow B) Assembly cycle tested (assemble > extract > code)
