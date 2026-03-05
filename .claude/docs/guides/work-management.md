---
title: Work Management with Linear Integration
created: 2025-09-06
updated: 2026-02-05
last_checked: 2026-02-05
tags: [guide, work-management, linear, project-management, git-workflow]
parent: ./README.md
---

# Work Management with Linear Integration

## Overview

AgentFlow uses Linear as the source of truth for project management while maintaining operational context files for AI session continuity. This guide explains how work flows through the system.

## Architecture

```
Linear (Source of Truth)          AgentFlow (Implementation)
├── Issues & States        →      ├── Phase Orchestrators
├── Sprint Planning        →      ├── work-management-agent
├── Team Collaboration     →      └── current-task.md
└── Progress Tracking      →          └── Session Context
```

## Phase-Based Workflow

### 1. Setup Phase
- **Linear State**: Special "Setup" label
- **Orchestrator**: setup-orchestrator
- **Activities**: Infrastructure, environment, tooling
- **No Linear issue required** (framework initialization)

### 2. Discovery Phase  
- **Linear State**: Backlog
- **Label**: `phase:discovery`
- **Orchestrator**: discovery-orchestrator
- **Activities**: Problem exploration, research, initial requirements
- **Creates**: Feature issues in Linear

### 3. Requirements Phase
- **Linear States**: Discovered → Refining → Approved
- **Label**: `phase:requirements`
- **Orchestrator**: requirements-orchestrator
- **Activities**: Three Amigos, Behaviour scenarios, visual specs, API contracts, mini-PRD creation
- **Creates**: [Behaviour] and [UX] sub-issues for specification work
- **Context File**: `.claude/work/current-requirement.md`

#### Sub-issue Lifecycle in Requirements

When a Feature enters Requirements, create specification sub-issues:

| Sub-issue | Label | Assignee | Order | Purpose |
|-----------|-------|----------|-------|---------|
| `[Behaviour] {Title} scenarios` | `type:behaviour` | QA role | First | Define WHAT the feature does |
| `[UX] {Title} Storybook` | `type:ux` | UX role | Second | Define HOW it looks |

**Ordering:** Complete Behaviour first — scenarios define what the feature does; UX uses scenarios as input.

**Approval gate:** All sub-issues must be Done before the parent moves to Approved.

```
Issue: Login Flow (8 pts) [Refining]
  ├── [Behaviour] Login Flow scenarios (2 pts) [Approved → Done] @QA
  ├── [UX] Login Flow Storybook (2 pts) [Approved → Done] @UX
  └── Parent moves to [Approved] when sub-issues complete
```

### 4. Delivery Phase
- **Linear States**: Approved → In Progress → In Review → Dev → Test → Live
- **Label**: `phase:delivery`
- **Orchestrator**: delivery-orchestrator
- **Activities**: Implementation, testing, review, deployment
- **Updates**: Links commits, tracks progress
- **Context File**: `.claude/work/current-task.md`

**Note:** "Approved" status means requirements are complete and the issue is ready for implementation. No scheduling buffer is needed — AI-accelerated planning makes direct transition to delivery practical.

## Linear Configuration

### Required Setup

#### States
States are auto-created during project setup (see `af-setup-process` skill):

1. **Discovered** (backlog) - New feature identified, needs exploration
2. **Refining** (started) - Requirements phase in progress
3. **Approved** (unstarted) - Requirements approved, ready for implementation
4. **In Progress** (started) - Active development
5. **Waiting for Feedback** (started) - Blocked on human input (essential for agent automation)
6. **In Review** (started) - PR created, code review
7. **Dev** (completed) - Merged and deployed to dev environment (feature branch only)
8. **Test** (completed) - Promoted to test environment (feature branch only)
9. **Live** (completed) - Released to production

**Development models:**
- **Trunk-based**: States 1-7 + 10 (no Dev/Test environments)
- **Feature branch**: All states (multi-environment deployment)

