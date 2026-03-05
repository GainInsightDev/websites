---
title: Quotation Commands
created: 2026-02-06
updated: 2026-02-06
last_checked: 2026-02-06
tags: [command, index, quotation]
parent: ../README.md
children:
  - ./generate.md
---

# Quotation Commands

Commands for generating client-facing quotations from Linear estimation data.

## Available Commands

| Command | Description |
|---------|-------------|
| `/quote:generate [issue-id]` | Generate a PDF quotation from estimation data |

## Prerequisites

- Issues must have estimation data (run estimation first if missing)
- `md-to-pdf` must be installed globally (`npm install -g md-to-pdf`)
- Email delivery requires configured email infrastructure

## Related Skills

- [**quotation-expertise**](../../skills/af-quotation-expertise/SKILL.md) — Pricing calculation, PDF generation, email delivery
- [**estimation-expertise**](../../skills/af-estimation-expertise/SKILL.md) — Creating the estimates that quotations consume
