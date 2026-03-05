#!/bin/bash
# SessionStart hook: Remind agent of orchestrator role and work context

# Check if current-task.md exists
CURRENT_TASK=".claude/work/current-task.md"

cat << 'EOF'

You are the ORCHESTRATOR. Drive work forward proactively.
Respect human decision points (phase transitions, approvals).

EOF

if [ -f "$CURRENT_TASK" ]; then
    cat << 'EOF'
Active task: .claude/work/current-task.md
Read it to restore: phase, role, Linear ID, progress, next steps.

If in Delivery phase: run tests first to establish baseline.
Failing tests = your todo list. Passing tests = done.

EOF
else
    cat << 'EOF'
No active task. To start work:
  - /task:start <LINEAR-ID>
  - Or ask user what they want to work on

EOF
fi

# Remind agent to check services
cat << 'EOF'
Check CLAUDE.md or PORT_INFO.md for project services and ensure they are running.
When asked for URLs, always give external URLs — never localhost.
EOF
