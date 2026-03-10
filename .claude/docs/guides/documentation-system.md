---
title: AgentFlow Documentation System Guide
sidebar_label: Documentation System
created: 2025-09-05
updated: 2025-12-09
last_checked: 2025-12-09
tags: [documentation, guide, agentflow, system]
parent: ./README.md
related:
  - ../standards/documentation-standards.md
  - ../../agents/af-docs-quality-agent.md
---

# AgentFlow Documentation System Guide

## Overview

AgentFlow uses a sophisticated self-documenting system that ensures all framework components and project code are thoroughly documented, validated, and maintained. This guide explains how the system works and how to use it effectively.

## Core Philosophy

- **Self-documenting code**: Assets describe themselves
- **Bidirectional linking**: Everything is connected
- **Continuous validation**: Scripts ensure quality
- **AI-driven maintenance**: docs-quality-agent keeps everything current

## Documentation Architecture

AgentFlow uses a three-layer documentation pattern as defined in the [Documentation Standards](../standards/documentation-standards.md#three-layer-documentation-pattern):
- **Asset Documentation**: Self-documenting files (agents, orchestrators, scripts)
- **Index Documentation**: README.md files for navigation
- **Reference Documentation**: Generated comprehensive docs

For detailed explanation of each layer, see the standards document.

## Bidirectional Linking System

Every document must maintain bidirectional links:

### Parent-Child Relationships
```yaml
# In parent (README.md)
children:
  - ./bdd-agent.md
  - ./docs-agent.md

# In child (bdd-agent.md)
parent: .claude/agents/README.md
```

### Validation Rules
1. Every parent must list its children
2. Every child must reference its parent
3. All links must resolve to existing files
4. Only designated roots can lack parents

### Allowed Root Documents
- `.claude/README.md` - Framework root
- `.claude/docs/README.md` - Documentation root
- `docs/README.md` - Project docs root
- `README.md` - Project root

## Validation Scripts

### Core Scripts

#### validate-frontmatter.ts
- Checks all .md files have required frontmatter
- Validates: title, dates, tags, linking fields
- Reports missing or invalid metadata

#### validate-links.ts
- Verifies bidirectional parent-child relationships
- Checks all referenced files exist
- Identifies orphaned documents
- Ensures README files list their children

#### validate-tsdoc.ts
- Checks TypeScript files for JSDoc comments
- Verifies @documentation tags
- Ensures code references its documentation

#### check-stale-docs.ts
- Finds documentation older than threshold
- Default: 30 days (configurable)
- Reports files needing review

#### repair-frontmatter.ts
- Automatically fixes missing frontmatter fields
- Adds required metadata
- Updates dates

### Running Validation

```bash
# Check frontmatter
npx ts-node .claude/scripts/validate-frontmatter.ts

# Check links
npx ts-node .claude/scripts/validate-links.ts

# Check all
npm run validate:docs
```

## docs-quality-agent Workflow

The docs-quality-agent is responsible for maintaining documentation:

### Phase 0: Prerequisites
1. Check if validation scripts work
2. Create package.json if missing
3. Install dependencies
4. Set up TypeScript config
5. Create missing directories

### Phase 1: Detection
1. Run validation scripts
2. Identify missing documentation
3. Find broken links
4. Detect stale content

### Phase 2: Repair
1. Fix frontmatter issues
2. Create missing README files
3. Establish parent-child links
4. Update stale content

### Phase 3: Generation
1. Create reference documentation
2. Generate component registry
3. Update architecture docs
4. Cross-reference components

### Phase 4: Validation
1. Re-run validation scripts
2. Confirm all issues fixed
3. Report what was updated

## Hook Integration

### SubagentStop Hook
- Analyzes changes made by subagents
- Propagates documentation recommendations
- Tells orchestrators when docs need updating

### Orchestrator Checkpoints
Mandatory documentation updates at:
- After creating Linear features
- After BDD scenario approval
- Before marking features as Done
- At phase completion

## For Developers

### Workflow: Creating Documentation for New Features

When implementing a new feature with BDD workflow:

1. **Refinement Phase** (creates initial documentation)
   - BDD scenarios define the feature in `.feature` files
   - Mini-PRD documents requirements and design
   - Visual specifications for UI components
   - **Output**: Feature specification documentation

2. **Implementation Phase** (creates code documentation)
   - Write code with inline JSDoc/TSDoc
   - Include `@documentation` tags pointing to guides
   - Reference BDD scenarios with `@requirements` tags
   - **Output**: Self-documenting code

3. **Documentation Phase** (creates reference guides)
   - Create comprehensive guides in `/docs/guides/`
   - Document APIs in `/docs/api/`
   - Write component documentation in `/docs/components/`
   - **Output**: User-facing documentation

4. **Validation Phase**
   - Run validation scripts to check metadata
   - Run docs-quality-agent for quality assessment
   - Ensure bidirectional links are complete
   - **Output**: Validated, complete documentation

**Example: Adding a new authentication feature**
```
1. Requirements: docs/bdd/authentication.feature
2. Design: docs/requirements/auth-mini-prd.md
3. Code: src/lib/auth.ts (with TSDoc)
4. Guide: docs/guides/authentication.md
5. API: docs/api/auth-endpoints.md
```

### Workflow: Adding New Framework Components

When adding agents, skills, commands, or orchestrators:

1. **Create the asset file**
   ```markdown
   ---
   title: My New Agent
   created: 2025-09-05
   updated: 2025-09-05
   last_checked: 2025-09-05
   tags: [agent, new]
   parent: .claude/agents/README.md
   ---
   # My New Agent
   [content]
   ```

2. **Update parent's children array**
   ```yaml
   # In .claude/agents/README.md
   children:
     - ./existing-agent.md
     - ./my-new-agent.md  # Add this
   ```

3. **Run validation**
   ```bash
   npx ts-node .claude/scripts/validate-links.ts
   ```

4. **Run docs-quality-agent**
   ```bash
   # Use Task tool to invoke docs-quality-agent
   ```

### Workflow: Updating Existing Documentation

When code changes require documentation updates:

1. **Identify affected documentation**
   - Check `@documentation` tags in changed code
   - Look for parent references in frontmatter
   - Search for related documents in `/docs/`

2. **Update content**
   - Modify the documentation to reflect changes
   - Update examples and code snippets
   - Add new sections if needed

3. **Update metadata**
   - Increment `updated` date to current date
   - Update `last_checked` to current date
   - Add new tags if topic areas expanded

4. **Validate changes**
   - Run `validate-frontmatter.ts` for metadata
   - Run `validate-links.ts` for broken links
   - Run docs-quality-agent for content quality

5. **Update related docs**
   - Check documents in `related` frontmatter field
   - Update any guides that reference changed code
   - Update parent README if behavior changed

**Common mistake**: Forgetting to update `last_checked` even when no content changes

### Workflow: Validating Documentation

Before committing any documentation changes:

1. **Run validation scripts**
   ```bash
   # Check frontmatter compliance
   npx ts-node .claude/scripts/validate-frontmatter.ts

   # Check bidirectional links
   npx ts-node .claude/scripts/validate-links.ts

   # Check TSDoc in code
   npx ts-node .claude/scripts/validate-tsdoc.ts

   # Check for stale docs
   npx ts-node .claude/scripts/check-stale-docs.ts
   ```

2. **Review script output**
   - Fix any errors reported (missing fields, broken links)
   - Address warnings (stale dates, missing tags)
   - Verify all parent-child relationships

3. **Run docs-quality-agent**
   - Performs semantic content validation
   - Identifies gaps in documentation
   - Suggests improvements

4. **Fix issues iteratively**
   - Start with infrastructure issues (missing files)
   - Fix metadata issues next (frontmatter)
   - Address content issues last (quality, completeness)

5. **Re-validate until clean**
   - Scripts should pass with no errors
   - Agent should confirm quality standards met

### Workflow: Migrating Legacy Documentation

When adding documentation to brownfield projects:

1. **Audit existing documentation**
   - Identify all existing `.md` files
   - Catalog documentation locations
   - Assess quality and coverage

2. **Add frontmatter to existing docs**
   - Use `repair-frontmatter.ts` for batch updates
   - Manually review and correct generated metadata
   - Establish parent-child relationships

3. **Create missing README indexes**
   - Add README.md to each directory with docs
   - List existing documentation as children
   - Provide navigation and overview

4. **Fill documentation gaps**
   - Identify undocumented code and features
   - Generate reference documentation
   - Create guides for complex workflows

5. **Establish validation baseline**
   - Run all validation scripts
   - Fix critical issues first
   - Create plan for addressing warnings

6. **Set up continuous validation**
   - Add validation to CI/CD pipeline
   - Configure git hooks for pre-commit checks
   - Schedule periodic docs-quality-agent runs

### Documentation Requirements

#### For Markdown Files
- Must have frontmatter
- Required fields: title, created, updated, last_checked, tags
- Must have at least one linking field

#### For TypeScript Files
- Must have JSDoc comment block
- Must include @documentation tag
- Should describe purpose and usage

#### For README Files
- Must list all children in directory
- Should provide brief descriptions
- Must link to parent (unless root)

## Edge Cases and Advanced Patterns

### Circular References
**Problem**: Two documents both trying to be each other's parent
```yaml
# doc-a.md
parent: ./doc-b.md

# doc-b.md
parent: ./doc-a.md  # CIRCULAR!
```

**Solution**: Establish clear hierarchy
- One document is the parent, one is the child
- Use `related` field for peer relationships instead
- Prefer parent-child for hierarchical relationships only

### Multiple Parents
**Problem**: Document logically belongs to multiple categories
```yaml
# authentication.md - belongs to both security/ and api/
```

**Solution**: Choose primary parent, use `related` for others
```yaml
# authentication.md
parent: ../security/README.md  # Primary category
related:
  - ../api/README.md  # Related category
```

### Orphaned Documents
**Problem**: Document exists but no parent references it
```yaml
# orphan.md
parent: ../README.md

# ../README.md doesn't list orphan.md in children
```

**Solution**: Add to parent's children array or use `related`
- If truly a child: Add to parent's `children` array
- If loosely related: Use `related` field instead
- If temporary: Move to `.claude/work/` directory

### Cross-Directory Linking
**Problem**: Linking between different documentation hierarchies
```
.claude/docs/guides/feature-a.md
docs/api/feature-a-api.md
```

**Solution**: Use `related` field for cross-hierarchy links
```yaml
# .claude/docs/guides/feature-a.md
parent: ./README.md
related:
  - ../../../docs/api/feature-a-api.md

# docs/api/feature-a-api.md
parent: ./README.md
related:
  - ../../.claude/docs/guides/feature-a.md
```

### Generated Documentation
**Problem**: Documentation auto-generated by tools (TypeDoc, Storybook)

**Solution**:
- Keep generated docs in separate directory (e.g., `docs/generated/`)
- Don't include in bidirectional linking system
- Link TO generated docs from hand-written guides
- Document the generation process in README

### Documentation for Deprecated Features
**Problem**: Feature deprecated but docs needed for legacy support

**Solution**:
1. Add deprecation notice to top of document
2. Move to `docs/deprecated/` directory
3. Update parent to new parent (`docs/deprecated/README.md`)
4. Add `deprecated: true` to frontmatter
5. Link from main docs with deprecation warning

## Troubleshooting

### Common Issues

#### "Missing frontmatter"
**Symptom**: `validate-frontmatter.ts` reports missing metadata
**Solution**: Add required frontmatter block at file start
```markdown
---
title: My Document
created: 2025-12-09
updated: 2025-12-09
last_checked: 2025-12-09
tags: [feature, guide]
parent: ./README.md
---
```

#### "Parent doesn't list this file as child"
**Symptom**: `validate-links.ts` reports unidirectional relationship
**Solution**: Update parent's children array
```yaml
# In parent README.md
children:
  - ./existing-child.md
  - ./your-document.md  # Add this line
```

#### "Child doesn't point back to parent"
**Symptom**: Document listed in parent but has wrong/missing parent field
**Solution**: Add or fix parent field in child's frontmatter
```yaml
# In child document
parent: ../README.md  # Must match parent's location
```

#### "Scripts won't run"
**Symptom**: `npx ts-node` commands fail or TypeScript errors
**Solution**:
1. Check package.json exists: `ls -la package.json`
2. Install dependencies: `npm install`
3. Check TypeScript installed: `npx tsc --version`
4. Verify script path: `ls -la .claude/scripts/validate-frontmatter.ts`

#### "Validation passes but docs-quality-agent fails"
**Symptom**: Scripts succeed but agent reports quality issues
**Explanation**:
- Scripts check structure (metadata, links exist)
- Agent checks semantics (content quality, completeness)
- Both validations are necessary

**Solution**: Address agent's semantic feedback
- Add missing content sections
- Improve examples and explanations
- Update outdated information
- Fill documentation gaps

#### "Stale documentation false positives"
**Symptom**: Docs marked stale but content is still current
**Solution**: Update `last_checked` date to confirm review
```yaml
last_checked: 2025-12-09  # Updated after confirming still accurate
```

#### "Broken links after moving files"
**Symptom**: Links break after reorganizing directory structure
**Solution**: Update all references systematically
1. Search for references to old path: `grep -r "old-path" .claude/`
2. Update parent's children array
3. Update document's parent field
4. Update any related field references
5. Run `validate-links.ts` to confirm fixes

#### "Merge conflicts in frontmatter"
**Symptom**: Git merge conflicts in YAML frontmatter
**Solution**: Careful manual resolution
1. Keep most recent `updated` date
2. Keep most recent `last_checked` date
3. Merge `tags` arrays (remove duplicates)
4. Preserve linking fields from both branches
5. Validate after resolving: `validate-frontmatter.ts`

### Diagnostic Process

1. **Run validation scripts** to identify issues
   ```bash
   npx ts-node .claude/scripts/validate-frontmatter.ts
   npx ts-node .claude/scripts/validate-links.ts
   npx ts-node .claude/scripts/validate-tsdoc.ts
   ```

2. **Check error messages** for specific problems
   - Read full error output carefully
   - Note which files are affected
   - Identify patterns in errors

3. **Fix infrastructure first** (package.json, directories)
   - Ensure build tools are installed
   - Create missing directories
   - Set up package.json if needed

4. **Repair metadata** using repair script
   ```bash
   npx ts-node .claude/scripts/repair-frontmatter.ts
   ```

5. **Manually fix** remaining issues
   - Update linking fields
   - Fix broken references
   - Add missing content

6. **Re-validate** to confirm fixes
   - Run scripts again
   - Verify all errors cleared
   - Run docs-quality-agent for final check

## Best Practices

1. **Always validate after changes** - Run scripts to catch issues early
2. **Keep frontmatter current** - Update dates when modifying files
3. **Maintain bidirectional links** - Update both parent and child
4. **Use descriptive titles** - Help with navigation and discovery
5. **Tag appropriately** - Enable better categorization
6. **Document as you go** - Don't leave it for later
7. **Let docs-quality-agent help** - Use it regularly to maintain quality

## System Benefits

- **Never lose documentation** - Everything is linked and validated
- **Always current** - Automated updates and freshness checks
- **Easy navigation** - Three-layer pattern provides multiple entry points
- **Quality assured** - Validation scripts catch issues
- **Self-healing** - docs-quality-agent can fix most problems automatically

## Summary

The AgentFlow documentation system combines:
- Self-documenting assets
- Navigation indexes
- Generated references
- Bidirectional linking
- Continuous validation
- AI-driven maintenance

This creates a robust, maintainable documentation system that scales with the project and ensures nothing is ever undocumented or out of date.