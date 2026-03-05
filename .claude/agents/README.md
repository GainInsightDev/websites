---
title: AgentFlow Agents
sidebar_label: Agents
sidebar_position: 3
created: 2025-09-05
updated: 2026-01-06
last_checked: 2026-01-06
tags: [agents, index, navigation, v2]
parent: ../README.md
children:
  - ./af-architecture-quality-agent.md
  - ./af-bdd-agent.md
  - ./af-code-quality-agent.md
  - ./af-dev-test-agent.md
  - ./af-docs-quality-agent.md
  - ./af-docs-retrofit-agent.md
  - ./af-docs-curator-agent.md
  - ./af-work-management-agent.md
  - ./af-search-agent.md
  - ./af-technical-writer-agent.md
  - ./af-ux-design-agent.md
---

# AgentFlow Agents

Specialized workers that execute domain-specific tasks within the AgentFlow framework. Agents are invoked by orchestrators via the Task tool and maintain context across their tasks.

## Agent Types

### Core Framework Agents

#### [Documentation Quality Agent](./af-docs-quality-agent.md)
**Role**: Automated documentation validation and quality assurance
- **Phase 1: Reference Validation** - Ensures docs accurately reflect changed assets
- **Phase 2: Structural Validation** - Validates frontmatter and metadata
- Maintains bidirectional links and parent chain validation
- Updates documentation freshness
- Repairs missing documentation structure
- Auto-fixes mechanical changes, reports semantic issues
- Git-aware performance optimization with cascade validation

#### [Technical Writer Agent](./af-technical-writer-agent.md)
**Role**: Creates comprehensive technical documentation
- Authors API documentation with examples
- Writes component documentation
- Generates JSDoc/TSDoc comments
- Creates user guides and tutorials
- Produces architecture diagrams
- Ensures documentation completeness

#### [BDD Agent](./af-bdd-agent.md)
**Role**: Markdown scenario transformation and BDD compliance
- Transforms Linear issues to Markdown scenario specifications
- Validates glossary compliance
- Ensures BDD standards adherence

#### [Code Quality Agent](./af-code-quality-agent.md)
**Role**: Code quality enforcement during implementation
- Runs linting and type checking
- Analyzes test coverage
- Reviews code against specifications
- Suggests refactoring improvements
- Validates error handling patterns

#### [Architecture Quality Agent](./af-architecture-quality-agent.md)
**Role**: System architecture validation across phases
- Validates ADR compliance
- Reviews integration patterns
- Ensures architectural consistency
- Tracks technical debt
- Validates cross-cutting concerns


#### [Documentation Curator Agent](./af-docs-curator-agent.md)
**Role**: DRY enforcement across documentation
- Finds duplicate concept explanations
- Identifies authoritative sources
- Replaces copies with references
- Handles both `.claude/` and `docs/` contexts
- Runs via `/quality:curator` command

### Setup & Retrofit Agents

> **Note:** Setup workflows (brownfield, greenfield, GI Standard) are now handled by commands and skills, not agents. See `/af:setup` command and `af-setup-process` skill.

#### [Documentation Retrofit Agent](./af-docs-retrofit-agent.md)
**Role**: Retrofit documentation standards to brownfield repositories
- Systematic 3-phase documentation approach
- Framework installation and verification
- Documentation hierarchy creation
- Code documentation integration

### Testing Agents

#### [Dev Test Agent](./af-dev-test-agent.md)
**Role**: Development-time testing
- Local test execution
- Test development support
- Debugging assistance

### Design & Communication Agents

#### [UX Design Agent](./af-ux-design-agent.md)
**Role**: Visual specifications and design
- UI/UX design specifications
- Visual mockups and prototypes
- Design system maintenance

#### [Work Management Agent](./af-work-management-agent.md)
**Role**: Linear integration and issue tracking
- Creates and updates Linear issues
- Manages state transitions
- Links artifacts to issues
- Tracks sub-tasks (BDD, Visual, API)

#### [Search Agent](./af-search-agent.md)
**Role**: Context-protected information gathering 
- External API research
- Competitive analysis
- Technical pattern research
- Context summarization to prevent bloat

## When to Invoke Agents

### Context Economics

Agents have the same tools as the orchestrator. The value of delegation is **context preservation**:

- Agents handle context-heavy work (reading many files, substantial iteration)
- They return summaries, keeping orchestrator context focused
- Multiple agents can run in parallel for similar tasks

### Decision Framework

| Factor | Do it yourself | Delegate to agent |
|--------|----------------|-------------------|
| **Files to read** | 1-3 files | 5+ files |
| **Output size** | Small, needed for next step | Large, summary sufficient |
| **Task scope** | Quick fix, single change | Feature-wide work |
| **Parallelism** | Sequential dependency | Can run alongside other work |

### Invocation Pattern

Agents are invoked using the Task tool:
```markdown
Task tool with subagent_type="af-[agent-name]"
```

## Agent Architecture

### Context Flow
- Orchestrator provides task context and requirements
- Agent loads relevant expertise skills
- Agent executes work, consuming its own context
- Agent returns structured summary to orchestrator

### Specialization Principle
- Each agent has a defined domain of expertise
- Agents focus on their specialized responsibilities
- Cross-domain coordination handled by orchestrators

## Agent Lifecycle

### 1. Invocation
- Orchestrator identifies need for specialized task
- Task tool called with agent name and context
- Agent receives current project context

### 2. Execution
- Agent performs domain-specific work
- Uses appropriate tools for their specialization
- Maintains quality standards within domain

### 3. Reporting
- Agent reports results to orchestrator
- Includes any recommendations or findings
- Provides context for next steps

### 4. Context Preservation
- Agent state maintained for future tasks
- Context shared with related agents as needed
- Orchestrator coordinates overall workflow

## Quality Standards

### All Agents Must:
- Follow framework principles and standards
- Maintain their specialized documentation
- Report progress and issues clearly
- Preserve context for subsequent tasks
- Coordinate with other agents through orchestrators

### Agent Documentation Requirements:
- Clear role and responsibility definition
- Specified tools and capabilities
- Integration points with other agents
- Quality metrics and success criteria

## Integration Points

### With Orchestrators
- Receive tasks with full context
- Report results and recommendations
- Participate in phase transitions
- Support human-in-the-loop processes

### With Framework Tools
- Use validation scripts when appropriate
- Follow documentation standards
- Maintain glossary compliance
- Support event-driven workflows

### With Quality Systems
- Enforce BDD compliance
- Maintain testing standards
- Support continuous integration
- Enable automated quality checks

---

**Total Agents**: 11 implemented
**Last Updated**: 2026-01-06

> **Note:** Security scanning is handled by the `af-security-expertise` skill and `/security:audit` command, not an agent. See [Security Expertise](../skills/af-security-expertise/SKILL.md).

For specific agent capabilities and usage, see individual agent documentation files.