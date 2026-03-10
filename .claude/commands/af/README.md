---
title: AgentFlow Framework Commands
created: 2025-12-09
updated: 2026-02-06
last_checked: 2026-02-06
tags: [commands, framework, af-namespace]
parent: ../README.md
children:
  - ./push.md
  - ./setup.md
  - ./sync.md
  - ./tour.md
---

# AgentFlow Framework Commands

Framework-level commands for managing the AgentFlow system itself. All commands in this directory use the `af-` namespace to distinguish them from project-specific commands.

## Available Commands

### /af:tour
Interactive introduction to AgentFlow for new team members.

**Purpose:** Onboarding and orientation for engineers new to AgentFlow

**When to use:**
- First time using AgentFlow
- Need a refresher on how the framework works
- Want to understand the four phases
- Questions about your role in the workflow

**What it covers:**
- The four-phase workflow (Setup → Discovery → Refinement → Delivery)
- Key commands and when to use them
- Role-specific guidance (PM, SE, UX, QA)
- Where to find documentation
- Interactive Q&A

See: [tour.md](./tour.md)

### /af:setup
Set up AgentFlow in a project - works for both new and existing projects.

**Purpose:** Unified entry point for all AgentFlow setup scenarios

**When to use:**
- Starting a brand new project (greenfield)
- Adding AgentFlow to existing project (brownfield)
- Setting up GainInsight Standard stack (coming soon)

**What it does:**
- Routes to appropriate setup agent (brownfield/greenfield)
- Guides user through setup process
- Syncs AgentFlow V2 framework
- Creates project documentation
- Sets up development workflow

See: [setup.md](./setup.md)

### /af:sync
Sync the latest AgentFlow V2 framework to this project.

**Purpose:** Update framework assets while preserving project customizations

**When to use:**
- New AgentFlow version released
- Get latest framework improvements
- After framework bug fixes
- Setting up new project branch

**What it syncs:**
- Framework agents, skills, orchestrators, docs, scripts
- Infrastructure files (.github workflows, hooks)
- Settings.json (with hook merging)
- Package.json scripts

**What it preserves:**
- All project-specific agents/skills (without af- prefix)
- .claude/work/, .claude/plans/ directories
- CLAUDE.md project content
- Local settings overrides

See: [sync.md](./sync.md)

## Namespace Convention

**Framework commands:** `/af:*` or in `.claude/commands/af/`

**Project commands:** `/project-name:*` or in `.claude/commands/project-name/`

Example:
- ✅ `/af:sync` - Framework command
- ✅ `/umii:deploy` - Umii project command
- ✅ `/portal:backup` - Portal project command

## Command Structure

All framework commands follow this structure:

```markdown
---
description: Brief command description
title: Full Command Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
last_checked: YYYY-MM-DD
tags: [command, ...]
parent: ../README.md
related:
  - ../../relevant/file.md
---

# /command-name

[Command documentation]
```

## Adding Framework Commands

To add a new framework command:

1. **Create command file** in `.claude/commands/af/`
2. **Follow naming convention** - kebab-case, descriptive
3. **Add frontmatter** with all required fields
4. **Document thoroughly** - what, when, why, how
5. **Update this README** with command listing
6. **Test command** execution

## See Also

- [Commands Index](../README.md) - All commands
- [Template Manifest Schema](../../docs/reference/template-manifest-schema.md) - Sync configuration
- [AgentFlow Framework Development](../../skills/af-modify-agentflow/SKILL.md) - Creating framework components

---

### /af:push
Push the latest AgentFlow framework to all consumer project worktrees.

**Purpose:** Distribute framework updates to all projects automatically

**When to use:**
- After committing framework changes to AgentFlow
- When releasing a new version
- To distribute bug fixes to all projects immediately

**What it does:**
- Discovers all worktrees with AgentFlow installed
- Runs sync on each worktree
- Auto-commits changes
- Sends Zulip notifications with CHANGELOG summary

See: [push.md](./push.md)

---

**Total Commands:** 4
**Last Updated:** 2026-02-06
