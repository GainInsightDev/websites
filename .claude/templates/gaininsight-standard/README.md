---
title: GainInsight Standard Templates
created: 2025-12-11
updated: 2026-01-05
last_checked: 2026-01-05
tags: [templates, gaininsight, infrastructure, hooks]
parent: ../README.md
children:
  - ./hello-world-app/README.md
  - ./cicd/README.md
  - ./docs/README.md
code_files:
  - ./.git-hook-helpers.sh.template
  - ./.start-work-hooks.template
  - ./.stop-work-hooks.template
  - ./amplify.yml.template
  - ./.github/workflows/claude-code-review.yml.template
related:
  - ../../skills/af-setup-gaininsight-stack/SKILL.md
---

# GainInsight Standard Templates

Templates for GainInsight Standard project setup (Layer 1).

## Files

| Template | Target | Purpose |
|----------|--------|---------|
| `.git-hook-helpers.sh.template` | `.git-hook-helpers.sh` | Shared helper functions for hooks |
| `.start-work-hooks.template` | `.start-work-hooks` | Sandbox deployment, dev server startup |
| `.stop-work-hooks.template` | `.stop-work-hooks` | Cleanup, sandbox deletion |
| `amplify.yml.template` | `amplify.yml` | Amplify Gen 2 build configuration |
| `.github/workflows/claude-code-review.yml.template` | `.github/workflows/claude-code-review.yml` | Automated PR review with Claude Code |

## Template Variables

Replace these placeholders when copying templates:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{project-name}}` | Doppler project name | `aft` |
| `{{doppler-config}}` | Doppler config for dev | `dev` |
| `{{region}}` | AWS region | `eu-west-2` |
| `{{base-branch}}` | Target branch for PRs | `develop` or `main` |

## Installation

During Layer 1 setup, copy templates to the project root and replace variables:

```bash
# Copy and process templates
sed -e 's/{{project-name}}/aft/g' \
    -e 's/{{doppler-config}}/dev/g' \
    -e 's/{{region}}/eu-west-2/g' \
    .git-hook-helpers.sh.template > .git-hook-helpers.sh

sed -e 's/{{project-name}}/aft/g' \
    -e 's/{{doppler-config}}/dev/g' \
    -e 's/{{region}}/eu-west-2/g' \
    .start-work-hooks.template > .start-work-hooks

sed -e 's/{{project-name}}/aft/g' \
    -e 's/{{doppler-config}}/dev/g' \
    -e 's/{{region}}/eu-west-2/g' \
    .stop-work-hooks.template > .stop-work-hooks

# Make executable
chmod +x .git-hook-helpers.sh .start-work-hooks .stop-work-hooks

# Copy amplify.yml (no variables to replace)
cp amplify.yml.template amplify.yml
```

### GitHub Workflows (Layer 4)

Install the Claude Code Review workflow during CI/CD setup:

```bash
# Create workflows directory if needed
mkdir -p .github/workflows

# Copy and configure the workflow
sed -e 's/{{base-branch}}/develop/g' \
    .github/workflows/claude-code-review.yml.template > .github/workflows/claude-code-review.yml
```

**Required GitHub Secrets:**
- `CLAUDE_CODE_OAUTH_TOKEN`: Your Anthropic OAuth token for Claude Code

**Optional Secrets (for Linear integration):**
- `LINEAR_API_KEY`: Linear API key for creating issues from reviews
- `LINEAR_TEAM_ID`: Your Linear team UUID

## Integration with GI Server

These hooks integrate with the GainInsight server's `start-work` and `stop-work` scripts:

1. Developer runs `start-work AF-123`
2. GI server creates/navigates to worktree
3. GI server looks for `.start-work-hooks` and executes it
4. Hook deploys sandbox, starts dev server, tracks state

Similarly for cleanup:
1. Developer runs `stop-work AF-123`
2. GI server calls `.stop-work-hooks`
3. Hook kills processes, deletes CloudFormation stack, cleans artifacts
4. GI server removes worktree

## State Management

Hooks maintain state in `/tmp/.hooks-state-{ISSUE_KEY}`:
- Process PIDs (sandbox, dev server)
- Configuration (port, region, sandbox ID)
- Status flags (sandbox ready, dev ready)

This enables:
- Resume after interruption
- Clean shutdown on stop-work
- Multiple isolated sandboxes per branch
