---
name: af-figma-design-expertise
description: |
  Use when performing Figma design round-trip workflows — capturing live UI to Figma,
  extracting design context back to code, managing Code Connect mappings, syncing
  Storybook components via Anima, and maintaining Figma project structure.

title: Figma Design Round-Trip Expertise
created: 2026-03-05
updated: 2026-03-05
last_checked: 2026-03-05
tags: [skill, expertise, figma, design, code-connect, round-trip, anima, mcp]
parent: ../README.md
related:
  - ../af-ux-design-expertise/SKILL.md
  - ../af-delivery-process/SKILL.md
  - ../af-setup-process/SKILL.md
  - ../../docs/guides/figma-setup-guide.md
---

# Figma Design Round-Trip Expertise

Directive knowledge for Figma ↔ Code design round-trips. Code remains source of truth; Figma is the visual manipulation layer for designers.

## When to Use This Skill

Load this skill when:
- Capturing live UI to Figma for designer review (`generate_figma_design`)
- Extracting design changes from Figma back to code (`get_design_context`)
- Setting up or maintaining Code Connect component mappings
- Syncing Storybook components to Figma via Anima CLI
- Creating or managing Figma project structure (Library, Active Work, Archive)
- Adding Figma page links to Linear issues
- Generating design system rules from project tokens

**Storybook remains primary.** Figma is an optional visual layer — not all projects use it.

## Quick Reference

### Two Workflows

| Flow | When to Use | Setup Time | Key Tool |
|------|-------------|------------|----------|
| **A: Direct Round-Trip** | Tweaking existing screens, layout adjustments, responsive checks | ~30 min | `generate_figma_design` + `get_design_context` |
| **B: Library Round-Trip** | New screen assembly, complex compositions, onboarding designers | ~2-4 hours | Anima CLI + Code Connect + Flow A tools |

**The designer always chooses their flow.** Never auto-decide.

### Figma MCP Tools

| Tool | MCP Name | Purpose |
|------|----------|---------|
| Capture UI | `generate_figma_design` | Live UI → editable Figma frames |
| Get Design Context | `get_design_context` | Figma selection → React + Tailwind code |
| Get Variables | `get_variable_defs` | Extract tokens (colors, spacing, typography) |
| Design System Rules | `create_design_system_rules` | Generate rule files for agent code generation |

### Rate Limits (Pro/Organization Plan)

| Metric | Limit |
|--------|-------|
| Daily tool calls | 200/day per seat |
| Per-minute calls | 15/min per seat |
| Capture calls | Exempt from limits |

### Figma Project Structure

```
Figma Project: "{Product Name}"
├── [Library] Design System          ← Tokens + components (Flow B syncs here)
├── [File] Active Work               ← Issue-specific design pages
└── [File] Shipped Archive           ← Completed designs (reference)
```

### Project Configuration

Per-project Figma settings in project config:

```json
{
  "figma": {
    "activeWorkFileId": "FILE_ID",
    "designSystemLibraryId": "LIBRARY_FILE_ID",
    "shippedArchiveFileId": "ARCHIVE_FILE_ID"
  }
}
```

### MCP Server Configuration

The Figma MCP server is **pre-configured globally** in AgentFlow's `.mcp.json` — no per-project setup needed.

No API keys or tokens needed. On first use, the MCP server initiates an OAuth flow in the browser — the user authenticates with their Figma account directly. Authentication persists across sessions.

> **Manual setup (non-AgentFlow projects):** Add to `.mcp.json`:
> ```json
> { "figma": { "command": "npx", "args": ["-y", "mcp-remote", "https://mcp.figma.com/mcp"] } }
> ```

## Rules (FOLLOW THESE)

### Source of Truth Rules

1. **Code is ALWAYS source of truth** — Figma is a visual manipulation layer, not the design source
2. **Tokens flow one-way: code → Figma** — Design System Library is read-only for issue work. Token changes flow from `globals.css` → Anima sync → Figma Styles
3. **Storybook remains primary** — All component design, testing, and sign-off happens in Storybook. Figma supplements, never replaces
4. **MUST NOT duplicate components in Figma** — All issue work references the Design System Library

