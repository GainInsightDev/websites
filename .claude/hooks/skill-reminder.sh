#!/bin/bash
# Skill Reminder Hook - Suggests relevant skills for the work at hand
# Triggered on: PreToolUse (Edit, Write, Task)
# Purpose: Help Claude load appropriate skills based on file context
# Shows ALL relevant skills across matching contexts (accumulates, doesn't exit early)

# Read JSON input from stdin
TOOL_INPUT=$(cat)

# Extract tool name and relevant fields
TOOL_NAME=$(echo "$TOOL_INPUT" | jq -r '.tool_name // ""')

# Extract file path based on tool type
case "$TOOL_NAME" in
  Edit|Write)
    FILE_PATH=$(echo "$TOOL_INPUT" | jq -r '.tool_input.file_path // ""')
    ;;
  Task)
    # For Task tool, check the prompt for keywords
    FILE_PATH=$(echo "$TOOL_INPUT" | jq -r '.tool_input.prompt // ""')
    ;;
  *)
    # Not a tool we care about
    exit 0
    ;;
esac

# --- Accumulator: collect all matching suggestions ---
SUGGESTIONS=""

add_suggestions() {
    local context="$1"
    local skills="$2"
    if [[ -n "$SUGGESTIONS" ]]; then
        SUGGESTIONS="${SUGGESTIONS}\\n\\n"
    fi
    SUGGESTIONS="${SUGGESTIONS}**${context}:**\\n${skills}"
}

# Function to warn about editing synced content (allows but shows strong warning)
# This is special — it exits immediately because it's a WARNING, not a suggestion
warn_synced_content() {
    local source_path="$1"

    cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "WARNING: This file is synced FROM AgentFlow and will be OVERWRITTEN!\\n\\nEdit the source instead: $source_path\\n\\nLoad \`af-commit-agentflow-changes\` for the correct workflow."
  }
}
EOF
    exit 0
}

# Check for docs-portal AgentFlow content (synced from AgentFlow - should not be edited directly)
# This must come BEFORE other checks to catch the mistake early
if [[ "$FILE_PATH" =~ /srv/docs-portal/site/docs/agentflow/ ]]; then
    # Extract the relative path after 'agentflow/'
    relative_path="${FILE_PATH#*/srv/docs-portal/site/docs/agentflow/}"
    source_path="/srv/worktrees/agentflow/main/.claude/docs/$relative_path"
    warn_synced_content "$source_path"
fi

# Skip planning/work files - they don't need skill suggestions
if [[ "$FILE_PATH" =~ (/planning/|/work/|/\.agentflow/|current-task\.md) ]]; then
    exit 0
fi

# --- Context detection: match file patterns to skill groups ---
# Each block ADDS to SUGGESTIONS instead of exiting early

# E2E testing: Playwright specs
if [[ "$FILE_PATH" =~ (\.spec\.|/e2e/|playwright) ]]; then
    add_suggestions "E2E testing" \
        "- af-write-playwright-tests (writing/debugging E2E tests)\\n- af-configure-test-frameworks (broader testing patterns)\\n- af-write-bdd-scenarios (if working from scenarios)"
fi

# Email testing
if [[ "$FILE_PATH" =~ (gmail|email.*test|email.*spec|test.*email) ]]; then
    add_suggestions "email testing" \
        "- af-test-email-delivery (Gmail API email verification)\\n- af-write-playwright-tests (E2E test structure)\\n- af-configure-test-frameworks (broader testing patterns)"
fi

# Component testing: RTL
if [[ "$FILE_PATH" =~ (/components/.*\.test\.|\.(test|spec)\.tsx$) ]]; then
    add_suggestions "component testing" \
        "- af-write-rtl-tests (RTL component tests)\\n- af-design-ui-components (design contracts, Storybook)\\n- af-configure-test-frameworks (broader testing patterns)"
fi

# Coverage analysis
if [[ "$FILE_PATH" =~ (coverage|\.coverage|lcov) ]]; then
    add_suggestions "test coverage" \
        "- af-analyse-test-coverage (coverage analysis and improvement)\\n- af-configure-test-frameworks (testing patterns and thresholds)"
fi

