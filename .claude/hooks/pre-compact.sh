#!/bin/bash
# PreCompact hook: Remind orchestrator to save state before compaction

cat << 'EOF'

Context compaction imminent. Save orchestration state:

  Update .claude/work/current-task.md with:
  - Current phase (Setup/Discovery/Requirements/Delivery)
  - Human's role (PM/UX/QA/SE)
  - Progress and blockers
  - Next orchestration step

  After compaction, you resume as ORCHESTRATOR.

EOF
