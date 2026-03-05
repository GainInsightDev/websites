---
# Claude Code slash command fields
description: Continue refining requirements from saved progress
allowed-tools: Read, Task

# Documentation system fields
title: Requirements Continue Command
created: 2025-09-06
updated: 2025-09-06
last_checked: 2025-09-06
tags: [command, requirements, continuation, phase-3]
parent: ./README.md
related:
  - ./refine.md
  - ../../skills/af-orchestration/SKILL.md
  - ../../skills/af-requirements-process/SKILL.md
---

# /requirements-continue

Resume requirements refinement from where you left off.

## What This Command Does

I will:
1. Read `.claude/work/current-requirement.md` to understand progress
2. Show you what's been completed and what remains
3. Continue building the mini-PRD from the last checkpoint
4. Resume the Requirements Orchestrator workflow

## When to Use

- **After context limit**: When previous session hit context limits
- **After interruption**: When refinement was paused
- **Team handoff**: When another team member continues refinement
- **Next day**: When returning to incomplete requirements

## Progress Tracking

The current-requirement.md file tracks:
- Linear issue being refined
- Mini-PRD sections completed
- Agent tasks completed
- Next steps to perform
- Draft content accumulated

## Example Flow

```
Session 1:
/refine-requirements LIN-123
[Three Amigos analysis...]
[Feature Summary created...]
[Discovery Context gathered...]
⚠️ Approaching context limit - saving progress

Session 2:  
/requirements-continue
✓ Loaded LIN-123 refinement
✓ Completed: Three Amigos, Feature Summary, Discovery Context
→ Continuing with: BDD Scenarios
```

## File Structure

```
.claude/work/current-requirement.md
├── Feature ID: LIN-123
├── Status: Refining (in Linear)
├── Progress Checklist
├── Mini-PRD Draft (building)
└── Next Steps
```

## Handoff Pattern

When requirements are complete:
1. Mini-PRD uploaded to Linear
2. Status changes to "Approved" (awaiting scheduling into milestone)
3. current-requirement.md cleared
4. Once "Approved", ready for `/task-start LIN-123`