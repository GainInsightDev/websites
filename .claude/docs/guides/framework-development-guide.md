---
title: Framework Development Guide - Creating AgentFlow Components
created: 2025-12-09
updated: 2026-01-03
last_checked: 2026-01-03
tags: [guide, framework, development, agents, skills, commands, hooks]
parent: ./README.md
related:
  - ../architecture/README.md
  - ../standards/documentation-standards.md
  - ../../skills/af-agentflow-framework-development/SKILL.md
---

# Framework Development Guide - Creating AgentFlow Components

This guide provides comprehensive patterns and best practices for developing AgentFlow framework components including agents, skills, commands, and hooks.

## Overview

AgentFlow V2 uses a layered architecture designed for maintainability and progressive disclosure:

```
Orchestrator (~100 lines) → References process skills
    ↓
Process Skills (~100-300 lines) → Workflow knowledge, references docs
    ↓
Sub-agents (~50 lines) → Execution layer, references expertise skills
    ↓
Expertise Skills (~100-400 lines) → Domain knowledge, references docs/templates
    ↓
Source Materials (500+ lines) → Docs, templates, scripts (source of truth)
```

### Core Principles

1. **Lightweight components** - Keep agents and skills small and focused
2. **Progressive disclosure** - Details live in comprehensive docs, not in agents
3. **Skills contain knowledge** - Agents are thin execution wrappers
4. **Documentation is king** - Everything must be thoroughly documented
5. **Namespace separation** - Framework uses `af-` prefix, projects don't

## Architecture Overview

### Component Types

| Component | Purpose | Size | Location |
|-----------|---------|------|----------|
| **Orchestration** | Phase coordination context | Always loaded | `CLAUDE-agentflow.md` |
| **Orchestration Skill** | Detailed workflows | 200-300 lines | `.claude/skills/af-orchestration/` |
| **Process Skill** | Workflow knowledge | 100-300 lines | `.claude/skills/af-*-process/` |
| **Expertise Skill** | Domain knowledge | 100-400 lines | `.claude/skills/af-*-expertise/` |
| **Agent** | Execution wrapper | ~50 lines | `.claude/agents/` |
| **Command** | User entry point | Variable | `.claude/commands/` |
| **Hook** | Automation trigger | Variable | `.claude/hooks/` |
| **Script** | Utility automation | Variable | `.claude/scripts/` |

### The V2 Architecture

**Key Innovation**: Knowledge lives in skills, agents load skills dynamically.

**Before (V1):**
```
Agent (500 lines) = Instructions + Procedures + Examples + Reference Material
```

**After (V2):**
```
Agent (50 lines) = "Load @skill-name and follow procedure X"
Skill (200 lines) = Rules + Workflows + Examples + Links to docs
Docs (800 lines) = Comprehensive reference material
```

**Benefits:**
- Agents stay lightweight and focused
- Skills are reusable across agents
- Documentation provides depth without bloat
- Easier to maintain and update

## Framework Namespace Rules

### The `af-` Prefix

**Framework components MUST use `af-` prefix:**
- `af-bdd-agent.md`
- `af-delivery-process/SKILL.md`
- `af-testing-expertise/SKILL.md`

**Project components MUST NOT use `af-` prefix:**
- `shopping-cart-service.md`
- `payment-processor-agent.md`
- `inventory-skill/SKILL.md`

### Why This Matters

1. **Clear separation** - Framework vs project code is instantly visible
2. **Sync safety** - Framework sync knows what to update (af-*) and what to preserve
3. **Naming conflicts** - Project can have `bdd-agent` alongside `af-bdd-agent`
4. **Distribution** - Brownfield setup knows which files came from AgentFlow

### Enforcement

The namespace is enforced by:
- Validation scripts checking for `af-` prefix
- Framework sync only touching `af-*` files
- Documentation standards requiring namespace compliance
- Code reviews and PR checks

## Creating Agents

### When to Create an Agent

Create a new agent when you need:
- **Specialized domain expertise** - BDD, testing, documentation, architecture
- **Distinct workflow** - Setup, discovery, requirements, delivery
- **Specific tool access** - Limited tools for safety (e.g., Read-only agent)
- **Model optimization** - Use Haiku for simple tasks, Opus for complex reasoning

**Don't create an agent when:**
- Functionality fits in existing agent
- Task can be handled by orchestrator directly
- No clear domain boundaries

### Agent Structure

Every agent must follow this structure:

```markdown
---
# Subagent registration (for Claude Code)
name: af-<domain>-agent
description: When to invoke this agent (1-2 clear sentences)
tools: Read, Write, Edit  # or omit for all tools
model: sonnet  # optional: sonnet|opus|haiku

# Documentation system (for AgentFlow)
title: <Domain> Agent
created: YYYY-MM-DD
updated: YYYY-MM-DD
last_checked: YYYY-MM-DD
tags: [agent, domain, specific-tags]
parent: ./README.md
---

# <Domain> Agent

## Role

[2-3 sentences describing what this agent does and when it's invoked]

## Skills Used

This agent loads the following skills:
- `af-<skill-name>` - [What knowledge it provides]
- `af-<other-skill>` - [What knowledge it provides]

## Inputs

**Required:**
- `parameter_name` (type) - Description of what this parameter is

**Optional:**
- `optional_param` (type) - Description and default value

## Procedure

1. **MUST load expertise skills**
   ```
   Load `af-<skill-name>` skill for [domain] knowledge
   ```

2. **MUST validate inputs**
   - Check required parameters are present
   - Validate parameter formats

3. **SHOULD perform main task**
   - Follow skill workflows
   - Apply skill rules
   - Use skill patterns

4. **MUST return results**
   - Format output as specified
   - Include success/error status

## Outputs

**On Success:**
- `result_field` (type) - Description of what is returned

**On Failure:**
- `error` (string) - Error message
- `details` (object) - Additional context

## Error Handling

- **Missing inputs** - Return error immediately
- **Validation failures** - Provide specific error details
- **Skill loading failures** - Fall back to basic procedure
- **Unexpected errors** - Log and report to orchestrator

## References

- Skills: `af-<skill-name>`
- Docs: [Link to comprehensive docs]
- Templates: [Link to any templates used]
```

