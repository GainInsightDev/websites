---
title: AgentFlow Framework Sync Guide
created: 2025-12-09
updated: 2026-01-07
last_checked: 2026-01-07
tags: [guide, sync, framework, distribution, brownfield, changelog]
parent: ./README.md
code_files:
  - ../../scripts/sync/sync-from-agentflow.ts
related:
  - ../reference/template-manifest-schema.md
  - ../../commands/af/sync.md
  - ../../commands/brownfield/add.md
---

# AgentFlow Framework Sync Guide

Complete guide to the AgentFlow V2 framework sync system - how it works, when to use it, and how to troubleshoot issues.

## Overview

### What is Framework Sync?

AgentFlow V2 uses a **git-based sync distribution model** where framework assets are copied into projects rather than symlinked. This approach:

- **Enables GitHub agent compatibility** - All files physically present in repository
- **Preserves project autonomy** - Projects can customize while maintaining sync capability
- **Tracks framework versions** - Clear versioning and update paths
- **Supports offline development** - No dependency on external symlink targets

### Sync vs Symlinks (V1)

**V1 Approach (Symlinks):**
```
Project/.claude/ → symlinks → /srv/worktrees/agentflow/main/.claude/
```
- ✅ Always latest framework
- ❌ Breaks GitHub agents (missing files)
- ❌ Requires shared filesystem
- ❌ No version control

**V2 Approach (Git Sync):**
```
Project/.claude/ ← copied from ← AgentFlow template
```
- ✅ GitHub agent compatible
- ✅ Version controlled updates
- ✅ Works anywhere (cloud, local, containers)
- ✅ Project can customize safely
- ⚠️ Manual sync required for updates

### Key Concepts

**Framework Assets** - Files with `af-` prefix that belong to AgentFlow:
- `af-*` agents, skills, commands
- Core orchestrators, docs, scripts
- Infrastructure (hooks, workflows)

**Project Assets** - Files without `af-` prefix that belong to the project:
- Project-specific agents, skills, commands
- Custom documentation
- Project configuration overrides

**Namespace Separation** - Clear ownership via naming:
- Framework: `af-*` prefix
- Project: No prefix or `{project-name}-*` prefix

## When to Sync

### Check the Changelog First

Before syncing, review `CHANGELOG.md` at the repository root to see what changed:

```bash
# View changelog
cat /srv/worktrees/agentflow/main/CHANGELOG.md

# Or check current vs latest version
cat .claude/.sync/state.json | grep version  # Your version
cat /srv/worktrees/agentflow/main/template-manifest.json | grep version  # Latest
```

