---
# Claude Code slash command fields
description: Begin work on a Linear issue by creating current-task.md
allowed-tools: Task
argument-hint: "<linear-issue-id>"

# Documentation system fields
title: Task Start Command
created: 2025-09-06
updated: 2025-09-06
last_checked: 2025-09-06
tags: [command, task-management, linear]
parent: ./README.md
---

Use the af-work-management-agent to start work on Linear issue $1:

1. Fetch the Linear issue details for $1
2. Create/update `.claude/work/current-task.md` with issue context
3. Move Linear issue to "In Progress" status
4. Add start comment to Linear issue

The af-work-management-agent will fetch complete issue details from Linear, generate current-task.md with Linear data, update issue status to "In Progress", and initialize working context for AI sessions.