### Agent Best Practices

#### 1. Keep Agents Lightweight

**Good (50 lines):**
```markdown
## Procedure

1. **MUST load BDD expertise**
   Load `af-bdd-expertise` skill

2. **MUST read Linear issue**
   - Extract requirements
   - Identify acceptance criteria

3. **MUST transform to Markdown scenarios**
   - Follow skill workflow: "Creating Scenarios from Requirements"
   - Apply glossary compliance rules

4. **MUST validate output**
   - Check scenario structure
   - Verify scenario coverage
```

**Bad (300 lines):**
```markdown
## Procedure

1. Understand scenario syntax:
   Markdown scenarios use a structured format...

   ## Scenario: Title

   **Preconditions:** Initial state...

   [200 lines of scenario reference material]

2. Apply BDD patterns:
   [100 more lines of patterns]
```

**Why bad is bad:**
- Agent contains reference material (should be in skill/docs)
- No skill loading - knowledge is baked in
- Hard to maintain - changes require agent updates
- Too long - Claude may skip or skim

#### 2. Use MUST/SHOULD/MAY Directives

**Clear priority:**
- **MUST** - Required step, agent fails if skipped
- **SHOULD** - Recommended step, can be skipped with reason
- **MAY** - Optional step, contextual decision

**Example:**
```markdown
1. **MUST validate inputs**
   - Required: linear_issue_id
   - Required: project_path

2. **SHOULD check for existing scenarios**
   - Look for existing mini-PRD files
   - Avoid duplicates

3. **MAY add additional scenarios**
   - If edge cases are identified
   - If user requests comprehensive coverage
```

#### 3. Specify Inputs and Outputs Clearly

**Good:**
```markdown
## Inputs

**Required:**
- `feature_id` (string) - Linear issue ID (format: LIN-XXX)
- `project_path` (string) - Absolute path to project root

**Optional:**
- `include_visual_specs` (boolean) - Generate UI mockups (default: false)
```

**Bad:**
```markdown
## Inputs

Takes a feature ID and maybe a project path or something. You might also want to pass other stuff.
```

#### 4. Reference Skills, Don't Duplicate Them

**Good:**
```markdown
3. **MUST transform to Markdown scenarios**
   - Load `af-bdd-expertise` skill
   - Follow workflow: "Creating Scenarios from Requirements"
   - Apply Rule #5: Glossary compliance
```

**Bad:**
```markdown
3. **MUST transform to scenarios**
   First, understand that scenarios use Preconditions/Steps/Expected...
   [Repeating content from the skill]
```

### Agent Testing

Before considering an agent complete:

1. **Test invocation** - Can orchestrator invoke it?
2. **Test inputs** - Does it handle required/optional params?
3. **Test skill loading** - Does it successfully load referenced skills?
4. **Test outputs** - Does it return expected results?
5. **Test error handling** - Does it fail gracefully?

**Example test procedure:**
```bash
# 1. Invoke agent via Task tool
Task tool → subagent_type="af-new-agent", inputs={"param": "value"}

# 2. Check it loaded skills
# Look for: "Loading `af-skill-name`..."

# 3. Verify output format
# Check returned object matches spec

# 4. Test error case
Task tool → subagent_type="af-new-agent", inputs={}  # missing required param

# 5. Check error message
# Should get clear error about missing param
```

## Creating Skills

### Skill Types

#### Process Skills

**Purpose:** Workflow knowledge - how to execute a phase or process

**Examples:**
- `af-setup-process` - Infrastructure setup workflow
- `af-discovery-process` - Problem exploration workflow
- `af-requirements-process` - BDD specification workflow
- `af-delivery-process` - Implementation workflow

**Characteristics:**
- Step-by-step procedures
- Phase-specific logic
- Coordination patterns
- When to invoke which agent

#### Expertise Skills

**Purpose:** Domain knowledge - patterns and rules for a specific domain

**Examples:**
- `af-bdd-expertise` - Markdown scenario patterns and glossary
- `af-testing-expertise` - Testing patterns and TDD
- `af-documentation-standards` - Documentation requirements
- `af-ux-design-expertise` - UI/UX patterns

**Characteristics:**
- Domain rules and constraints
- Pattern libraries
- Best practices
- Anti-patterns to avoid

### Skill Structure

Every skill must follow this structure:

