---
# Claude Code slash command fields
description: Sync AgentFlow framework updates to this project

# Documentation system fields
title: AgentFlow Sync Command
created: 2025-12-09
updated: 2026-02-06
last_checked: 2026-02-06
tags: [command, sync, framework, distribution, changelog]
parent: ./README.md
related:
  - ../../docs/reference/template-manifest-schema.md
---

# /af:sync

Pull the latest AgentFlow V2 framework to this project from the AgentFlow repository.

> **Note:** The primary distribution method is now `/af:push`, which pushes updates from AgentFlow to all consumer worktrees automatically. Use `/af:sync` for ad-hoc sync of individual projects or newly created branches.

## What This Command Does

This command updates your project with the latest framework assets while preserving all project-specific customizations.

**Synced content:**
1. Framework files in `.claude/` (agents, skills, orchestrators, docs, scripts, templates, hooks, lib)
2. Infrastructure files (`.github/workflows/agentflow-*.yml`, `.start-work-hooks`)
3. Settings configuration (`.claude/settings.json` with hook merging)
4. Package.json scripts (agentflow:* commands)
5. CLAUDE.md import line (`@.claude/CLAUDE-agentflow.md`)

**Preserved content:**
- All project-specific agents without `af-` prefix
- All project-specific skills without `af-` prefix
- All project-specific commands outside `/af/` directory
- `.claude/work/` directory
- `.claude/plans/` directory
- `.claude/.sync/` state tracking
- `CLAUDE.md` project-specific content
- `.claude/settings.local.json` overrides

## Usage

```
/af:sync
```

This will:
1. Check if an update is available (compares versions)
2. If update available, run the sync script
3. Show you what changed
4. Ask if you want to commit the changes

**If already up to date:**
```
✅ Already up to date!

AgentFlow is already synced to the latest version.

  - Version: 3.0.0
  - Synced at: 2026-01-06T12:00:00.000Z
  - Commit: abc1234

No updates needed - this project is current with the AgentFlow framework.
```

### Options

For more control, run the script directly:

```bash
# Preview changes without applying
npm run agentflow:sync:dry-run

# Force sync even if already up to date
npx ts-node .claude/scripts/sync/sync-from-agentflow.ts --force

# Sync with verbose output
npx ts-node .claude/scripts/sync/sync-from-agentflow.ts --verbose

# Sync from different template path
npx ts-node .claude/scripts/sync/sync-from-agentflow.ts --template /path/to/agentflow
```

**Version comparison behavior:**
- Compares local `.claude/.sync/state.json` version against source `template-manifest.json`
- Also checks commit hash - syncs if same version but different commit
- Use `--force` to sync regardless of version

## When to Sync

**Check what's new first:**
```bash
# Review the changelog
cat /srv/worktrees/agentflow/main/CHANGELOG.md

# Compare versions
cat .claude/.sync/state.json | grep version  # Your version
```