#### Labels
Create these labels:
- Phase labels: `phase:setup`, `phase:discovery`, `phase:requirements`, `phase:delivery`
- Type labels: `type:feature`, `type:bug`, `type:improvement`, `type:documentation`
- Spec labels: `type:behaviour` (Behaviour scenario sub-issues), `type:ux` (UX/Storybook sub-issues)
- Optional: Team member labels for assignment

#### Teams and Projects
- Create "Project" team
- Create project for your application
- Note the team and project IDs for configuration

#### Milestones

Milestones group related features toward a delivery goal. They serve the role traditionally filled by "Epics":

| Use Case | Example Milestone |
|----------|------------------|
| Capability area | "Auth MVP" — Login + Registration + Session Management |
| Release target | "v1.0 Release" — Core feature set |
| Time-boxed goal | "Q2 Delivery" — Quarterly objectives |

**Create Milestones during:**
- Discovery (for capability areas identified)
- Planning (for release groupings)

**Milestones vs Projects:**
- **Milestones** — For most delivery goals (recommended)
- **Projects** — Only for "super-epics" spanning multiple milestones (rare)

### Custom Fields (Optional)
If your Linear plan supports custom fields:
- **Phase** (Select): Current AgentFlow phase
- **Artifacts** (Text): Links to specifications
- **ADR** (Text): Decision record references
- **Orchestrator** (Select): Active orchestrator

## current-task.md Pattern

### Purpose
Bridges the gap between Linear's high-level tracking and implementation details needed by AI.

### Lifecycle

#### 1. Task Activation
```markdown
af-work-management-agent fetches Linear issue
→ Creates/updates current-task.md
→ Populates with issue details
→ Adds implementation context
```

#### 2. During Implementation
```markdown
Orchestrator/agents update progress
→ Technical decisions logged
→ Blockers documented
→ Granular steps tracked
```

#### 3. Task Completion
```markdown
Final status updated
→ Outcomes documented
→ Linear issue closed
→ current-task.md cleared
```

### Structure Example
```markdown
---
title: "Current Task: Add User Authentication"
linear_issue: AF-123
linear_url: https://linear.app/agentflow/issue/AF-123
phase: delivery
started: 2025-01-20
status: in-progress
---

## Linear Issue
[AF-123 - Add User Authentication](https://linear.app/agentflow/issue/AF-123)

## Plans
- 2025-01-20: ~/.claude/plans/wiggly-riding-lighthouse.md (current)

## Objectives
- [ ] Implement OAuth2 with Google
- [ ] Add session management
- [ ] Create login/logout UI
- [ ] Write integration tests

## Technical Context
Using NextAuth.js for authentication...
Decision: Store sessions in Redis for scalability...

## Progress Log
- 2025-01-20 10:00 - Set up NextAuth configuration
- 2025-01-20 11:30 - Implemented Google OAuth provider
- 2025-01-20 14:00 - BLOCKED: Need Google OAuth credentials from DevOps

## Next Steps
1. Unblock: Get OAuth credentials
2. Complete session store implementation
3. Add UI components
```

### Plans Integration

When using Claude's plan mode, plan files are stored at `~/.claude/plans/[random-name].md`.

**Record plan file references in current-task.md:**
- Add path under `## Plans` section when a plan is created
- Mark as `(current)` or `(superseded)` as plans evolve
- Plan files survive compaction (stored on disk)

This ensures you can reconnect to detailed implementation plans after session restarts or compaction.

## work-management-agent Operations

### Finding Work
```
"Find issues in Requirements phase"
"Show current sprint tasks"
"What's blocking progress?"
```

### Creating Issues
```
"Create feature for user authentication"
"Create bug for login timeout issue"
```

### Updating Progress
```
"Move current task to In Review"
"Add comment about architectural decision"
"Link PR #123 to current issue"
```

### Reporting
```
"Generate sprint summary"
"Show team velocity"
```

## Hooks

AgentFlow uses hooks to maintain work state across session boundaries:

| Hook | Trigger | Action |
|------|---------|--------|
| **SessionStart** | Session begins/resumes | Reminds to read current-task.md |
| **PreCompact** | Before context compaction | Reminds to update current-task.md |
| **git-commit-reminder** | git commit | Quality checklist (tests, docs, validation) |

### Hook Configuration

Hooks are configured in `.claude/settings.json`:
- `SessionStart` → `.claude/hooks/session-start.sh`
- `PreCompact` → `.claude/hooks/pre-compact.sh`
- `PreToolUse` (Bash) → `.claude/hooks/git-commit-reminder.sh`

## Handoff Protocol

### Session Start
1. **SessionStart hook** reminds to read current-task.md
2. Read current-task.md for Linear context
3. Read referenced plan file (if any)
4. Check Linear for updates
5. Resume from Progress Log

### Session End
1. Update Progress Log
2. Document blockers
3. Note next steps
4. Sync to Linear

### Before Compaction
1. **PreCompact hook** reminds to save state
2. Update current-task.md with current progress
3. Ensure plan file path is recorded
4. Document next steps clearly

### After Compaction
1. Context has been compressed
2. Read current-task.md (survives - on disk)
3. Read plan file (survives - on disk)
4. Check TodoWrite (survives - on disk)
5. Restore context and continue

### Context Overflow
When approaching token limits:
1. Summarize completed work
2. Archive to Linear comments
3. Clear old progress entries
4. Preserve only essential context

## TodoWrite Integration

Claude's TodoWrite tool tracks real-time progress during a session:

| Asset | Purpose | Survives Compaction |
|-------|---------|---------------------|
| **current-task.md** | Project-level state, Linear link | ✅ Yes (git) |
| **Plan files** | Detailed implementation steps | ✅ Yes (disk) |
| **TodoWrite** | Real-time session tracking | ✅ Yes (disk) |

**Use TodoWrite for:**
- Tracking in-progress work during a session
- Breaking complex tasks into steps
- Real-time visibility for the user

**Use current-task.md for:**
- Cross-session persistence
- Team visibility (version controlled)
- Linear issue linkage
- Plan file references

They complement each other: TodoWrite is the belt, current-task.md is the braces.

## Best Practices

### DO
- ✅ Keep Linear as source of truth for task state
- ✅ Use current-task.md for implementation details
- ✅ Update both Linear and current-task.md regularly
- ✅ Use consistent phase labels
- ✅ Link artifacts in Linear comments

### DON'T
- ❌ Duplicate Linear data in markdown files
- ❌ Create tasks outside of Linear, except for in claude's todo list
- ❌ Skip phase transitions
- ❌ Store sensitive data in current-task.md
- ❌ Let current-task.md grow beyond 1000 lines

## Git Workflow

### Branch Strategy (ADR-009)

AgentFlow uses a **specs branch strategy** that aligns with Linear issue status:

```
develop (stable baseline)
    │
    ├── specs (Discovery + Requirements work)
    │       └── PRd to develop when specs approved
    │
    ├── JCN-123 (Delivery - implementation only)
    └── JCN-124 (Delivery - implementation only)
```

#### Branch Purposes

| Branch | Phase | Who Works Here | Lifecycle |
|--------|-------|----------------|-----------|
| `develop` | - | Merge target | Permanent |
| `specs` | Discovery, Requirements | PM, UX, QA | Long-lived |
| `{ISSUE-ID}` | Delivery | SE | Short-lived |

#### Linear Status Drives Branching

| Linear Status | Branch | Activity |
|---------------|--------|----------|
| Discovered | `specs` | PM created Feature |
| Refining | `specs` | Writing mini-PRD, designs, scenarios |
| Approved | `specs` → PR | Specs complete, merge to develop |
| In Progress | `{ISSUE-ID}` | SE implements |
| In Review | `{ISSUE-ID}` | PR open |
| Dev/Test/Live | merged | Deployed |