```markdown
---
# Skill registration (for Claude Code)
name: af-<skill-name>
description: When to use this skill (clear trigger conditions)
type: process|expertise
domain: <domain-name>

# Documentation system (for AgentFlow)
title: <Skill Name>
created: YYYY-MM-DD
updated: YYYY-MM-DD
last_checked: YYYY-MM-DD
tags: [skill, type, domain]
parent: ../README.md
---

# <Skill Name>

## When to Use This Skill

Load this skill when you need to:
- [Specific trigger condition 1]
- [Specific trigger condition 2]
- [Specific trigger condition 3]

## Rules (FOLLOW THESE)

1. **Hard constraint** - Never do X
2. **Hard constraint** - Always do Y
3. **Validation requirement** - Check Z before proceeding
4. **Output requirement** - Format must be W
[15-20 rules total, one line each]

---

## Workflows

### Workflow: <Task Name>

**When:** [Condition that triggers this workflow]

**Steps:**
1. [Action step with brief explanation]
2. [Action step with brief explanation]
3. [Action step with brief explanation]
[10-15 steps total per workflow]

**Success criteria:**
- ✅ [Measurable outcome 1]
- ✅ [Measurable outcome 2]

---

### Workflow: <Another Task>

[Repeat structure]

---

## Examples

### Good Example: [What Works]

```[language if code, markdown otherwise]
[Example of correct pattern]
```

**Why this is good:**
- [Reason 1]
- [Reason 2]

### Bad Example: [Anti-pattern]

```[language]
[Example of incorrect pattern]
```

**Why this is bad:**
- [Reason 1]
- [Reason 2]

---

## Essential Reading

**Before using this skill, read:**
- [Link to comprehensive guide]
- [Link to related standard]

**For detailed patterns:**
- [Link to pattern library]
- [Link to examples]
```

### Skill Best Practices

#### 1. Be Directive, Not Reference

**Good (Directive):**
```markdown
## Rules (FOLLOW THESE)

1. All test files must end in `.test.ts` or `.spec.ts`
2. Never mock internal code - only external dependencies
3. Tests must be independent (no shared state)
4. Use `describe` for test suites, `it` or `test` for cases
5. Follow Arrange-Act-Assert pattern in every test

## Workflows

### Workflow: Writing Unit Tests from BDD

1. Read BDD scenario Given/When/Then
2. Create test file: `<feature>.test.ts`
3. Write describe block matching Feature name
4. Write it block for each Scenario
5. Implement: Given (setup), When (action), Then (assertions)
6. Run tests: `npm test`
```

**Bad (Reference):**
```markdown
## Testing in JavaScript

JavaScript has many testing frameworks available. Jest is one of the most popular
testing frameworks because it provides a complete testing solution...

[500 lines explaining testing concepts, history, comparisons]

When you write tests, you should think about...
[More conceptual discussion]

There are different types of tests...
[Taxonomy explanation]
```

**Why directive wins:**
- Claude knows exactly what to do
- Rules are clear and enforceable
- Workflows are step-by-step actionable
- Can be executed immediately
- Easy to validate compliance

**Why reference fails:**
- Claude treats it as background reading
- No clear action steps
- Too long to process fully
- Knowledge doesn't translate to action
- Hard to determine if followed correctly

#### 2. Keep Skills Under 300 Lines

Target: **150-200 lines**

**If your skill is growing past 300 lines:**

1. **Create a comprehensive guide** in `.claude/docs/guides/`
2. **Move detailed explanations** to the guide
3. **Move extensive examples** to the guide
4. **Keep only essential rules and workflows** in skill
5. **Link to guide** from "Essential Reading" section

**Example refactor:**

**Before (400 lines in skill):**
```markdown
## BDD Patterns

### Pattern 1: User Authentication
[50 lines of detailed explanation]

### Pattern 2: Data Validation
[50 lines of detailed explanation]

### Pattern 3: Error Handling
[50 lines of detailed explanation]

[Continue for 10 patterns...]
```

**After (180 lines in skill + 800 lines in guide):**

**Skill:**
```markdown
## Rules (FOLLOW THESE)

1. Use approved glossary terms only
2. Tag all scenarios: @happy, @error, @boundary, @validation
3. Include Feature, Background, and 4+ Scenarios minimum
4. Link to Linear issue with @linear:LIN-XXX tag

## Workflows

### Workflow: Creating Scenarios from Linear Issue
1. Read Linear issue requirements
2. Identify actors, actions, outcomes
3. Create mini-PRD file: `docs/requirements/mini-prd/<name>.md`
4. Write feature description with user story
5. Add Background for common setup
6. Write scenarios (happy, error, boundary, validation)
7. Validate with glossary

## Essential Reading

**Comprehensive BDD patterns and examples:**
- [BDD Expertise Skill](../../skills/af-bdd-expertise/SKILL.md) - Markdown scenario patterns
```

**Skill (af-bdd-expertise):**
```markdown
[Concise directive skill with patterns, glossary compliance, examples]
```

#### 3. Organize with Clear Section Headers

**Required sections:**
1. **When to Use This Skill** - Trigger conditions
2. **Rules (FOLLOW THESE)** - Hard constraints
3. **Workflows** - Step-by-step procedures
4. **Examples** - Good vs bad patterns
5. **Essential Reading** - Links to comprehensive docs

**Optional sections:**
- **Glossary** - Domain-specific terms (if not in separate file)
- **Troubleshooting** - Common issues and fixes (brief, link to guide for detail)
- **Quick Reference** - Cheat sheet or table

#### 4. Use Consistent Workflow Format

**Template:**
```markdown
### Workflow: [Task Name]

**When:** [Trigger condition]

**Steps:**
1. [Action with brief rationale]
2. [Action with brief rationale]
3. [Action with brief rationale]
[etc.]

**Success criteria:**
- ✅ [Measurable outcome]
- ✅ [Measurable outcome]
```

