---
title: AgentFlow Documentation
sidebar_label: Documentation
sidebar_position: 2
created: 2025-09-05
updated: 2026-01-03
last_checked: 2026-01-03
tags: [documentation, root, index, introduction]
parent: ../README.md
children:
  - ./architecture/README.md
  - ./setup/README.md
  - ./guides/README.md
  - ./standards/README.md
  - ./reference/README.md
---

# AgentFlow

**A BDD-driven development framework that orchestrates AI agents through structured phases.**

## What is AgentFlow?

AgentFlow provides a systematic approach to AI-assisted software development:

- **Four-Phase Workflow**: Setup → Discovery → Refinement → Delivery
- **BDD-First Development**: All features start with Markdown scenario specifications
- **Human-in-the-Loop**: Critical decisions require explicit approval
- **Context Preservation**: Maintains state across sessions via Linear integration
- **Quality Automation**: Documentation and code quality enforced via hooks

## Two Ways to Use AgentFlow

### Brownfield (Existing Projects)

Add AgentFlow to your existing project to get the BDD workflow, documentation quality tooling, and Linear integration. Your existing tech stack stays as-is.

```bash
# From AgentFlow context
/af:setup --type brownfield --repo your-project
```

See: [Setup Guide](./guides/setup-guide.md)

### Greenfield (New Projects)

Start fresh with AgentFlow's opinionated stack: Next.js, AWS Amplify, TypeScript, shadcn/ui, and full testing infrastructure.

See: [Technical Requirements](./setup/README.md) for the full stack details.

## Core Mental Models

### 1. Claude Code Capabilities (The Platform)

AgentFlow is built on Claude Code's primitives. Understanding these dimensions helps understand why AgentFlow is structured as it is:

| Dimension | What It Is | AgentFlow Example |
|-----------|-----------|-------------------|
| **CONTEXT** | Always-loaded instructions | `CLAUDE-agentflow.md`, `current-task.md` |
| **WHO** | Main agent vs sub-agents | Orchestrator (main) invokes specialized agents |
| **HOW** | Skills (methodology) | Process skills, expertise skills |
| **AGENCY** | MCP/Tools (capabilities) | Linear, ShadCN, Context7 integrations |
| **WHEN** | Hooks (event triggers) | SessionStart, PreCompact, git-commit-reminder |

See: [Capabilities Framework](./architecture/capabilities-framework.md) for the complete mental model.

### 2. Four-Phase Process (The Workflow)

| Phase | Purpose | Key Output | Human Gate? |
|-------|---------|------------|-------------|
| **Setup** | Environment and infrastructure | Working project structure | No |
| **Discovery** | Problem exploration | Linear Features, project docs | No |
| **Refinement** | BDD specification | Markdown scenarios, mini-PRDs | **Yes** |
| **Delivery** | TDD implementation | Working, tested code | No |

See: [Phase Guides](./guides/) for detailed workflows.

### 3. Skills Architecture (The Knowledge)

```
CLAUDE-agentflow.md (always loaded - "You ARE the orchestrator")
    ↓
Process Skills (workflow: setup, discovery, refinement, delivery)
    ↓
Agents (thin execution wrappers)
    ↓
Expertise Skills (domain: BDD, testing, docs, UX)
    ↓
Documentation (source of truth)
```

See: [System Architecture](./architecture/README.md) for details.

### 4. Human-in-the-Loop (The Decisions)

| Decision Type | Who Decides | When |
|---------------|-------------|------|
| Phase transitions | Human | Moving between Setup/Discovery/Refinement/Delivery |
| Refinement approval | Human | Before Delivery phase begins |
| Architectural decisions | Human | ADRs require sign-off |
| Destructive operations | Human | Force push, schema migrations, etc. |
| Routine operations | AI | Loading skills, running tests, committing code |

### Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **Orchestration** | Coordinates phases, invokes agents | `CLAUDE-agentflow.md` + `.claude/skills/af-orchestrate-workflow/` |
| **Process Skills** | Workflow knowledge (setup, discovery, etc.) | `.claude/skills/*/SKILL.md` |
| **Expertise Skills** | Domain knowledge (BDD, testing, etc.) | `.claude/skills/*/SKILL.md` |
| **Agents** | Execute specific tasks | `.claude/agents/` |
| **Commands** | User-invoked actions | `.claude/commands/` |
| **Hooks** | Automated quality enforcement | `.claude/hooks/` |

## Getting Started

### For Existing Projects (Brownfield)

1. Run `/af:setup --type brownfield --repo your-project` from AgentFlow context
2. Run `/docs:audit-project` to assess documentation state
3. Start working with `/task:start ISSUE-123`

### For New Projects (Greenfield)

1. Run Setup phase to initialize infrastructure
2. Run Discovery phase to explore and document the project
3. Proceed through Refinement and Delivery phases

## Documentation Sections

### [Guides](./guides/)

How-to guides for each phase:
- [Setup Guide](./guides/setup-guide.md)
- [Discovery Guide](./guides/discovery-guide.md)
- [Refinement Guide](./guides/refinement-guide.md)
- [Delivery Guide](./guides/delivery-guide.md)
- [Testing Guide](./guides/testing-guide.md)

### [Standards](./standards/)

Quality standards and conventions:
- [Documentation Standards](./standards/documentation-standards.md)
- [Project Structure](./standards/project-structure.md)

### Framework Reference

Self-documenting components:
- [Orchestration](../skills/af-orchestrate-workflow/SKILL.md) - Phase coordination and workflows
- [Agents](../agents/README.md)
- [Skills](../skills/README.md)
- [Commands](../commands/README.md)
- [Hooks](../hooks/README.md)

## Quick Reference

### Common Commands

```
/af:setup          # Set up AgentFlow (brownfield/greenfield/standard)
/docs:audit-project       # Assess documentation state
/task:start <issue>       # Begin work on Linear issue
/task:continue            # Resume current task
/refinement:refine      # BDD specification work
```

### Key Principles

1. **Specifications before implementation** - Refinement phase is mandatory
2. **Human approval required** - Critical decisions need sign-off
3. **Documentation is automatic** - Hooks maintain quality
4. **Context is preserved** - Linear + current-task.md maintain state

---

*AgentFlow Framework v2.0*
