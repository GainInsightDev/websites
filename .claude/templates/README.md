---
title: AgentFlow Templates
created: 2025-09-05
updated: 2026-01-06
last_checked: 2026-01-06
tags: [templates, documentation, agentflow]
parent: ../README.md
children:
  - ./mini-prd-template.md
  - ./ideation-document.md
  - ./brownfield-CLAUDE.md
  - ./gaininsight-standard/README.md
  - ./setup/README.md
  - ./adr-template.md
  - ./adr-index.md
  - ./brand-system-spec-template.md
code_files:
  - ./glossary.yml
  - ./selector-contract.ts
---

# AgentFlow Templates

Reusable templates for AgentFlow documentation and specifications.

## Available Templates

### adr-index.md
Template for Architecture Decision Record index files.
- Used when creating ADR directories
- Provides consistent structure for tracking decisions
- Includes status tracking (Proposed, Accepted, Deprecated)

### mini-prd-template.md
Comprehensive Product Requirements Document template.
- Used by Refinement Orchestrator during Phase 3
- Creates ~80k context documents for Linear issues
- Contains 7 sections for complete feature specification

### glossary.yml
Example glossary configuration for domain vocabulary.
- Used by BDD agent for term validation
- Defines approved terms, synonyms, and forbidden terms
- Ensures consistent language across specifications

### brand-system-spec-template.md
Brand System Specification template for defining complete visual language.
- Used during Discovery phase (UX + AI workflow)
- 15 sections: reference class, colours (5-layer hierarchy), typography, spacing, shadows, motion, iconography, accessibility
- Drives token generation, Storybook Brand Page, and component styling
- Output: `docs/design/brand-system.md` and `tokens/` directory

### selector-contract.ts
TypeScript template for test selector contracts.
- Bridges design (Storybook) and testing (E2E/RTL)
- Referenced in mini-PRD Section 5 scenarios
- Defines data-testid naming conventions
- Pattern: `CAPABILITY.component.element`

### setup/
Templates for project setup workflows.
- `greenfield-claudemd.md` - CLAUDE.md template for new projects
- `brownfield-claudemd.md` - CLAUDE.md template for existing projects
- `greenfield-handoff.txt` - User handoff message after greenfield setup
- `brownfield-handoff.txt` - User handoff message after brownfield setup

## Usage

Templates are copied and customized, not directly referenced. They provide starting points for:
- Orchestrators creating documentation
- Agents needing consistent structures
- Projects requiring standardized formats

## Adding Templates

New templates should:
1. Include proper frontmatter
2. Be added to this README's children list
3. Document their purpose and usage
4. Follow AgentFlow documentation standards