The changelog follows [Keep a Changelog](https://keepachangelog.com/) format with:
- **Added** - New features and capabilities
- **Changed** - Changes to existing functionality
- **Fixed** - Bug fixes
- **Removed** - Removed features

This helps you understand what you're getting before running sync.

### Initial Setup (Brownfield)

When adding AgentFlow to an existing project:

```bash
cd /srv/worktrees/agentflow/main
claude

> /brownfield:add myproject
```

The brownfield setup command automatically runs initial sync to populate the framework.

### Framework Updates

When new AgentFlow versions are released:

```bash
cd /srv/worktrees/myproject/main
claude

> /af:sync
```

Sync pulls latest framework improvements while preserving project customizations.

### New Feature Branches

When creating a new feature branch from an outdated base:

```bash
start-work myproject ISSUE-123
cd /srv/worktrees/myproject/ISSUE-123
claude

> /af:sync  # Get latest framework
```

Ensures feature work uses current framework capabilities.

### After Framework Bug Fixes

When AgentFlow fixes a critical bug:

```bash
> /af:sync
# Review changes
# Test your project
# Commit and push
```

Pull fixes immediately without waiting for feature work.

## What Gets Synced

### Framework Assets

**Always synced** (overwritten on sync):

```
.claude/
├── agents/
│   └── af-*.md                    # Framework agents
├── skills/
│   ├── af-orchestrate-workflow/          # Orchestration workflows
│   ├── af-**/SKILL.md             # Framework skills
│   └── af-**/README.md            # Skill indexes
├── commands/
│   └── af/**/*.md                 # Framework commands
├── docs/
│   ├── guides/                    # Framework guides
│   ├── standards/                 # Standards docs
│   ├── reference/                 # Reference docs
│   └── architecture/              # ADRs and design
├── scripts/
│   ├── sync/                      # Sync scripts
│   ├── validation/                # Validation scripts
│   └── brownfield/                # Setup scripts
├── templates/
│   ├── glossary.yml               # BDD glossary
│   ├── mini-prd-template.md       # Requirements template
│   └── brownfield-CLAUDE.md       # Brownfield template
├── hooks/
│   └── *.template                 # Hook templates
├── settings.json                  # Framework settings (merged)
├── CLAUDE-agentflow.md            # Framework instructions
└── README.md                      # Framework overview
```

### Infrastructure Files

**Conditionally synced** (if they exist in template):

```
.start-work-hooks                  # Worktree setup automation
.github/workflows/agentflow-*.yml  # Framework CI/CD workflows
package.json                       # Framework scripts (merged)
```

### Sync Behavior Details

**Complete Replacement:**
- Framework assets with `af-` prefix
- Documentation in `.claude/docs/`
- Scripts in `.claude/scripts/`
- Templates in `.claude/templates/`

**Smart Merging:**
- `settings.json` - Hooks arrays merged (framework + project)
- `package.json` - Scripts merged, dependencies preserved

**Never Touched:**
- Project-specific agents/skills (no `af-` prefix)
- Project work directories (`.claude/work/`, `.claude/plans/`)
- Root `CLAUDE.md` (project instructions)
- Root `docs/` (project documentation)

## What Gets Preserved

### Project-Specific Assets

**Never modified by sync:**

```
.claude/
├── agents/
│   └── myproject-*.md             # Project agents
├── skills/
│   └── myproject-**/SKILL.md      # Project skills
├── commands/
│   └── myproject/**/*.md          # Project commands
├── work/
│   └── current-task.md            # Session context
├── plans/
│   └── feature-plan.md            # Planning docs
└── logs/                          # Agent logs

CLAUDE.md                          # Project instructions (import only)
docs/                              # Project documentation
```

### CLAUDE.md Handling

The root `CLAUDE.md` is **preserved** but sync ensures it imports the framework:

```markdown
# Project Instructions

@.claude/CLAUDE-agentflow.md      # ← Sync adds this if missing

[Your project-specific content]
```

Sync will:
- ✅ Add import line if missing
- ✅ Preserve all project content
- ❌ Never modify project instructions

### Settings.json Merging

Framework and project hooks run **in parallel** (not replaced):

**Before sync:**
```json
{
  "hooks": {
    "preToolUse": ["project-validator.sh"],
    "stop": ["custom-cleanup.sh"]
  }
}
```

**After sync:**
```json
{
  "hooks": {
    "preToolUse": [
      ".claude/hooks/pre-tool-use.sh",    // Framework
      "project-validator.sh"               // Project (preserved)
    ],
    "stop": [
      ".claude/hooks/stop.sh",             // Framework
      "custom-cleanup.sh"                  // Project (preserved)
    ]
  }
}
```

## Using /af:sync

### Basic Usage

```bash
/af:sync
```

Runs interactive sync with confirmation prompts.

### Command Options

```bash
/af:sync --dry-run          # Preview changes without modifying
/af:sync --force            # Skip confirmation prompts
/af:sync --no-backup        # Skip backup creation
```

### Sync Workflow

1. **Validation** - Checks prerequisites
   - Node.js and npm available
   - Git working directory clean (or user confirms)
   - Template path accessible

2. **Analysis** - Identifies changes
   - Compares current vs template versions
   - Lists files to add/update/delete
   - Shows namespace compliance issues

3. **Confirmation** - User reviews changes
   - Displays change summary
   - Shows version upgrade path
   - Asks for confirmation (unless `--force`)

4. **Backup** - Protects existing state
   - Creates `.claude/.sync/backup-{timestamp}/`
   - Copies all framework assets pre-sync
   - Enables rollback if needed

5. **Sync** - Applies changes
   - Copies framework assets
   - Merges settings.json and package.json
   - Syncs infrastructure files
   - Updates CLAUDE.md import

6. **State Tracking** - Records sync
   - Creates/updates `.claude/.sync/state.json`
   - Tracks framework version, commit, timestamp
   - Lists all synced files

7. **Validation** - Verifies result
   - Checks namespace compliance
   - Validates manifest rules
   - Reports any issues

### Sync Output

```
AgentFlow Framework Sync
========================

Source: /srv/worktrees/agentflow/main
Target: /srv/worktrees/myproject/main
Distribution Model: git-sync

Current Version: 1.0.0
Template Version: 2.0.0

Changes:
  Added: 3 files
  Updated: 12 files
  Deleted: 1 file

Framework Assets:
  - 12 agents (af-*)
  - 11 skills (af-*)
  - 4 command namespaces
  - Complete docs, scripts, templates

Infrastructure:
  - .start-work-hooks
  - .github/workflows/ (2 files)

Proceed with sync? (y/N): y

Syncing...
✓ Backed up to .claude/.sync/backup-20251209-143022/
✓ Synced framework assets
✓ Merged settings.json (hooks)
✓ Synced infrastructure files
✓ Updated CLAUDE.md import
✓ Created sync state

Sync complete!

Next steps:
1. Review changes: git diff
2. Test your project: npm test
3. Commit: git add .claude/ && git commit -m "chore: Sync AgentFlow v2.0.0"
```

## How Sync Works Internally

### The Sync Script

Located at `.claude/scripts/sync/sync-from-agentflow.ts`, the sync script:

1. **Reads manifest** - `template-manifest.json` defines sync rules
2. **Validates namespaces** - Ensures `af-` prefix compliance
3. **Copies framework assets** - Using manifest include patterns
4. **Syncs infrastructure** - Based on manifest configuration
5. **Merges JSON files** - Smart merging for settings/package
6. **Tracks state** - Records sync metadata
7. **Validates result** - Ensures sync succeeded correctly

### Template Manifest

The manifest (`.template-manifest.json` at repo root) defines:

**Framework Assets:**
```json
{
  "framework": {
    "include": [
      ".claude/agents/af-*.md",
      ".claude/skills/af-*/SKILL.md",
      ".claude/commands/af/**/*.md",
      ".claude/docs/**/*.md",
      ".claude/scripts/**/*.{ts,js,sh}",
      ".claude/templates/**/*",
      ".claude/hooks/*.template",
      ".claude/settings.json",
      ".claude/CLAUDE-agentflow.md",
      ".claude/README.md"
    ]
  }
}
```

**Infrastructure:**
```json
{
  "infrastructure": {
    "include": [
      ".start-work-hooks",
      ".github/workflows/agentflow-*.yml"
    ]
  }
}
```

**Namespace Rules:**
```json
{
  "namespaces": {
    "framework": "af-",
    "validation": {
      "enforceFrameworkPrefix": true
    }
  }
}
```

**Sync Behavior:**
```json
{
  "syncBehavior": {
    "settingsJsonStrategy": "merge-hooks",
    "backupBeforeSync": true,
    "validateAfterSync": true
  }
}
```

See [Template Manifest Schema](../reference/template-manifest-schema.md) for complete specification.

### Sync State Tracking

After each sync, `.claude/.sync/state.json` records:

```json
{
  "version": "2.0.0",
  "syncedAt": "2025-12-09T14:30:22Z",
  "sourceCommit": "bd38b4b",
  "sourcePath": "/srv/worktrees/agentflow/main",
  "syncedFiles": [
    ".claude/agents/af-bdd-agent.md",
    ".claude/skills/af-write-bdd-scenarios/SKILL.md",
    "..."
  ],
  "backupPath": ".claude/.sync/backup-20251209-143022/"
}
```

This enables:
- Version tracking (know what framework version is installed)
- Change detection (identify what needs updating)
- Rollback capability (restore from backup)
- Audit trail (when and what was synced)

## Brownfield Integration

### Initial Setup Flow

When running `/brownfield:add myproject`:

1. **Create stable worktree** at `/srv/worktrees/myproject/main`
2. **Detect tech stack** (Next.js, Python, etc.)
3. **Install dependencies** (`npm install` if package.json exists)
4. **Run initial sync:**
   ```bash
   npx ts-node /srv/worktrees/agentflow/main/.claude/scripts/sync/sync-from-agentflow.ts \
     --template /srv/worktrees/agentflow/main
   ```
5. **Create CLAUDE.md** customized for tech stack (imports framework)
6. **Commit and push** framework integration
7. **Configure docs portal** for project documentation

### What Brownfield Setup Creates

**From Sync:**
- Complete `.claude/` directory with framework assets
- `.start-work-hooks` for automatic worktree setup
- `.github/workflows/agentflow-*.yml` (if applicable)
- `.claude/.sync/state.json` for tracking

**Project-Specific:**
- `CLAUDE.md` with tech stack customization and framework import
- `docs/README.md` (if no docs exist)

### First Sync vs Updates

**Initial Sync (Brownfield):**
- Populates empty `.claude/` directory
- Creates all framework structure
- Sets up sync state from scratch
- No conflicts (nothing exists yet)

**Update Sync (Ongoing):**
- Compares existing vs template
- Shows what changed
- Preserves project customizations
- Merges configuration files

## Troubleshooting

### "Template path not found"

**Cause:** Cannot access AgentFlow template directory

**Solutions:**
```bash
# Verify template exists
ls -la /srv/worktrees/agentflow/main

# Check permissions
groups  # Should include devteam

# Run from your worktree
cd /srv/worktrees/myproject/{branch}
```

### "Namespace validation failed"

**Cause:** Framework assets missing `af-` prefix

**Example Error:**
```
Error: Framework asset missing af- prefix: .claude/agents/search-agent.md
```

**Solution:**
```bash
# Rename the file
mv .claude/agents/search-agent.md .claude/agents/af-search-agent.md

# Update references
grep -r "search-agent" .claude/ --files-with-matches | xargs sed -i 's/search-agent/af-search-agent/g'

# Re-run sync
/af:sync
```

### "Git working directory not clean"

**Cause:** Uncommitted changes in project

**Solutions:**
```bash
# Option 1: Commit changes first
git add . && git commit -m "WIP: Before framework sync"
/af:sync

# Option 2: Stash changes
git stash
/af:sync
git stash pop

# Option 3: Force sync (risky)
/af:sync --force
```

### "Settings.json merge conflict"

**Cause:** Complex settings structure conflicts

**Solution:**
```bash
# Backup your settings
cp .claude/settings.json .claude/settings.json.backup

# Run sync (will merge hooks)
/af:sync

# Review merged result
diff .claude/settings.json .claude/settings.json.backup

# Manually adjust if needed
vim .claude/settings.json
```

### "Node.js/npm not found"

**Cause:** Required for TypeScript sync script

**Solution:**
```bash
# Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x or higher
npm --version

# Re-run sync
/af:sync
```

### "Sync completed but tests failing"

**Cause:** Framework updates may change APIs or patterns

**Investigation:**
```bash
# Check what changed
git diff HEAD~1 .claude/

# Review sync state
cat .claude/.sync/state.json

# Check specific version changes
git log --oneline .claude/ | head -5

# Run specific tests
npm test -- --verbose
```

**Recovery:**
```bash
# Option 1: Rollback from backup
cp -r .claude/.sync/backup-*/.claude .

# Option 2: Revert commit
git revert HEAD

# Option 3: Fix compatibility issues
# Update your project code to match new framework patterns
```

### "Infrastructure files not syncing"

**Cause:** Template doesn't have infrastructure files

**Check:**
```bash
# Verify template has the files
ls /srv/worktrees/agentflow/main/.start-work-hooks
ls /srv/worktrees/agentflow/main/.github/workflows/

# Check manifest includes them
cat template-manifest.json | grep -A 5 infrastructure
```

**Solution:**
If files don't exist in template, they won't sync. This is normal - not all projects need all infrastructure.

### "Permission denied on sync"

**Cause:** File permissions prevent writing

**Solution:**
```bash
# Fix ownership (brownfield worktrees)
sudo chown -R tmux-shared:devteam .claude/
sudo chmod -R 2775 .claude/

# Verify you're in devteam group
groups | grep devteam

# Re-run sync
/af:sync
```

## Best Practices

### When to Sync

**Do sync:**
- ✅ When starting work on a project (get latest framework)
- ✅ After AgentFlow update announcements in `#engineering-team`
- ✅ When you need new framework features
- ✅ After framework bug fixes
- ✅ On any branch - main, develop, or feature branches

**Don't sync:**
- ❌ With uncommitted changes (commit or stash first)
- ❌ When tests are failing (fix issues first, then sync)

### Sync Workflow Best Practices

1. **Sync on any branch:**
   ```bash
   cd /srv/worktrees/myproject/{branch}  # Any worktree
   /af:sync
   ```

2. **Review changes before committing:**
   ```bash
   git diff .claude/
   git status
   ```

3. **Test after sync:**
   ```bash
   npm test
   npm run build  # If applicable
   ```

4. **Commit with clear message:**
   ```bash
   git add .claude/ .start-work-hooks .github/workflows/
   git commit -m "chore: Sync AgentFlow framework

   - [Brief description of what changed]

   Framework commit: bd38b4b"
   ```

### Version Management

**Track framework versions:**
```bash
# Check your current version
cat .claude/.sync/state.json | grep version

# Check latest available version
cat /srv/worktrees/agentflow/main/template-manifest.json | grep '"version"'

# View sync history
git log --oneline .claude/.sync/state.json
```

**Review changes before syncing:**
```bash
# Read the changelog
cat /srv/worktrees/agentflow/main/CHANGELOG.md

# Preview what sync would change
/af:sync --dry-run
```

**Stay informed:**
- Review `CHANGELOG.md` before syncing - lists all changes by version
- Check Zulip #agentflow channel for announcements
- Watch AgentFlow repository for releases

### Project Customization

**Safe to customize:**
- Your own agents/skills (without `af-` prefix)
- Root CLAUDE.md (framework imports, project adds)
- Project settings (hooks merged, not replaced)
- Project documentation in `docs/`

**Avoid customizing:**
- Framework agents/skills (with `af-` prefix) - sync will overwrite
- `.claude/docs/` - framework documentation
- `.claude/scripts/` - framework scripts
- Hook templates - copy and modify, don't edit originals

**If you need framework changes:**
- Propose them to AgentFlow repository
- They'll be included in next release
- All projects benefit from improvements

### Emergency Procedures

**Rollback after failed sync:**
```bash
# Find latest backup
ls -la .claude/.sync/

# Restore from backup
cp -r .claude/.sync/backup-20251209-143022/.claude .

# Verify restoration
git diff .claude/

# Commit if needed
git add .claude/ && git commit -m "Rollback: Restore pre-sync state"
```

**Sync state corruption:**
```bash
# Remove corrupted state
rm .claude/.sync/state.json

# Re-run sync (will create fresh state)
/af:sync
```

**Complete framework reset:**
```bash
# Nuclear option - removes all framework assets
rm -rf .claude/

# Re-run brownfield setup
cd /srv/worktrees/agentflow/main
claude
> /brownfield:add myproject --branch main
```

## Advanced Topics

### Custom Sync Configuration

Projects can customize sync behavior by modifying their local `template-manifest.json` (if needed):

```json
{
  "version": "2.0.0",
  "distributionModel": "git-sync",
  "syncBehavior": {
    "settingsJsonStrategy": "merge-hooks",
    "backupBeforeSync": true,
    "validateAfterSync": true,
    "excludePatterns": [
      ".claude/docs/project-specific-override.md"
    ]
  }
}
```

**Warning:** Customizing manifest can cause sync issues. Only do this if you understand the implications.

### Multiple Template Sources

Projects can sync from different AgentFlow versions:

```bash
# Sync from main (latest)
npx ts-node .claude/scripts/sync/sync-from-agentflow.ts \
  --template /srv/worktrees/agentflow/main

# Sync from stable release branch
npx ts-node .claude/scripts/sync/sync-from-agentflow.ts \
  --template /srv/worktrees/agentflow/v2.0-stable

# Sync from custom fork
npx ts-node .claude/scripts/sync/sync-from-agentflow.ts \
  --template /srv/worktrees/agentflow-custom/main
```

### Partial Sync

Sync specific components only:

```bash
# Sync only agents
npx ts-node .claude/scripts/sync/sync-from-agentflow.ts \
  --include ".claude/agents/af-*.md"

# Sync only documentation
npx ts-node .claude/scripts/sync/sync-from-agentflow.ts \
  --include ".claude/docs/**/*.md"
```

**Note:** Partial sync may leave framework in inconsistent state. Use with caution.

### CI/CD Integration

Automate framework version checks in CI:

```yaml
# .github/workflows/check-framework-version.yml
name: Check AgentFlow Version

on: [pull_request]

jobs:
  check-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check framework version
        run: |
          CURRENT=$(cat .claude/.sync/state.json | jq -r .version)
          LATEST=$(curl -s https://api.github.com/repos/org/agentflow/releases/latest | jq -r .tag_name)

          if [ "$CURRENT" != "$LATEST" ]; then
            echo "⚠️ Framework outdated: $CURRENT (latest: $LATEST)"
            echo "Run '/af:sync' to update"
          fi
```

## Related Documentation

- **[CHANGELOG.md](../../../CHANGELOG.md)** - Version history and release notes
- **[/af:sync Command](../../commands/af/sync.md)** - Command reference and examples
- **[Template Manifest Schema](../reference/template-manifest-schema.md)** - Manifest specification
- **[Brownfield Setup Command](../../commands/brownfield/add.md)** - Initial setup procedures
- **[Sync Script](../../scripts/sync/sync-from-agentflow.ts)** - Implementation details
- **[Framework Development Guide](./framework-development-guide.md)** - Contributing to AgentFlow

## Summary

The AgentFlow sync system enables:
- ✅ GitHub agent compatibility through physical file presence
- ✅ Version-controlled framework updates
- ✅ Project autonomy with safe customization
- ✅ Clear namespace separation (af- prefix)
- ✅ Automated brownfield setup
- ✅ Rollback capability via backups

**Key Takeaways:**
1. Sync replaces framework assets (`af-*` prefix) while preserving project assets
2. Settings and configuration are merged intelligently
3. Sync on any branch - main, develop, or feature branches are all fine
4. Review and test changes before committing
5. Backups enable safe rollback if needed

For questions or issues, consult the troubleshooting section or reach out in `#engineering-team` on Zulip.

---

**Framework Version:** 3.0.0
**Last Updated:** 2026-01-07
**Distribution Model:** git-sync