**Example:**
```markdown
### Workflow: Setting Up Test Infrastructure

**When:** Starting new project or adding tests to existing code

**Steps:**
1. Install test framework: `npm install --save-dev jest @types/jest`
2. Create jest.config.js with TypeScript support
3. Add test scripts to package.json
4. Create `__tests__` directory structure
5. Configure coverage thresholds (80% minimum)
6. Verify setup: `npm test`

**Success criteria:**
- ✅ Jest runs without errors
- ✅ Coverage reporting works
- ✅ TypeScript tests execute
```

### Skill Testing

Before considering a skill complete:

1. **Test in isolation** - Load skill and verify Claude understands it
2. **Test with agent** - Agent should successfully load and use skill
3. **Test workflows** - Follow each workflow to ensure it's actionable
4. **Test examples** - Examples should be clear and helpful
5. **Test links** - All referenced docs must exist

**Example test:**
```markdown
# Test Skill Loading
1. Create simple agent that loads the skill
2. Give agent a task that requires skill workflows
3. Verify agent follows workflow steps
4. Check agent applies skill rules
5. Confirm agent references skill examples

# Example Agent for Testing
Task: "Create a unit test for authentication function"

Expected:
- Agent loads `af-testing-expertise`
- Agent follows "Writing Unit Tests from BDD" workflow
- Agent creates .test.ts file (Rule #1)
- Agent uses Arrange-Act-Assert pattern (Rule #5)
```

## Creating Commands

### When to Create a Command

Create a slash command when you need:
- **User-facing entry point** - Discoverable way to start a workflow
- **Consistent invocation** - Standardized way to trigger common tasks
- **Parameter handling** - Accept and validate user inputs
- **Phase transitions** - Start setup, discovery, requirements, delivery

**Don't create a command when:**
- Functionality is only used internally by agents
- No user interaction needed
- Feature is experimental or temporary

### Command Structure

```markdown
---
# Claude Code slash command registration
description: What this command does (1 line, shows in autocomplete)
title: Command Full Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
last_checked: YYYY-MM-DD
tags: [command, category]
parent: ./README.md
---

# Command Title

[The body is the prompt that executes when command is invoked]

[You can use $1, $2, etc. for positional arguments]
[Or $ARGUMENTS for all arguments as string]

Example command body:

You are starting the Requirements phase for Linear feature $1.

Your tasks:
1. Load `af-requirements-process` skill
2. Invoke af-bdd-agent to create Markdown scenarios
3. Invoke af-ux-design-agent to create visual specifications
4. Create mini-PRD document
5. Wait for human approval before proceeding

Begin by reading the Linear feature and confirming you understand the requirements.
```

### Command Categories

Commands are organized by category:

```
.claude/commands/
├── af/                    # Framework commands (/af:*)
│   ├── sync.md
│   └── validate.md
├── task/                  # Task management (/task:*)
│   ├── start.md
│   ├── continue.md
│   └── complete.md
├── requirements/          # Requirements phase (/requirements:*)
│   ├── refine.md
│   └── approve.md
└── discovery/             # Discovery phase (/discovery:*)
    └── discover.md
```

### Command Naming

**Format:** `/<category>:<action>`

**Examples:**
- `/task:start` - Start working on a task
- `/requirements:refine` - Begin requirements refinement
- `/af:sync` - Sync framework from upstream
- `/discovery:discover` - Start discovery phase

**Rules:**
1. Category matches directory name
2. Action is verb (start, continue, approve, sync)
3. Use kebab-case for multi-word: `/task:complete`
4. Framework commands use `/af:` prefix

### Command Best Practices

#### 1. Clear Description for Autocomplete

**Good:**
```yaml
description: Start work on a Linear issue by creating current-task.md
```

**Bad:**
```yaml
description: Task starter
```

**Why:** Users see description in autocomplete and need to understand what command does.

#### 2. Validate Arguments

**Good:**
```markdown
# /task:start <linear-issue-id>

Check that argument is provided:

@if $1
  Starting work on Linear issue: $1
  [rest of command]
@else
  ERROR: Missing required argument
  Usage: /task:start <linear-issue-id>
  Example: /task:start LIN-123
```

**Note:** Command files don't support true conditionals, so validation happens when command executes. Clear error messages help users correct mistakes.

#### 3. Provide Usage Examples

**Good:**
```markdown
---
description: Sync AgentFlow framework from upstream repository
---

# Sync Framework

Sync the latest AgentFlow framework changes from the upstream repository.

**Usage:**
/af:sync [--branch <branch-name>]

**Examples:**
- /af:sync                    # Sync from main branch
- /af:sync --branch feature   # Sync from feature branch

**What gets synced:**
- All `af-*` files (agents, skills, commands, hooks)
- Framework documentation
- Validation scripts

**What is preserved:**
- Project-specific files (no `af-` prefix)
- Project documentation
- Local customizations

[Command implementation]
```

#### 4. Reference Skills and Agents

**Good:**
```markdown
# /requirements:refine <feature-id>

You are starting the Requirements phase for Linear feature $1.

**Your procedure:**

1. **Load process skill**
   Load `af-requirements-process` for Requirements phase workflow

2. **Invoke BDD agent**
   Use Task tool with subagent_type="af-bdd-agent"
   Input: feature_id="$1"

3. **Invoke UX agent** (if UI feature)
   Use Task tool with subagent_type="af-ux-design-agent"
   Input: feature_id="$1"

4. **Create mini-PRD**
   Follow mini-PRD template structure
   Include BDD scenarios and visual specs

5. **Request approval**
   Wait for human approval via /requirements:approve
```

### Command Testing

Before considering a command complete:

