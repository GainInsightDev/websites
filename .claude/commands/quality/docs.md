---
# Claude Code slash command fields
description: Manually run docs-quality-agent to validate documentation standards and quality
allowed-tools: Task, Read, Write, Edit, Glob, Grep, Bash

# Documentation system fields
title: Run Documentation Quality Agent Command
created: 2025-09-07
updated: 2025-09-07
last_checked: 2025-09-07
tags: [quality, documentation, validation, agent]
parent: ./README.md
children: []
related:
  - ../../agents/af-docs-quality-agent.md
  - ../../docs/standards/documentation-standards.md
---

# /run-docs-quality-agent - Manual Documentation Quality Validation

Manually invokes the docs-quality-agent to validate documentation standards, repair frontmatter, and ensure documentation completeness.

## Usage

```
/run-docs-quality-agent
```

## What This Command Does

Uses the Task tool to invoke the docs-quality-agent with the directive:
```
"Validate documentation standards. Use git detection to focus on changed files and their dependencies."
```

## Workflow

1. **Identifies changed files** via git status
2. **Validates documentation standards** for changed files and their dependencies
3. **Repairs frontmatter issues** automatically
4. **Updates parent-child relationships** as needed
5. **Generates validation report** with any issues found
6. **Updates last_checked metadata** for validated files

## When to Use

### Manual Validation Needed
- When Stop hooks are disabled or not functioning
- For comprehensive documentation reviews
- After major framework changes
- During documentation system setup

### Quality Assurance
- Before creating pull requests
- After significant documentation changes
- During periodic maintenance
- When documentation errors are suspected

### Troubleshooting
- When validation scripts report issues
- After restructuring documentation
- When parent-child links are broken
- During documentation migration

## Integration Points

### With Validation Scripts
The command leverages:
- `validate-frontmatter.ts` - Metadata validation
- `repair-frontmatter.ts` - Automatic repairs
- `check-stale-docs.ts` - Freshness checking
- `validate-links.ts` - Link verification

### With Git Detection
Uses git-aware workflow to focus on:
- Modified documentation files
- Parent documents that may need updates
- Child documents referencing changed files
- New files requiring documentation

### With Quality Standards
Ensures compliance with:
- [Documentation Standards](../../docs/standards/documentation-standards.md)
- Three-layer documentation pattern
- Bidirectional linking requirements
- Required frontmatter fields

## Expected Output

### Success Case
```
✅ Documentation validation complete
- Validated 15 files
- Repaired 3 frontmatter issues
- Updated 2 parent-child relationships
- No quality issues found
```

### Issues Found
```
⚠️  Documentation issues detected:
- Missing parent link in ./agents/new-agent.md
- Outdated last_checked in ./docs/guide.md
- Broken reference to deleted file

Running automatic repairs...
✅ All issues resolved
```

### Comprehensive Report
```
📊 Validation Report:
- Files checked: 23
- Repairs made: 5
- Links verified: 67
- Stale documents: 2
- Quality score: 95/100

See detailed report at: .claude/logs/docs-quality-agent-[timestamp].log
```

## Command Implementation

```markdown
Use Task tool with:
subagent_type: 'af-docs-quality-agent'
prompt: 'Validate documentation standards. Use git detection to focus on changed files and their dependencies.'
```

## Comparison to Automatic Validation

### Manual Command (/run-docs-quality-agent)
- **Triggered**: On-demand by user
- **Scope**: Git-aware, focuses on changed files
- **Reporting**: Detailed output and logs
- **Use Case**: Troubleshooting, comprehensive reviews

### Automatic Validation (Stop Hooks)
- **Triggered**: After Task tool usage
- **Scope**: Event-driven based on detected changes
- **Reporting**: Background with error alerts
- **Use Case**: Continuous quality maintenance

## See Also

- [af-docs-quality-agent](../../agents/af-docs-quality-agent.md) - Full agent documentation
- [Documentation Standards](../../docs/standards/documentation-standards.md) - Quality standards
- [Documentation System Guide](../../docs/guides/documentation-system.md) - Complete system overview
- [/documentation](./documentation.md) - Related optimization command