**Key rule:** Issue branches (`JCN-123`) are only created when Linear status reaches "Approved" or later.

#### Commands

```bash
# Discovery/Requirements work (PM, UX, QA)
start-specs myproject           # Creates/attaches to specs worktree + tmux

# Delivery work (SE) - only works if Linear status >= "Approved"
start-work myproject JCN-123    # Creates issue worktree + tmux

# Cleanup after PR merged
stop-work myproject JCN-123     # Removes worktree + tmux
```

#### File Ownership on Specs Branch

To minimize merge conflicts when PM/UX/QA work concurrently:

| Role | Owns | Path Pattern |
|------|------|--------------|
| PM | Mini-PRDs, acceptance criteria | `specs/{issue}/prd.md` |
| UX | Designs, Storybook stories | `specs/{issue}/design.md`, `stories/` |
| QA | BDD scenarios, test contracts | `specs/{issue}/scenarios.md` |

#### Worktree Locations

```
/srv/worktrees/{project}/
├── develop        # Stable (setup phase)
├── specs          # Discovery + Requirements
├── JCN-123        # Active delivery (short-lived)
└── JCN-124        # Active delivery (short-lived)
```

See [ADR-009: Specs Branch Strategy](../../../.agentflow/adr/adr-009-specs-branch-strategy.md) for full details.

#### Trunk-Based Projects

Some projects use **trunk-based development** where Discovery/Requirements work happens directly on the main branch (no specs branch). Configured in the project registry:

```bash
project-registry set <project> branching_strategy trunk-based
```

For trunk-based projects:
- `start-discovery` and `start-refine` use the main `working_directory`
- No specs branch or worktree is created
- All phases work on the single main branch

### Branch and Merge Pattern

Work on feature branches, merge via GitHub - not locally.

```
Feature Branch                  GitHub (Origin)              Downstream
     │                               │                           │
     ├── git push ──────────────────►│                           │
     │                               │                           │
     │                    merge/PR ──┤                           │
     │                               │                           │
     │                               │◄── git pull ──────────────┤
     │                               │    (docs sync, CI, etc.)  │
```

**Pattern:**
1. Create feature branch (e.g., `AF-123` for Linear issue)
2. Push branch to origin
3. Merge on GitHub (PR if main is protected)
4. Downstream systems pull from origin

**Why not merge locally?**
- GitHub is the source of truth
- PRs provide review, CI checks, audit trail
- Local worktrees (like docs portal cache) are just consumers
- Avoids divergence between local and remote

### Worktrees

AgentFlow projects use git worktrees for parallel work:

```bash
# Create feature worktree
start-work myproject AF-123

# Work happens in /srv/worktrees/myproject/AF-123
# Push to origin, merge on GitHub
# Main worktree pulls via automated sync
```

The `main` worktree at `/srv/worktrees/{project}/main` is a **cache** for downstream systems (docs portal, deployments). Don't merge there directly.

## Integration with CI/CD

### Commit Messages
Include Linear issue ID:
```bash
git commit -m "AF-123: Implement OAuth2 authentication"
```

### Pull Requests
Reference Linear issue in PR description:
```markdown
## Linear Issue
Closes AF-123

## Changes
- Added NextAuth configuration
- Implemented Google OAuth
```

### Automated Updates
Webhooks can update Linear when:
- PR created → Move to In Review, add PR link to issue
- PR merged → Move to Dev
- Deploy to test → Move to Test
- Deploy to production → Move to Live

## Troubleshooting

### current-task.md Out of Sync
```bash
# Refresh from Linear
work-management-agent "Sync current task from Linear"
```

### Linear API Errors
- Check API token validity
- Verify team/project access
- Review rate limits

### Phase Mismatch
- Ensure labels match states
- Check orchestrator handoffs
- Verify task transitions

## See Also
- [af-work-management-agent specification](../../agents/af-work-management-agent.md)
- [Linear API documentation](https://developers.linear.app)