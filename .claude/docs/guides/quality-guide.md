---
title: AgentFlow Quality Guide
sidebar_label: Quality
sidebar_position: 9
created: 2025-12-09
updated: 2025-12-09
last_checked: 2025-12-09
tags: [quality, validation, documentation, testing, guide]
parent: ./README.md
related:
  - ../standards/documentation-standards.md
  - ./documentation-system.md
  - ./testing-guide.md
  - ../../agents/af-docs-quality-agent.md
  - ../../agents/af-code-quality-agent.md
  - ../../agents/af-architecture-quality-agent.md
---

# AgentFlow Quality Guide

## Overview

Quality in AgentFlow is multi-faceted, encompassing documentation quality, code quality, architectural quality, and process quality. This guide explains how AgentFlow maintains high standards through automated validation, continuous monitoring, and AI-assisted quality assurance.

## Core Quality Philosophy

AgentFlow's quality approach is built on these principles:

1. **Automated First**: Deterministic validation through scripts catches structural issues
2. **AI-Augmented**: Quality agents provide semantic validation and repair
3. **Continuous**: Quality checks run throughout development, not just at gates
4. **Preventive**: Git hooks and workflow checkpoints prevent quality debt
5. **Incremental**: Git-aware validation focuses on changes, not full re-validation
6. **Self-Healing**: Agents automatically repair safe issues

## Quality Dimensions

### 1. Documentation Quality

Documentation quality ensures all code, features, and framework components are thoroughly documented and maintained.

#### Standards Enforced
- **Frontmatter compliance**: All `.md` files have required metadata
- **Bidirectional linking**: Parent-child relationships are maintained
- **Freshness**: Documentation is reviewed within threshold (default 30 days)
- **Completeness**: All components have corresponding documentation
- **TSDoc compliance**: Code has JSDoc/TSDoc comments with `@documentation` tags

#### Validation Tools
- `validate-frontmatter.ts` - Checks YAML schema compliance
- `validate-links.ts` - Verifies bidirectional relationships
- `validate-tsdoc.ts` - Ensures code documentation
- `check-stale-docs.ts` - Finds outdated documentation
- `repair-frontmatter.ts` - Auto-fixes metadata issues

#### Quality Agent
**docs-quality-agent** orchestrates documentation validation:
- Runs validation scripts
- Identifies issues and gaps
- Performs safe automatic repairs
- Reports issues requiring human review
- Tracks validation state incrementally

See [Documentation System Guide](./documentation-system.md) for detailed workflows.

### 2. Code Quality

Code quality ensures implementation follows best practices, is well-tested, and maintainable.

#### Standards Enforced
- **Testing**: All code has corresponding tests (unit, integration, or E2E)
- **Type Safety**: TypeScript strict mode, no `any` types
- **Linting**: ESLint rules enforced
- **Formatting**: Prettier configuration applied
- **Documentation**: JSDoc/TSDoc for public APIs
- **BDD Alignment**: Implementation matches Markdown scenario specifications

#### Validation Tools
- `npm run lint` - ESLint validation
- `npm run type-check` - TypeScript compiler
- `npm test` - Jest test execution
- `npm run test:coverage` - Coverage analysis
- Custom: `validate-tsdoc.ts` - Documentation compliance

#### Quality Agent
**code-quality-agent** performs code validation:
- Runs linting and type checking
- Validates test coverage meets thresholds
- Checks code-to-documentation links
- Ensures BDD scenario alignment
- Reviews code patterns for best practices

See [Testing Guide](./testing-guide.md) for testing standards.

### 3. Architecture Quality

Architecture quality ensures design decisions are documented, ADRs are current, and system design remains coherent.

#### Standards Enforced
- **ADR Creation**: Significant decisions have Architecture Decision Records
- **ADR Currency**: ADRs reviewed and updated as needed
- **System Coherence**: Architecture documentation reflects current system
- **Decision Tracking**: All design choices have rationale
- **Pattern Consistency**: Architectural patterns are applied consistently