# Unit testing: Jest
if [[ "$FILE_PATH" =~ (\.test\.|/tests/unit/|/test/|jest) ]]; then
    add_suggestions "unit testing" \
        "- af-write-jest-tests (Jest unit tests, TDD)\\n- af-follow-tdd-cycle (Red-Green-Refactor cycle)\\n- af-configure-test-frameworks (broader testing patterns)"
fi

# BDD scenarios and glossary
if [[ "$FILE_PATH" =~ (\.feature$|/features/|scenarios|BDD|mini-prd) ]]; then
    add_suggestions "BDD/requirements" \
        "- af-write-scenario-specs (Markdown scenario specs)\\n- af-write-bdd-scenarios (comprehensive BDD patterns)\\n- af-enforce-glossary (domain terminology)"
fi

# Glossary specifically
if [[ "$FILE_PATH" =~ (glossary|glossary\.yml) ]]; then
    add_suggestions "glossary" \
        "- af-enforce-glossary (terminology enforcement)\\n- af-write-bdd-scenarios (BDD language rules)"
fi

# Frontmatter
if [[ "$FILE_PATH" =~ (frontmatter|validate-frontmatter|repair-frontmatter) ]]; then
    add_suggestions "frontmatter" \
        "- af-fix-frontmatter (YAML frontmatter metadata)\\n- af-enforce-doc-standards (full doc standards)\\n- af-link-documentation (bidirectional linking)"
fi

# Documentation (broad)
if [[ "$FILE_PATH" =~ (\.md$|/docs/|/\.claude/docs/) ]]; then
    add_suggestions "documentation" \
        "- af-write-documentation (creating/updating docs)\\n- af-enforce-doc-standards (full doc standards)\\n- af-fix-frontmatter (metadata requirements)\\n- af-link-documentation (cross-references)"
fi

# UX/Storybook
if [[ "$FILE_PATH" =~ (\.stories\.|/stories/|Storybook|shadcn|design-system) ]]; then
    add_suggestions "UX/design" \
        "- af-design-ui-components (Storybook, design flow)\\n- af-write-rtl-tests (component test contracts)"
fi

# Framework files (.claude/)
if [[ "$FILE_PATH" =~ /\.claude/ ]]; then
    # Skip preserved paths that are safe to edit locally
    if [[ ! "$FILE_PATH" =~ (/\.claude/work/|/\.claude/plans/|/\.claude/logs/|/\.claude/reports/|/\.claude/\.sync/|\.local\.|current-.*\.md$) ]]; then
        add_suggestions "framework files" \
            "- af-commit-agentflow-changes (contribution workflow)\\n- af-modify-agentflow (creating agents, skills, hooks)"
    fi
fi

# Work management: Linear
if [[ "$FILE_PATH" =~ (Linear|LIN-[0-9]+|api\.linear\.app) ]]; then
    add_suggestions "work management" \
        "- af-manage-linear-issues (create/update issues)\\n- af-manage-work-state (full workflow)\\n- af-start-work-session (task context setup)"
fi

# Delivery: PR preparation
if [[ "$FILE_PATH" =~ (pull.request|PR|pr-template) ]]; then
    add_suggestions "delivery" \
        "- af-prepare-pull-request (PR checks and formatting)\\n- af-deliver-features (full delivery workflow)\\n- af-follow-tdd-cycle (implementation cycle)"
fi

# Setup
if [[ "$FILE_PATH" =~ (setup|brownfield|greenfield|bootstrap|initialization) ]]; then
    add_suggestions "setup" \
        "- af-setup-project (infrastructure bootstrapping)\\n- af-setup-gaininsight-stack (GI Standard stack)"
fi

# Quality/validation
if [[ "$FILE_PATH" =~ (validate|quality|lint|docs-quality|validation) ]]; then
    add_suggestions "quality" \
        "- af-validate-quality (validation workflows)\\n- af-enforce-doc-standards (doc standards)"
fi

# --- Output accumulated suggestions or exit silently ---

if [[ -n "$SUGGESTIONS" ]]; then
    cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "Relevant skills for this context:\\n\\n$SUGGESTIONS"
  }
}
EOF
    exit 0
fi

# No match - exit silently (implicit allow)
exit 0
