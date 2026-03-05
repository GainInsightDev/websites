---
title: Discovery Commands
created: 2025-09-06
updated: 2025-09-06
last_checked: 2025-09-06
tags: [commands, discovery, phase-2, exploration]
parent: ../README.md
children:
  - ./discover.md
---

# Discovery Commands

Commands for Phase 2: Product-level exploration and Linear Feature creation.

## Available Commands

### /discover
Start the Discovery phase to explore project scope and create a feature roadmap.

**Usage**: `/discover`

**Process**:
1. Asks 4 key context-gathering questions
2. Optionally researches external information
3. Creates 6 focused deliverables
4. Sets up Linear Features with version tags
5. Validates and commits all documentation

## Phase Overview

The Discovery phase is where:
- Product ideas become structured roadmaps
- User needs are identified and documented
- Technical architecture is designed
- Features are prioritized into versions
- Linear backlog is created

## Key Concepts

### Product-Level Scope
Discovery works at the **product/project level**, not individual features:
- ✅ "Build a cost allocation system"
- ✅ "Create a learning platform"
- ❌ "Add user authentication" (too specific)

### 6 Focused Deliverables
1. **Project Overview** - Vision, goals, success metrics
2. **User Analysis** - Personas, journeys, needs
3. **Feature Roadmap** - Prioritized feature list with versions
4. **Integration Architecture** - Technical design and external systems
5. **Design System** - Brand, visual style, accessibility requirements
6. **ADRs** - Architectural decisions with rationale

### Version Tagging
Features are tagged for phased delivery:
- `version:v1` - MVP features
- `version:v2` - Enhancement features  
- `version:future` - Long-term vision

## Workflow

```mermaid
graph TD
    A[Project Idea] --> B[/discover]
    B --> C[4 Context Questions]
    C --> D[User Provides Answers]
    D --> E{Research Needed?}
    E -->|Yes| F[Search External Info]
    E -->|No| G[Create Deliverables]
    F --> G
    G --> H[6 Documents Created]
    H --> I[Validate with docs-agent]
    I --> J[Create Linear Features]
    J --> K[Commit Documentation]
    K --> L[Ready for Requirements]
```

## File Outputs

### Documentation
- `/docs/requirements/project-overview.md`
- `/docs/requirements/user-analysis.md`
- `/docs/requirements/feature-roadmap.md`
- `/docs/architecture/integration-architecture.md`
- `/docs/design/design-system.md`
- `/docs/architecture/adr/adr-XXX-[decision].md`

### Linear Issues
- Features created with proper metadata
- Version labels applied
- Capability groupings
- Default effort: 1 (to be refined)
- Status: Backlog

## Success Criteria

Discovery is complete when:
- [ ] All 6 deliverables created
- [ ] Documentation validated by docs-agent
- [ ] Linear Features created with version tags
- [ ] ADRs document key decisions
- [ ] Design system captures visual preferences
- [ ] Everything committed to git

## Related Resources

- Orchestration Skill: `../../skills/af-orchestration/SKILL.md`
- Discovery Process: `../../skills/af-discovery-process/SKILL.md`
- Search Agent: `../../agents/af-search-agent.md`
- Discovery Guide: `../../docs/guides/discovery-guide.md`
- Work Management Agent: `../../agents/af-work-management-agent.md`

## Next Phase

After Discovery, pick any Linear Feature and run:
```bash
/refine-requirements LIN-XXX
```

This begins the Requirements phase where features become detailed mini-PRDs.