1. **Test autocomplete** - Does command show up when typing `/`?
2. **Test invocation** - Does `/category:action` execute correctly?
3. **Test arguments** - Do $1, $2, etc. work as expected?
4. **Test error cases** - What happens with missing/invalid args?
5. **Test documentation** - Is usage clear from command body?

**Example test:**
```bash
# 1. Type "/" in Claude Code
# Verify: command appears in autocomplete list

# 2. Type full command
/task:start LIN-123

# Verify: command expands and executes
# Expected: Creates current-task.md with LIN-123

# 3. Test without argument
/task:start

# Verify: Shows error message with usage
```

## Creating Hooks

### Hook Types

AgentFlow uses Claude Code hooks for automation:

| Hook | When It Fires | Use Case |
|------|--------------|----------|
| `PreToolUse` | Before tool execution | Validation, safety checks |
| `PostToolUse` | After tool execution | Formatting, notifications |
| `Stop` | After main agent completes | Documentation updates |
| `SubagentStop` | After subagent completes | Propagate recommendations |
| `SessionStart` | When session begins | Environment setup |
| `SessionEnd` | When session ends | Cleanup |

### Hook Actions

Each hook can perform different actions:

| Type | Description | Example |
|------|-------------|---------|
| `command` | Run bash script | Execute validation script |
| `prompt` | Display message | Remind user to validate |
| `block` | Prevent action | Block commit if tests fail |

### Hook Structure

**Example hook configuration (settings.json):**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/git-commit-reminder.sh '$ARGUMENTS'",
            "displayOutput": true
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Consider running docs-quality-agent to update documentation."
          }
        ]
      }
    ]
  }
}
```

**Example hook script (.claude/hooks/git-commit-reminder.sh):**

```bash
#!/bin/bash
# Reminds about validation before commits

COMMAND="$1"

# Check if this is a git commit command
if [[ "$COMMAND" == *"git commit"* ]]; then
    echo "⚠️  Reminder: Have you run validation?"
    echo "   - Code changes: Run tests"
    echo "   - Docs changes: Run docs-quality-agent"
    echo ""
    echo "   If already validated, proceed with commit."
    echo "   If not validated, run checks first."

    # Don't block, just remind
    exit 0
fi

# Not a commit, allow through
exit 0
```

### Hook Best Practices

#### 1. Use Hooks for Automation, Not Blocking

**Good:**
```bash
# Reminder hook - informs but doesn't block
echo "⚠️  Reminder: Run validation before committing"
echo "If already done, proceed. Otherwise, validate first."
exit 0  # Allow action to proceed
```

**Bad:**
```bash
# Blocking hook - prevents action
echo "ERROR: You must run validation"
exit 1  # Blocks action - frustrating if already validated
```

**Why:** Hooks that block require workarounds. Reminder hooks respect context.

#### 2. Make Hooks Contextual

**Good:**
```bash
# Only remind about docs for doc changes
if [[ "$CHANGED_FILES" == *".md"* ]] || [[ "$CHANGED_FILES" == *".claude/"* ]]; then
    echo "⚠️  Documentation changed. Consider running docs-quality-agent."
fi
```

**Bad:**
```bash
# Always remind, even for trivial changes
echo "Run docs-quality-agent before every commit"
```

#### 3. Provide Clear Feedback

**Good:**
```bash
echo "⚠️  Git Commit Reminder"
echo ""
echo "Before committing, ensure you've run:"
echo "  - Tests (for code changes): npm test"
echo "  - Validation (for doc changes): docs-quality-agent"
echo ""
echo "Already validated? Proceed with commit."
```

**Bad:**
```bash
echo "Remember validation"
```

#### 4. Use SubagentStop for Documentation Propagation

**Pattern:**
```json
{
  "hooks": {
    "SubagentStop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Subagent completed. Review outputs and update documentation if needed."
          }
        ]
      }
    ]
  }
}
```

**Use case:** When BDD agent creates scenarios, remind orchestrator to update feature documentation.

### Hook Testing

Before considering a hook complete:

1. **Test trigger** - Does hook fire on correct event?
2. **Test matcher** - Does matcher correctly identify target actions?
3. **Test script** - Does hook script execute without errors?
4. **Test output** - Is feedback clear and helpful?
5. **Test side effects** - Does hook avoid unintended consequences?

**Example test:**
```bash
# Test PreToolUse hook for git commits

# 1. Attempt a git commit
git commit -m "Test commit"

# Expected: Hook fires and shows reminder

# 2. Verify hook output
# Should see: "⚠️  Reminder: Have you run validation?"

# 3. Verify non-blocking
# Commit should proceed (not blocked)

# 4. Test with non-commit Bash command
ls -la

# Expected: Hook should not fire
```

## Documentation Requirements

### Frontmatter

Every framework file requires complete frontmatter:

```yaml
---
# Component-specific fields (agents, skills, commands)
name: af-component-name          # For agents, skills
description: Clear description    # For all components

# Documentation system fields (required for all .md files)
title: Component Title
created: YYYY-MM-DD
updated: YYYY-MM-DD              # Update when content changes
last_checked: YYYY-MM-DD         # Update when verified current
tags: [type, domain, specifics]
parent: ./README.md              # Or full path to parent
---
```

### Bidirectional Linking

**Parent must list children:**
```yaml
# In .claude/agents/README.md
children:
  - ./af-bdd-agent.md
  - ./af-docs-quality-agent.md
  - ./af-ux-design-agent.md
