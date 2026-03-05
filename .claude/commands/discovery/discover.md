---
# Claude Code slash command fields
description: Start the Discovery phase to explore project scope and create Linear Features

# Documentation system fields
title: Discover Command
created: 2025-09-06
updated: 2025-09-06
last_checked: 2025-09-06
tags: [command, discovery, phase-2, exploration]
parent: ./README.md
related:
  - ../../skills/af-orchestration/SKILL.md
  - ../../skills/af-discovery-process/SKILL.md
  - ../../agents/af-search-agent.md
---

# /discover

You are now entering the **Discovery Phase** of AgentFlow.

I will help you explore your project idea and transform it into a structured roadmap with Linear Features.

## What I'll Do

Through a collaborative conversation, I'll help you:

1. **Understand Your Vision** - Explore the business problem and solution
2. **Identify Users** - Define who will use this and their needs  
3. **Map Features** - Break down the project into implementable features
4. **Document Architecture** - Capture technical decisions and integrations
5. **Create Linear Features** - Set up your project backlog

## Our Discovery Process

### Step 1: Context Gathering
I'll ask you 4 key questions:
- **Business Driver**: What problem are you solving?
- **User Context**: Who are the users and their experience?
- **Technical Constraints**: Any platform or integration requirements?
- **Success Criteria**: How will you measure success?

### Step 2: Optional Research
If needed, I'll research:
- External APIs and integrations
- Best practices for your domain
- Similar solutions for inspiration
- Technical feasibility

### Step 3: Create Deliverables
I'll produce 6 focused documents:
- **Project Overview** - Vision and goals
- **User Analysis** - Personas and journeys
- **Feature Roadmap** - Prioritized feature list
- **Integration Architecture** - Technical design
- **Design System** - Visual preferences and accessibility
- **ADRs** - Key architectural decisions

### Step 4: Linear Setup
I'll create:
- Features tagged with versions (v1, v2, future)
- Proper capability groupings
- Effort estimates
- Dependencies mapped

## Getting Started

Please describe your project idea. Think at the **product level**, not individual features.

**Good Examples**:
- "Create a cost allocation system that imports from Xero"
- "Build a project management SaaS platform"
- "Develop a learning management system"

**Too Specific** (save for Requirements phase):
- "Add user login"
- "Create a dashboard"
- "Implement notifications"

## What Happens Next

After Discovery:
1. All documentation is validated and committed
2. Linear Features are created in Backlog
3. You can pick any feature to refine with `/refine-requirements`
4. Each feature becomes a mini-PRD in Requirements phase

Ready to explore your project idea?