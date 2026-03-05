---
title: AgentFlow Documentation Standards
sidebar_label: Documentation Standards
created: 2024-01-20
updated: 2025-12-03
last_checked: 2025-12-03
tags: [documentation, standards, agentflow, docs-portal]
parent: ./README.md
---

# AgentFlow Documentation Standards

## Core Principles
- All documentation is AI-generated
- Complete and well-organized over size-constrained
- Bidirectional linking between docs and code
- Continuous validation ensures quality

## Documentation Architecture

### Framework Documentation (Two-Layer Pattern)
For AgentFlow framework components in `.claude/`:

1. **Asset Documentation** (Self-documenting files)
   - Location: Next to the assets they describe
   - Examples: `.claude/agents/af-bdd-agent.md`, `.claude/scripts/*.ts`
   - Purpose: Define the asset, contain implementation
   - Self-documenting: Markdown files explain themselves, code has TSDoc

2. **Index Documentation** (README.md navigation)
   - Location: One README.md per directory
   - Example: `.claude/agents/README.md` lists all agents
   - Purpose: Navigation, discovery, quick reference
   - Content: Brief descriptions and links to assets

### Project Documentation (Three-Layer Pattern)
For project code using AgentFlow:

1. **Code Documentation** (Inline comments and JSDoc)
   - Location: In source files
   - Examples: `src/components/*.tsx`, `src/lib/*.ts`
   - Purpose: Document code behavior, parameters, types

2. **Index Documentation** (README.md navigation)
   - Location: One README.md per code directory
   - Purpose: Navigation and overview

3. **Reference Documentation** (Detailed guides)
   - Location: `/docs/reference/`, `/docs/api/`, `/docs/components/`
   - Purpose: Comprehensive usage guides, examples, API docs
   - Content: How to use components, API endpoints, services

### Directory Structure with Documentation
```
.claude/
├── README.md                    # Framework overview (root index)
├── CLAUDE-agentflow.md          # Core framework instructions
├── agents/
│   ├── README.md               # Agent index listing all agents
│   ├── bdd-agent.md           # BDD agent definition (self-documenting)
│   └── docs-quality-agent.md  # Docs quality agent definition (self-documenting)
├── skills/
│   ├── README.md               # Skills index
│   ├── af-orchestration/       # Orchestration workflows
│   ├── af-*-process/           # Phase-specific process skills
│   └── af-*-expertise/         # Domain expertise skills
├── hooks/
│   ├── README.md               # Hook system documentation
│   └── *.sh                   # Hook scripts (with comments)
├── scripts/
│   ├── README.md               # Script documentation index
│   └── *.ts                   # Validation scripts (with TSDoc)
├── commands/
│   ├── README.md               # Command index
│   └── *.md                   # Command definitions
└── docs/
    ├── README.md               # Documentation root index
    ├── guides/                 # How-to guides
    ├── process/               # Team workflows and methodology
    ├── standards/             # Framework standards and conventions
    └── system-architecture.md # System architecture overview
```

### Bidirectional Linking Requirements

Every document participates in a bidirectional linking system:

1. **Parent-Child Relationships**
   - Every child must reference its parent: `parent: .claude/README.md`
   - Every parent must list its children: `children: [./agents/README.md]`
   - These relationships must be reciprocal

2. **Link Validation Rules**
   - All referenced files must exist
   - Parent-child relationships must be bidirectional
   - README.md files should have children (unless empty directory)
   - Only designated root files can have no parent

3. **Allowed Root Documents** (no parent required)
   - `.claude/README.md` - Framework root
   - `.claude/docs/README.md` - Documentation root
   - `docs/README.md` - Project documentation root
   - `README.md` - Project root

## Required Metadata

### Documentation Front Matter

#### Standard Documentation Files
```yaml
---
title: [string - required]
created: [date - required]
updated: [date - required]
last_checked: [date - required]
tags: [array - required]
# At least one linking field required:
parent: [path - optional]
children: [array - optional]
code_files: [array - optional]
related: [array - optional]
---
```

#### Agent Files (.claude/agents/*.md)
Agent files require BOTH subagent registration AND documentation fields:
```yaml
---
# Subagent registration fields (for Claude Code)
name: [hyphenated-name - required for agents]
description: [what the agent does - required for agents]
tools: [comma-separated list - optional, inherits all if omitted]

# Documentation system fields (for AgentFlow)
title: [string - required]
created: [date - required]
updated: [date - required]
last_checked: [date - required]
tags: [array - required]
parent: [path - required]
code_files: [array - optional]
---
```

The `name` and `description` fields register the agent with Claude Code's `/agents` command.
The documentation fields maintain our bidirectional linking and validation system.

### YAML Frontmatter Quoting

Values containing special YAML characters must be quoted for Docusaurus compatibility:

