---
title: AgentFlow Guides
sidebar_label: Guides
sidebar_position: 3
created: 2025-09-05
updated: 2026-02-18
last_checked: 2026-02-18
tags: [guides, index, documentation]
parent: ../README.md
children:
  - ./documentation-system.md
  - ./framework-development-guide.md
  - ./framework-sync.md
  - ./setup-guide.md
  - ./setup-interview.md
  - ./discovery-guide.md
  - ./work-management.md
  - ./atomic-refinement-guide.md
  - ./refinement-guide.md
  - ./bdd-guide.md
  - ./delivery-guide.md
  - ./quality-guide.md
  - ./testing-guide.md
  - ./ux-design-guide.md
  - ./aws-amplify-guide.md
  - ./integrations/README.md
  - ./gaininsight-standard/README.md
  - ./posthog-guide.md
  - ./figma-setup-guide.md
  - ./design-grammar-retrofit-guide.md
---

# AgentFlow Guides

Comprehensive guides for understanding and using the AgentFlow framework.

## Available Guides

### [Documentation System](./documentation-system.md)
Complete guide to AgentFlow's self-documenting system, including:
- Three-layer documentation architecture
- Bidirectional linking requirements
- Validation scripts and their usage
- docs-quality-agent workflow and capabilities
- Troubleshooting common issues

### [Framework Development Guide](./framework-development-guide.md)
Comprehensive guide to creating AgentFlow framework components, including:
- V2 layered architecture and component types
- Creating agents, skills, commands, and hooks
- Namespace rules (af- prefix for framework components)
- Size guidelines and structural patterns
- Workflows for adding new components
- Documentation standards for framework assets

### [Framework Sync](./framework-sync.md)
Complete guide to the AgentFlow V2 sync system, including:
- Git-based sync distribution model
- When to sync (brownfield, updates, branches)
- What gets synced vs preserved (namespace separation)
- Using /af:sync command
- How sync works internally
- Troubleshooting and best practices

### [Setup Guide](./setup-guide.md)
Comprehensive guide covering all AgentFlow setup paths:
- Decision tree for choosing setup type (brownfield, greenfield, standard)
- Brownfield setup (adding to existing projects) - **Available now**
- Greenfield setup (new projects from scratch) - Coming soon
- GainInsight Standard (15-phase production setup) - Placeholder
- Command reference and troubleshooting
- Best practices and customization options

### [Discovery Guide](./discovery-guide.md)
Comprehensive guide to the Discovery phase (Phase 2 of 4), including:
- Appropriate scope examples and boundaries
- 3-step workflow with practical examples
- Context gathering questions and patterns
- External research and search-agent usage
- Linear feature creation and documentation

### [Work Management](./work-management.md)
Guide to managing work and context in AgentFlow:
- Task management patterns
- Context preservation across sessions
- Linear integration workflows
- Progress tracking approaches

### [Atomic Refinement Guide](./atomic-refinement-guide.md)
How AgentFlow structures work into Epics, Features, and Scenarios:
- Outside-in development principle
- Epic → Feature → Scenario hierarchy
- What makes a Feature atomic (IS/IS NOT)
- Mapping to Linear, Mini-PRDs, and test files
- Seed data and selector contract patterns

### [Refinement Guide](./refinement-guide.md)
Guide to the Refinement phase (Phase 3 of 4), including:
- Three Amigos analysis approach
- Human-in-the-loop coordination
- BDD scenario creation with bdd-agent
- Visual specifications with ux-design-agent
- Mini-PRD structure and approval process

### [BDD Guide](./bdd-guide.md)
Comprehensive guide to Behavior-Driven Development with Markdown scenarios:
- V2 BDD workflow (Markdown scenarios instead of Gherkin)
- Scenario format (Preconditions/Steps/Expected)
- Test type classification (E2E, Integration, Component, Unit)
- Selector contracts for UI testing
- Coverage requirements (happy path, error, boundary, validation)
- Glossary compliance and language rules
- Complete examples and common patterns

### [Delivery Guide](./delivery-guide.md)
Complete guide to the Delivery phase (Phase 4 of 4), including:
- Local development workflow (localhost:3000 + sandbox)
- Iterative testing patterns with stateless dev-test-agent
- Documentation creation with technical-writer-agent
- Background process management
- Pull request preparation and handoff to CI/CD

### [Quality Guide](./quality-guide.md)
Comprehensive quality assurance guide for AgentFlow:
- Multi-dimensional quality (documentation, code, architecture, process)
- Validation workflows (pre-commit, incremental, full audit, brownfield)
- Quality agents and validation scripts
- Metrics and targets
- Common issues and troubleshooting
- Best practices for maintaining quality

### [Testing Guide](./testing-guide.md)
Complete testing strategy for AgentFlow projects:
- Testing pyramid (Unit, Integration, E2E)
- TDD workflow (Red → Green → Refactor)
- Jest configuration and patterns
- Playwright E2E testing
- Coverage targets and best practices

### [UX Design Guide](./ux-design-guide.md)
Comprehensive guide to UX design in AgentFlow projects:
- Atomic Design classification (Atoms, Molecules, Organisms, Templates)
- Component folder structure and Storybook organization
- 7-stage design flow with early tokenization
- Component Catalog Check workflow (prevent duplication)
- Storybook patterns (CSF 3, play functions, theme/responsive variants, autodocs)
- UX Review workflow and checklists
- Selector contracts and accessibility compliance

### [AWS Amplify Guide](./aws-amplify-guide.md)
Infrastructure and deployment guide for AWS Amplify:
- DynamoDB data modeling (NoSQL patterns)
- GraphQL API with AppSync
- Authentication with Cognito
- Storage with S3
- Environment management
- Monitoring and debugging

### [Integration Guides](./integrations/README.md)
Cross-module integration knowledge for combining modules during setup:
- Amplify ESM configuration (package.json + tsconfig.json coordination)
- Auth + Testing integration (custom attributes, admin auth flow, test emails)
- Cognito + SES integration (domain verification, production access, email delivery)
- SES per-account architecture (multi-account setup, DKIM sharing, regional requirements)
- CI/CD + Amplify polling (GitHub Actions waiting for deployments, E2E test sequencing)
- Flutter + Amplify monorepo (structure, shared backend, package managers, port allocation)

### [GainInsight Standard Guides](./gaininsight-standard/README.md)
Complete step-by-step instructions for the GainInsight Standard 4-layer stack:
- Layer 1: Infrastructure (AWS, Doppler, Amplify)
- Layer 2: Testing Framework (Jest, Playwright)
- Layer 3: UI & Styling (shadcn/ui, Storybook)
- Layer 4: CI/CD (GitHub Actions, branch protection)
- Teardown procedures

### [Design Grammar Retrofit Guide](./design-grammar-retrofit-guide.md)
How to add the AgentFlow Design Grammar to an existing project:
- Audit existing design values (CSS vars, Tailwind config, theme files)
- Create project tokens in W3C DTCG format
- Set up Style Dictionary build pipeline (JSON → CSS + Tailwind)
- Map existing components to grammar types
- Align Storybook to extended atomic hierarchy
- Optional Tokens Studio setup for Figma ↔ repo sync

## Planned Guides

- **Orchestrator Development** - Creating custom orchestrators
- **Hook System** - Implementing automation with hooks
- **Command Development** - Adding slash commands

## Guide Standards

All guides should:
- Explain concepts clearly with examples
- Include practical usage instructions
- Provide troubleshooting sections
- Link to related documentation
- Stay current with framework changes