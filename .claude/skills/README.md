---
title: AgentFlow Skills System
sidebar_label: Skills
sidebar_position: 4
created: 2025-10-29
updated: 2026-02-06
last_checked: 2026-02-06
tags: [skills, index, v2, framework]
parent: ../README.md
children:
  # Orchestration
  - ./af-orchestration/SKILL.md
  # Process Skills
  - ./af-setup-process/SKILL.md
  - ./af-discovery-process/SKILL.md
  - ./af-requirements-process/SKILL.md
  - ./af-delivery-process/SKILL.md
  - ./af-quality-process/SKILL.md
  # Expertise Skills
  - ./af-bdd-expertise/SKILL.md
  - ./af-comms-expertise/SKILL.md
  - ./af-documentation-standards/SKILL.md
  - ./af-security-expertise/SKILL.md
  - ./af-testing-expertise/SKILL.md
  - ./af-ux-design-expertise/SKILL.md
  - ./af-work-management-expertise/SKILL.md
  - ./af-environment-infrastructure/SKILL.md
  - ./af-gidev-server/SKILL.md
  - ./af-gaininsight-standard/SKILL.md
  - ./af-amplify-expertise/SKILL.md
  - ./af-architecture-expertise/SKILL.md
  - ./af-canvas-expertise/SKILL.md
  - ./af-estimation-expertise/SKILL.md
  - ./af-quotation-expertise/SKILL.md
  - ./af-email-sending-expertise/SKILL.md
  - ./af-flutter-expertise/SKILL.md
  # Entry-Point Skills (ad-hoc triggering)
  # Infrastructure
  - ./af-cognito-expertise/SKILL.md
  - ./af-ses-expertise/SKILL.md
  # Testing
  - ./af-jest-unit-tests/SKILL.md
  - ./af-playwright-e2e/SKILL.md
  - ./af-rtl-component-tests/SKILL.md
  - ./af-test-coverage/SKILL.md
  - ./af-email-e2e-testing/SKILL.md
  # Requirements
  - ./af-defining-requirements/SKILL.md
  - ./af-writing-scenarios/SKILL.md
  - ./af-glossary-compliance/SKILL.md
  # Documentation
  - ./af-writing-docs/SKILL.md
  - ./af-frontmatter/SKILL.md
  - ./af-linking-docs/SKILL.md
  # Work Management
  - ./af-starting-work/SKILL.md
  - ./af-linear-issues/SKILL.md
  - ./af-session-recovery/SKILL.md
  # Delivery
  - ./af-tdd-workflow/SKILL.md
  - ./af-pr-preparation/SKILL.md
  # Framework Skills
  - ./af-agentflow-framework-development/SKILL.md
  - ./af-making-agentflow-changes/SKILL.md
---

# AgentFlow Skills System

Skills are modular knowledge units that agents load to perform specialized tasks. This is a core component of the V2 layered architecture.

## Architecture

```
Orchestrator → References process skills
    ↓
Process Skills → Workflow knowledge, references docs
    ↓
Sub-agents → Execution layer, references expertise skills
    ↓
Expertise Skills → Domain knowledge, references docs/templates
    ↓
Source Materials → Docs, templates, scripts (source of truth)
```

## Skill Categories

### Orchestration
Coordination and workflow control:
- [**orchestration**](./af-orchestration/SKILL.md) - Phase transitions, role-specific workflows, intervention points

### Process Skills
Workflow knowledge for each development phase:
- [**setup-process**](./setup-process/SKILL.md) - Infrastructure bootstrapping workflow
- [**discovery-process**](./discovery-process/SKILL.md) - Problem exploration workflow
- [**requirements-process**](./requirements-process/SKILL.md) - BDD specification workflow
- [**delivery-process**](./delivery-process/SKILL.md) - Implementation workflow
- [**quality-process**](./quality-process/SKILL.md) - Validation workflows