```yaml
# Quote values with: < > [ ] : { }
argument-hint: "<repo-name> [--branch <branch>]"  ✅
argument-hint: <repo-name> [--branch <branch>]    ❌ Breaks YAML parsing

# Simple values don't need quotes
description: Add AgentFlow to an existing repository  ✅
```

### Code Documentation
```typescript
/**
 * Component/Function description
 * @documentation /docs/path/to/doc.md (required)
 * @requirements /docs/bdd/feature.feature (optional)
 * @adr /docs/architecture/adr/adr-xxx.md (optional)
 */
```

## Folder Structure

### Framework Documentation (/.claude/docs/)
- How AgentFlow itself works
- Reference docs for agents/orchestrators
- Command and hook documentation

### Project Documentation (/docs/)
```
/docs/
├── bdd/              # Mandatory - BDD scenarios
├── architecture/     # Mandatory - ADRs and design
│   └── adr/
├── requirements/     # Mandatory - Requirements links
├── cicd/            # Pre-populated - CI/CD guides
└── development/     # Pre-populated - Dev guides
```

## Docs Portal Integration

AgentFlow documentation is published to a shared Docusaurus site. The portal mirrors the `.claude/` structure.

### Synced to Portal
These directories are synced and relative links between them work:
- `docs/` - Core documentation (entry point: `docs/README.md`)
- `agents/` - Agent definitions
- `skills/` - Process and expertise skills (includes orchestration)
- `commands/` - Slash command documentation

### Not Synced (Internal)
Links to these will break on the portal - acceptable for internal references:
- `scripts/` - Validation and setup scripts
- `templates/` - File templates
- `lib/` - TypeScript utilities
- `hooks/` - Claude Code hooks
- `work/` - Working files

### Linking Best Practice
When linking between synced directories, use relative paths:
```markdown
<!-- From commands/brownfield/add.md -->
[setup-process skill](../../skills/af-setup-process/SKILL.md)  ✅ Works

<!-- Link to internal script - will break on portal -->
[setup script](../../scripts/brownfield/agentflow-setup.sh)  ⚠️ Internal only
```

### Git Workflow for Docs Publishing

Merge on GitHub, not locally. The docs sync script pulls updates automatically.

```
Feature Branch                  GitHub (Origin)              Docs Portal
     │                               │                           │
     ├── push ──────────────────────►│                           │
     │                               │                           │
     │                    merge/PR ──┤                           │
     │                               │                           │
     │                               │◄── docs sync pulls ───────┤
     │                               │                           │
     │                               │────── syncs content ─────►│
```

**Pattern:**
1. Push feature branch to origin
2. Merge on GitHub (PR if main is protected)
3. Docs sync script runs periodically, pulls main, rebuilds portal

**Don't:** Merge locally in the main worktree - it's just a cache for the docs portal.

## Validation Approach

### Deterministic (Scripts)
- Front matter schema validation
- Link existence checking
- Bidirectional link verification
- Tag format validation

### AI-Powered (docs-quality-agent)
- Content quality assessment
- Documentation completeness
- Relevance to current code
- Identifying gaps and outdated content

### Validation Triggers
- **Post-write**: After any files created/modified
- **On-demand**: Via slash commands
- **Periodic**: Based on freshness threshold
- **Pre-deployment**: Full validation

## Freshness Management

Default threshold: 30 days (configurable)
```json
{
  "documentation": {
    "freshness_threshold_days": 30
  }
}
```

During rapid development, consider setting to 7 days.

## Documentation Modes

### Framework Mode
- Triggered by changes to `.claude/*` files
- Generates reference documentation
- Maintains component registry

### Project Mode
- Triggered by project source changes
- Updates API documentation
- Maintains feature documentation

## Quality Standards
1. **Complete** - Cover topics thoroughly
2. **Organized** - Clear heading structure
3. **Tagged** - Proper categorization
4. **Linked** - Connected to related docs/code
5. **Fresh** - Regularly validated and updated

## Operational Context Files

### Purpose
Dynamic files that serve as AI working memory for session continuity, distinct from static documentation.

### Location
`.claude/work/` - Separate from documentation directories

### Characteristics
- **Dynamic**: Change frequently during development
- **Operational**: Support active work, not reference
- **Ephemeral**: May be cleared between tasks
- **Linear-linked**: Reference Linear issues for context

### Exemptions
Operational context files are NOT subject to:
- Bidirectional linking requirements
- Parent-child relationship validation
- 30-day freshness checks
- Documentation validation scripts
- Standard frontmatter requirements

### Examples
- `current-task.md` - Active task implementation context
- Session handoff notes
- Temporary work tracking

These files are maintained programmatically by agents and orchestrators, not manually documented.

## No Templates Required
AI agents generate appropriate structure based on content.
Focus on metadata compliance, not rigid document formats.