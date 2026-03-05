#!/bin/bash
# .git-hook-helpers.sh
# Shared helper functions for start-work and stop-work hooks
# GainInsight Standard template

set -euo pipefail

# ============================================================================
# PROJECT CONFIGURATION
# ============================================================================

# Get project name from environment or derive from directory
get_project_name() {
    if [ -n "${DOPPLER_PROJECT:-}" ]; then
        echo "$DOPPLER_PROJECT"
    elif [ -f "doppler.yaml" ]; then
        # Handle both flat (project: foo) and nested (- project: foo) formats
        grep "project:" doppler.yaml 2>/dev/null | head -1 | awk '{print $NF}' | tr -d '"' || basename "$(pwd)"
    else
        basename "$(pwd)"
    fi
}

PROJECT_NAME="${PROJECT_NAME:-$(get_project_name)}"

# ============================================================================
# COLORS & FORMATTING
# ============================================================================

if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    BOLD='\033[1m'
    NC='\033[0m'
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    CYAN=''
    BOLD=''
    NC=''
fi

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

log_info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*"
}

log_success() {
    echo -e "${GREEN}✓ [$(date +'%H:%M:%S')]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}⚠  [$(date +'%H:%M:%S')]${NC} $*"
}

log_error() {
    echo -e "${RED}✗ [$(date +'%H:%M:%S')]${NC} $*" >&2
}

log_step() {
    echo -e "\n${CYAN}${BOLD}▶ $*${NC}"
}

# ============================================================================
# STATE MANAGEMENT
# ============================================================================

STATE_FILE=""

init_state_file() {
    local issue_key="$1"
    STATE_FILE="/tmp/.hooks-state-${issue_key}"

    cat > "$STATE_FILE" <<EOF
# Git Hooks State File
# Created: $(date)
# Issue: ${issue_key}

# PIDs
SANDBOX_PID=
DEV_PID=

# Config
PORT=
REGION=
SANDBOX_ID=
WORKTREE_PATH=

# Status
PHASE=init
SANDBOX_READY=false
DEV_READY=false
EOF

    log_info "State file initialized: $STATE_FILE"
}

load_state() {
    if [ -f "$STATE_FILE" ]; then
        source "$STATE_FILE"
    fi
}

save_state() {
    local key="$1"
    local value="$2"

    if [ -f "$STATE_FILE" ]; then
        if grep -q "^${key}=" "$STATE_FILE"; then
            sed -i "s@^${key}=.*@${key}=${value}@" "$STATE_FILE"
        else
            echo "${key}=${value}" >> "$STATE_FILE"
        fi
    fi
}

# ============================================================================
# PROCESS MANAGEMENT
# ============================================================================

