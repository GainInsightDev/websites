---
title: Refinement Commands
created: 2025-09-06
updated: 2026-01-03
last_checked: 2026-01-03
tags: [commands, requirements, phase-3, mini-prd]
parent: ../README.md
children:
  - ./refine.md
  - ./approve.md
  - ./continue.md
---

# Refinement Commands

Commands for Phase 3: Refinement, mini-PRD creation, and BDD specification.

## Available Commands

### /refine-requirements
Transform Linear Features into comprehensive mini-PRDs with BDD scenarios and visual specifications.

**Usage**: `/refine-requirements LIN-XXX`

**Process**:
1. Analyzes feature from Three Amigos perspectives
2. Collaborates with human on approach
3. Creates mini-PRD with complete specifications
4. Invokes agents for BDD and visual specs
5. Prepares feature for approval

### /approve-requirements
Review and approve the mini-PRD to transition to Delivery phase.

**Usage**: `/approve-requirements LIN-XXX`

**Process**:
1. Presents complete mini-PRD for review
2. Verifies all artifacts are created
3. Gets explicit human approval
4. Updates Linear to "Approved"
5. Creates handoff documentation

## Phase Overview

The Refinement phase is where:
- High-level features become detailed mini-PRDs
- Three Amigos analysis ensures comprehensive coverage
- BDD scenarios are created as Markdown specifications
- Visual designs are created as Storybook stories
- Technical specifications define implementation approach
- Human approval is required before development

## Key Concepts

### Mini-PRD (Product Requirements Document)
A comprehensive specification document containing:
- Feature summary and success criteria
- Discovery context and decisions
- Technical specifications (API, database, architecture)
- BDD scenarios with complete test coverage
- Visual specifications with Storybook stories
- Implementation notes and considerations

### Three Amigos Analysis
AI simulates three perspectives:
- **Business**: Value delivery, user outcomes, ROI
- **Development**: Technical feasibility, architecture, implementation
- **QA**: Edge cases, error handling, testing strategy

### Human-in-the-Loop
Critical decisions require human approval:
- Technical approach validation
- Scenario coverage confirmation
- Final specification sign-off

## Workflow

```mermaid
graph TD
    A[Linear Feature] --> B[/refine-requirements]
    B --> C[Three Amigos Analysis]
    C --> D{Human Feedback}
    D -->|Iterate| C
    D -->|Approved| E[Create Mini-PRD]
    E --> F[BDD Agent]
    E --> G[UX Design Agent]
    F --> H[Markdown scenarios]
    G --> I[.stories.tsx files]
    H --> J[Complete Mini-PRD]
    I --> J
    J --> K[/approve-requirements]
    K --> L{Human Approval}
    L -->|Changes Needed| E
    L -->|Approved| M[Approved Status]
```

## File Outputs

### Mini-PRD Document
- **Location**: `/docs/requirements/[feature-name]/mini-prd.md`
- **Template**: `.claude/templates/mini-prd-template.md`
- **Contents**: Complete specification with all sections

### BDD Specifications
- **Scenarios**: Mini-PRD Section 4 - Markdown scenarios with test types
- **Selector Contracts**: `/tests/selectors/[capability].ts`
- **Coverage**: Happy paths, error cases, boundary cases, validation

### Visual Specifications
- **Storybook Stories**: `/stories/[capability]/[feature-name].stories.tsx`
- **User Flows**: `/docs/requirements/[feature-name]/user-flow.md`
- **Components**: shadcn/ui based designs

## Related Resources

- Orchestration Skill: `../../skills/af-orchestration/SKILL.md`
- Refinement Process: `../../skills/af-refinement-process/SKILL.md`
- BDD Agent: `../../agents/af-bdd-agent.md`
- UX Design Agent: `../../agents/af-ux-design-agent.md`
- Mini-PRD Template: `../../templates/mini-prd-template.md`
- Refinement Guide: `../../docs/guides/refinement-guide.md`

## Success Criteria

A feature is ready for Delivery when:
- [ ] Mini-PRD is complete with all sections
- [ ] BDD scenarios achieve 100% coverage
- [ ] Visual specs exist for all scenarios
- [ ] Technical approach is documented
- [ ] Glossary compliance is verified
- [ ] Human has given explicit approval
- [ ] Linear issue updated to "Approved"
- [ ] All artifacts are created and linked