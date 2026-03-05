---
title: Template Manifest Schema Reference
sidebar_label: Manifest Schema
sidebar_position: 5
created: 2025-12-09
updated: 2025-12-09
last_checked: 2025-12-09
tags: [reference, manifest, sync, schema, v2]
parent: ./README.md
---

# Template Manifest Schema Reference

The `template-manifest.json` file defines how AgentFlow framework is distributed to projects via the sync system.

## Overview

**Location:** `/template-manifest.json` (AgentFlow repository root)

**Purpose:**
- Define which files are framework vs project-specific
- Specify namespace conventions (af- prefix)
- Configure sync behavior and validation rules
- Track compatibility requirements

**Version:** 2.0.0 (V2 architecture with skills)

## Schema Structure

### Root Fields

```json
{
  "version": "2.0.0",
  "description": "Human-readable description",
  "templateRepo": "git@github.com:organization/agentflow.git",
  "distributionModel": "git-sync"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Semantic version of manifest schema |
| `description` | string | Human-readable description of manifest |
| `templateRepo` | string | Git URL of AgentFlow repository |
| `distributionModel` | string | Distribution strategy (always "git-sync" for V2) |

### framework

Defines framework files that get synced to projects.

```json
{
  "framework": {
    "description": "Framework files synced to projects (all have af- prefix)",
    "include": [
      ".claude/agents/af-*.md",
      ".claude/skills/af-*/SKILL.md",
      ".claude/skills/af-*/**/*.md",
      ".claude/commands/af/**/*.md",
      ".claude/docs/**/*.md",
      ".claude/scripts/**/*",
      ".claude/templates/**/*",
      ".claude/hooks/**/*",
      ".claude/lib/**/*",
      ".claude/settings.json",
      ".claude/CLAUDE-agentflow.md",
      ".claude/README.md"
    ],
    "exclude": [
      ".claude/work/**",
      ".claude/plans/**",
      ".claude/.sync/**"
    ]
  }
}
```

**include patterns:**
- Uses glob patterns for file matching
- All agents and skills use `af-*` prefix pattern
- Skills require `/SKILL.md` file and support nested docs
- Commands use `/af/` directory namespace
- Orchestrators, docs, scripts, templates, hooks, lib are all framework

**exclude patterns:**
- Temporary or project-specific directories
- Sync state tracking
- Local work artifacts

### infrastructure

Infrastructure files outside `.claude/` directory.

```json
{
  "infrastructure": {
    "description": "Infrastructure files for CI/CD and automation",
    "include": [
      ".github/workflows/agentflow-*.yml",
      ".start-work-hooks"
    ]
  }
}
```

**Why separate from framework:**
- Lives outside `.claude/` directory
- CI/CD workflows (GitHub Actions)
- Brownfield setup automation hooks
- Namespaced with `agentflow-*` prefix for workflows

### projectSpecific

Defines project assets that must be preserved during sync.

```json
{
  "projectSpecific": {
    "description": "Project assets preserved during sync (no af- prefix)",
    "preserve": [
      "CLAUDE.md",
      ".claude/work/**",
      ".claude/plans/**",
      ".claude/.sync/**",
      ".claude/settings.local.json",
      ".claude/**/*.local.*",
      ".claude/**/current-*.md"
    ],
    "preservePattern": "^(?!af-).*",
    "comment": "All agents, skills, commands without af- prefix are project-specific"
  }
}
```

**preserve array:**
- Explicit files/patterns that NEVER get overwritten
- `CLAUDE.md` - Project-specific instructions
- `.claude/work/` - Current task tracking
- `.claude/plans/` - Project plans
- `.local.*` files - Local overrides

**preservePattern:**
- Regex pattern for namespace-based preservation
- `^(?!af-).*` - Matches anything NOT starting with `af-`
- Automatically preserves project agents/skills/commands

**Example preservation:**
```
✅ Preserved (project-specific):
  - umii-deployment-agent.md
  - umii-apollo-graphql/
  - .claude/work/current-task.md
  - CLAUDE.md

❌ Overwritten (framework):
  - af-bdd-agent.md
  - af-testing-expertise/
  - .claude/docs/standards/
