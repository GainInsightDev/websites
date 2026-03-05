---
# Claude Code slash command fields
description: Approve the mini-PRD and transition to Delivery phase
argument-hint: "<Linear-Feature-ID>"

# Documentation system fields
title: Approve Requirements Command
created: 2025-09-06
updated: 2025-09-06
last_checked: 2025-09-06
tags: [command, requirements, approval, phase-3]
parent: ./README.md
related:
  - ./refine.md
  - ../../skills/af-orchestration/SKILL.md
  - ../../skills/af-requirements-process/SKILL.md
---

# /approve-requirements

You are at the **approval checkpoint** for the Requirements Phase.

## What This Command Does

This command helps you:
1. Review the complete mini-PRD for the feature
2. Verify all specifications are complete
3. Give explicit approval to proceed
4. Transition the feature to Delivery phase

## Pre-Approval Checklist

Before approving, I'll verify:

### ✅ Mini-PRD Completeness
- [ ] Feature Summary with clear success criteria
- [ ] Discovery Context linked and referenced
- [ ] Technical Specification defined
- [ ] BDD Scenarios written and saved
- [ ] Visual Specifications in Storybook
- [ ] Implementation Notes documented

### ✅ File Artifacts Created
- [ ] `.feature` files in `/features/[capability]/`
- [ ] Step definition stubs in `/features/step-definitions/`
- [ ] Storybook stories in `/stories/[capability]/`
- [ ] Mini-PRD in `/docs/requirements/[feature-name]/`
- [ ] User flows documented (if applicable)

### ✅ Quality Checks
- [ ] Glossary compliance verified
- [ ] Design system consistency checked
- [ ] All BDD scenarios have corresponding stories
- [ ] Accessibility requirements documented
- [ ] API contracts defined (if applicable)

### ✅ Linear Updates
- [ ] Mini-PRD linked to Linear issue
- [ ] Issue status ready for transition
- [ ] Sub-issues created for implementation
- [ ] Labels and metadata updated
- [ ] `approval:bdd-approved` label present on parent issue
- [ ] `approval:ux-approved` label present on parent issue (UI features only)

## Approval Process

When you run this command:

1. **I'll present** the complete mini-PRD for review
2. **You confirm** that specifications meet your expectations
3. **I'll verify** all artifacts are in place
4. **You provide** explicit approval to proceed
5. **I'll update** Linear to mark as "Approved"
6. **I'll create** handoff documentation for Delivery phase

## What Happens After Approval

Once approved:
- Feature moves to "Approved" status in Linear (awaiting scheduling)
- Mini-PRD becomes the source of truth for implementation
- Delivery Orchestrator can begin implementation
- No further requirements changes without new approval cycle

## Getting Started

Please provide:
1. **Linear Feature ID** to approve (e.g., LIN-321)
2. Any final concerns or questions
3. Confirmation you're ready to review

I'll then present the complete specifications for your approval.

**Note**: This is a critical quality gate. Take time to review thoroughly - changes after this point require returning to Requirements phase.