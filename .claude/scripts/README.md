---
title: AgentFlow Scripts
created: 2025-09-05
updated: 2025-12-09
last_checked: 2025-12-09
tags: [scripts, validation, automation, index, navigation]
parent: ../README.md
children:
  - ./brownfield/README.md
---

# AgentFlow Scripts

Organized scripts for framework operations.

## Directory Structure

```
scripts/
├── documentation/       # Documentation validation scripts
│   ├── validate-frontmatter.ts
│   ├── validate-links.ts
│   ├── validate-tsdoc.ts
│   ├── repair-frontmatter.ts
│   ├── check-stale-docs.ts
│   └── comprehensive-validation.ts
├── sync/                # Framework synchronization
│   └── sync-from-agentflow.ts
├── validation/          # Manifest and framework validation
│   ├── validate-manifest.ts
│   └── validate-module-registry.ts
├── brownfield/          # Brownfield project setup
│   ├── agentflow-setup.sh       # Main setup script
│   ├── start-work-hooks.template # Template for projects without hooks
│   └── README.md
└── archived/            # Deprecated scripts (sync tools)
```

## Documentation Scripts

Located in `documentation/` subdirectory. TypeScript utilities for documentation quality.

## Sync Scripts

Located in `sync/` subdirectory. Framework synchronization tools for distributing AgentFlow updates to projects.

### [sync-from-agentflow.ts](./sync/sync-from-agentflow.ts)
**Purpose**: Sync AgentFlow V2 framework from template repository to target projects
**Language**: TypeScript
**Dependencies**: Node.js, glob, fs, child_process

**Features**:
- Namespace validation (af- prefix checking)
- Settings.json merge strategy (hooks merge)
- Infrastructure sync (.github/workflows, .start-work-hooks)
- Backup creation before sync
- Sync state tracking at .claude/.sync/state.json
- Dry-run mode for preview

**Usage**:
```bash
npm run agentflow:sync
# or directly:
npx ts-node .claude/scripts/sync/sync-from-agentflow.ts

# With options:
npx ts-node .claude/scripts/sync/sync-from-agentflow.ts --dry-run --verbose
npx ts-node .claude/scripts/sync/sync-from-agentflow.ts --target /path/to/project
```

**Output**: Sync report with files synced, warnings, and errors

## Validation Scripts

Located in `validation/` subdirectory. Framework manifest and structure validation.

### [validate-manifest.ts](./validation/validate-manifest.ts)
**Purpose**: Validate template-manifest.json schema and namespace compliance
**Language**: TypeScript
**Dependencies**: Node.js, glob, fs

**Validation Rules**:
- Required manifest sections present
- Namespace rules enforced (af- prefix)
- Framework assets properly namespaced
- Include/exclude patterns valid
- Sync behavior configuration valid

**Usage**:
```bash
npm run validate:manifest
# or directly:
npx ts-node .claude/scripts/validation/validate-manifest.ts
```

**Output**: Validation report with schema compliance and namespace violations

### [validate-module-registry.ts](./validation/validate-module-registry.ts)
**Purpose**: Validate module-registry.yml structure, references, and dependency graph
**Language**: TypeScript
**Dependencies**: Node.js, Python 3 (for YAML parsing)

