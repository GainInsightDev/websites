---
# Claude Code slash command fields
description: Plan the weekly work cycle for the current team by prioritizing backlog issues and proposing cycle allocations
allowed-tools: Task
argument-hint: "[team-name]"

# Documentation system fields
title: Plan Week Command
created: 2026-02-08
updated: 2026-02-08
last_checked: 2026-02-08
tags: [command, project-management, planning, cycles]
parent: ./README.md
related:
  - ../../skills/af-project-management-expertise/SKILL.md
  - ../../agents/af-project-management-agent.md
  - ../../skills/af-estimation-expertise/SKILL.md
---

# /pm:plan-week

You are now entering **Weekly Cycle Planning** mode.

## What I'll Do

I'll help you plan the next work cycle for your team by:

1. **Querying the backlog** — Pull all Discovered and Approved issues
2. **Assessing estimates** — Check which issues have estimates and at what quality
3. **Estimating gaps** — Quick-estimate any unestimated issues using heuristics
4. **Prioritizing** — Sort by status tier, then priority, then size, then age
5. **Proposing a cycle** — Fill a ~50-point weekly budget with the highest-priority work
6. **Waiting for approval** — Present the plan before making any changes

## Skills to Load

Load these skills before proceeding:
- `af-project-management-expertise` — Capacity planning, prioritization, cycle management
- `af-estimation-expertise` — Estimation heuristics and structured output format

## Parameters

- **Team**: $1 (if provided), otherwise use the team this project belongs to
- **Capacity**: 25 man-days / ~50 story points (default)

## Procedure

1. Load `af-project-management-expertise` and `af-estimation-expertise`
2. Identify the target team (from argument or project config)
3. Follow the "Plan a Weekly Cycle" workflow from the project-management-expertise skill
4. Present the proposed plan and wait for human approval
5. On approval, execute: assign issues to cycle, set estimates, post comments
6. Post summary to Slack

## Important

- **Always present the plan before executing** — never assign to cycles without approval
- **Leave buffer capacity** — aim for 40-45 points, not the full 50
- **Estimate before scheduling** — no unestimated issues in the cycle