```

**Child must reference parent:**
```yaml
# In .claude/agents/af-bdd-agent.md
parent: ./README.md  # Relative to current file
```

### README Files

Every directory must have README.md:

```markdown
---
title: Directory Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
last_checked: YYYY-MM-DD
tags: [index, category]
parent: ../README.md
children:
  - ./component1.md
  - ./component2.md
---

# Directory Title

Brief description of what this directory contains.

## Contents

### [Component 1](./component1.md)
Description of component 1

### [Component 2](./component2.md)
Description of component 2
```

### Validation

After creating or modifying framework components:

```bash
# 1. Validate frontmatter
npx ts-node .claude/scripts/validate-frontmatter.ts

# 2. Validate links
npx ts-node .claude/scripts/validate-links.ts

# 3. Run docs-quality-agent (comprehensive)
Task tool → docs-quality-agent

# 4. Check for stale docs (if updating old components)
npx ts-node .claude/scripts/check-stale-docs.ts
```

## Complete Workflows

### Complete Workflow: Adding a New Agent

**Prerequisites:**
- Identified clear domain and purpose
- Determined which skills agent will load
- Reviewed existing agents for patterns

**Steps:**

1. **Create agent file**
   ```bash
   touch .claude/agents/af-<domain>-agent.md
   ```

2. **Add frontmatter**
   ```yaml
   ---
   name: af-<domain>-agent
   description: Clear 1-2 sentence description
   tools: Read, Write, Edit  # or omit for all tools
   model: sonnet
   title: <Domain> Agent
   created: 2025-12-09
   updated: 2025-12-09
   last_checked: 2025-12-09
   tags: [agent, domain]
   parent: ./README.md
   ---
   ```

3. **Write agent content**
   - Role (what it does)
   - Skills Used (which skills it loads)
   - Inputs (required and optional parameters)
   - Procedure (step-by-step with MUST/SHOULD)
   - Outputs (return format)
   - Error Handling (failure modes)
   - References (links to skills and docs)

4. **Update parent README**
   ```bash
   # Add to .claude/agents/README.md children array
   - ./af-<domain>-agent.md
   ```

5. **Validate documentation**
   ```bash
   npx ts-node .claude/scripts/validate-frontmatter.ts
   npx ts-node .claude/scripts/validate-links.ts
   ```

6. **Test agent invocation**
   ```
   Task tool → subagent_type="af-<domain>-agent"
   ```

7. **Run docs-quality-agent**
   ```
   Task tool → docs-quality-agent
   ```

8. **Commit changes**
   ```bash
   git add .claude/agents/af-<domain>-agent.md .claude/agents/README.md
   git commit -m "feat: Add af-<domain>-agent for <purpose>"
   ```

**Success criteria:**
- ✅ Agent file has complete frontmatter
- ✅ Agent appears in agents/README.md children list
- ✅ Agent can be invoked via Task tool
- ✅ Agent successfully loads referenced skills
- ✅ Validation scripts pass
- ✅ docs-quality-agent confirms documentation quality

### Complete Workflow: Creating a New Skill

**Prerequisites:**
- Determined skill type (process vs expertise)
- Identified what knowledge skill will contain
- Created comprehensive guide (if needed for depth)

**Steps:**

1. **Create skill directory and file**
   ```bash
   mkdir -p .claude/skills/af-<name>
   touch .claude/skills/af-<name>/SKILL.md
   ```

2. **Add frontmatter**
   ```yaml
   ---
   name: af-<name>
   description: When to use this skill
   type: process|expertise
   domain: <domain>
   title: <Name> Skill
   created: 2025-12-09
   updated: 2025-12-09
   last_checked: 2025-12-09
   tags: [skill, type, domain]
   parent: ../README.md
   ---
   ```

3. **Write skill content** (keep under 300 lines)
   - When to Use This Skill (trigger conditions)
   - Rules (15-20 hard constraints, one line each)
   - Workflows (4-5 workflows, 10-15 steps each)
   - Examples (good vs bad, 40-50 lines total)
   - Essential Reading (links to comprehensive docs)

4. **Create comprehensive guide** (if needed)
   ```bash
   touch .claude/docs/guides/<domain>-guide.md
   # Write 800-1500 lines of detailed patterns, examples, edge cases
   ```

5. **Update skills/README.md**
   ```bash
   # Add to children array
   - ./af-<name>/SKILL.md
   ```

6. **Update guides/README.md** (if created guide)
   ```bash
   # Add to children array
   - ./<domain>-guide.md
   ```

7. **Validate documentation**
   ```bash
   npx ts-node .claude/scripts/validate-frontmatter.ts
   npx ts-node .claude/scripts/validate-links.ts
   ```

8. **Restart Claude Code**
   ```
   Exit and restart session to pick up new skill
   ```

9. **Test skill with agent**
   ```
   Create test agent that loads skill
   Verify agent can load and use skill
   ```

10. **Run docs-quality-agent**
    ```
    Task tool → docs-quality-agent
    ```

11. **Commit changes**
    ```bash
    git add .claude/skills/af-<name>/ .claude/skills/README.md
    git add .claude/docs/guides/<domain>-guide.md .claude/docs/guides/README.md  # if guide created
    git commit -m "feat: Add af-<name> skill for <purpose>"
    ```

**Success criteria:**
- ✅ Skill is directive (rules + workflows, not reference)
- ✅ Skill is under 300 lines (target: 150-200)
- ✅ Skill links to comprehensive docs (if needed)
- ✅ Skill appears in skills/README.md
- ✅ Agents can load and use skill
- ✅ Validation scripts pass
- ✅ docs-quality-agent confirms quality

### Complete Workflow: Adding a Slash Command

**Prerequisites:**
- Identified clear user-facing need
- Determined category and command name
- Reviewed existing commands in category

**Steps:**

1. **Create command file**
   ```bash
   touch .claude/commands/<category>/<action>.md
   ```

2. **Add frontmatter**
   ```yaml
   ---
   description: What command does (1 line, autocomplete)
   title: Command Title
   created: 2025-12-09
   updated: 2025-12-09
   last_checked: 2025-12-09
   tags: [command, category]
   parent: ./README.md
   ---
   ```

3. **Write command body**
   - Command description and usage
   - Parameter explanation ($1, $2, etc.)
   - Examples
   - The actual prompt that executes

4. **Update category README**
   ```bash
   # Add to .claude/commands/<category>/README.md children array
   - ./<action>.md
   ```

5. **Validate documentation**
   ```bash
   npx ts-node .claude/scripts/validate-frontmatter.ts
   npx ts-node .claude/scripts/validate-links.ts
   ```

6. **Test command**
   ```
   /<category>:<action> [args]
   Verify: command expands and executes correctly
   ```

7. **Test autocomplete**
   ```
   Type "/cat" and verify command appears in suggestions
   ```

8. **Run docs-quality-agent**
   ```
   Task tool → docs-quality-agent
   ```

9. **Commit changes**
   ```bash
   git add .claude/commands/<category>/<action>.md .claude/commands/<category>/README.md
   git commit -m "feat: Add /<category>:<action> command for <purpose>"
   ```

**Success criteria:**
- ✅ Command shows in autocomplete
- ✅ Command expands correctly
- ✅ Command handles arguments properly
- ✅ Command is documented with examples
- ✅ Command appears in category README
- ✅ Validation scripts pass

### Complete Workflow: Configuring a Hook

**Prerequisites:**
- Identified trigger event (PreToolUse, PostToolUse, Stop, etc.)
- Determined hook action (command, prompt, block)
- Created hook script (if using command type)

**Steps:**

1. **Create hook script** (if needed)
   ```bash
   touch .claude/hooks/<name>.sh
   chmod +x .claude/hooks/<name>.sh
   ```

2. **Write hook logic**
   ```bash
   #!/bin/bash
   # Use hook variables: $TOOL_NAME, $ARGUMENTS, etc.
   # Exit 0 to allow, exit 1 to block (if blocking hook)
   ```

3. **Configure in settings.json**
   ```json
   {
     "hooks": {
       "PreToolUse": [
         {
           "matcher": "ToolName",
           "hooks": [
             {
               "type": "command",
               "command": "bash .claude/hooks/<name>.sh '$ARGUMENTS'",
               "displayOutput": true
             }
           ]
         }
       ]
     }
   }
   ```

4. **Test hook firing**
   ```
   Trigger the event (e.g., use tool that matches)
   Verify hook executes
   Check output is as expected
   ```

5. **Test hook logic**
   ```
   Test with various inputs
   Verify exit codes work correctly
   Check for unintended side effects
   ```

6. **Document hook** in hooks/README.md
   ```markdown
   ### [Hook Name](./hook-name.sh)
   - **Trigger:** PreToolUse (Bash commands)
   - **Purpose:** Remind about validation before commits
   - **Behavior:** Non-blocking reminder
   ```

7. **Validate documentation**
   ```bash
   npx ts-node .claude/scripts/validate-frontmatter.ts
   npx ts-node .claude/scripts/validate-links.ts
   ```

8. **Run docs-quality-agent**
   ```
   Task tool → docs-quality-agent
   ```

9. **Commit changes**
   ```bash
   git add .claude/hooks/<name>.sh .claude/hooks/README.md settings.json
   git commit -m "feat: Add <name> hook for <purpose>"
   ```

**Success criteria:**
- ✅ Hook fires on correct event
- ✅ Hook logic works as intended
- ✅ Hook provides clear feedback
- ✅ Hook is documented
- ✅ No unintended side effects
- ✅ Validation passes

## Troubleshooting

### Agent Issues

#### "Agent not found when invoking via Task tool"

**Cause:** Agent name mismatch or Claude Code hasn't picked up new agent

**Solution:**
1. Check agent frontmatter has correct `name: af-agent-name`
2. Verify agent is in `.claude/agents/` directory
3. Restart Claude Code session
4. Try invoking again

#### "Agent doesn't load skills"

**Cause:** Skill reference syntax incorrect or skill doesn't exist

**Solution:**
1. Check skill exists in `.claude/skills/<skill-name>/SKILL.md`
2. Verify skill has `name:` field in frontmatter
3. Use correct syntax in agent: `Load \`af-skill-name\` skill`
4. Restart Claude Code to pick up new skills

