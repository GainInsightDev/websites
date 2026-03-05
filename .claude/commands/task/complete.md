---
# Claude Code slash command fields
description: Complete current task and clean up work context after deployment
allowed-tools: Task

# Documentation system fields
title: Task Complete Command
created: 2025-09-06
updated: 2026-01-06
last_checked: 2026-01-06
tags: [command, task-management, linear]
parent: ./README.md
---

Use the af-work-management-agent to complete the current task:

1. Read `.claude/work/current-task.md` to get Linear issue details
2. Verify Linear status is "Live" (deployed to production)
   - If not "Live", confirm with user before proceeding
   - CI/CD automation should have moved status through Dev → Test → Live
3. Add completion comment with implementation summary
4. Clear current-task.md for next task

The af-work-management-agent will archive the task context and prepare for worktree teardown.

**Note:** This command is for cleanup after deployment, not for changing Linear status. The status flow (In Review → Dev → Test → Live) is handled by CI/CD automation.