**Validation Rules**:
- YAML schema and required categories present
- All module fields valid (name, description, skill, depends_on)
- All skill references point to existing SKILL.md files
- All guide references point to existing documentation
- All integration guide references and conditions valid
- No circular dependencies (Kahn's algorithm)
- Topological sort produces valid installation order
- Combinations include all transitive dependencies

**Usage**:
```bash
npx ts-node .claude/scripts/validation/validate-module-registry.ts
```

**Output**: 133-check validation report with pass/fail for each assertion

## Script Overview

### [validate-frontmatter.ts](./documentation/validate-frontmatter.ts)
**Purpose**: Validate YAML frontmatter in documentation files
**Language**: TypeScript
**Dependencies**: Node.js, glob, yaml-front-matter

**Validation Rules**:
- Required fields: `title`, `created`, `updated`, `last_checked`, `tags`
- Date format: YYYY-MM-DD
- Tags format: Array of strings
- Parent/children relationships
- File existence verification

**Usage**:
```bash
npm run validate:docs
# or directly:
npx ts-node .claude/scripts/documentation/validate-frontmatter.ts
```

**Output**: List of files with invalid or missing frontmatter

### [repair-frontmatter.ts](./documentation/repair-frontmatter.ts)
**Purpose**: Automatically fix common frontmatter issues
**Language**: TypeScript
**Dependencies**: Node.js, glob, yaml-front-matter

**Repair Actions**:
- Add missing required fields
- Fix date formats
- Update `last_checked` to current date
- Normalize tag arrays
- Create proper parent/child relationships

**Usage**:
```bash
npm run repair:docs
# or directly:
npx ts-node .claude/scripts/documentation/repair-frontmatter.ts
```

**Output**: List of files repaired and changes made

### [check-stale-docs.ts](./documentation/check-stale-docs.ts)
**Purpose**: Identify documentation that may be outdated
**Language**: TypeScript
**Dependencies**: Node.js, glob, file system access

**Staleness Criteria**:
- `last_checked` date older than threshold
- File modification time newer than `last_checked`
- Related code files modified since last check
- Missing required documentation

**Usage**:
```bash
npm run check:stale
# or directly:
npx ts-node .claude/scripts/documentation/check-stale-docs.ts
```

**Output**: Report of stale documentation requiring updates

### [validate-links.ts](./documentation/validate-links.ts)
**Purpose**: Verify bidirectional linking between documentation files
**Language**: TypeScript
**Dependencies**: Node.js, glob, markdown parsing

**Link Validation**:
- Parent-child relationships are reciprocal
- File references exist and are accessible
- Markdown links resolve to valid files
- Cross-references are bidirectional
- No orphaned documentation

**Usage**:
```bash
npm run validate:links
# or directly:
npx ts-node .claude/scripts/documentation/validate-links.ts
```

**Output**: Report of broken or missing links

### [validate-tsdoc.ts](./documentation/validate-tsdoc.ts)
**Purpose**: Check TypeScript files for proper documentation
**Language**: TypeScript
**Dependencies**: Node.js, TypeScript compiler API

**Documentation Checks**:
- Public functions have TSDoc comments
- Interfaces are documented
- Classes have proper documentation
- Exported members are documented
- Documentation follows TSDoc standards

**Usage**:
```bash
npm run validate:tsdoc
# or directly:
npx ts-node .claude/scripts/documentation/validate-tsdoc.ts
```

**Output**: List of TypeScript files missing documentation

## Script Architecture

### Technology Stack
- **TypeScript**: Type safety and modern JavaScript features
- **Node.js**: Runtime environment for script execution
- **glob**: File pattern matching for documentation discovery
- **YAML/Markdown Parsing**: Content analysis and manipulation

### Common Dependencies
Scripts require these npm packages:
```json
{
  "dependencies": {
    "glob": "^10.0.0",
    "ts-node": "^10.0.0",
    "typescript": "^5.0.0",
    "yaml-front-matter": "^4.0.0"
  }
}
```

### Execution Environment
- **Working Directory**: Should be run from `.claude/scripts/`
- **Node.js Version**: Modern Node.js (16+)
- **TypeScript**: Configured via tsconfig.json
- **File Access**: Requires read/write access to documentation files

## Integration Points

### With docs-agent
Scripts are integral to docs-agent workflow:
1. **Detection Phase**: Run validation scripts to identify issues
2. **Repair Phase**: Use repair scripts to fix problems
3. **Validation Phase**: Re-run scripts to confirm fixes

### With Commands
Scripts support slash commands:
- `/check-stale-docs` → `check-stale-docs.ts`
- `/run-docs-agent` → All validation scripts
- Quality validation across framework

### With Hooks
Scripts can be triggered by hooks:
- Change detection hooks run relevant validations
- Automated quality maintenance
- Event-driven documentation updates

### With Framework Quality
Scripts enforce AgentFlow standards:
- BDD compliance through documentation
- Glossary term consistency
- Framework structure maintenance
- Quality gate enforcement

## Quality Standards

### Documentation Requirements
**All Documentation Must Have**:
- Valid YAML frontmatter with required fields
- Proper parent/child relationships
- Current `last_checked` dates
- Appropriate tags for classification
- Bidirectional links where applicable

### Validation Criteria
**Frontmatter Validation**:
- Required fields present
- Valid date formats (YYYY-MM-DD)
- Consistent tag formats
- Valid file references

**Link Validation**:
- Parent documents list children correctly
- Child documents reference correct parents
- File paths resolve to existing files
- No broken cross-references

**Freshness Validation**:
- Documentation updated within acceptable timeframes
- Code changes reflected in documentation
- Related files synchronized

## Script Usage Patterns

### Development Workflow
**Before Starting Work**:
```bash
cd .claude/scripts
npx ts-node validate-frontmatter.ts
npx ts-node check-stale-docs.ts
```

**During Development**:
- Scripts run automatically via docs-agent and hooks
- Manual execution for troubleshooting

**After Development**:
```bash
npx ts-node repair-frontmatter.ts
npx ts-node validate-links.ts
```

### Maintenance Workflow
**Regular Maintenance**:
```bash
# Complete validation suite
npx ts-node validate-frontmatter.ts
npx ts-node validate-links.ts  
npx ts-node check-stale-docs.ts
npx ts-node validate-tsdoc.ts

# Repair issues found
npx ts-node repair-frontmatter.ts
```

**Release Preparation**:
```bash
# Ensure all documentation is current
npx ts-node check-stale-docs.ts
npx ts-node validate-links.ts
npx ts-node validate-frontmatter.ts
```

## Infrastructure Requirements

### Package.json Setup
Scripts require package.json in root directory:
```json
{
  "name": "agentflow",
  "type": "module",
  "dependencies": {
    "glob": "^10.0.0",
    "ts-node": "^10.0.0", 
    "typescript": "^5.0.0",
    "yaml-front-matter": "^4.0.0"
  }
}
```

### TypeScript Configuration
tsconfig.json for proper script execution:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### Directory Structure
Scripts expect this documentation structure:
```
.claude/
├── docs/
│   ├── README.md
│   ├── guides/
├── agents/
├── skills/
└── scripts/ (working directory)
```

## Troubleshooting

### Common Issues

**Module Resolution Errors**:
```bash
# Ensure package.json has "type": "module"
# Install dependencies: npm install
# Check tsconfig.json configuration
```

**Permission Issues**:
```bash
# Ensure write access to documentation directories
# Check file permissions: ls -la
# Verify script execution permissions
```

**TypeScript Compilation Errors**:
```bash
# Update TypeScript: npm install typescript@latest
# Check tsconfig.json compatibility
# Verify import/export syntax
```

**File Path Issues**:
```bash
# Run from correct directory: cd .claude/scripts
# Check relative path resolution
# Verify file existence: ls -la ../docs/
```

### Debugging Scripts
```bash
# Add verbose output to scripts
# Check file system access
ls -la .claude/docs/

# Verify npm dependencies
npm list

# Test individual script sections
# Use console.log for debugging
```

### Script Output Analysis
**Validation Failures**: Review specific error messages and file paths
**Repair Actions**: Verify changes made to files
**Performance Issues**: Check file system access and script efficiency
**Integration Problems**: Verify framework directory structure

## Future Enhancements

### Planned Features
- **Performance Optimization**: Parallel processing of validation
- **Custom Rules**: Configurable validation criteria
- **Integration APIs**: REST endpoints for validation services
- **Reporting**: HTML/JSON output formats

### Extension Points
- **Plugin Architecture**: Support for custom validators
- **Configuration Files**: YAML/JSON configuration
- **CLI Options**: Command-line argument support
- **IDE Integration**: Editor plugins for real-time validation

---

**Documentation Scripts**: 6 (validation and repair)
**Sync Scripts**: 1 (framework distribution)
**Validation Scripts**: 2 (manifest/namespace, module registry)
**Setup Scripts**: See `brownfield/` directory
**Language**: TypeScript, Bash
**Runtime**: Node.js
**Last Updated**: 2025-12-09

These scripts are essential for maintaining AgentFlow's documentation quality standards, distributing framework updates, and supporting the automated maintenance capabilities of the framework.