#### Validation Tools
- ADR format validation
- Cross-reference checking (ADRs to code)
- Architecture diagram validation
- Pattern compliance checking

#### Quality Agent
**architecture-quality-agent** maintains architectural quality:
- Reviews recent code changes for architectural impact
- Identifies decisions needing ADRs
- Validates existing ADRs against current code
- Checks for architectural drift
- Ensures documentation reflects design

### 4. Process Quality

Process quality ensures AgentFlow workflows are followed correctly and context is preserved.

#### Standards Enforced
- **Phase Adherence**: Development follows Setup → Discovery → Requirements → Delivery
- **BDD Compliance**: All features start with Markdown scenario specifications
- **Approval Gates**: Requirements phase has human approval
- **Context Preservation**: `current-task.md` and Linear integration maintain state
- **Commit Standards**: Commits are properly formatted and validated

#### Validation Checkpoints
- **Setup Phase**: Infrastructure validated before proceeding
- **Discovery Phase**: Linear features properly documented
- **Requirements Phase**: Mini-PRD approved before implementation
- **Delivery Phase**: Tests pass, documentation created, pre-commit validation

## Quality Workflows

### 1. Pre-Commit Quality Validation

**When**: Before every `git commit`

**Triggered By**: `.claude/hooks/git-commit-reminder` hook

**Process**:
```bash
# Hook checks if validation needed
1. Detect changed files (code, docs, config)
2. Display reminder if non-trivial changes
3. Block commit on first attempt (reminder)
4. Allow commit on second attempt (after validation)
```

**Developer Workflow**:
```bash
# First attempt - blocked with reminder
git commit -m "Add new feature"
# > Have you run validation? (docs-quality-agent, tests, etc.)

# Run appropriate validation
Task tool → docs-quality-agent    # If docs changed
npm test                          # If code changed
npm run lint                      # If code changed

# Second attempt - proceeds
git commit -m "Add new feature"
# > Commit succeeds
```

**Validation Decision Tree**:
- **Documentation changes?** → Run docs-quality-agent
- **Code changes?** → Run tests + linting
- **Configuration changes?** → Verify functionality
- **Framework changes?** → Full validation suite
- **Trivial changes?** → Skip validation (typos, formatting, whitespace)

See [CLAUDE-agentflow.md section 5](../../CLAUDE-agentflow.md) for hook reminder rules.

### 2. Incremental Validation

**When**: During development, after changes

**Purpose**: Validate only what changed since last validation

**Implementation**:
```typescript
// Uses .claude/lib/validation-state.ts
const state = validationState.getAgentState('docs-quality-agent');
const changedFiles = validationState.getChangedFiles(
  'docs-quality-agent',
  ['**/*.md']
);

// Validate only changed files
for (const file of changedFiles) {
  await validateFile(file);
}

// Update state
validationState.updateAgentState('docs-quality-agent', {
  lastCommit: currentCommit,
  lastRun: new Date().toISOString()
});
```

**Benefits**:
- Faster feedback (seconds vs minutes)
- Focused on recent work
- Catches issues immediately
- Scales with project size

**State File**: `.claude/validation-state.json`
```json
{
  "lastValidation": "2025-12-09T10:30:00Z",
  "agents": {
    "docs-quality-agent": {
      "lastCommit": "abc123",
      "lastRun": "2025-12-09T10:30:00Z",
      "filesValidated": 12,
      "issuesFound": 0
    }
  }
}
```

### 3. Full Quality Audit

**When**: Before releases, weekly scheduled, on-demand

**Purpose**: Comprehensive validation of entire project

**Invocation**:
```bash
# Via slash command
/quality:docs --full-audit

# Direct agent invocation
Task tool → docs-quality-agent with "full audit" directive
```