check_process_running() {
    local pid="$1"
    [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

store_pid() {
    local name="$1"
    local pid="$2"
    save_state "${name}_PID" "$pid"
}

kill_process_tree() {
    local pid="$1"
    local signal="${2:-TERM}"

    if [ -z "$pid" ]; then
        return 0
    fi

    if ! check_process_running "$pid"; then
        return 0
    fi

    log_info "Killing process tree (PID: $pid, signal: $signal)"

    # Kill children first
    local children=$(pgrep -P "$pid" 2>/dev/null || true)
    for child in $children; do
        kill_process_tree "$child" "$signal"
    done

    # Kill parent
    kill -"$signal" "$pid" 2>/dev/null || true

    # Wait for process to die
    for i in {1..10}; do
        if ! check_process_running "$pid"; then
            return 0
        fi
        sleep 0.5
    done

    # Force kill if still alive
    if check_process_running "$pid"; then
        log_warn "Process $pid didn't respond to $signal, using SIGKILL"
        kill -KILL "$pid" 2>/dev/null || true
        sleep 1
    fi
}

find_process_by_port() {
    local port="$1"
    lsof -ti ":$port" 2>/dev/null || true
}

kill_by_port() {
    local port="$1"
    local pid=$(find_process_by_port "$port")

    if [ -n "$pid" ]; then
        log_info "Found process on port $port (PID: $pid)"
        kill_process_tree "$pid"
        return 0
    fi
    return 1
}

# ============================================================================
# FILE VALIDATION
# ============================================================================

validate_json_file() {
    local file_path="$1"

    if ! jq empty "$file_path" 2>/dev/null; then
        log_error "Invalid JSON in $file_path"
        return 1
    fi
    return 0
}

# ============================================================================
# URL/SERVICE HEALTH CHECKS
# ============================================================================

wait_for_url() {
    local url="$1"
    local timeout="${2:-60}"
    local expected_status="${3:-200}"

    log_info "Waiting for URL: $url"

    local elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if curl -sf -o /dev/null -w "%{http_code}" "$url" 2>/dev/null | grep -q "$expected_status"; then
            log_success "URL responding: $url"
            return 0
        fi

        sleep 2
        elapsed=$((elapsed + 2))

        if [ $((elapsed % 15)) -eq 0 ]; then
            log_info "Still waiting for $url... (${elapsed}s elapsed)"
        fi
    done

    log_error "Timeout waiting for URL: $url"
    return 1
}

# ============================================================================
# SANDBOX HELPERS
# ============================================================================

get_sandbox_identifier() {
    local branch_name="$1"

    if [ -z "$branch_name" ]; then
        log_error "Branch name is empty"
        return 1
    fi

    # Match Amplify's formula: strip non-alphanumeric, take first 9 chars + 4-char hash
    local branch_part=$(echo "$branch_name" | sed 's/[^a-zA-Z0-9]//g' | cut -c1-9)
    local hash_part=$(echo "$branch_name" | md5sum | cut -c1-4)
    echo "${branch_part}${hash_part}"
}

find_existing_sandbox() {
    local sandbox_id="$1"
    pgrep -f "ampx sandbox.*${sandbox_id}" >/dev/null 2>&1
}

# ============================================================================
# CLOUDFORMATION HELPERS
# ============================================================================

find_cf_stack() {
    local identifier="$1"
    local region="${2:-eu-west-2}"
    local project="${3:-$PROJECT_NAME}"

    # Find root stack (no ParentId)
    local result=$(doppler run --config dev --project "$project" -- \
        aws cloudformation list-stacks \
        --region "$region" \
        --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE UPDATE_ROLLBACK_COMPLETE \
        --query "StackSummaries[?starts_with(StackName, 'amplify-') && contains(StackName, '${identifier}') && contains(StackName, 'sandbox') && ParentId == null].StackName | [0]" \
        --output text 2>/dev/null || echo "")

    if [ "$result" = "None" ] || [ -z "$result" ]; then
        echo ""
    else
        echo "$result"
    fi
}

delete_cf_stack() {
    local stack_name="$1"
    local region="${2:-eu-west-2}"
    local timeout="${3:-600}"
    local project="${4:-$PROJECT_NAME}"

    log_info "Deleting CloudFormation stack: $stack_name"

    doppler run --config dev --project "$project" -- \
        aws cloudformation delete-stack \
        --region "$region" \
        --stack-name "$stack_name" 2>/dev/null || true

    # Wait for deletion
    local elapsed=0
    while [ $elapsed -lt $timeout ]; do
        local status=$(doppler run --config dev --project "$project" -- \
            aws cloudformation describe-stacks \
            --region "$region" \
            --stack-name "$stack_name" \
            --query "Stacks[0].StackStatus" \
            --output text 2>/dev/null || echo "DELETED")

        if [ "$status" = "DELETED" ] || echo "$status" | grep -q "does not exist"; then
            log_success "Stack deleted successfully"
            return 0
        fi

        if echo "$status" | grep -qE "DELETE_FAILED"; then
            log_error "Stack deletion failed: $status"
            return 1
        fi

        sleep 10
        elapsed=$((elapsed + 10))

        if [ $((elapsed % 60)) -eq 0 ]; then
            log_info "Waiting for stack deletion... (${elapsed}s elapsed, status: $status)"
        fi
    done

    log_error "Timeout waiting for stack deletion"
    return 1
}

# ============================================================================
# AUTH CHECKS
# ============================================================================

check_doppler_auth() {
    # Accept either DOPPLER_TOKEN environment variable or logged-in session
    if [ -n "${DOPPLER_TOKEN:-}" ]; then
        log_info "Using DOPPLER_TOKEN from environment"
        return 0
    fi
    if doppler whoami >/dev/null 2>&1; then
        return 0
    fi
    log_error "Doppler not authenticated. Set DOPPLER_TOKEN or run: doppler login"
    return 1
}

check_aws_auth() {
    local project="${1:-$PROJECT_NAME}"
    if ! doppler run --config dev --project "$project" -- aws sts get-caller-identity >/dev/null 2>&1; then
        log_error "AWS credentials not valid"
        return 1
    fi
    return 0
}

check_disk_space() {
    local required_mb="${1:-1000}"
    local available_mb=$(df -m . | tail -1 | awk '{print $4}')

    if [ "$available_mb" -lt "$required_mb" ]; then
        log_warn "Low disk space: ${available_mb}MB available, ${required_mb}MB recommended"
    fi
}

# ============================================================================
# CLEANUP TRAP
# ============================================================================

cleanup_on_failure() {
    log_error "Setup failed!"
    log_info "Partial state saved to: $STATE_FILE"
    log_info "To resume: re-run start-work ${ISSUE_KEY:-}"
    log_info "To cleanup: run stop-work ${ISSUE_KEY:-}"
}