#### "Agent procedure is too long"

**Cause:** Agent contains reference material instead of loading skills

**Solution:**
1. Move detailed content to a skill
2. Create comprehensive guide for extensive material
3. Update agent to reference skill/docs
4. Target: ~50 lines for agent procedure

### Skill Issues

#### "Skill is over 300 lines"

**Cause:** Too much detail in skill, should be in comprehensive guide

**Solution:**
1. Create guide in `.claude/docs/guides/<domain>-guide.md`
2. Move detailed examples to guide
3. Move extensive patterns to guide
4. Keep only rules, workflows, brief examples in skill
5. Link to guide from "Essential Reading"

#### "Claude doesn't follow skill workflows"

**Cause:** Workflows are too vague or reference-like instead of directive

**Solution:**
1. Make workflows step-by-step actionable
2. Use numbered steps with clear actions
3. Avoid conceptual discussion - focus on "do this"
4. Add success criteria to each workflow

#### "Skill not loading in agent"

**Cause:** Skill name mismatch or Claude Code cache

**Solution:**
1. Verify skill frontmatter has `name: af-skill-name`
2. Check agent uses backtick syntax: `\`af-skill-name\``
3. Restart Claude Code session
4. Check skill file is `SKILL.md` (all caps)

### Command Issues

#### "Command doesn't show in autocomplete"

