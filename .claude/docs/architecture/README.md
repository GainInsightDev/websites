---
title: AgentFlow System Architecture
sidebar_label: Architecture
sidebar_position: 1
created: 2025-09-06
updated: 2026-01-06
last_checked: 2026-01-06
tags: [architecture, system-overview, v2]
parent: ../README.md
children:
  - ./capabilities-framework.md
---

# AgentFlow System Architecture (V2)

## Executive Summary

AgentFlow is a BDD-driven development framework that uses a **skills-based architecture** to orchestrate specialized AI agents through four distinct phases: Setup, Discovery, Requirements, and Delivery.

**Key V2 Changes:**
- **Single orchestrator** with process skills (vs. 4 separate orchestrators)
- **Thin agents** (~50 lines) referencing expertise skills
- **Skills layer** for progressive knowledge disclosure
- **Brownfield support** for existing projects

## Architecture Overview

### Skills-Based Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ USER                                                         │
│ - Requests work via commands or conversation                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ ORCHESTRATION (You ARE the orchestrator)                    │
│ Context: CLAUDE-agentflow.md (always loaded)                │
│ Detail: .claude/skills/af-orchestration/SKILL.md            │
│                                                              │
│ Responsibilities:                                            │
│ - Determine current phase/task                              │
│ - Load appropriate PROCESS skill                            │
│ - Make decisions, invoke agents, manage approvals           │
└───────┬──────────────────────────┬──────────────────────────┘
        │                          │
        │ loads                    │ invokes via Task tool
        ▼                          ▼