```

### namespaces

Namespace conventions and validation rules.

```json
{
  "namespaces": {
    "framework": "af-",
    "instructions": [
      "Framework assets MUST use 'af-' prefix",
      "Example: af-bdd-agent.md, af-bdd-expertise/",
      "Project assets should use '{project-name}-' prefix",
      "Example: umii-deployment-agent.md, umii-apollo-graphql/",
      "Sync preserves all non-af- prefixed assets automatically"
    ],
    "validation": {
      "enforceFrameworkPrefix": true,
      "warnOnCollisions": true,
      "requireProjectPrefix": false
    }
  }
}
```

**Namespace strategy:**
- **Framework:** `af-` prefix (AgentFlow)
- **Project:** `{project-name}-` prefix (e.g., `umii-`, `portal-`)
- **Separation:** By naming convention, NOT directory structure

**Validation options:**
- `enforceFrameworkPrefix` - Fail sync if framework assets lack `af-`
- `warnOnCollisions` - Warn if project asset matches framework pattern
- `requireProjectPrefix` - Optionally enforce project naming (false for flexibility)

### syncBehavior

How sync operations behave.

```json
{
  "syncBehavior": {
    "description": "How sync operations behave",
    "mode": "merge",
    "settingsJsonStrategy": "merge-hooks",
    "conflictResolution": "prompt",
    "backupBeforeSync": true,
    "validateAfterSync": false,
    "comment": "Claude handles post-sync validation conversationally"
  }
}
```

| Field | Options | Description |
|-------|---------|-------------|
| `mode` | merge, replace | Merge preserves project files, replace overwrites all |
| `settingsJsonStrategy` | merge-hooks, replace, skip | How to handle settings.json (hooks merge) |
| `conflictResolution` | prompt, auto, skip | How to handle conflicts |
| `backupBeforeSync` | boolean | Create .claude.backup.* before sync |
| `validateAfterSync` | boolean | Run validation scripts (false - Claude handles) |

**settingsJsonStrategy: "merge-hooks"**

Settings.json hooks from multiple sources run in parallel:
```json
// Framework settings.json
{
  "hooks": {
    "stop": ["framework-hook-1", "framework-hook-2"]
  }
}

// Project settings.local.json
{
  "hooks": {
    "stop": ["project-hook-1"]
  }
}

// Result: All three hooks run
```

### gitSetup

Git configuration for synced projects.

```json
{
  "gitSetup": {
    "description": "Git configuration (Claude Code hooks, not .git/hooks)",
    "initIfMissing": false,
    "hooks": "via-settings-json",
    "gitignorePatterns": [
      ".claude/.sync/",
      ".claude/work/current-*",
      ".claude/logs/",
      ".claude/reports/",
      "*.local.json",
      ".claude/validation-state.json",
      ".claude.backup.*"
    ]
  }
}
```

**Key decisions:**
- ✅ **Claude Code hooks** via `.claude/settings.json`
- ❌ **NOT .git/hooks/** (incompatible with Claude Code)
- `initIfMissing: false` - Projects already have git
- `gitignorePatterns` - Patterns to add to project .gitignore

### packageJsonScripts

Scripts added to project package.json.

```json
{
  "packageJsonScripts": {
    "description": "Scripts to add to target project's package.json",
    "scripts": {
      "agentflow:sync": "npx ts-node .claude/scripts/sync/sync-from-agentflow.ts",
      "agentflow:sync:dry-run": "npx ts-node .claude/scripts/sync/sync-from-agentflow.ts --dry-run",
      "agentflow:validate": "npx ts-node .claude/scripts/documentation/validate-frontmatter.ts",
      "agentflow:check-stale": "npx ts-node .claude/scripts/documentation/check-stale-docs.ts"
    }
  }
}
```

**Usage in projects:**
```bash
npm run agentflow:sync          # Sync latest framework
npm run agentflow:sync:dry-run  # Preview changes
npm run agentflow:validate      # Validate documentation
npm run agentflow:check-stale   # Find stale docs
```

### changelog

Framework update tracking and notifications.

```json
{
  "changelog": {
    "description": "Track framework updates",
    "location": "CHANGELOG.md",
    "notificationChannels": ["zulip"],
    "zulipStream": "#engineering-team",
    "zulipTopic": "framework-updates"
  }
}
```

**Workflow:**
1. Update CHANGELOG.md with changes
2. Developers sync when ready (`npm run agentflow:sync`)
3. Zulip notification to #engineering-team
4. No Linear tasks created (manual sync workflow)

### compatibility

Minimum version requirements.

```json
{
  "compatibility": {
    "minNodeVersion": "18.0.0",
    "minClaudeCodeVersion": "1.0.0",
    "targetProjects": ["umii", "customer-portal", "analytics-dashboard"]
  }
}
```

Sync script can validate compatibility before proceeding.

### metadata

Tracking information.

```json
{
  "metadata": {
    "created": "2024-09-05",
    "updated": "2025-12-09",
    "author": "AgentFlow Team",
    "schemaVersion": "2.0"
  }
}
```

## Validation Rules

### Framework Asset Validation

All framework assets MUST:
1. ✅ Use `af-` prefix
2. ✅ Match include patterns
3. ✅ Not match exclude patterns
4. ✅ Follow Claude Code discovery patterns

**Claude Code discovery requirements:**
- Agents: `.claude/agents/*.md` (flat)
- Skills: `.claude/skills/*/SKILL.md` (one level)
- Commands: `.claude/commands/**/*.md` (recursive)

### Project Asset Validation

Project assets SHOULD:
1. Use `{project-name}-` prefix for clarity
2. NOT use `af-` prefix (reserved for framework)
3. Follow same structural patterns as framework

### Sync State Tracking

Each synced project maintains state at `.claude/.sync/state.json`:

```json
{
  "version": "2.0.0",
  "syncedAt": "2025-12-09T12:00:00Z",
  "commit": "abc123def456",
  "files": [
    ".claude/agents/af-bdd-agent.md",
    ".claude/skills/af-bdd-expertise/SKILL.md"
  ]
}
```

## Usage

### Reading the Manifest

```typescript
import * as fs from 'fs';
import * as path from 'path';