**Cause:** Command file location or frontmatter issue

**Solution:**
1. Verify command is in `.claude/commands/<category>/<name>.md`
2. Check frontmatter has `description:` field
3. Restart Claude Code session
4. Try typing `/<category>:` to see category commands

#### "Command arguments not working"

**Cause:** Argument syntax incorrect

**Solution:**
1. Use `$1`, `$2`, etc. for positional args
2. Use `$ARGUMENTS` for all args as string
3. Test command with actual arguments
4. Add usage examples in command documentation

### Hook Issues

#### "Hook not firing"

**Cause:** Matcher not matching or hook configuration issue

**Solution:**
1. Check settings.json syntax is correct
2. Verify matcher matches target tool/event
3. Test with simple hook first (just echo)
4. Check hook script has execute permissions

#### "Hook blocks legitimate actions"

**Cause:** Hook exit code is 1 (blocking) when should be 0 (allow)

**Solution:**
1. Use exit 0 for reminder/non-blocking hooks
2. Only use exit 1 for true safety blocks
3. Add logic to detect context and be selective
4. Prefer prompts over blocking commands

### Documentation Issues

#### "Validation fails: missing frontmatter"

**Cause:** File doesn't have required frontmatter fields

**Solution:**
1. Add frontmatter block at file start
2. Include required fields: title, created, updated, last_checked, tags, parent
3. Run validation again

#### "Validation fails: parent doesn't list child"

**Cause:** Bidirectional linking broken

**Solution:**
1. Find parent file (from child's `parent:` field)
2. Add child to parent's `children:` array
3. Run validation again

#### "Validation fails: child doesn't reference parent"

**Cause:** Missing `parent:` field in child frontmatter

**Solution:**
1. Add `parent: ./README.md` to child frontmatter
2. Use relative path from child to parent
3. Run validation again

## Best Practices Summary

### For All Framework Components

1. **Namespace correctly** - Use `af-` prefix for framework components
2. **Document thoroughly** - Complete frontmatter, clear descriptions
3. **Link bidirectionally** - Parent lists children, child references parent
4. **Validate before committing** - Run validation scripts and docs-quality-agent
5. **Test functionality** - Verify component works as intended
6. **Keep it focused** - Single responsibility principle
7. **Reference don't duplicate** - Link to docs, don't copy content

### For Agents

1. **Keep lightweight** - ~50 lines of procedure
2. **Load skills** - Don't duplicate knowledge
3. **Use MUST/SHOULD** - Clear priority directives
4. **Specify I/O** - Clear inputs and outputs
5. **Handle errors** - Graceful failure modes

### For Skills

1. **Be directive** - Rules and workflows, not reference
2. **Stay under 300 lines** - Target 150-200 lines
3. **Link to guides** - Comprehensive docs live separately
4. **Clear workflows** - Step-by-step actionable
5. **Good examples** - Show good vs bad patterns

### For Commands

1. **Clear description** - Users see in autocomplete
2. **Validate arguments** - Handle missing/invalid inputs
3. **Provide examples** - Show correct usage
4. **Reference skills/agents** - Invoke framework components
5. **Document usage** - Clear instructions in command body

### For Hooks

1. **Be contextual** - Only fire when relevant
2. **Prefer reminders** - Non-blocking guidance
3. **Clear feedback** - User understands what's happening
4. **Test thoroughly** - Ensure no side effects
5. **Document behavior** - Explain when and why hook fires

## Essential Reading

**Before creating framework components:**
- [Documentation Standards](../standards/documentation-standards.md) - Frontmatter and linking requirements
- [Framework Architecture](../architecture/README.md) - V2 architecture overview
- [Project Structure](../standards/project-structure.md) - Where files go

**Comprehensive guides for depth:**
- [Documentation System Guide](./documentation-system.md) - Self-documenting system details
- [BDD Expertise Skill](../../skills/af-bdd-expertise/SKILL.md) - Markdown scenario patterns
- [Testing Guide](./testing-guide.md) - Testing strategy and TDD workflow

**Claude Code official documentation:**
- [Skills Guide](https://code.claude.com/docs/en/skills) - Official skills documentation
- [Sub-agents Guide](https://code.claude.com/docs/en/sub-agents) - Official agents documentation
- [Slash Commands](https://code.claude.com/docs/en/slash-commands) - Official commands documentation
- [Hooks Guide](https://code.claude.com/docs/en/hooks) - Official hooks documentation

## Summary

Creating AgentFlow framework components requires:

1. **Understanding V2 architecture** - Layered, skills-based approach
2. **Following namespace rules** - `af-` prefix for framework
3. **Keeping components focused** - Agents light, skills directive, docs comprehensive
4. **Documenting thoroughly** - Complete frontmatter, bidirectional linking
5. **Validating rigorously** - Scripts and docs-quality-agent
6. **Testing completely** - Verify functionality before considering done

The framework is designed for maintainability and progressive disclosure. Follow these patterns and your components will integrate seamlessly with the rest of AgentFlow.