┌──────────────────────┐    ┌─────────────────────────────────┐
│ PROCESS SKILLS       │    │ AGENTS (~50 lines each)          │
│ .claude/skills/      │    │ .claude/agents/                  │
│ process/             │    │                                  │
│                      │    │ - af-bdd-agent                   │
│ - setup-process      │    │ - af-docs-quality-agent          │
│ - discovery-process  │    │ - af-dev-test-agent              │
│ - requirements-      │    │ - af-ux-design-agent             │
│   process            │    │ - af-work-management-agent       │
│ - delivery-process   │    │ - af-technical-writer-agent      │
│ - quality-process    │    │ - af-code-quality-agent          │
└───────┬──────────────┘    └────────┬─────────────────────────┘
        │                            │
        │ references                 │ loads
        │                            ▼
        │                   ┌─────────────────────────────────┐
        │                   │ EXPERTISE SKILLS                 │
        │                   │ .claude/skills/*/SKILL.md        │
        │                   │                                  │
        │                   │ - bdd-expertise                  │
        │                   │ - testing-expertise              │
        │                   │ - documentation-standards        │
        │                   │ - ux-design-expertise            │
        │                   │ - work-management-expertise      │
        │                   └────────┬─────────────────────────┘
        │                            │
        │ references                 │ references
        ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│ SOURCE MATERIALS                                             │
│ - Guides (.claude/docs/guides/)                             │
│ - Templates (.claude/templates/)                            │
│ - Scripts (.claude/scripts/)                                │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Progressive Disclosure**: Skills summarize knowledge; full details in docs
2. **Thin Agents**: Agents execute tasks, skills provide knowledge
3. **Single Orchestrator**: One coordinator loads phase-appropriate skills
4. **DRY Knowledge**: Documentation is source of truth, referenced not duplicated

## Four-Phase Workflow

### Phase 1: Setup

**Purpose**: Environment and infrastructure configuration

**For Brownfield Projects**:
- Run `/af:setup --type brownfield --repo <project>` from AgentFlow context
- Creates stable worktree, adds `.start-work-hooks`, creates `CLAUDE.md`
- Configures docs portal integration
- Process orchestrated by `af-setup-process` skill

**For Greenfield Projects**:
- Initialize AWS Amplify infrastructure
- Set up Next.js project structure
- Configure testing frameworks

**Process Skill**: `setup-process.md`

### Phase 2: Discovery

**Purpose**: Problem exploration and feature scoping

**Actions**:
1. Context gathering (4 systematic questions)
2. Optional external research
3. Create Linear Features with proper labels

**Outputs**:
- Project overview documentation
- Linear Epic + Features
- Technical ADRs for major decisions

**Process Skill**: `discovery-process.md`

### Phase 3: Requirements

**Purpose**: BDD specification with human approval

**Three Amigos Analysis** (AI simulating perspectives):
- Business: User experience, compliance
- Development: Technical implementation, complexity
- QA: Edge cases, testability

**Outputs**:
- Mini-PRD with complete specifications
- Markdown scenarios in mini-PRDs
- Storybook stories for UI components
- Human approval before Delivery

**Process Skill**: `requirements-process.md`

### Phase 4: Delivery

**Purpose**: TDD implementation from specifications

**Cycle**: Red → Green → Refactor
1. Write failing tests from Markdown scenarios
2. Implement to make tests pass
3. Refactor for quality

**Process Skill**: `delivery-process.md`

## Component Details

### Orchestration

**Core Context**: `CLAUDE-agentflow.md` (always loaded)
**Detailed Workflow**: `.claude/skills/af-orchestration/SKILL.md`

Orchestration responsibilities:
- Identifies current phase from context
- Loads appropriate process skill
- Invokes agents via Task tool
- Manages human approval gates

### Process Skills

**Location**: `.claude/skills/<skill-name>/SKILL.md`

| Skill | Purpose |
|-------|---------|
| `af-setup-process` | Infrastructure setup workflow |
| `af-discovery-process` | Problem exploration workflow |
| `af-requirements-process` | BDD specification workflow |
| `af-delivery-process` | TDD implementation workflow |
| `af-quality-process` | Validation and quality workflow |

### Expertise Skills

**Location**: `.claude/skills/<skill-name>/SKILL.md`

| Skill | Purpose |
|-------|---------|
| `af-bdd-expertise` | Markdown scenario patterns, glossary compliance |
| `af-testing-expertise` | TDD/BDD, Jest, Playwright patterns |
| `af-documentation-standards` | Metadata, linking requirements |
| `af-ux-design-expertise` | Storybook, component specs |
| `af-work-management-expertise` | Linear workflows, task state, compaction recovery |

### Agents

**Location**: `.claude/agents/`

Thin agents (~50 lines) that:
- Load expertise skills for domain knowledge
- Execute specific tasks
- Return results to orchestrator

| Agent | Purpose |
|-------|---------|
| `af-bdd-agent` | Transform requirements to Markdown scenarios |
| `af-docs-quality-agent` | Documentation validation |
| `af-dev-test-agent` | Test implementation and execution |
| `af-ux-design-agent` | Storybook stories, component specs |
| `af-work-management-agent` | Linear integration |
| `af-technical-writer-agent` | Documentation authoring |
| `af-docs-retrofit-agent` | Retrofit documentation standards to existing codebases |
| `af-architecture-quality-agent` | Validate system architecture and ADR compliance |
| `af-code-quality-agent` | Code quality checks and validation |

## Context Preservation

### Multi-Session Continuity

Context is preserved across sessions via:

1. **Linear Issues**: Business context, requirements, progress
2. **current-task.md**: Technical implementation context
3. **Markdown Scenarios**: Executable specifications
4. **Git History**: Implementation audit trail

### Session Handoff Pattern

```markdown
# .claude/work/current-task.md

## Context
- Linear Issue: AF-123 (User Authentication)
- Phase: Delivery
- Sub-issues: AF-124 (BDD), AF-125 (Visual), AF-126 (API)

## Current Implementation Status
- [x] Playwright tests written (Red phase)
- [ ] Authentication components (in progress)
- [ ] GraphQL resolvers (pending)

## Next Steps
1. Complete Login component
2. Add AWS Cognito integration
3. Run tests (Green phase)
```

## File System Layout

```
project/
├── .claude/                    # AgentFlow framework (symlinked)
│   ├── CLAUDE-agentflow.md     # Core orchestration context (always loaded)
│   ├── agents/                 # Thin agent definitions
│   ├── skills/                 # Knowledge layer
│   │   ├── af-orchestration/   # Detailed orchestration workflows
│   │   ├── af-*-process/       # Phase-specific workflow skills
│   │   └── af-*-expertise/     # Domain expertise skills
│   ├── commands/               # Slash commands
│   ├── hooks/                  # Claude Code hooks
│   ├── docs/                   # Framework documentation
│   ├── templates/              # Reusable templates
│   ├── scripts/                # Utility scripts
│   │   ├── documentation/      # Validation scripts
│   │   └── brownfield/         # Setup scripts
│   ├── lib/                    # Shared utilities
│   └── work/                   # Local working files
│       └── current-task.md     # Active task context
├── CLAUDE.md                   # Project instructions (imports AgentFlow)
├── features/                   # E2E test specifications
├── stories/                    # Storybook component stories
└── docs/
    └── glossary.yml            # BDD vocabulary
```

## Integration Points

### MCP Servers

| Server | Purpose | Used By |
|--------|---------|---------|
| **Linear** | Project management | af-work-management-agent |
| **ShadCN** | UI components | ux-design-agent |
| **Context7** | Documentation research | Various agents |

### Hooks

AgentFlow uses Claude Code hooks (PreToolUse):

| Hook | Trigger | Purpose |
|------|---------|---------|
| `git-commit-reminder.sh` | `git commit` | Validation reminder |

### Docs Portal

Projects can integrate with the shared docs portal:
- Configuration: `project-registry set <project> docs.branch <branch>` and `project-registry set <project> docs.subpath docs`
- Rebuild: `/srv/docs-portal/scripts/update-docs.sh`
- URL: `https://docs.gaininsight.co.uk/{project}`
- Query: `project-registry docs-sources` to list all configured sources

## Brownfield vs Greenfield

### Brownfield (Existing Projects)

```bash
# From AgentFlow context
/af:setup --type brownfield --repo myproject
```

- Orchestrated by `af-setup-process` skill
- Creates stable worktree
- Adds `.start-work-hooks` (symlinks AgentFlow on feature worktree creation)
- Creates customized `CLAUDE.md`
- Syncs AgentFlow V2 framework to `.claude/`
- Keeps existing tech stack

**After setup**, run `/docs:audit-project` to assess documentation state, then optionally use `af-docs-retrofit-agent` to retrofit AgentFlow documentation standards to existing docs.

### Greenfield (New Projects)

- Full AWS Amplify infrastructure
- Next.js + TypeScript + Tailwind + shadcn/ui
- Complete testing stack (Jest, Playwright, Storybook)
- 15-phase setup process

## Quality Gates

Every feature must pass:

1. **Specification**: Markdown scenarios cover all paths
2. **Implementation**: All tests passing
3. **Documentation**: docs-quality-agent validates
4. **Human Approval**: Requirements phase sign-off

## ADR References

### Framework ADRs

Framework architectural decisions (how AgentFlow itself is built) are in the AgentFlow source repository under `.agentflow/adr/`. These are not synced to consumer projects.

Key framework decisions:
- **Testing Without Cucumber** - AgentFlow uses Playwright directly with Markdown scenarios
- **Lightweight Layered Architecture** - V2 skills-based approach
- **BDD Integration Strategy** - How BDD flows through phases

### Project ADRs

Consumer projects should create their own ADRs in `docs/architecture/adr/`. Use the ADR template and index template from `.claude/templates/`:
- `adr-template.md` - Structure for individual ADRs
- `adr-index.md` - Summary index for quick agent reference

See `af-architecture-expertise` skill for ADR lifecycle guidance.

---

**Framework Version**: 2.0
**Last Updated**: 2026-01-03
