---
description: Push AgentFlow framework updates to all consumer project worktrees
title: AgentFlow Push Command
created: 2026-02-06
updated: 2026-02-06
last_checked: 2026-02-06
tags: [command, push, sync, framework, distribution]
parent: ./README.md
related:
  - ./sync.md
  - ../../docs/guides/framework-sync.md
  - ../../scripts/sync/push-to-projects.ts
---

# /af:push

Push the latest AgentFlow framework to all consumer project worktrees. This is the primary distribution mechanism - it replaces the need for each project to manually run `/af:sync`.

## What This Command Does

1. Reads the server project registry (`project-registry` CLI)
2. Discovers all worktrees with AgentFlow installed (`.claude/CLAUDE-agentflow.md` present)
3. For each worktree:
   - Runs the sync script to copy framework-owned files
   - Auto-commits the changes
4. Posts one Zulip notification per project stream with CHANGELOG summary
5. Prints a summary of all results

## Usage

Run the push script from the AgentFlow worktree:

```bash
npx ts-node .claude/scripts/sync/push-to-projects.ts
```

### Options

```bash
# Preview changes without applying
npx ts-node .claude/scripts/sync/push-to-projects.ts --dry-run

# Push to a specific project only
npx ts-node .claude/scripts/sync/push-to-projects.ts --project umii

# Force push even if versions match
npx ts-node .claude/scripts/sync/push-to-projects.ts --force

# Sync files but don't auto-commit
npx ts-node .claude/scripts/sync/push-to-projects.ts --no-commit

# Skip Zulip notifications
npx ts-node .claude/scripts/sync/push-to-projects.ts --no-notify

# Verbose output
npx ts-node .claude/scripts/sync/push-to-projects.ts --verbose
```

## When to Push

**Push after:**
- Committing framework changes to AgentFlow
- Version bumps
- Bug fixes that should reach all projects immediately
- New skills, agents, or commands

**Don't push:**
- Experimental/in-progress work (use `--project` for targeted testing)
- Changes that need review first (use `--dry-run` to preview)

## Worktree Discovery

The push script discovers targets by:
1. Querying `project-registry list` for all projects
2. For each project with a `worktree_base`, scanning all subdirectories
3. Including any directory containing `.claude/CLAUDE-agentflow.md`
4. Skipping the `agentflow` project itself (source, not target)

This means it automatically finds:
- Main/develop branches
- Issue worktrees (e.g., `ING-111`, `JKN-4`)
- Specs branches
- Staging branches

## Safety

- **Force-write framework files**: AF is the source of truth for `af-*` prefixed files - always overwrites
- **Namespace isolation**: Only `af-` prefixed files are synced; project-owned files are never touched
- **Backup**: The underlying sync script creates `.claude.backup.YYYY-MM-DD` before changes
- **Dry run**: Always available with `--dry-run`
- **Results logged**: Full results written to `.claude/work/push-results.json`

## Output Files

After a push, two files are created:

| File | Purpose |
|------|---------|
| `.claude/work/push-results.json` | Machine-readable results (all worktrees, status, file counts) |
| `.claude/work/push-notifications.jsonl` | Zulip notification entries per project |

## Workflow Integration

The typical workflow after making AgentFlow changes:

1. Edit framework files in `/srv/worktrees/agentflow/main/`
2. Update `CHANGELOG.md` under `[Unreleased]`
3. Commit the changes
4. Run `/af:push` to distribute to all projects
5. Review the push summary
6. Send Zulip notifications from the notification file

## Relationship to /af:sync

| | /af:push | /af:sync |
|--|----------|----------|
| **Direction** | AgentFlow → all projects | Project ← AgentFlow |
| **Initiated by** | Framework maintainer | Project developer |
| **Scope** | All worktrees across all projects | Single project |
| **Use case** | Distributing updates | Ad-hoc sync, new branches |

Both commands use the same underlying sync logic (`sync-from-agentflow.ts`). `/af:push` orchestrates multiple `/af:sync` operations.

## See Also

- [/af:sync](./sync.md) - Pull-based sync for individual projects
- [Framework Sync Guide](../../docs/guides/framework-sync.md) - Sync system overview
- [Push Script Source](../../scripts/sync/push-to-projects.ts) - Implementation
- [Making AgentFlow Changes](../../skills/af-commit-agentflow-changes/SKILL.md) - Contribution workflow