### Round-Trip Rules

5. **MUST limit round-trips to 2-3 cycles** before re-capturing from code — frames degrade after multiple cycles
6. **MUST remove Figma annotations before extraction** — Annotations break `get_design_context` output
7. **MUST use Code Connect for structural components** — Prevents auto-layout becoming absolute positioning
8. **MUST validate each cycle against original intent** — Check for layout drift, token loss, component degradation
9. **Output from `get_design_context` is a starting point** — MUST replace Tailwind utilities with project tokens and reuse existing components

### Code Connect Rules

10. **MUST set up Code Connect before first extraction** — Maps Figma components to codebase imports
11. **Code Connect is design-first** — It maps existing Figma components to code, not the reverse
12. **Anima-synced components need manual Code Connect mapping** — Anima does not embed Code Connect metadata automatically
13. **MUST test `get_design_context` output after Code Connect setup** — Verify it produces `<CodeConnectSnippet>` wrappers with correct imports

### Variable Rules

14. **`get_variable_defs` only returns DEFAULT mode values** — Cannot read alternate variable modes
15. **MUST run `create_design_system_rules`** after setting up a project — Ensures agent generates code using project tokens, not raw Tailwind utilities

### Figma File Management Rules

16. **Each issue gets its own Figma page** — Named `{ISSUE-ID} {Short Description}`
17. **Frame naming within a page** — `{ISSUE-ID}/Screen Name/State` (e.g., `AF-124/Dashboard/Default`)
18. **MUST add Figma page URL to Linear issue** — Under a `## Design` section in the issue description
19. **MUST use `needs:design` label** — Add when designer input is needed, remove when complete

### Anima Rules (Flow B only)

20. **MUST build Storybook before syncing** — `npm run build-storybook && npx anima sync`
21. **Free tier limits ~5 syncs/day** — Sufficient for occasional updates, not rapid iteration
22. **Sync latency is 5-30 minutes** — Storybook build + backend processing + Figma plugin update
23. **MUST verify synced components in Figma** — Check variants, tokens, and visual fidelity after each sync

## Workflows

### Workflow: Designer Flow Choice (Mandatory First Step)

**When:** Designer invokes Figma workflow on any issue.

**Steps:**
1. Ask the designer: "Which workflow? (A) Edit existing screens — capture live UI, tweak in Figma, extract back. (B) Assemble from component library — use Figma library to compose new screens."
2. Designer picks their flow
3. Auto-scaffold:
   - Create page in Active Work file: `{ISSUE-ID} {Short Description}`
   - For Flow A: capture current UI into the page
   - For Flow B: open the page ready for library component assembly
   - Add Figma page URL to Linear issue under `## Design`
4. Add `needs:design` label to the Linear issue
5. Designer works in Figma
6. On completion: extract design context → generate/update code → remove `needs:design` label

---

### Workflow: Flow A — Direct Code ↔ Figma Round-Trip

**When:** Iterating on existing screens, layout adjustments, spacing/color tweaks, responsive checks.

**Prerequisites:** Figma MCP configured, Code Connect set up, design system rules generated.

**Steps:**
1. **Capture**: Use `generate_figma_design` to capture live UI from browser to Figma
2. **Verify**: Check frame quality — editable layers, correct structure, no flat screenshots
3. **Designer edits**: Designer tweaks visually in Figma (spacing, colors, component swaps)
4. **Extract**: Use `get_design_context` on designer's modified selection
5. **Translate**: Replace Tailwind utilities with project tokens, map to existing components
6. **Implement**: Update code based on extracted design intent
7. **Re-capture**: Capture updated UI back to Figma for review
8. **Iterate**: Repeat steps 3-7 (max 2-3 cycles before fresh capture)

**Success criteria:**
- Code changes match designer's visual intent
- Components use project tokens, not raw Tailwind values
- Code Connect resolves to actual codebase imports

---

### Workflow: Flow B — Storybook → Figma Library → Code

**When:** New screen design, complex multi-component compositions, design system exploration.

**Prerequisites:** All of Flow A + Anima CLI installed and configured.

