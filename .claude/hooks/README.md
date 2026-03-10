---
title: AgentFlow Hooks System
created: 2025-09-05
updated: 2026-01-04
last_checked: 2026-01-04
tags: [hooks, automation, claude-code]
parent: ../README.md
children: []
code_files:
  - ./git-commit-reminder.sh
  - ./skill-reminder.sh
  - ./session-start.sh
  - ./pre-compact.sh
  - ./check-services-before-slack.sh
  - ./specs-merge-reminder.sh
---

# AgentFlow Hooks System

Claude Code hooks that maintain quality standards through behavioral guardrails.

## Key Principle

Hooks work because:
1. Hook shows reminder/instruction to Claude
2. Claude follows the instruction (per CLAUDE-agentflow.md)
3. Quality is maintained through Claude's compliance

If Claude ignores hook reminders, the system breaks. The fix is in instructions (CLAUDE-agentflow.md), not more complex hooks.

## Active Hooks

### 1. git-commit-reminder.sh
**Type**: PreToolUse (Bash tool)
**Trigger**: When Claude runs any command containing `git commit`
**Purpose**: Remind Claude to run docs-quality-agent before committing

**Behavior:**
1. First commit attempt → Blocked with reminder message
2. Second attempt → Allowed through

**State tracking**: Uses `.claude/work/commit-reminder` file

**Important**: This hook relies on Claude following the reminder, not bypassing it. See CLAUDE-agentflow.md:
- Section 5: "Git Hook Validation Reminders"

### 2. skill-reminder.sh
**Type**: PreToolUse (Edit, Write, Task tools)
**Trigger**: When Claude modifies files or invokes agents
**Purpose**: Gently suggest loading relevant skills based on work being done

**Detection patterns:**
- Documentation files (`.md`) → Suggests `af-enforce-doc-standards`
- BDD files (`.feature`) → Suggests `af-write-bdd-scenarios`
- Test files (`.test.`, `.spec.`) → Suggests `af-configure-test-frameworks`
- Storybook files (`.stories.`) → Suggests `af-design-ui-components`
- Framework files (`.claude/`) → Suggests `af-modify-agentflow`
- Linear references (`LIN-XXX`) → Suggests `af-manage-work-state`
- Setup/bootstrap work → Suggests `af-setup-project`
- Quality/validation work → Suggests `af-validate-quality`

**Behavior:**
- Non-blocking suggestion (informational only)
- Shows skill benefits and loading syntax
- Exits silently if no pattern matches

**Important**: This is a gentle reminder, not a requirement. Skills can be loaded proactively or when needed.

### 3. check-services-before-slack.sh (legacy)
**Type**: PreToolUse (`mcp__slack__slack_reply_to_thread`)
**Trigger**: When Claude posts a reply to a Slack thread (legacy -- Zulip is now the active communication channel)
**Purpose**: Check that project services are running before the agent tells the user to look at them

**Behavior:**
1. Reads PORT_INFO.md to discover service ports (Storybook, API, dev server)
2. Curls each discovered port
3. If any service is down, outputs warning with port numbers
4. Agent should restart services before posting the message

**Detection patterns:**
- Storybook port from `PORT_INFO.md` (grep for "storybook")
- API port from `PORT_INFO.md` (grep for "api" or "server")
- Dev server port from `PORT_INFO.md` (grep for "dev", "vite", or "next")

**Important**: This hook is informational -- it warns the agent but doesn't block the message. The agent is expected to restart down services before continuing. Requires PORT_INFO.md in the project root. Note: This hook still targets the legacy Slack MCP tool; a Zulip equivalent should be added when the Zulip MCP integration is configured.

### 4. specs-merge-reminder.sh
**Type**: PreToolUse (mcp__agentflow__mark_done)
**Trigger**: When an agent calls `mark_done()`
**Purpose**: Ensure specs branch is merged into base branch before completing Discovery/Refinement

**Behavior:**
1. If not on `specs` branch → Allow through (Delivery agents, etc.)
2. If specs is already merged into base → Allow through
3. First attempt on specs branch → Block with merge instructions
4. Second attempt (within 5-minute window) → Allow through

**Base branch detection**: Uses `develop` if it exists, otherwise `main`.

**Merge check**: Uses `git merge-base --is-ancestor` to verify specs HEAD is already in the base branch. If already merged, skips the reminder entirely.

**State tracking**: Uses `.claude/work/specs-merge-reminder` file (5-minute window)

**Important**: The agent performs the actual merge, not the hook. This allows the agent to handle merge conflicts and push to remote.

## Hook Configuration

Located in `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/git-commit-reminder.sh"
          }
        ]
      },
      {
        "matcher": "(Edit|Write|Task)",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/skill-reminder.sh"
          }
        ]
      },
      {
        "matcher": "mcp__agentflow__mark_done",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/specs-merge-reminder.sh"
          }
        ]
      }
    ]
  }
}
```

## Hook Response Format

Hooks must return JSON with `hookSpecificOutput` wrapper:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Your message here"
  }
}
```

**Permission decisions:**
- `"allow"` - Bypass restrictions, execute tool
- `"deny"` - Block tool, show reason to Claude
- `"ask"` - Prompt user for confirmation

## Environment Requirements

- **Bash**: Script execution
- **jq**: JSON parsing for tool input

## Debugging

```bash
# Check hook permissions
ls -la .claude/hooks/

# Test hook manually
echo '{"tool_input":{"command":"git commit -m test"}}' | bash .claude/hooks/git-commit-reminder.sh

# Clear state to test first-attempt behavior
rm -f .claude/work/commit-reminder
```

## Design Decision

**Why Claude Code hooks only (no git hooks)?**

1. Claude Code hooks intercept before the command runs
2. Git hooks run after `git commit` is invoked
3. Claude Code hooks provide the reminder at the right time
4. Simpler setup - no installation step needed
5. Works consistently across all worktrees via symlinks

---

**Active Hooks**:
- git-commit-reminder.sh (PreToolUse on Bash)
- skill-reminder.sh (PreToolUse on Edit/Write/Task)
- check-services-before-slack.sh (PreToolUse on mcp__slack__slack_reply_to_thread) (legacy)
- specs-merge-reminder.sh (PreToolUse on mcp__agentflow__mark_done)

**Last Updated**: 2026-03-06