**Process**:
1. **Documentation Validation**
   - All `.md` files in `.claude/` and `docs/`
   - Frontmatter schema compliance
   - Bidirectional link verification
   - Freshness checking (30-day threshold)
   - TSDoc validation in code

2. **Code Validation**
   - Full test suite execution
   - Coverage analysis (target: 80%+)
   - Linting all source files
   - Type checking entire codebase
   - Build verification

3. **Architecture Validation**
   - ADR completeness check
   - Architecture documentation currency
   - Pattern consistency review
   - Cross-reference validation

4. **Process Validation**
   - Linear issue synchronization
   - BDD scenario alignment
   - Work context integrity
   - Git history quality

**Output**: Comprehensive report with all findings and recommendations

### 4. On-Demand Validation

**When**: Developer or orchestrator requests specific validation

**Use Cases**:
- After major refactoring
- Before creating pull requests
- When documentation feels stale
- After resolving merge conflicts
- When onboarding to AgentFlow (brownfield)

**Commands**:
```bash
# Documentation validation
/quality:docs

# Stale documentation check
/quality:docs --check-stale [days]

# Specific file validation
Task tool → docs-quality-agent "validate docs/api/auth.md"

# Code quality check
Task tool → code-quality-agent "validate src/components/Button.tsx"

# Architecture review
Task tool → architecture-quality-agent "review recent changes"
```

### 5. Brownfield Onboarding Validation

**When**: Adding AgentFlow to existing projects

**Purpose**: Assess current documentation state and identify gaps

**Process**:
```bash
# Audit existing documentation
/docs:audit-project

# Reports:
# - Overall assessment (None/Poor/Scattered/Good)
# - Documentation inventory
# - Gaps and recommendations
# - Migration plan
```

**Agent Procedure**:
1. Scan for existing documentation
2. Assess current state
3. Identify gaps and issues
4. Generate migration recommendations
5. Create baseline for improvement

See [docs-quality-agent Brownfield Audit Mode](../../agents/af-docs-quality-agent.md#brownfield-audit-mode) for details.

## Quality Validation Reference

### Documentation Validation

#### Frontmatter Schema
```yaml
---
# Required fields
title: [string]
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
last_checked: [YYYY-MM-DD]
tags: [array of strings]

# At least one linking field required
parent: [relative path to parent]
children: [array of relative paths]
code_files: [array of paths to code]
related: [array of related docs]
---
```

#### Script Execution
```bash
# Validate frontmatter
npx ts-node .claude/scripts/documentation/validate-frontmatter.ts

# Output examples:
# ✅ All 45 markdown files have valid frontmatter
# ❌ 3 files missing required fields:
#    - docs/guide.md: missing 'tags' field
#    - .claude/agents/new.md: missing 'created' date

# Validate links
npx ts-node .claude/scripts/documentation/validate-links.ts

# Output examples:
# ✅ All bidirectional links verified
# ❌ Link issues found:
#    - docs/api.md: parent doesn't list as child
#    - .claude/README.md: child reference broken

# Check stale docs
npx ts-node .claude/scripts/documentation/check-stale-docs.ts

# Output examples:
# ⚠️ 5 files not checked in > 30 days:
#    - docs/setup.md: last_checked 45 days ago
#    - .claude/agents/old.md: last_checked 60 days ago

# Auto-repair frontmatter
npx ts-node .claude/scripts/documentation/repair-frontmatter.ts

# Output examples:
# ✅ Repaired 3 files:
#    - Added missing 'tags' to docs/guide.md
#    - Updated 'last_checked' in setup.md
```

#### Safe Auto-Repairs
Agents can automatically fix:
- Missing frontmatter fields (add with defaults)
- Outdated `last_checked` dates (update to current)
- Malformed tags (convert to array format)
- Missing parent in parent's children array (add)
- Broken internal links with known new path (update)

#### Manual Review Required
Agents report but don't fix:
- Outdated content (requires re-writing)
- Missing documentation (need to create)
- Broken external links (need human decision)
- Circular parent-child relationships (need restructure)
- Architectural decisions (need ADR review)

### Code Validation

#### TSDoc Requirements
```typescript
/**
 * Description of what the function does
 *
 * @param paramName - Description of parameter
 * @returns Description of return value
 * @documentation /docs/guides/feature.md
 * @requirements /docs/bdd/feature.feature
 * @adr /docs/architecture/adr/adr-005.md (optional)
 */
export function myFunction(paramName: string): number {
  // implementation
}
```

#### Test Coverage Targets
- **Overall Coverage**: 80%+ (target)
- **Critical Paths**: 95%+ (authentication, payments, data integrity)
- **UI Components**: 70%+ (focus on logic, not just rendering)
- **Utilities**: 90%+ (pure functions are easy to test)

#### Linting Rules
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'no-console': 'warn',
    'complexity': ['error', 10],
    'max-lines-per-function': ['warn', 50]
  }
}
```

### Architecture Validation

#### ADR Format
```markdown
---
title: ADR-XXX: Decision Title
created: 2025-12-09
updated: 2025-12-09
last_checked: 2025-12-09
tags: [adr, architecture, decision]
parent: ../README.md
status: accepted  # proposed | accepted | deprecated | superseded
---

