---
title: Greenfield CLAUDE.md Template
created: 2026-01-02
updated: 2026-02-18
last_checked: 2026-02-18
tags: [template, setup, greenfield]
parent: ./README.md
---

# {PROJECT_NAME}

@.claude/CLAUDE-agentflow.md

## Project Links
- **Linear Team**: {LINEAR_KEY} - https://linear.app/gaininsight/team/{LINEAR_KEY}
- **GitHub**: https://github.com/{GITHUB_ORG}/{REPO_NAME}
{SLACK_LINE}

## Project Context
{PROJECT_DESCRIPTION}

## Tech Stack

{STACK_SECTION}

## Development

This project uses AgentFlow for BDD-driven development.

### Getting Started

{GETTING_STARTED_SECTION}

### Commands

{COMMANDS_SECTION}

### Current Status
- Initial setup complete
- Stack: {STACK_SUMMARY}
- Components: {COMPONENTS_SUMMARY}

---

## Template Variables

When generating CLAUDE.md, replace these placeholders:

| Variable | Description |
|----------|-------------|
| `{PROJECT_NAME}` | Project display name |
| `{LINEAR_KEY}` | Linear team key (e.g., CRM) |
| `{GITHUB_ORG}` | GitHub organization |
| `{REPO_NAME}` | Repository name |
| `{ZULIP_LINE}` | `- **Zulip**: #channel` or empty |
| `{PROJECT_DESCRIPTION}` | From user or vision doc |
| `{STACK_SECTION}` | Stack-specific content (see below) |
| `{GETTING_STARTED_SECTION}` | Stack-specific getting started |
| `{COMMANDS_SECTION}` | Stack-specific npm commands |
| `{STACK_SUMMARY}` | One-line stack description |
| `{COMPONENTS_SUMMARY}` | List of included components |

---

## Stack-Specific Sections

### For Next.js + Amplify (GainInsight Standard)

**STACK_SECTION:**
```markdown
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router) |
| Backend | AWS Amplify Gen 2 |
| Database | DynamoDB (via AppSync) |
| Auth | Amazon Cognito |
| Hosting | AWS Amplify Hosting |
```

**GETTING_STARTED_SECTION:**
```markdown
1. Create a feature worktree: `start-work {repo-name} {ISSUE-ID}`
2. Start local sandbox: `npx ampx sandbox`
3. Run dev server: `npm run dev`
4. Follow AgentFlow workflow: Discovery → Refinement → Delivery
```

**COMMANDS_SECTION:**
```markdown
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server |
| `npx ampx sandbox` | Deploy personal AWS sandbox |
| `npm run test:unit` | Run Jest unit tests |
| `npm run test:e2e:local` | Run Playwright E2E (via Doppler) |
| `npm run build` | Production build |
```

---

### For Minimal (Framework Only)

**STACK_SECTION:**
```markdown
| Layer | Technology |
|-------|------------|
| Framework | AgentFlow |
| Runtime | Node.js |

This is a minimal setup with just the AgentFlow framework.
Add your own tech stack as needed.
```

**GETTING_STARTED_SECTION:**
```markdown
1. Install dependencies: `npm install`
2. Add your tech stack (frontend, backend, etc.)
3. Follow AgentFlow workflow: Discovery → Refinement → Delivery
```

**COMMANDS_SECTION:**
```markdown
| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm test` | Run tests (when configured) |
```
