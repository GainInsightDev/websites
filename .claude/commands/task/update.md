---
# Claude Code slash command fields
description: Sync current task with Linear and update progress
allowed-tools: Task

# Documentation system fields
title: Task Update Command
created: 2025-09-06
updated: 2025-09-06
last_checked: 2025-09-06
tags: [command, task-management, linear]
parent: ./README.md
---

Use the af-work-management-agent to update the current task:

1. Read `.claude/work/current-task.md` to get current context
2. Sync with Linear issue for any updates
3. Add progress comment to Linear issue
4. Update current-task.md with latest information

The af-work-management-agent will keep the current task synchronized with Linear and update progress tracking.