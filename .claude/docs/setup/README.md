---
title: AgentFlow Technical Requirements
sidebar_label: Setup
sidebar_position: 2
created: 2025-09-06
updated: 2025-12-02
last_checked: 2025-12-02
tags: [technical-requirements, stack-requirements, setup]
parent: ../README.md
---

# AgentFlow Technical Requirements

## Overview

This document describes the technical requirements for using AgentFlow. Requirements differ based on whether you're adding AgentFlow to an existing project (brownfield) or starting fresh (greenfield).

## Core Requirements (All Projects)

These are required regardless of project type:

### Development Environment

| Requirement | Details |
|-------------|---------|
| **Claude Code CLI** | Framework designed specifically for Claude Code |
| **Node.js** | Version 20.x or later |
| **Git** | Required for version control and workflow |
| **Linear Account** | Project management integration (mandatory) |

### MCP Servers

| Server | Status | Purpose |
|--------|--------|---------|
| **Linear** | Required | Project management, issue tracking |
| **ShadCN** | Recommended | UI component library |
| **Context7** | Optional | Technical documentation research |
| **Sentry** | Optional | Error monitoring |

### AgentFlow Setup

| Requirement | Details |
|-------------|---------|
| **AgentFlow Main Worktree** | `/srv/worktrees/agentflow/main` |
| **Symlinked .claude/** | Via `agentflow-setup.sh` or `.start-work-hooks` |
| **CLAUDE.md** | Must import `@.claude/CLAUDE-agentflow.md` |

---

## Brownfield Requirements (Existing Projects)

For adding AgentFlow to an existing project, you keep your existing stack. AgentFlow adds:

### What You Get

- BDD workflow (Discovery → Requirements → Delivery)
- Documentation quality tooling
- Linear integration for task management
- Slash commands and agent access

### What You Keep

- Your existing frontend framework (React, Vue, etc.)
- Your existing backend/database
- Your existing auth system
- Your existing deployment pipeline

### Setup Checklist

```
[ ] Bare repo exists at /srv/repos/{project}.git
[ ] Run /af:setup from AgentFlow context (select "Brownfield")
[ ] Verify .start-work-hooks committed to repo
[ ] Verify CLAUDE.md created and imports AgentFlow
[ ] Run /docs:audit-project to assess documentation
```

---

## Greenfield Requirements (New Projects)

For new projects using AgentFlow's opinionated stack:

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14+ with App Router | React framework |
| **TypeScript** | Required | Type safety |
| **Tailwind CSS** | Latest | Styling |
| **shadcn/ui** | Latest | Component library |

### Infrastructure (AWS)

| Service | Purpose |
|---------|---------|
| **AWS Amplify** | Deployment, SSR hosting |
| **DynamoDB** | Database via Amplify DataStore |
| **Cognito** | Authentication via Amplify Auth |
| **AppSync** | GraphQL API via Amplify API |
| **S3** | File storage via Amplify Storage |

### Testing Stack

| Tool | Purpose |
|------|---------|
| **Jest** | Unit testing |
| **Playwright** | E2E testing |
| **Storybook** | Component documentation/testing |

### Required Directory Structure

```
project/
├── features/           # E2E test specifications
├── stories/            # Storybook stories
├── docs/
│   └── glossary.yml    # BDD vocabulary
├── amplify/            # AWS Amplify config
└── .claude/            # AgentFlow (symlinked)
```

### Setup Checklist

```
[ ] AWS credentials configured
[ ] Amplify CLI installed
[ ] Run Setup phase for infrastructure initialization
[ ] Verify Amplify sandbox starts
[ ] MCP servers configured (Linear, ShadCN, Context7)
[ ] Test frameworks installed and working
```

---

## Quality Tools

### Validation Scripts

Available via npm scripts (when configured):

```bash
npm run validate:docs       # Documentation validation
npm run validate:links      # Link verification
npm run validate:frontmatter # Frontmatter validation
npm run check:stale         # Stale documentation check
```

### Claude Code Hooks

AgentFlow uses Claude Code hooks (not git hooks):

| Hook | Purpose |
|------|---------|
| `git-commit-reminder.sh` | Reminds to validate before commits |

Hooks work automatically via symlinked `.claude/` directory.

---

## Environment Variables

### Brownfield (Minimal)

```bash
# Linear (required)
LINEAR_API_KEY=lin_api_xxxxx
```

### Greenfield (Full Stack)

```bash
# Linear (required)
LINEAR_API_KEY=lin_api_xxxxx

# AWS (for Amplify)
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=eu-west-2

# Optional
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

## Troubleshooting

### "Linear MCP not configured"

Ensure Linear MCP server is configured in Claude Code settings with valid API key.

### "AgentFlow symlinks missing"

Run the setup script:
```bash
/srv/worktrees/agentflow/main/.claude/scripts/brownfield/agentflow-setup.sh
```

### "Amplify sandbox fails" (Greenfield)

Check AWS credentials:
```bash
aws sts get-caller-identity
amplify sandbox --help
```

---

**See Also:**
- [System Architecture](../architecture/README.md) - Framework architecture
- [Brownfield Setup](../../scripts/brownfield/README.md) - Brownfield onboarding
- [AWS Amplify Guide](../guides/aws-amplify-guide.md) - Greenfield infrastructure