# ADR-XXX: Decision Title

## Context
[What's the situation requiring a decision?]

## Decision
[What did we decide?]

## Consequences
[What are the impacts - positive and negative?]

## Alternatives Considered
[What else did we think about?]

## References
[Related ADRs, docs, code]
```

#### ADR Status Lifecycle
- **proposed**: Under consideration
- **accepted**: Active and being followed
- **deprecated**: No longer recommended but still in use
- **superseded**: Replaced by newer ADR (link to replacement)

#### Validation Checks
- All ADRs have status field
- Superseded ADRs link to replacement
- Deprecated ADRs have deprecation notes
- Recent major changes have corresponding ADRs
- Code references ADRs in comments when implementing decisions

## Quality Metrics

### Documentation Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Frontmatter Compliance | 100% | All `.md` files have valid frontmatter |
| Link Validity | 100% | All links resolve correctly |
| Bidirectional Links | 100% | Parent-child relationships complete |
| Documentation Freshness | 100% | No docs > 30 days without review |
| Code Documentation | 90%+ | Public APIs have JSDoc/TSDoc |

### Code Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test Coverage | 80%+ | Lines covered by tests |
| Type Safety | 100% | No `any` types, strict mode |
| Linting Clean | 100% | No ESLint errors |
| Build Success | 100% | `npm run build` succeeds |
| Test Pass Rate | 100% | All tests passing |

### Architecture Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| ADR Coverage | 100% | Major decisions have ADRs |
| ADR Currency | 90%+ | ADRs reviewed within 90 days |
| Pattern Consistency | High | Manual review of implementations |
| Documentation Alignment | 100% | Docs reflect actual architecture |

### Process Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Phase Adherence | 100% | All features follow 4-phase workflow |
| BDD Compliance | 100% | Features start with Markdown scenarios |
| Approval Gate | 100% | Requirements approved before Delivery |
| Context Preservation | High | Tasks tracked in Linear + current-task.md |
| Pre-commit Validation | High | Validation before most commits |

## Common Quality Issues

### Documentation Issues

#### Missing Frontmatter
**Problem**: Markdown file without metadata block

**Detection**: `validate-frontmatter.ts` reports error

**Fix**: Add frontmatter block
```yaml
---
title: Document Title
created: 2025-12-09
updated: 2025-12-09
last_checked: 2025-12-09
tags: [category, type]
parent: ../README.md
---
```

**Prevention**: Use docs-quality-agent when creating new docs

#### Broken Links
**Problem**: Parent doesn't list child, or child points to wrong parent

**Detection**: `validate-links.ts` reports mismatch

**Fix**: Update both sides of relationship
```yaml
# In parent
children:
  - ./child.md  # Add this

# In child
parent: ../README.md  # Verify correct path
```

**Prevention**: Use docs-quality-agent after moving files

#### Stale Documentation
**Problem**: Documentation not reviewed in > 30 days

**Detection**: `check-stale-docs.ts` reports age

**Fix**: Review content and update `last_checked`
```yaml
last_checked: 2025-12-09  # Update after review
```

**Prevention**: Weekly documentation review cycles

### Code Issues

#### Missing Tests
**Problem**: Code without corresponding test coverage

**Detection**: Coverage report shows uncovered lines

**Fix**: Add tests for uncovered code
```typescript
// src/utils/calculate.ts
export function calculate(x: number): number {
  return x * 2;
}

// src/utils/calculate.test.ts
describe('calculate', () => {
  it('doubles the input', () => {
    expect(calculate(5)).toBe(10);
  });
});
```

**Prevention**: TDD workflow (write tests first)

#### Missing Documentation
**Problem**: Public API without JSDoc

**Detection**: `validate-tsdoc.ts` reports missing docs

**Fix**: Add JSDoc block
```typescript
/**
 * Calculates the result by doubling the input
 *
 * @param x - The input number
 * @returns The doubled value
 * @documentation /docs/guides/calculations.md
 */
export function calculate(x: number): number {
  return x * 2;
}
```

**Prevention**: Code review checklist includes documentation

#### Type Safety Violations
**Problem**: Use of `any` type or type assertions

**Detection**: TypeScript compiler warnings, ESLint errors

**Fix**: Proper typing
```typescript
// Bad
const data: any = fetchData();

// Good
interface UserData {
  id: string;
  name: string;
}
const data: UserData = fetchData();
```

**Prevention**: Enable strict mode, avoid `any`

### Architecture Issues

#### Missing ADR
**Problem**: Major decision made without documentation

**Detection**: Code review notices architectural change without ADR

**Fix**: Create ADR retroactively
```markdown
# ADR-012: Switch to GraphQL

## Context
We needed better API flexibility for mobile clients...

## Decision
Migrated from REST to GraphQL using AWS AppSync...

## Consequences
- Benefit: Flexible queries reduce over-fetching
- Cost: Team learning curve for GraphQL
```

**Prevention**: Orchestrators create ADRs during decision-making

#### Outdated ADR
**Problem**: ADR doesn't reflect current implementation

**Detection**: architecture-quality-agent reports mismatch

**Fix**: Update ADR with current state or supersede
```yaml
# In old ADR
status: superseded
superseded_by: ../adr-018-new-approach.md

# In new ADR
status: accepted
supersedes: ../adr-012-old-approach.md
```

**Prevention**: Regular architecture review cycles

### Process Issues

#### Skipping Requirements Phase
**Problem**: Implementation without approved mini-PRD

**Detection**: Linear issue in Delivery without Requirements label

**Fix**: Stop implementation, create requirements
```bash
/requirements:refine <Linear-Feature-ID>
# Complete mini-PRD
/requirements:approve <Linear-Feature-ID>
# Then resume implementation
```

**Prevention**: Orchestrator enforces phase gates

#### Missing BDD Scenarios
**Problem**: Feature implemented without Markdown scenario specification

**Detection**: No scenarios in mini-PRD Section 4 for Linear issue

**Fix**: Retroactively create BDD scenarios in mini-PRD
```markdown
### E2E: Successful user login
**Test Type:** E2E
**Selectors:** AUTH.signin.*

**Preconditions:**
- User is registered

**Steps:**
1. User enters valid credentials
2. User submits login form

**Expected:**
- User is authenticated
- User redirected to dashboard
```

**Prevention**: Requirements phase creates scenario specs

#### Lost Context
**Problem**: Switching tasks without preserving state

**Detection**: Multiple concurrent `current-task.md` issues

**Fix**: Complete current task first
```bash
/task:complete  # Finish current work
/task:start <new-issue-id>  # Start new task
```

**Prevention**: One task at a time, update Linear

## Quality Agent Reference

### docs-quality-agent

**Purpose**: Validate and maintain documentation quality

**Capabilities**:
- Run validation scripts
- Fix frontmatter issues
- Update stale documentation
- Identify documentation gaps
- Generate missing README files

**Invocation**:
```bash
# Quick validation (changed files only)
Task tool → docs-quality-agent

# Full audit
Task tool → docs-quality-agent with "full audit" directive

# Brownfield assessment
/docs:audit-project
```

**Inputs**:
- Validation scope (incremental | full)
- Specific files/patterns (optional)
- Auto-repair mode (default: true)

**Outputs**:
- files_validated (count)
- issues_found (array)
- repairs_made (count)
- status (success | error)

See [af-docs-quality-agent.md](../../agents/af-docs-quality-agent.md)

### code-quality-agent

**Purpose**: Validate code quality and test coverage

**Capabilities**:
- Run linting and type checking
- Execute test suites
- Analyze coverage
- Validate TSDoc compliance
- Check BDD alignment

**Invocation**:
```bash
# Validate changed code
Task tool → code-quality-agent

# Specific file validation
Task tool → code-quality-agent "validate src/components/Button.tsx"
```

**Inputs**:
- Validation scope (incremental | full)
- Specific files/patterns (optional)

**Outputs**:
- files_validated (count)
- lint_errors (count)
- type_errors (count)
- test_failures (count)
- coverage_percentage (number)
- status (success | error)

See [af-code-quality-agent.md](../../agents/af-code-quality-agent.md)

### architecture-quality-agent

**Purpose**: Maintain architectural coherence and ADR quality

**Capabilities**:
- Review architectural changes
- Identify decisions needing ADRs
- Validate ADR currency
- Check pattern consistency
- Ensure documentation alignment

**Invocation**:
```bash
# Review recent changes
Task tool → architecture-quality-agent "review recent changes"

# Validate specific ADR
Task tool → architecture-quality-agent "validate ADR-012"
```

**Inputs**:
- Review scope (recent changes | specific ADR | full audit)
- Time window for "recent" (default: 7 days)

**Outputs**:
- decisions_requiring_adr (array)
- outdated_adrs (array)
- inconsistencies_found (array)
- status (success | error)

See [af-architecture-quality-agent.md](../../agents/af-architecture-quality-agent.md)

## Integration with Development Workflow

### Setup Phase
- Run full quality audit to establish baseline
- Validate framework documentation is current
- Ensure validation scripts are operational
- Set up git hooks for continuous validation

### Discovery Phase
- Validate requirement documents as created
- Check freshness of reference documentation
- Ensure Linear features are properly documented

### Requirements Phase
- Validate BDD feature files with bdd-expertise skill
- Ensure mini-PRDs have proper metadata
- Verify visual specifications are complete
- Run docs-quality-agent before approval

### Delivery Phase
- Validate code documentation (TSDoc) during implementation
- Run tests continuously (TDD workflow)
- Check code-to-doc links
- Pre-commit validation on every commit
- Full quality check before creating PR

## Best Practices

### 1. Validate Early and Often
- Run validation after creating new files
- Don't accumulate validation debt
- Fix issues immediately, not later
- Use incremental validation for speed

### 2. Automate What You Can
- Let repair scripts fix safe issues
- Use git hooks for continuous checks
- Schedule periodic full audits
- Trust quality agents for routine validation

### 3. Preserve Context
- Update validation state after runs
- Track what's been validated
- Use git-aware incremental validation
- Don't re-validate unchanged files

### 4. Respect the Reminders
- Hook reminders are behavioral guardrails
- Run suggested validation, don't bypass
- Understand trivial vs. non-trivial changes
- Use second attempt only after validation

### 5. Maintain Documentation
- Update `last_checked` even when content unchanged
- Keep frontmatter current
- Fix broken links immediately
- Review stale documentation weekly

### 6. Follow the Workflow
- Don't skip phases (especially Requirements)
- Create BDD scenarios before implementing
- Get approval before proceeding to Delivery
- Preserve context across sessions

### 7. Use the Right Tools
- Validation scripts for structural checks
- Quality agents for semantic validation
- Both are necessary for complete quality
- Don't rely on one without the other

## Troubleshooting

### Validation Scripts Won't Run
**Symptoms**: `npx ts-node` fails, TypeScript errors

**Diagnosis**:
```bash
# Check prerequisites
ls -la package.json         # Should exist
npx tsc --version           # Should show version
ls -la .claude/scripts/     # Should contain scripts
```

**Solutions**:
1. Install dependencies: `npm install`
2. Verify TypeScript: `npm install -D typescript ts-node`
3. Check script paths are correct
4. Ensure Node.js version compatible (16+)

### Validation Passes But Quality Agent Fails
**Explanation**: Scripts check structure, agents check semantics

**Example**:
```bash
# Scripts succeed
✅ validate-frontmatter: All metadata correct
✅ validate-links: All links valid

# Agent fails
❌ docs-quality-agent: Content outdated, missing sections
```

**Solution**: Address agent's semantic feedback
- Update outdated content
- Add missing sections
- Improve examples
- Fill documentation gaps

### False Positive Stale Warnings
**Symptom**: Docs marked stale but content is current

**Cause**: `last_checked` date not updated

**Fix**: Update date after reviewing
```yaml
last_checked: 2025-12-09  # Confirm content still accurate
```

**Prevention**: Review docs even when no changes needed

### Incremental Validation Misses Issues
**Symptom**: Full audit finds issues incremental validation missed

**Cause**: Validation state out of sync or corrupted

**Fix**:
```bash
# Reset validation state
rm .claude/validation-state.json

# Run full audit
Task tool → docs-quality-agent with "full audit"
```

**Prevention**: Don't manually edit validation-state.json

### Merge Conflicts in Frontmatter
**Symptom**: Git merge conflicts in YAML metadata

**Resolution Strategy**:
1. Keep most recent `updated` date
2. Keep most recent `last_checked` date
3. Merge `tags` arrays (remove duplicates)
4. Preserve linking fields from both branches
5. Validate after resolving

**Example**:
```yaml
# Branch A
updated: 2025-12-01
tags: [guide, api]

# Branch B
updated: 2025-12-05
tags: [guide, authentication]

# Resolved
updated: 2025-12-05      # Latest date
tags: [guide, api, authentication]  # Merged
```

### Quality Agent Timeout
**Symptom**: Agent runs for long time without completing

**Causes**:
- Large project (many files)
- Slow validation scripts
- Network issues (if fetching external data)

**Solutions**:
1. Use incremental validation instead of full audit
2. Validate specific subdirectories
3. Increase timeout in agent configuration
4. Run validation scripts directly (faster)

## Summary

AgentFlow quality is maintained through:

1. **Multi-dimensional validation**: Documentation, code, architecture, process
2. **Automated tools**: Validation scripts for deterministic checks
3. **AI agents**: Semantic validation and auto-repair
4. **Continuous monitoring**: Git hooks, incremental validation, scheduled audits
5. **Preventive measures**: Phase gates, BDD compliance, approval workflows
6. **Self-healing**: Automatic repair of safe issues

The result is a quality system that scales with project size, catches issues early, and maintains high standards with minimal manual effort.

**Key Takeaway**: Quality is not a gate at the end—it's continuous validation throughout development, with automation handling routine checks and AI agents providing intelligent assistance.
