---
title: Brownfield Commands
created: 2025-12-02
updated: 2025-12-02
last_checked: 2025-12-02
tags: [commands, brownfield, setup, onboarding]
parent: ../README.md
children:
  - ./add.md
---

# Brownfield Commands

> **⚠️ DEPRECATED:** These commands are deprecated. Use `/agentflow:setup` (select "Brownfield" option) instead for unified setup experience.

Commands for adding AgentFlow to existing (brownfield) projects.

## Commands

### /brownfield:add <repo-name>

**DEPRECATED**: Use `/agentflow:setup` instead.

Add AgentFlow to an existing repository. Creates stable worktree, commits required files, and configures docs portal.

```
/brownfield:add myproject
/brownfield:add myproject --branch develop
```

## Workflow

The typical brownfield onboarding workflow:

```bash
# 1. Add repo from GitHub (server-level script)
add-repo git@github.com:myorg/myproject.git

# 2. Run Claude from AgentFlow context
cd /srv/worktrees/agentflow/main
claude

# 3. Add AgentFlow to the project
> /brownfield:add myproject

# 4. Create feature worktree and start working
start-work myproject ISSUE-123
cd /srv/worktrees/myproject/ISSUE-123
claude
> /docs:audit-project
```

## Related

- [af-setup-process](../../skills/af-setup-process/SKILL.md) - Setup workflow and procedures
- [Brownfield Scripts](../../scripts/brownfield/) - Setup scripts and templates
