---
# Claude Code slash command fields
description: Interactive introduction to AgentFlow for new team members

# Documentation system fields
title: AgentFlow Tour
created: 2026-01-06
updated: 2026-01-06
last_checked: 2026-01-06
tags: [command, onboarding, introduction, tour]
parent: ./README.md
related:
  - ../../skills/af-orchestration/SKILL.md
  - ../../docs/architecture/README.md
---

# /af:tour

Welcome to AgentFlow! I'll give you a guided introduction to the framework.

## What is AgentFlow?

AgentFlow is a **BDD-driven development framework** that helps structure AI-assisted software development. It guides work through four phases, ensures quality through automated checks, and maintains context across sessions.

**Key idea:** Instead of ad-hoc AI conversations, AgentFlow provides structured workflows that produce consistent, high-quality outputs.

## The Four Phases

```
┌─────────┐    ┌───────────┐    ┌──────────────┐    ┌──────────┐
│  Setup  │ → │ Discovery │ → │ Requirements │ → │ Delivery │
└─────────┘    └───────────┘    └──────────────┘    └──────────┘
     │              │                  │                  │
  Infra &       Explore &          BDD specs &        TDD impl &
  Config        Features           Approval           Testing
```

| Phase | Purpose | Output |
|-------|---------|--------|
| **Setup** | Infrastructure, environment | Working dev environment |
| **Discovery** | Explore problems, scope features | Linear Features, ADRs |
| **Requirements** | BDD specs, designs, approval | Mini-PRD with scenarios |
| **Delivery** | TDD implementation | Tested, deployed code |

## How It Works

**You talk to me, the orchestrator.** I coordinate everything:

- Load the right **skills** (knowledge about how to do things)
- Invoke **agents** (specialists for specific tasks)
- Track progress in **Linear** and **current-task.md**
- Enforce quality through **hooks** (automatic checks)

**You don't need to know all the internals.** Just tell me what you're working on, and I'll guide you through the appropriate workflow.

## Key Commands

| Command | When to Use |
|---------|-------------|
| `/task:start AF-123` | Begin work on a Linear issue |
| `/task:continue` | Resume your current task |
| `/requirements:refine AF-123` | Create BDD specs for a feature |
| `/af:sync` | Get latest framework updates |

## Your Role Matters

AgentFlow adapts to your role:

| If you're a... | You'll mainly... |
|----------------|------------------|
| **PM** | Approve requirements, plan milestones |
| **SE** | Implement features, write tests |
| **UX** | Create Storybook stories, verify designs |
| **QA** | Refine requirements, verify test coverage |

## Where Things Live

```
your-project/
├── CLAUDE.md           # Project-specific instructions
├── .claude/            # AgentFlow framework (don't edit af-* files)
│   ├── work/
│   │   └── current-task.md  # Your active task context
│   ├── skills/         # How-to knowledge
│   ├── agents/         # Specialist workers
│   └── docs/           # Framework documentation
└── docs/
    └── architecture/
        └── adr/        # Your project's architecture decisions
```

## Getting Started

**If this is a new project:**
1. Someone runs `/af:setup` from the AgentFlow worktree to add it to your project
2. You're ready to start work

**If AgentFlow is already in your project:**
1. Check Linear for available issues
2. Run `/task:start <issue-id>` to begin

**If you want to explore first:**
- Read `.claude/docs/architecture/README.md` for system overview
- Check `docs/architecture/adr/README.md` for project decisions

## Questions?

I'm here to help. You can ask me:

- "How does the Requirements phase work?"
- "What's a mini-PRD?"
- "How do I create a new feature?"
- "What tests should I write?"

**What would you like to know more about?**

1. **The four phases** - Detailed walkthrough of each phase
2. **Linear integration** - How work items flow through the system
3. **BDD and testing** - How scenarios become tests
4. **My first task** - Jump straight into working on an issue

Just tell me what interests you, or ask any question about the framework.
