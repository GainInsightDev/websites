---
title: Audit Project Documentation
description: Assess existing project documentation for brownfield onboarding
created: 2025-12-02
updated: 2026-01-05
last_checked: 2026-01-05
tags: [command, documentation, audit, brownfield]
parent: ./README.md
---

# /docs:audit-project

Assess existing project documentation state for brownfield onboarding to AgentFlow.

## Usage

```
/docs:audit-project
```

## What This Command Does

Invokes the docs-retrofit-agent in audit mode to:

1. **Scan the project** for all documentation artifacts
2. **Assess documentation quality** (None, Poor, Scattered, Good)
3. **Generate inventory** of what exists
4. **Provide recommendations** for AgentFlow integration

## When to Use

- **First time onboarding** - When adding AgentFlow to an existing project
- **Documentation discovery** - Understanding what docs exist
- **Planning documentation work** - Prioritizing what to create/update

## What Gets Checked

| Category | What We Look For |
|----------|------------------|
| Root docs | README.md, CONTRIBUTING, CHANGELOG, LICENSE |
| Docs directories | docs/, documentation/, doc/, wiki/ |
| Code docs | JSDoc/TSDoc comments, docstrings |
| API docs | OpenAPI, Swagger, GraphQL schemas |
| Architecture | ADRs, design docs, specifications |
| AI configs | CLAUDE.md, .cursorrules |

## Assessment Categories

| Rating | Meaning |
|--------|---------|
| **None** | No README, no docs folder, minimal code comments |
| **Poor** | README exists but outdated/incomplete, no structured docs |
| **Scattered** | Documentation exists but inconsistent, gaps present |
| **Good** | README current, docs organized, code documented |

## Example Output

```markdown
# Project Documentation Audit

## Overall Assessment: Scattered

## Documentation Inventory
- Root: README.md (outdated), LICENSE
- Docs Directory: docs/ with 12 files, inconsistent format
- Code Documentation: ~30% of public functions have TSDoc
- API Documentation: OpenAPI spec found (swagger.json)
- Architecture Records: None found

## Recommendations

### Immediate (Required for AgentFlow)
- [x] README.md exists (needs update)
- [ ] Add CLAUDE.md with @.claude/CLAUDE-agentflow.md import

### Short-term (First Sprint)
- [ ] Reorganize docs/ with consistent frontmatter
- [ ] Add project overview documentation
- [ ] Document key entry points and APIs

### Long-term (Ongoing)
- [ ] Increase TSDoc coverage to 80%+
- [ ] Create ADRs for major architectural decisions
- [ ] Add component documentation
```

## Command Implementation

```
Use Task tool with:
subagent_type: 'af-docs-retrofit-agent'
prompt: 'Run Phase 0 (Brownfield Audit). Scan all documentation artifacts, assess quality level (None/Poor/Scattered/Good), and provide structured recommendations for AgentFlow integration.'
```

## Next Steps After Audit

Based on assessment:

| Assessment | Next Action |
|------------|-------------|
| **None** | Create README.md and CLAUDE.md from templates, then run `/docs:retrofit` |
| **Poor** | Run `/docs:retrofit` to add structure and frontmatter |
| **Scattered** | Run `/docs:retrofit` to consolidate and standardize |
| **Good** | Add CLAUDE.md import, run `/quality:docs` to validate |

After retrofit is complete, use `/quality:docs` for ongoing validation.

## See Also

- [af-docs-retrofit-agent](../../agents/af-docs-retrofit-agent.md) - Agent documentation
- [brownfield-CLAUDE.md](../../templates/brownfield-CLAUDE.md) - CLAUDE.md template
- [brownfield setup](../../scripts/brownfield/README.md) - Setup scripts
