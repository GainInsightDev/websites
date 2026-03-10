---
# Claude Code slash command fields
description: Start the Refinement phase to create mini-PRDs with BDD specifications and visual designs
argument-hint: "<Linear-Feature-ID>"

# Documentation system fields
title: Refine Command
created: 2025-09-05
updated: 2026-01-03
last_checked: 2026-01-03
tags: [command, refinement, bdd, phase-3, mini-prd]
parent: ./README.md
related:
  - ../../skills/af-orchestration/SKILL.md
  - ../../skills/af-refinement-process/SKILL.md
  - ../../agents/af-bdd-agent.md
  - ../../agents/af-ux-design-agent.md
---

# /refine-requirements

You are now entering the **Refinement Phase** of AgentFlow.

I will help you transform Linear Features from Discovery into complete mini-PRDs with implementable specifications.

## What I'll Create

For each feature, I'll produce a comprehensive **mini-PRD** containing:

1. **Feature Summary** - Clear description and success criteria
2. **Discovery Context** - Links to research and ADRs
3. **Technical Specification** - API contracts and component designs
4. **BDD Scenarios** - Complete Markdown scenario specifications with test coverage
5. **Visual Specifications** - Storybook stories and component selections
6. **Implementation Notes** - Critical details for developers

## Our Interactive Process

This is a **human-in-the-loop** workflow where we'll collaborate through 5 phases:

### Phase 1: Context Gathering
- I'll analyze the Linear feature and related discovery docs
- Present Three Amigos perspectives (Business, Dev, QA)
- You provide feedback and clarifications

### Phase 2: Human Collaboration
- We'll discuss implementation approaches
- Make key technical decisions together
- You'll approve the direction before we proceed

### Phase 3: Specification Creation
- I'll invoke the BDD agent for Markdown scenarios
- I'll invoke the UX Design agent for visual specs
- Create technical specifications and API contracts

### Phase 4: Integration & Review
- Present the complete mini-PRD for your review
- Make any adjustments based on your feedback
- Ensure all parts are aligned and consistent

### Phase 5: Finalization
- Get your explicit approval on specifications
- Update Linear with mini-PRD link
- Mark feature as ready for Delivery phase

## Getting Started

Please provide:
1. **Linear Feature ID** to refine (e.g., LIN-321)
2. Any specific concerns or requirements
3. Technical constraints or preferences

I'll use the Refinement Orchestrator to guide us through creating a comprehensive mini-PRD that bridges Discovery insights with Delivery implementation.

Ready to begin refinement?