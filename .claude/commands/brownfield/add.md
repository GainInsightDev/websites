---
# Claude Code slash command fields
description: Add AgentFlow to an existing repository
allowed-tools: Task, Bash, Read, Write, Edit, Glob
argument-hint: "<repo-name> [--branch <branch>]"

# Documentation system fields
title: Add AgentFlow to Brownfield Project
created: 2025-12-02
updated: 2025-12-09
last_checked: 2025-12-09
tags: [command, brownfield, setup, onboarding]
parent: ./README.md
---

# /brownfield:add - Add AgentFlow to Existing Project

Sets up AgentFlow in an existing (brownfield) repository by creating the stable worktree, adding required files, and configuring docs portal.

## Usage

```
/brownfield:add <repo-name>
/brownfield:add <repo-name> --branch develop
```

## Arguments

- `repo-name` (required): Name of the repository (must exist at `/srv/repos/{repo-name}.git`)
- `--branch` (optional): Integration branch to use. If not specified, will detect or ask.

## Prerequisites

Before running this command:

1. **Bare repo must exist**: Run `add-repo <github-url>` first
2. **AgentFlow main worktree**: Must exist at `/srv/worktrees/agentflow/main`
3. **Permissions**: User must be in `devteam` group

## What This Command Does

Executes the brownfield setup procedure which:

1. **Creates stable worktree** at `/srv/worktrees/{repo-name}/{branch}`
2. **Analyzes project** to detect tech stack (Next.js, Python, etc.)
3. **Syncs AgentFlow V2 framework** - Runs sync script to populate `.claude/` with all framework assets
4. **Creates `.start-work-hooks`** for automatic worktree setup (synced from framework)
5. **Creates `CLAUDE.md`** customized for detected tech stack with framework import
6. **Creates `docs/`** directory if missing
7. **Commits and pushes** to the integration branch
8. **Adds to docs portal** and triggers rebuild

## Example

```bash
# First, add the repo from GitHub
add-repo git@github.com:myorg/myproject.git

# Then, run Claude from AgentFlow context
cd /srv/worktrees/agentflow/main
claude

# Add AgentFlow to the project
> /brownfield:add myproject

# Or specify the branch explicitly
> /brownfield:add myproject --branch develop
```

## Output

```
AgentFlow V2 Setup Complete for myproject
============================================

Stable Worktree: /srv/worktrees/myproject/develop
Integration Branch: develop

Framework Synced:
- AgentFlow V2 framework version 2.0.0
- 12 framework agents (af-*)
- 11 framework skills (af-*)
- Complete orchestrators, docs, scripts, templates, hooks
- .claude/.sync/state.json for tracking updates

Infrastructure Created:
- .start-work-hooks (automatic worktree setup)
- .github/workflows/ (if applicable)

Project Files Created:
- CLAUDE.md (customized for Next.js/TypeScript)
- docs/README.md

Docs Portal: https://docs.gaininsight.co.uk/myproject

Tech Stack Detected:
- Next.js 14
- TypeScript
- Prisma

Recommended Next Steps:
1. Run `start-work myproject ISSUE-XXX` to create a feature worktree
2. Run `/security:audit` to check security configuration
3. Run `/docs:audit-project` to assess documentation state
4. Run `/docs:retrofit` to apply AgentFlow standards (if audit shows gaps)
5. Review and customize CLAUDE.md for project-specific instructions
6. Run `/quality:docs` for ongoing documentation validation
7. Run `/agentflow:sync` when framework updates are released
```

## After Setup

Once AgentFlow is added:

1. **Create feature worktrees** with `start-work`:
   ```bash
   start-work myproject ISSUE-123
   ```
   This automatically runs `.start-work-hooks` which sets up AgentFlow symlinks.

2. **Set up documentation** (one-time, in stable worktree):
   ```bash
   cd /srv/worktrees/myproject/develop
   claude
   > /docs:audit-project   # Assess existing documentation
   > /docs:retrofit        # Apply AgentFlow standards (if needed)
   > /quality:docs         # Validate documentation
   ```

3. **Start working** in feature worktree:
   ```bash
   cd /srv/worktrees/myproject/ISSUE-123
   claude
   > /task:start ISSUE-123 # Begin work on the issue
   ```

## Idempotency

This command is safe to run multiple times. If the stable worktree already exists, the setup process will ask whether to:
- Skip (leave as-is)
- Update files (refresh .start-work-hooks and CLAUDE.md)
- Abort

## Command Implementation

Execute the brownfield setup procedure directly.

Load `af-setup-process` skill and execute "Workflow: Brownfield Setup":

**Steps to execute:**

1. **Validate environment**
   - Verify bare repo exists: `ls /srv/repos/{repo-name}.git`
   - Detect AgentFlow path (try `/srv/worktrees/agentflow/main`, `/data/worktrees/agentflow/main`)
   - Validate Linear team exists: `linearis teams list`

2. **Detect or ask for branch**
   - Detect default: `git -C /srv/repos/{repo-name}.git symbolic-ref HEAD`
   - If unclear, use AskUserQuestion to confirm branch

3. **Create or use stable worktree**
   - Check if exists at `/srv/worktrees/{repo-name}/{branch}`
   - If not: `git -C /srv/repos/{repo-name}.git worktree add /srv/worktrees/{repo-name}/{branch} {branch}`

4. **Analyze project** (detect tech stack from package.json, tsconfig.json, etc.)

5. **Install dependencies** (respect lockfile: bun/pnpm/yarn/npm)

6. **Run AgentFlow sync**
   ```bash
   cd /srv/worktrees/{repo-name}/{branch}
   npx ts-node ${AGENTFLOW_PATH}/.claude/scripts/sync/sync-from-agentflow.ts --template ${AGENTFLOW_PATH}
   ```

7. **Create CLAUDE.md** from `.claude/templates/setup/brownfield-claudemd.md`

8. **Commit and push** with `--no-verify` (initial framework commit)

9. **Add to project registry** via `project-registry` CLI (Turso cloud DB)

10. **Report summary** with next steps

**Full procedure details:** `.claude/skills/af-setup-process/SKILL.md` → "Workflow: Brownfield Setup"

## Troubleshooting

### "Bare repo not found"
Run `add-repo <github-url>` first to create the bare repo.

### "Permission denied"
Ensure you're in the `devteam` group:
```bash
groups  # Should include 'devteam'
```

### "Branch not found"
The agent will list available branches. Choose one or create the branch first.

### "Setup on wrong branch"
The setup must create/use a stable worktree for the integration branch (main/develop). If setup was done on a feature branch, it needs to be redone on the stable worktree.

## See Also

- [af-setup-process](../../skills/af-setup-process/SKILL.md) - Setup workflows (brownfield and greenfield)
- [Brownfield Setup Guide](../../scripts/brownfield/README.md) - Full documentation
- [sync-from-agentflow.ts](../../scripts/sync/sync-from-agentflow.ts) - V2 sync script
