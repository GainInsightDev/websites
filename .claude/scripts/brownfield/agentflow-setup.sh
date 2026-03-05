#!/bin/bash
# agentflow-setup.sh - Set up AgentFlow in a brownfield project
# Called from project's .start-work-hooks or manually
#
# Usage: agentflow-setup.sh [WORKTREE_PATH] [AGENTFLOW_PATH]
#   WORKTREE_PATH: Path to project worktree (default: current directory)
#   AGENTFLOW_PATH: Path to AgentFlow main worktree (default: /srv/worktrees/agentflow/main)

set -euo pipefail

# Configuration
WORKTREE_PATH="${1:-$(pwd)}"
AGENTFLOW_PATH="${2:-/srv/worktrees/agentflow/main}"

# Directories to symlink from AgentFlow (framework)
SYMLINK_DIRS=(
    agents
    skills
    orchestrators
    docs
    scripts
    templates
    hooks
    commands
    lib
)

# Directories to create locally (project-specific)
LOCAL_DIRS=(
    work
    plans
)

# Files to symlink
SYMLINK_FILES=(
    CLAUDE-agentflow.md
    settings.json
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[AgentFlow]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[AgentFlow]${NC} $1"; }
log_error() { echo -e "${RED}[AgentFlow]${NC} $1"; }

# Validate AgentFlow path exists
if [ ! -d "$AGENTFLOW_PATH/.claude" ]; then
    log_error "AgentFlow not found at $AGENTFLOW_PATH"
    log_error "Expected to find $AGENTFLOW_PATH/.claude/"
    exit 1
fi

cd "$WORKTREE_PATH"

log_info "Setting up AgentFlow in: $WORKTREE_PATH"
log_info "Using AgentFlow from: $AGENTFLOW_PATH"

# Create .claude directory if it doesn't exist
mkdir -p .claude

# Create symlinks for framework directories
for dir in "${SYMLINK_DIRS[@]}"; do
    target="$AGENTFLOW_PATH/.claude/$dir"
    link=".claude/$dir"

    if [ -L "$link" ]; then
        # Already a symlink - check if pointing to correct target
        current_target=$(readlink "$link")
        if [ "$current_target" = "$target" ]; then
            log_info "✓ $dir (symlink OK)"
        else
            log_warn "Updating $dir symlink (was: $current_target)"
            rm "$link"
            ln -s "$target" "$link"
            log_info "✓ $dir (symlink updated)"
        fi
    elif [ -d "$link" ]; then
        log_warn "$dir exists as directory - skipping (manual migration needed)"
    elif [ -e "$link" ]; then
        log_warn "$dir exists as file - skipping"
    else
        if [ -d "$target" ]; then
            ln -s "$target" "$link"
            log_info "✓ $dir (symlink created)"
        else
            log_warn "$dir not found in AgentFlow - skipping"
        fi
    fi
done

# Create symlinks for framework files
for file in "${SYMLINK_FILES[@]}"; do
    target="$AGENTFLOW_PATH/.claude/$file"
    link=".claude/$file"

    if [ -L "$link" ]; then
        current_target=$(readlink "$link")
        if [ "$current_target" = "$target" ]; then
            log_info "✓ $file (symlink OK)"
        else
            rm "$link"
            ln -s "$target" "$link"
            log_info "✓ $file (symlink updated)"
        fi
    elif [ -f "$link" ]; then
        log_warn "$file exists - skipping (may need manual update)"
    else
        if [ -f "$target" ]; then
            ln -s "$target" "$link"
            log_info "✓ $file (symlink created)"
        else
            log_warn "$file not found in AgentFlow - skipping"
        fi
    fi
done

# Create local directories
for dir in "${LOCAL_DIRS[@]}"; do
    local_dir=".claude/$dir"
    if [ -d "$local_dir" ]; then
        log_info "✓ $dir (exists)"
    else
        mkdir -p "$local_dir"
        log_info "✓ $dir (created)"
    fi
done

# Create work/README.md if it doesn't exist
if [ ! -f ".claude/work/README.md" ]; then
    cat > ".claude/work/README.md" << 'EOF'
# Work Directory

This directory contains project-specific working files:

- `current-task.md` - Current task context and implementation details
- `commit-reminder` - State file for commit hook (auto-managed)

These files are local to this project (not symlinked from AgentFlow).
EOF
    log_info "✓ work/README.md (created)"
fi

# Check for CLAUDE.md in project root
if [ -f "CLAUDE.md" ]; then
    # Check if it already imports CLAUDE-agentflow.md
    if grep -q "CLAUDE-agentflow.md" "CLAUDE.md"; then
        log_info "✓ CLAUDE.md (already imports AgentFlow)"
    else
        log_warn "CLAUDE.md exists but doesn't import AgentFlow"
        log_warn "Add this line to import: @.claude/CLAUDE-agentflow.md"
    fi
else
    log_warn "No CLAUDE.md found - consider creating one"
    log_warn "See .claude/templates/brownfield-CLAUDE.md for template"
fi

echo ""
log_info "AgentFlow setup complete!"
echo ""
echo "Next steps:"
echo "  1. Ensure CLAUDE.md imports AgentFlow: @.claude/CLAUDE-agentflow.md"
echo "  2. Start Claude Code: claudedev"
echo "  3. Begin with: /discover-features or /task:start <issue-id>"
echo ""
