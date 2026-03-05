---
title: Retrofit Documentation Standards
description: Apply AgentFlow documentation standards to existing project documentation
created: 2026-01-05
updated: 2026-01-05
last_checked: 2026-01-05
tags: [command, documentation, retrofit, brownfield]
parent: ./README.md
---

# /docs:retrofit

Apply AgentFlow documentation standards to existing project documentation. Use after `/docs:audit-project` identifies gaps.

## Usage

```
/docs:retrofit
/docs:retrofit --phase hierarchy
/docs:retrofit --phase code
```

## Arguments

- `--phase` (optional): Specific phase to run
  - `framework` - Install validation scripts
  - `hierarchy` - Add frontmatter, create structure
  - `code` - Add JSDoc/TSDoc to source files
  - (default: run all phases)

## When to Use

After running `/docs:audit-project` and getting:
- **Poor** assessment → Run full retrofit
- **Scattered** assessment → Run hierarchy + code phases
- **Good** assessment → Skip retrofit, just run `/quality:docs`

## What This Command Does

Invokes `af-docs-retrofit-agent` which performs a 3-phase transformation:

### Phase 1: Framework Installation
- Installs validation scripts to `.claude/scripts/`
- Adds npm scripts for doc validation
- Verifies scripts execute correctly

### Phase 2: Documentation Hierarchy
- Adds frontmatter to existing markdown files
- Creates `/docs/` structure if missing
- Establishes bidirectional linking (parent/children)
- Creates index README files
- **Preserves all existing content**

### Phase 3: Code Documentation
- Identifies critical business components
- Adds JSDoc/TSDoc to functions and classes
- Documents React components with props
- Prioritizes business logic over boilerplate

## Key Principles

- **Non-destructive** - Never deletes existing documentation
- **Incremental** - Enhances without disruption
- **Validates continuously** - Runs validators after each change

## Example Output

```
Documentation Retrofit Complete
===============================

Phase 1: Framework ✓
- 5 validation scripts installed
- npm scripts added to package.json

Phase 2: Hierarchy ✓
- 23 files enhanced with frontmatter
- 8 bidirectional links created
- docs/README.md index created

Phase 3: Code ✓
- 47 functions documented with JSDoc
- 12 React components documented
- Coverage: 34% → 78%

Validation: All checks passing ✓

Next Steps:
1. Review generated documentation for accuracy
2. Run /quality:docs for ongoing validation
3. Commit changes: git add docs/ && git commit -m "docs: retrofit AgentFlow standards"
```

## Command Implementation

```
Use Task tool with:
subagent_type: 'af-docs-retrofit-agent'
prompt: 'Retrofit AgentFlow documentation standards to this project. Phase: {phase or "full"}. Preserve all existing content. Run validation after each phase.'
```

## See Also

- [/docs:audit-project](./audit-project.md) - Assess documentation state first
- [/quality:docs](../quality/docs.md) - Ongoing validation after retrofit
- [af-docs-retrofit-agent](../../agents/af-docs-retrofit-agent.md) - Agent documentation
- [af-documentation-standards](../../skills/af-documentation-standards/SKILL.md) - Standards being applied
