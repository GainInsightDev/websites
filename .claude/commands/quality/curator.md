---
# Claude Code slash command fields
description: Enforce DRY across documentation by finding duplicates and consolidating to single sources with references
allowed-tools: Task, Read, Write, Edit, Glob, Grep
argument-hint: "[--scope framework|project|full] [--report-only] [--auto-fix]"

# Documentation system fields
title: Documentation Curator Command
created: 2025-09-07
updated: 2026-01-05
last_checked: 2026-01-05
tags: [quality, documentation, curation, dry, consolidation]
parent: ./README.md
children: []
related:
  - ../../agents/af-docs-curator-agent.md
  - ../../agents/af-docs-quality-agent.md
  - ../../skills/af-documentation-standards/SKILL.md
---

# /quality:curator - Documentation Curation Command

Enforce DRY (Don't Repeat Yourself) across documentation by finding duplicates, identifying authoritative sources, and replacing copies with references.

## Usage

```
/quality:curator
/quality:curator --scope framework
/quality:curator --scope project
/quality:curator --report-only
/quality:curator --auto-fix
```

## Arguments

- `--scope` - What to curate:
  - `framework` - Only `.claude/` (skills, agents, guides)
  - `project` - Only `docs/` (project documentation)
  - `full` - Both (default)
- `--report-only` - Generate report without making changes
- `--auto-fix` - Apply safe consolidations automatically

## What This Command Does

Invokes `af-docs-curator-agent` to:

1. **Find duplicates** - Same concept explained in multiple places
2. **Identify authoritative sources** - Which file should be the single source of truth
3. **Create references** - Replace copies with links to authoritative source
4. **Find orphans** - Documentation not connected to the tree

## Two Documentation Contexts

The curator understands two different structures:

### AgentFlow Framework (`.claude/`)
- Skills (directive, 150-200 lines) → reference guides
- Guides (comprehensive, 800-1500 lines) → authoritative source
- Agents (thin, ~50 lines) → load skills, don't embed knowledge

### Project Documentation (`docs/`)
- Three-layer pattern: Code Docs → Index Docs → Reference Docs
- `@documentation` JSDoc tags link code to guides
- Single source per API endpoint/component

## Example Output

```
Documentation Curation Report
=============================

Duplicates Found: 3
- "BDD Scenario Syntax" in 3 locations → Consolidate to af-bdd-expertise skill
- "Frontmatter Requirements" in 2 locations → OK (rules vs comprehensive)

Orphaned Files: 1
- docs/old-readme.md (no parent, not in children array)

Recommendations:
- Remove 80 lines from af-bdd-agent.md, add skill reference
- Add parent field to docs/old-readme.md
```

## When to Use

- **Weekly/Sprint** - Regular documentation maintenance
- **After major changes** - New features, refactoring
- **Before releases** - Ensure docs are clean
- **Large PRs** - When significant documentation added

## Command Implementation

```
Use Task tool with:
subagent_type: 'af-docs-curator-agent'
prompt: 'Curate documentation to enforce DRY. Scope: {scope}. Mode: {report-only|auto-fix|full}. Find duplicates, identify authoritative sources, recommend consolidations.'
```

## See Also

- [Documentation Curator Agent](../../agents/af-docs-curator-agent.md) - Full agent documentation
- [Documentation Standards](../../skills/af-documentation-standards/SKILL.md) - Standards to maintain
- [Docs Quality Agent](../../agents/af-docs-quality-agent.md) - Continuous validation (different purpose)
