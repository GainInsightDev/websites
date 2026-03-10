#!/bin/bash
# Reminder to merge specs → base branch before completing Discovery/Refinement
#
# Type: PreToolUse (mcp__agentflow__mark_done)
# Trigger: When an agent calls mark_done()
# Purpose: Ensure specs branch is merged to base branch before closing out
#
# Behavior:
# - If NOT on specs branch: allow through (Delivery agents, etc.)
# - If on specs branch, first attempt: block with merge reminder
# - If on specs branch, second attempt (within 5min window): allow through

# Get the tool input from stdin
TOOL_INPUT=$(cat)

# Only relevant when on the specs branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")

if [[ "$CURRENT_BRANCH" != "specs" ]]; then
    # Not on specs branch — nothing to do
    exit 0
fi

# Determine base branch (develop if it exists, otherwise main)
if git rev-parse --verify develop &>/dev/null; then
    BASE_BRANCH="develop"
elif git rev-parse --verify main &>/dev/null; then
    BASE_BRANCH="main"
else
    # Can't determine base branch — allow through with warning
    cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "WARNING: Could not determine base branch (no 'develop' or 'main' found). Skipping specs merge check."
  }
}
EOF
    exit 0
fi

# Check if specs is already merged into base branch
# (specs HEAD is an ancestor of base, or they point to the same commit)
if git merge-base --is-ancestor specs "$BASE_BRANCH" 2>/dev/null; then
    # Already merged — allow through
    cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "Specs branch is already merged into $BASE_BRANCH. Proceeding with mark_done."
  }
}
EOF
    exit 0
fi

# State file for first-attempt/retry flow
STATE_FILE=".claude/work/specs-merge-reminder"
mkdir -p "$(dirname "$STATE_FILE")"

if [ -f "$STATE_FILE" ]; then
    # Check file age
    if [[ "$OSTYPE" == "darwin"* ]]; then
        FILE_AGE=$(($(date +%s) - $(stat -f %m "$STATE_FILE" 2>/dev/null || echo 0)))
    else
        FILE_AGE=$(($(date +%s) - $(stat -c %Y "$STATE_FILE" 2>/dev/null || echo 0)))
    fi

    if [ $FILE_AGE -lt 300 ]; then
        # Within 5-minute window — allow through
        rm -f "$STATE_FILE"
        cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "Specs merge reminder acknowledged. Proceeding with mark_done."
  }
}
EOF
        exit 0
    else
        # State file is stale — reset
        rm -f "$STATE_FILE"
    fi
fi

# First attempt — block and remind
touch "$STATE_FILE"
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "STOP: You are completing Discovery/Refinement work on the specs branch.\n\nBefore marking done, you MUST merge specs into $BASE_BRANCH:\n\n1. Switch to the $BASE_BRANCH worktree (or use: git -C <path-to-base-worktree> merge specs)\n2. Or from the current worktree: git checkout $BASE_BRANCH && git merge specs && git checkout specs\n3. Push $BASE_BRANCH to remote: git push origin $BASE_BRANCH\n\nThis ensures the base branch has all spec documents before Delivery begins.\n\nAfter merging, call mark_done() again."
  }
}
EOF
