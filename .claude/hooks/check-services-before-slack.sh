#!/bin/bash
# PreToolUse hook on mcp__slack__slack_reply_to_thread (legacy — Zulip is now the active comms channel)
#
# Before the agent posts a message, check that project services are running.
# Prevents the user from clicking dead links when the agent says "check Storybook".
#
# Reads PORT_INFO.md or CLAUDE.md to discover service ports.
# Only warns — does not auto-start services.
#
# NOTE: This hook targets the legacy Slack MCP tool. Add a Zulip equivalent when migrated.

ISSUES=""

# Check common service ports if they exist in PORT_INFO.md or are well-known
# Storybook (common port: 6006 or project-specific)
if [ -f "PORT_INFO.md" ]; then
  # Extract ports from PORT_INFO.md
  STORYBOOK_PORT=$(grep -i storybook PORT_INFO.md | grep -oP '\d{4,5}' | head -1)
  API_PORT=$(grep -iP '(api|server)' PORT_INFO.md | grep -oP '\d{4,5}' | head -1)
  DEV_PORT=$(grep -iP '(dev|vite|next)' PORT_INFO.md | grep -oP '\d{4,5}' | head -1)
fi

# Check Storybook if port found
if [ -n "$STORYBOOK_PORT" ]; then
  if ! curl -sf "http://localhost:${STORYBOOK_PORT}" > /dev/null 2>&1; then
    ISSUES="${ISSUES}\n- Storybook (port ${STORYBOOK_PORT}) is DOWN"
  fi
fi

# Check API if port found
if [ -n "$API_PORT" ]; then
  if ! curl -sf "http://localhost:${API_PORT}/health" > /dev/null 2>&1; then
    # Try without /health endpoint
    if ! curl -sf "http://localhost:${API_PORT}" > /dev/null 2>&1; then
      ISSUES="${ISSUES}\n- API server (port ${API_PORT}) is DOWN"
    fi
  fi
fi

# Check dev server if port found
if [ -n "$DEV_PORT" ]; then
  if ! curl -sf "http://localhost:${DEV_PORT}" > /dev/null 2>&1; then
    ISSUES="${ISSUES}\n- Dev server (port ${DEV_PORT}) is DOWN"
  fi
fi

if [ -n "$ISSUES" ]; then
  echo "[Service Check] Before responding to the user, these services are DOWN:"
  echo -e "$ISSUES"
  echo ""
  echo "The user may try to access these after reading your message."
  echo "Restart them NOW, then continue with your reply."
  echo "See CLAUDE.md or PORT_INFO.md for start commands."
fi
