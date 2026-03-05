#!/bin/bash
# Reminder to run docs-quality-agent before committing any changes

# Get the tool input from stdin
TOOL_INPUT=$(cat)

# Extract the command from tool_input.command (correct path for PreToolUse)
COMMAND=$(echo "$TOOL_INPUT" | jq -r '.tool_input.command // ""')

# Quick exit if not a git commit - reduces overhead
if [[ "$COMMAND" != *"git commit"* ]]; then
    exit 0
fi

# Simple state file to track attempts
STATE_FILE=".claude/work/commit-reminder"
mkdir -p "$(dirname "$STATE_FILE")"

# Handle git commit reminder with timestamp window
if [ -f "$STATE_FILE" ]; then
    # Check file age (seconds since last modification)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        FILE_AGE=$(($(date +%s) - $(stat -f %m "$STATE_FILE" 2>/dev/null || echo 0)))
    else
        # Linux
        FILE_AGE=$(($(date +%s) - $(stat -c %Y "$STATE_FILE" 2>/dev/null || echo 0)))
    fi

    if [ $FILE_AGE -lt 120 ]; then
        # Within 2-minute assessment window - allow commit
        # Keep state file (don't delete) so window persists
        cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "Within assessment window - proceeding with commit"
  }
}
EOF
    else
        # State file is stale (>2 minutes old) - reset to first attempt
        rm -f "$STATE_FILE"
        touch "$STATE_FILE"
        cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "You are about to commit code. You MUST answer these questions:\n\n1. TESTS: Have you run tests covering this code? Do they pass?\n   → If no tests exist: Why? Should af-dev-test-agent write them?\n   → If tests fail: Why? Not implemented yet? Code broken? Or is the test wrong?\n   → SILENT SKIPS: Are there any test.skip() calls in staged files? These are BANNED — use test.todo() instead.\n   → test.todo() = visible in output (noisy). test.skip() = invisible (silent). We require noisy.\n\n2. DOCUMENTATION: Does this change need documentation updates?\n   → New APIs, components, or config → YES\n   → Changed behavior or contracts → YES\n   → .claude/ framework changes → YES\n\n3. VALIDATION: If any code or docs have changed, this could have a knock-on effect on other documentation. Has af-docs-quality-agent validated the docs?\n   → Run /quality:docs before proceeding\n\n4. ARCHITECTURE: Do these changes align with existing ADRs?\n   → Read ADR index first: docs/architecture/adr/README.md\n   → If introducing new patterns → Create ADR before implementing\n   → Use: Task tool → af-architecture-quality-agent for compliance check\n\n5. SECURITY: Have you checked for secrets/credentials in staged files?\n   → No hardcoded passwords, API keys, or tokens\n   → Use Doppler for all credentials\n\n6. UX REVIEW: Have you made UI/component changes?\n   → New or modified components in src/components/ → Run af-ux-design-agent\n   → Changes to Storybook stories → Verify design decision alignment\n   → Visual changes → Check against brand guidelines (docs/design/brand-guidelines.md)\n   → If significant UI work: Update design decision log\n\nOnly proceed if you can answer YES to all applicable items.\n\nDO NOT claim 'trivial change' for:\n- Any code that executes (even small fixes)\n- Any file in .claude/ (framework files)\n- Any changes to docs/ or README content\n- Moving, renaming, or deleting files\n\nTrivial exceptions (skip validation):\n- Whitespace/formatting only\n- Fixing typos in comments (not code, not docs)"
  }
}
EOF
    fi
else
    # First attempt - remind about quality checks
    touch "$STATE_FILE"
    cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "You are about to commit code. You MUST answer these questions:\n\n1. TESTS: Have you run tests covering this code? Do they pass?\n   → If no tests exist: Why? Should af-dev-test-agent write them?\n   → If tests fail: Why? Not implemented yet? Code broken? Or is the test wrong?\n   → SILENT SKIPS: Are there any test.skip() calls in staged files? These are BANNED — use test.todo() instead.\n   → test.todo() = visible in output (noisy). test.skip() = invisible (silent). We require noisy.\n\n2. DOCUMENTATION: Does this change need documentation updates?\n   → New APIs, components, or config → YES\n   → Changed behavior or contracts → YES\n   → .claude/ framework changes → YES\n\n3. VALIDATION: If any code or docs have changed, this could have a knock-on effect on other documentation. Has af-docs-quality-agent validated the docs?\n   → Run /quality:docs before proceeding\n\n4. ARCHITECTURE: Do these changes align with existing ADRs?\n   → Read ADR index first: docs/architecture/adr/README.md\n   → If introducing new patterns → Create ADR before implementing\n   → Use: Task tool → af-architecture-quality-agent for compliance check\n\n5. SECURITY: Have you checked for secrets/credentials in staged files?\n   → No hardcoded passwords, API keys, or tokens\n   → Use Doppler for all credentials\n\n6. UX REVIEW: Have you made UI/component changes?\n   → New or modified components in src/components/ → Run af-ux-design-agent\n   → Changes to Storybook stories → Verify design decision alignment\n   → Visual changes → Check against brand guidelines (docs/design/brand-guidelines.md)\n   → If significant UI work: Update design decision log\n\nOnly proceed if you can answer YES to all applicable items.\n\nDO NOT claim 'trivial change' for:\n- Any code that executes (even small fixes)\n- Any file in .claude/ (framework files)\n- Any changes to docs/ or README content\n- Moving, renaming, or deleting files\n\nTrivial exceptions (skip validation):\n- Whitespace/formatting only\n- Fixing typos in comments (not code, not docs)"
  }
}
EOF
fi
