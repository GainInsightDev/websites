---
title: Brownfield Setup Scripts
created: 2025-12-02
updated: 2025-12-02
last_checked: 2025-12-02
tags: [brownfield, setup, scripts]
parent: ../README.md
---

# Brownfield Setup Scripts

Scripts for adding AgentFlow to existing projects.

## Quick Start

### For projects without `.start-work-hooks`

1. Copy the template to your project:
   ```bash
   cp /srv/worktrees/agentflow/main/.claude/scripts/brownfield/start-work-hooks.template \
      /srv/repos/your-project.git/.start-work-hooks
   ```

2. The next time you run `start-work your-project ISSUE-123`, AgentFlow will be set up automatically.

### For projects with existing `.start-work-hooks`

Add this line to your existing hooks file:

```bash
# AgentFlow setup (add near the top of your script)
AGENTFLOW_PATH="/srv/worktrees/agentflow/main"
if [ -f "$AGENTFLOW_PATH/.claude/scripts/brownfield/agentflow-setup.sh" ]; then
    bash "$AGENTFLOW_PATH/.claude/scripts/brownfield/agentflow-setup.sh" "$WORKTREE_PATH" "$AGENTFLOW_PATH"
fi
```

### Manual setup (without start-work)

```bash
cd /path/to/your/project
/srv/worktrees/agentflow/main/.claude/scripts/brownfield/agentflow-setup.sh
```

## Files

### agentflow-setup.sh

The main setup script. Creates symlinks to AgentFlow framework directories and local project-specific directories.

**What it does:**
- Symlinks framework directories (agents, skills, orchestrators, docs, etc.)
- Creates local directories (work, plans)
- Checks for CLAUDE.md and suggests updates

**Idempotent**: Safe to run multiple times.

### start-work-hooks.template

A minimal template for projects without existing hooks. Copy to your project as `.start-work-hooks`.

## After Setup

1. **Create/update CLAUDE.md** in your project root:
   - Use `.claude/templates/brownfield-CLAUDE.md` as a starting point
   - Must import AgentFlow: `@.claude/CLAUDE-agentflow.md`

2. **Start Claude Code**:
   ```bash
   claudedev
   ```

3. **Assess existing documentation** (recommended for brownfield):
   ```
   /docs:audit-project
   ```
   This will scan and rate your existing docs as None/Poor/Scattered/Good with recommendations.

4. **Begin working**:
   - `/task:start <linear-issue-id>` - Start working on an issue
   - `/discovery:discover` - If you need to explore/document the project first

## Troubleshooting

### "AgentFlow not found"

Ensure the AgentFlow main worktree exists:
```bash
ls /srv/worktrees/agentflow/main/.claude/
```

### Symlink conflicts

If a directory already exists (not as a symlink), the script skips it. You may need to:
1. Back up existing content
2. Remove the directory
3. Re-run the setup script
4. Migrate content if needed

### CLAUDE.md not importing AgentFlow

Add this line near the top of your CLAUDE.md:
```
@.claude/CLAUDE-agentflow.md
```
