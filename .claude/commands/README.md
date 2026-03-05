---
title: AgentFlow Commands
sidebar_label: Commands
sidebar_position: 6
created: 2025-09-05
updated: 2026-01-03
last_checked: 2026-01-03
tags: [commands, slash-commands, index, navigation]
parent: ../README.md
children:
  - ./af/README.md
  - ./brownfield/README.md
  - ./docs/README.md
  - ./quality/README.md
  - ./quote/README.md
  - ./requirements/README.md
  - ./security/README.md
  - ./task/README.md
  - ./discovery/README.md
---

# AgentFlow Commands

Claude Code slash commands that provide direct access to AgentFlow framework functionality. These commands enable users to interact with the framework outside of the orchestrated workflow when needed.

## Available Commands

### [check-stale-docs](./check-stale-docs.md)
**Purpose**: Find and identify outdated documentation
**Usage**: `/check-stale-docs`

**Functionality**:
- Scans documentation for files with outdated `last_checked` dates
- Identifies documentation that may be out of sync with code
- Provides report of stale documentation requiring updates
- Integrates with validation scripts for comprehensive checking

**When to Use**:
- Before starting new development phases
- During documentation reviews
- When preparing for releases
- As part of regular maintenance

### [refine-requirements](./refine-requirements.md)
**Purpose**: BDD specification refinement and validation
**Usage**: `/refine-requirements`

**Functionality**:
- Invokes Requirements Orchestrator for specification work
- Validates Markdown scenario coverage
- Ensures glossary compliance
- Coordinates human approval processes
- Updates acceptance criteria

**When to Use**:
- When specifications need updates
- Before starting Delivery phase
- When requirements change
- During stakeholder review cycles

### [run-docs-quality-agent](./quality/run-docs-quality-agent.md)
**Purpose**: Manual documentation validation and quality checks
**Usage**: `/run-docs-quality-agent`

**Functionality**:
- Manually triggers docs-quality-agent outside of hook automation
- Performs comprehensive documentation validation
- Repairs frontmatter and metadata issues
- Updates bidirectional links
- Generates reference documentation

**When to Use**:
- When hooks are disabled or not working
- For comprehensive documentation reviews
- After major framework changes
- During documentation system setup

## Command Architecture

### Integration with Framework
- **Orchestrator Access**: Commands can invoke orchestrators directly
- **Agent Invocation**: Commands can trigger specific agents
- **Validation Integration**: Commands use framework validation scripts
- **Quality Standards**: Commands maintain AgentFlow quality requirements

### Command Structure
Each command consists of:
1. **Markdown File**: Command documentation and specification
2. **Implementation**: Built into Claude Code slash command system
3. **Integration Points**: Connections to orchestrators, agents, and scripts
4. **Usage Guidelines**: When and how to use the command

### Command Categories

#### Brownfield/Setup Commands
- `/brownfield:add`: Add AgentFlow to existing repository

#### Documentation Commands
- `/docs:check-stale`: Documentation maintenance
- `/docs:audit-project`: Assess existing project documentation
- `/quality:docs`: Manual documentation validation

#### Development Process Commands
- `/requirements:refine`: BDD specification work

#### Task Management Commands
- `/task:start`: Begin work on a Linear issue
- `/task:continue`: Resume current task
- `/task:complete`: Complete current task

## Command Usage Patterns

### Phase-Based Usage
**Setup Phase**:
- Use documentation commands to ensure clean starting state
- Run docs-quality-agent to validate framework setup

**Discovery Phase**:
- Check stale docs before exploring new features
- Ensure documentation is current for context

**Requirements Phase**:
- Use `refine-requirements` for specification work
- Validate documentation completeness

**Delivery Phase**:
- Documentation commands run automatically via hooks
- Manual commands available for troubleshooting

### Maintenance Usage
**Regular Maintenance**:
```bash
/check-stale-docs     # Find outdated documentation
/run-docs-quality-agent  # Validate documentation
```

**Before Development**:
```bash
/check-stale-docs     # Ensure current context
/refine-requirements  # Validate specifications
```

**After Major Changes**:
```bash
/run-docs-quality-agent  # Comprehensive documentation validation
```

## Integration Points

### With Validation Scripts
Commands leverage the TypeScript validation scripts:
- `validate-frontmatter.ts` - Metadata validation
- `check-stale-docs.ts` - Freshness checking
- `repair-frontmatter.ts` - Automatic repairs
- `validate-links.ts` - Link verification

### With Orchestrators
Commands can invoke orchestrators when appropriate:
- `refine-requirements` → Requirements Orchestrator
- Commands maintain orchestrator context and workflow

### With Agents
Commands can trigger specific agents:
- `run-docs-quality-agent` → docs-quality-agent
- Direct agent invocation bypasses orchestrator coordination

### With Quality Systems
Commands support quality assurance:
- Documentation validation
- BDD compliance checking
- Glossary term verification
- Link integrity validation

## Command Development

### Adding New Commands
1. Create command documentation in `.claude/commands/`
2. Define command purpose and usage
3. Specify integration points
4. Document when to use the command
5. Update this index file

### Command Standards
**All Commands Must**:
- Have comprehensive documentation
- Define clear usage guidelines
- Specify integration points
- Maintain quality standards
- Support framework principles

**Command Documentation Requirements**:
- Clear purpose statement
- Usage examples
- Integration specifications
- When to use guidelines
- Expected outcomes

## Best Practices

### When to Use Commands
**Use Commands When**:
- Need specific functionality outside orchestrated workflow
- Troubleshooting framework issues
- Performing maintenance tasks
- Validating system state

**Prefer Orchestrators When**:
- Following standard development workflow
- Need coordinated multi-agent work
- Require human approval processes
- Working within established phases

### Command Selection
**Documentation Issues**: Use `check-stale-docs` or `run-docs-quality-agent`
**Specification Work**: Use `refine-requirements`
**General Development**: Use phase-appropriate orchestrator slash commands

### Quality Considerations
- Commands should maintain framework quality standards
- Documentation commands should validate comprehensively
- Process commands should follow BDD principles
- All commands should integrate with existing quality systems

## Troubleshooting

### Common Issues
**Permission Errors**:
- Ensure write access to `.claude/logs/`
- Check script permissions for validation tools

**Script Failures**:
- Verify npm dependencies installed
- Check TypeScript configuration
- Validate file paths and structure

**Integration Issues**:
- Confirm orchestrator/agent availability
- Check framework configuration
- Verify Git repository state

### Debugging Commands
```bash
# Check command availability
/help

# Validate framework state
ls -la .claude/

# Test validation scripts
cd .claude/scripts && npx ts-node validate-frontmatter.ts

# Check logs
tail -f .claude/logs/docs-quality-agent-*.log
```

---

**Total Commands**: 3
**Command Types**: Documentation (2), Requirements (1)
**Last Updated**: 2025-09-05

Commands provide direct access to framework functionality while maintaining quality standards. Use appropriately based on your current development phase and specific needs.