### Expertise Skills
Domain knowledge for specialized tasks:
- [**bdd-expertise**](./af-bdd-expertise/SKILL.md) - Markdown scenario patterns and glossary compliance
- [**documentation-standards**](./documentation-standards/SKILL.md) - Documentation requirements
- [**testing-expertise**](./testing-expertise/SKILL.md) - Testing patterns and strategies
- [**ux-design-expertise**](./ux-design-expertise/SKILL.md) - UI/UX design patterns
- [**work-management-expertise**](./af-work-management-expertise/SKILL.md) - Linear workflows, task state, session recovery
- [**environment-infrastructure**](./af-environment-infrastructure/SKILL.md) - AWS credentials, DNS, Route53, CloudFront, Doppler patterns
- [**gidev-server**](./af-gidev-server/SKILL.md) - GiDev server operations (worktrees, Caddy, tmux)
- [**gaininsight-standard**](./af-gaininsight-standard/SKILL.md) - GainInsight Standard stack setup (4-layer opinionated infrastructure)
- [**estimation-expertise**](./af-estimation-expertise/SKILL.md) - Effort estimation by functional area and role, Linear story points
- [**quotation-expertise**](./af-quotation-expertise/SKILL.md) - Client-facing quotations from estimation data, PDF generation, email delivery
- [**email-sending-expertise**](./af-email-sending-expertise/SKILL.md) - Sending emails via Gmail API with attachments from holly@gaininsight.global
- [**flutter-expertise**](./af-flutter-expertise/SKILL.md) - Flutter mobile development, Widgetbook, monorepo patterns, design token bridging

### Entry-Point Skills
Small, focused skills (~20-40 lines) for reliable ad-hoc triggering. These route to specific guide sections rather than containing comprehensive knowledge:

**Infrastructure:**
- [**cognito-expertise**](./af-cognito-expertise/SKILL.md) - Cognito User Pool setup, custom attributes, auth triggers
- [**ses-expertise**](./af-ses-expertise/SKILL.md) - SES domain verification, DKIM, sandbox/production

**Testing:**
- [**jest-unit-tests**](./af-jest-unit-tests/SKILL.md) - Jest unit tests, TDD workflow
- [**playwright-e2e**](./af-playwright-e2e/SKILL.md) - Playwright E2E tests from Markdown scenarios
- [**rtl-component-tests**](./af-rtl-component-tests/SKILL.md) - React Testing Library component tests
- [**test-coverage**](./af-test-coverage/SKILL.md) - Test coverage analysis and improvement
- [**email-e2e-testing**](./af-email-e2e-testing/SKILL.md) - Gmail API email verification in E2E tests

**Requirements:**
- [**defining-requirements**](./af-defining-requirements/SKILL.md) - Atomic features, mini-PRDs, work structure
- [**writing-scenarios**](./af-writing-scenarios/SKILL.md) - BDD Markdown scenarios with test type classification
- [**glossary-compliance**](./af-glossary-compliance/SKILL.md) - Domain terminology enforcement

**Documentation:**
- [**writing-docs**](./af-writing-docs/SKILL.md) - Creating docs following AgentFlow standards
- [**frontmatter**](./af-frontmatter/SKILL.md) - YAML frontmatter metadata and validation
- [**linking-docs**](./af-linking-docs/SKILL.md) - Bidirectional document linking

**Work Management:**
- [**starting-work**](./af-starting-work/SKILL.md) - Start work on a Linear issue
- [**linear-issues**](./af-linear-issues/SKILL.md) - Create and manage Linear issues
- [**session-recovery**](./af-session-recovery/SKILL.md) - Recover context after restart/compaction

**Delivery:**
- [**tdd-workflow**](./af-tdd-workflow/SKILL.md) - Red-Green-Refactor implementation cycle
- [**pr-preparation**](./af-pr-preparation/SKILL.md) - Pull request preparation and exit criteria

### Framework Skills
Meta-skills for extending AgentFlow itself:
- [**agentflow-framework-development**](./af-agentflow-framework-development/SKILL.md) - Creating agents, skills, commands, hooks
- [**making-agentflow-changes**](./af-making-agentflow-changes/SKILL.md) - Contributing changes back to AgentFlow, version bumping, CHANGELOG

## Usage

Skills are loaded by agents using the skill reference pattern:

```markdown
## Skills Used

- **bdd-expertise** (for scenario patterns)
- **documentation-standards** (for metadata requirements)
```

Agents should load skills at the start of their procedure before executing tasks.

## Design Principles

1. **Single Responsibility**: Each skill covers one domain
2. **Reference, Don't Duplicate**: Skills point to source materials
3. **Composable**: Agents can load multiple skills
4. **Lightweight**: Expertise skills ~100-400 lines; entry-point skills ~20-40 lines

---

**Skills Count**: 38 (5 process + 13 expertise + 18 entry-point + 2 framework)