**You should sync when:**
- New version available in `CHANGELOG.md` with features you need
- AgentFlow releases a new version (announced in Zulip #engineering-team)
- You want to get latest framework improvements
- New agents or skills are added to the framework
- Bug fixes or documentation updates are available
- Setting up a new project branch

**You don't need to sync for:**
- Project-specific changes (agents, skills, commands you create)
- Local work-in-progress
- Experimental features being developed in your project

## What Happens During Sync

### 1. Backup
Creates `.claude.backup.YYYY-MM-DD` before making changes (if enabled in manifest)

### 2. Framework Files Sync
Syncs all framework assets with `af-` prefix:
- Agents: `af-bdd-agent.md`, `af-docs-quality-agent.md`, etc.
- Skills: `af-write-bdd-scenarios/`, `af-configure-test-frameworks/`, etc.
- Commands: `.claude/commands/af/**/*.md`
- All orchestrators, docs, scripts, templates, hooks, lib files

### 3. Infrastructure Sync
Syncs CI/CD and automation files:
- `.github/workflows/agentflow-*.yml` workflows
- `.start-work-hooks` for brownfield setup

### 4. Settings Merge
Merges `.claude/settings.json` using "merge-hooks" strategy:
- Framework hooks + Project hooks run in parallel
- No conflicts - all hooks execute
- Project can override with `.claude/settings.local.json`

### 5. Package.json Update
Adds/updates npm scripts:
- `agentflow:sync` - Run sync
- `agentflow:sync:dry-run` - Preview changes
- `agentflow:validate` - Validate documentation
- `agentflow:check-stale` - Find stale docs

### 6. CLAUDE.md Import
Ensures `CLAUDE.md` has framework import:
```markdown
@.claude/CLAUDE-agentflow.md
```

### 7. Sync State
Updates `.claude/.sync/state.json` with:
- Framework version synced
- Timestamp
- Commit hash
- List of files synced

## After Sync

Once sync completes, you should:

1. **Review changes:**
   ```bash
   git diff
   ```

2. **Test validation (optional):**
   ```bash
   npm run agentflow:validate
   ```

3. **Check security configuration:**
   ```bash
   # Run security audit to check for missing configs
   /security:audit
   ```
   This checks for dependabot.yml, npm audit in CI, etc.

4. **Commit the updates:**
   ```bash
   git add .claude .github CLAUDE.md package.json .start-work-hooks
   git commit -m "chore: Sync AgentFlow framework to v2.x.x"
   git push
   ```

5. **Restart Claude Code session:**
   - Required for agent name updates to register
   - File changes are immediately available

## Namespace Rules

The sync system uses naming conventions to separate framework and project assets:

**Framework assets (af- prefix):**
- `af-bdd-agent.md` - Framework BDD agent
- `af-configure-test-frameworks/` - Framework testing skill
- `.claude/commands/af/sync.md` - Framework command

**Project assets (project- prefix):**
- `umii-deployment-agent.md` - Project-specific agent
- `umii-apollo-graphql/` - Project-specific skill
- `.claude/commands/umii/deploy.md` - Project command

**Automatic preservation:**
- Sync NEVER overwrites project assets (no af- prefix)
- You can safely create custom agents, skills, commands
- Framework updates won't conflict with your work

## Troubleshooting

### Sync Detects Uncommitted Changes
```
⚠️  Warning: Target has uncommitted changes
```

**Solution:** Commit or stash your work first:
```bash
git add .
git commit -m "wip: save before framework sync"
# OR
git stash
```

### Settings.json Conflicts
If you have custom settings, they'll be preserved. Framework and project hooks merge automatically.

To override framework settings:
1. Create `.claude/settings.local.json`
2. Add your overrides there
3. Local settings take precedence

### Namespace Collision
```
❌ Framework asset missing af- prefix: my-agent.md
```

**Cause:** Framework asset doesn't follow naming convention

**Solution:** This shouldn't happen (validation prevents it). If you see this, report it to the AgentFlow team.

### Sync State Issues
If `.claude/.sync/state.json` gets corrupted:
1. Delete the file
2. Re-run sync
3. New state file will be created

## Command Implementation

This command runs:
```bash
npx ts-node .claude/scripts/sync/sync-from-agentflow.ts
```

The sync script:
- Reads `template-manifest.json` from AgentFlow repository
- Copies framework files matching include patterns
- Preserves files matching preserve patterns
- Validates namespace conventions
- Merges settings.json
- Updates sync state
- Reports results

## See Also

- [/af:push Command](./push.md) - Push-based distribution (primary method)
- [CHANGELOG.md](../../../CHANGELOG.md) - Version history and what changed
- [Template Manifest Schema](../../docs/reference/template-manifest-schema.md) - Full sync configuration reference
- [Sync Script Source](../../scripts/sync/sync-from-agentflow.ts) - Implementation details
- [Brownfield Setup](../brownfield/add.md) - Initial project setup
- [Framework Sync Guide](../../docs/guides/framework-sync.md) - Sync system overview

---

**Version:** 3.0.0 (V3 with version comparison)
**Last Updated:** 2026-01-07