interface TemplateManifest {
  version: string;
  framework: {
    include: string[];
    exclude: string[];
  };
  namespaces: {
    framework: string;
    validation: {
      enforceFrameworkPrefix: boolean;
    };
  };
  // ... other fields
}

const manifestPath = path.join(__dirname, '../../template-manifest.json');
const manifest: TemplateManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
```

### Validating Framework Assets

```typescript
function isFrameworkAsset(filePath: string, manifest: TemplateManifest): boolean {
  const filename = path.basename(filePath);
  return filename.startsWith(manifest.namespaces.framework);
}

function validateFrameworkPrefix(filePath: string, manifest: TemplateManifest): boolean {
  if (isFrameworkCandidate(filePath)) {
    const filename = path.basename(filePath);
    if (!filename.startsWith(manifest.namespaces.framework)) {
      console.warn(`Framework asset missing af- prefix: ${filePath}`);
      return false;
    }
  }
  return true;
}
```

### Checking Preservation

```typescript
function shouldPreserve(filePath: string, manifest: TemplateManifest): boolean {
  // Check explicit preserve list
  for (const pattern of manifest.projectSpecific.preserve) {
    if (minimatch(filePath, pattern)) {
      return true;
    }
  }

  // Check namespace pattern
  const filename = path.basename(filePath);
  const preserveRegex = new RegExp(manifest.projectSpecific.preservePattern);
  return preserveRegex.test(filename);
}
```

## Migration from V1

**V1 → V2 changes:**

| Change | V1 | V2 |
|--------|----|----|
| Skills | ❌ None | ✅ `.claude/skills/af-*/SKILL.md` |
| Namespace | Directory-based | Prefix-based (`af-`) |
| Hooks | `.git/hooks/` | `.claude/settings.json` |
| Infrastructure | ❌ None | ✅ `.github/workflows/`, `.start-work-hooks` |
| Settings merge | Replace | Merge hooks |

**Migration script handles:**
- Removing old symlinks
- Applying new namespace structure
- Converting hooks to settings.json
- Initial sync with V2 manifest

## See Also

- [Sync Modernization Plan](../../.agentflow/planning/sync-modernization-plan.md) - Implementation roadmap
- [Framework Sync Guide](../guides/framework-sync.md) - User guide for syncing
- [V2 Architecture](../architecture/README.md) - Overall V2 design
- [Brownfield Setup](../guides/brownfield-setup.md) - Setting up new projects

---

**Schema Version:** 2.0
**Last Updated:** 2025-12-09
**Status:** Active
