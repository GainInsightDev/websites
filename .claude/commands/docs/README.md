---
title: Documentation Commands
created: 2025-09-06
updated: 2026-01-05
last_checked: 2026-01-05
tags: [commands, documentation, slash-commands, validation]
parent: ../README.md
children:
  - ./audit-project.md
  - ./retrofit.md
  - ./check-all.md
  - ./check-stale.md
---

# Documentation Commands

Slash commands for documentation management and validation.

## Brownfield Flow

```
/docs:audit-project  →  /docs:retrofit  →  /quality:docs (ongoing)
     (assess)              (transform)         (validate)
```

## Commands

### /docs:audit-project
Assess existing project documentation for brownfield onboarding.
- Scans all documentation artifacts (README, docs/, code comments, API specs)
- Rates documentation state: None, Poor, Scattered, Good
- Provides recommendations for AgentFlow integration

### /docs:retrofit
Apply AgentFlow documentation standards to existing docs.
- Adds frontmatter to markdown files
- Creates bidirectional linking structure
- Adds JSDoc/TSDoc to code
- **Use after audit-project identifies gaps**

### /docs:check-all
Run comprehensive documentation audit with full validation workflow.
- **Mode 1 (full)**: Check all documentation files
- **Mode 2 (git)**: Check only git-modified files

### /docs:check-stale [days]
Check specifically for outdated documentation (default: >7 days old).