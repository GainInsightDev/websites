---
# Claude Code slash command fields
description: Check for stale documentation and update if needed
allowed-tools: Bash, Task, Read, Write, Edit, Glob
argument-hint: "[days]"

# Documentation system fields
title: Check Stale Documentation
created: 2025-09-04
updated: 2025-09-05
last_checked: 2025-09-05
tags: [command, documentation, validation]
parent: ./README.md
---

# /check-stale-docs

First, run the stale documentation check:
!npx tsx .claude/scripts/check-stale-docs.ts $ARGUMENTS

Based on the results, if any documentation is stale (hasn't been reviewed in ${1:-30} days), review and update each stale document.

## Usage

```
/check-stale-docs [days]
```

- `days` (optional): Threshold for staleness (default: 30)

## What it does

1. Runs the stale documentation check script
2. Lists all documents older than the threshold
3. Reviews each stale document for:
   - Accuracy with current code
   - Outdated information
   - Broken links
   - Missing updates
4. Updates the `last_checked` date
5. Makes necessary content updates
6. Reports what was changed

## Example

```
/check-stale-docs 7
```

This checks for docs not reviewed in the last 7 days.

## Script Integration

The command uses `.claude/scripts/check-stale-docs.ts` to find stale documentation, then the docs-quality-agent reviews and updates them.