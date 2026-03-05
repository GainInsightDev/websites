---
# Claude Code slash command fields
description: Generate a client-facing quotation from Linear estimation data

# Documentation system fields
title: Generate Quotation Command
created: 2026-02-06
updated: 2026-02-06
last_checked: 2026-02-06
tags: [command, quotation, pricing, pdf]
parent: ./README.md
related:
  - ../../skills/af-quotation-expertise/SKILL.md
  - ../../skills/af-estimation-expertise/SKILL.md
---

# /quote:generate

You are now generating a **client-facing quotation** from Linear estimation data.

## What I'll Do

I'll walk you through generating a professional quotation PDF:

1. **Identify scope** — Which Linear issue(s) to quote
2. **Set pricing** — Day rate (flat or per-role)
3. **Extract estimates** — Pull hour breakdowns from Linear
4. **Calculate costs** — Hours to days to £ amounts
5. **Generate PDF** — Clean, professional quotation document
6. **Deliver** — Email the PDF to your specified recipient

## Getting Started

Load the quotation expertise skill for detailed guidance:
→ Read `.claude/skills/af-quotation-expertise/SKILL.md`

Then follow the "Workflow: Generate a Quotation" procedure.

## Quick Start

If an issue ID was provided as an argument, use it as the scope. Otherwise ask:

**Which Linear issue(s) should I quote?**
- A single issue: `AF-42`
- Multiple issues: `AF-42, AF-43, AF-44`
- A parent feature (includes all sub-issues): `AF-40`

**What day rate should I use?**
- Single rate for all work (e.g., £650/day)
- Or per-role rates (SE, UX, QA, PM)

**Where should I send the PDF?**
- Email address for delivery

Let's get started — which issue(s) would you like to quote?