**Steps:**
1. **Build Storybook**: `npm run build-storybook`
2. **Sync to Figma**: `npx anima sync` — creates/updates Figma component library
3. **Verify library**: Check components, variants, and tokens in Figma
4. **Set up Code Connect**: Map synced Figma components back to codebase origins
5. **Designer assembles**: Designer builds screen from library components in Figma
6. **Extract**: Use `get_design_context` — verify output references actual components
7. **Implement**: Generate code using Code Connect mappings
8. **Re-capture**: Capture to Figma for review

**Success criteria:**
- Figma library reflects Storybook components with correct variants
- `get_design_context` produces component references (via Code Connect), not inline code
- Designer can assemble screens from the component palette

---

### Workflow: Initial Project Setup

**When:** Adding Figma integration to a new project.

**Steps:**
1. **Configure Figma MCP** — Add remote server to Claude Code config (see MCP Server Configuration above)
2. **Set up Figma API token** — Store `FIGMA_API_TOKEN` in Doppler for the project
3. **Create Figma project structure** — Library + Active Work + Shipped Archive files
4. **Install Code Connect CLI** — `npm install -D @figma/code-connect`
5. **Map key components** — Run Code Connect wizard for frequently-used shadcn/ui and project components
6. **Generate design system rules** — `create_design_system_rules` against project tokens
7. **Test capture cycle** — Capture a page → verify frames → extract → compare output
8. **(Optional) Flow B: Install Anima** — `npm install -D @animaapp/anima-cli`, configure team token, run first sync

**Success criteria:**
- `generate_figma_design` produces editable frames
- `get_design_context` produces code with correct component references
- Design system rules map CSS variables to Figma tokens

---

### Workflow: Dev Agent Design Lookup

**When:** Development agent starts work on an issue that has a Figma design.

**Steps:**
1. Read Linear issue description
2. Look for `## Design` section with Figma link
3. If found: use `get_design_context` on the linked Figma node
4. Code Connect resolves components to actual codebase imports
5. Generate code referencing real components
6. If no Figma link: proceed with Storybook-only (existing behaviour)

---

## Known Limitations

| Limitation | Impact | Workaround |
|-----------|--------|------------|
| Auto-layout NOT preserved on round-trip | Designer's spacing changes produce absolute positioning | Use Code Connect for structural components |
| Frame degradation after 3+ cycles | Increasing noise in extracted code | Re-capture from code every 2-3 cycles |
| Only DEFAULT variable mode extracted | No alternate theme/mode values | Use design system rules to enforce token usage |
| Annotations break `get_design_context` | Extraction fails or produces garbage | Remove annotations before extraction |
| Token truncation on deep nesting | Incomplete extraction | Use `get_metadata` first, then fetch specific subtrees |
| Anima free tier ~5 syncs/day | Cannot rapidly iterate library | Batch component changes, sync at end of session |
| Anima-synced components lack Code Connect | `get_design_context` generates inline code | Manually create Code Connect configs per component |

## Environment Variables

No Doppler secrets required. The Figma MCP server uses browser-based OAuth — each user authenticates with their own Figma account on first use.

## Essential Reading

- [Figma MCP Documentation](https://mcp.figma.com/) — Official Figma MCP server docs
- [Code Connect Documentation](https://github.com/figma/code-connect) — Component mapping setup
- [Anima CLI Documentation](https://docs.animaapp.com/docs/manage-design-system/storybook-to-figma) — Storybook → Figma sync
- [UX Design Expertise](../af-ux-design-expertise/SKILL.md) — Primary design workflow (Storybook)
- [Research Spec](../../../.agentflow/research/figma-code-round-trip-spec.md) — Full analysis and risk register

---

**Remember:**
1. Code is source of truth — Figma is a visual layer, not the design source
2. The designer always chooses their flow (A or B) — never auto-decide
3. Limit round-trips to 2-3 cycles before re-capturing from code
4. Code Connect is essential — without it, extraction produces inline code instead of component references
5. Remove annotations before extraction — they break `get_design_context`
6. Each issue gets its own Figma page, linked in the Linear issue `## Design` section
7. `needs:design` label signals designer input is needed
