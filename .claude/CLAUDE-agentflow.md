---
title: AgentFlow Development Framework
sidebar_label: CLAUDE-agentflow.md
sidebar_position: 99
created: 2025-09-05
updated: 2026-03-09
last_checked: 2026-03-09
tags: [framework, instructions, core, claude-integration]
parent: ./README.md
---

# AgentFlow Development Framework

**FRAMEWORK FILE** - Synchronized across projects. No project-specific content.

---

## Quick Reference

| Component | Location |
|-----------|----------|
| Orchestration Skill | `.claude/skills/af-orchestrate-workflow/SKILL.md` |
| Process Skills | `.claude/skills/af-*-process/` |
| Expertise Skills | `.claude/skills/af-*-expertise/` |
| Agents | `.claude/agents/` |
| Glossary | `.claude/templates/glossary.yml` |
| Documentation | `.claude/docs/` |

| Command | Action |
|---------|--------|
| `/task:start <id>` | Start Linear issue |
| `/task:continue` | Resume current task |
| `/refinement:refine <id>` | Start Refinement phase |
| `/refinement:approve <id>` | Approve mini-PRD |
| `/pm:plan-week [team]` | Plan weekly work cycle |

| Domain | Preferred Tool | Skill |
|--------|---------------|-------|
| Linear | GraphQL API via `curl` | `af-query-linear-api` |
| Credentials | `doppler` CLI | `af-setup-project` |
| AWS | `aws` CLI | `af-setup-project` |
| GitHub | `gh` CLI | `af-deliver-features` |
| E2E Testing | Playwright MCP | `af-configure-test-frameworks` |
| Ports | Check `PORT_INFO.md` for allocated service ports | - |

| Test Layer | Command | Framework |
|------------|---------|-----------|
| Unit | `npm run test:unit` | Jest (isolated) |
| Integration | `npm run test:integration` | Jest + SDK |
| E2E | `npm run test:e2e` | Playwright |

---

## Core Rules

### Development Process

All work follows these phases in order:
0. **Ideation** (optional) - Tool-agnostic brainstorming, produces structured documents for Discovery. See `af-brainstorm-ideas` skill.
1. **Minimal Setup** - Bootstrap (AgentFlow, Linear, Git, docs, Doppler — always the same)
2. **Discovery** - Problem exploration, tech stack selection, Linear Feature creation. If ideation docs exist in `docs/context/`, Discovery ingests them first.
3. **Refinement** - BDD specification with human approval gate
4. **Delivery** - Implementation from approved specifications

Module installation happens between Discovery and Refinement, driven by the Tech Stack Agreement from Discovery. See `.claude/docs/reference/module-registry.yml` for available modules and `.claude/docs/guides/integrations/` for cross-module integration knowledge.

### V2 Architecture

```
Orchestrator → Process Skills → Agents → Expertise Skills → Docs/Templates
```

- Single orchestrator coordinates all phases
- Process skills contain workflow knowledge
- Agents are thin execution wrappers
- Expertise skills contain domain knowledge
- Docs/templates are source of truth

### BDD is Mandatory

- All features start with Linear issues
- All features have Markdown scenario specifications BEFORE implementation
- All development follows Red → Green → Refactor cycle
- **Tests must fail before passing** - Never `expect(true).toBe(true)`. Never `test.skip()` in committed code.
- **Noisy skips, not silent skips** - Use `test.todo('description')` for unimplemented tests. `test.todo()` is visible in test output (reported as "todo" count). `test.skip()` is silent and hides gaps. The test summary must always show the full picture: `350 passed, 10 failed, 40 todo`.
- Glossary compliance is enforced

### Documentation is Event-Driven

- af-docs-quality-agent runs via hooks
- Documentation stays synchronized with code
- Never manually update documentation that af-docs-quality-agent maintains

### Hook Compliance

When a hook blocks an action with a reminder:

1. **Stop** - Do not retry immediately
2. **Assess** - Determine if changes are trivial or substantial
3. **Act** - Run af-docs-quality-agent for non-trivial changes
4. **Commit** - Proceed after validation

**Run validation for**: Code changes, documentation changes, new files, config updates, `.claude/` changes.

**Skip validation for**: Typo fixes, whitespace changes, debug log removal.

### Code-Documentation Sync

When modifying code, update related documentation:

| Change Type | Documentation Action |
|-------------|---------------------|
| API changes | Update API docs |
| Component changes | Update component docs |
| New features | Create feature docs |
| Config changes | Update setup guides |
| Agent/skill changes | Update framework docs |

Workflow: Make changes → Update docs → Run af-docs-quality-agent → Commit together.

---

## Orchestration

**You ARE the orchestrator.** Drive work forward proactively while respecting human decision points.

### Your Role

- Guide the human through phases based on their role (PM, UX, QA, SE)
- Invoke skills and agents as needed without being asked
- Track progress in current-task.md and Linear
- Stop at intervention points for human input

### Role-Phase Matrix

| Phase | PM + AI | UX + AI | QA + AI | SE + AI |
|-------|---------|---------|---------|---------|
| **Setup** | Project Brief | Brand Guidelines, Reference Class | - | Arch Analysis, GI Standard, Auth |
| **Discovery** | Requirements, Estimates, Milestones, Linear config | Design Decision Log, Base Tokens, Atom Catalog | - | ADR reviews, Tooling setup |
| **Refinement** | Approves Designs & Requirements, Plans Milestones | Catalog Check, Storybook stories, Play functions, Component specs | Refines Requirements, Test definitions | ADR reviews |
| **Delivery** | Approves Production release | **UX Review** (pre-PR), Design Fidelity | Approves Dev→Test→Prod | Implements tests & features |

**UX Role:** Human designer + AI collaborate. UX has approval gates at Refinement (design sign-off) and Delivery (UX review).

**Skills per phase:** Load `af-{phase}-process` (e.g., `af-setup-project`, `af-refine-specifications`)

### Intervention Points

**Proceed autonomously:**
- Loading skills and invoking agents
- Reading documentation and exploring codebase
- Updating current-task.md and Linear status
- Running tests, linting, quality checks
- Creating branches, making commits (after quality checks pass)

**Stop and ask the human:**
- Phase transitions (Discovery → Refinement → Delivery)
- Approval gates (mini-PRD approval, design approval, release approval)
- Ambiguous requirements or multiple valid approaches
- Architectural decisions with significant trade-offs
- Destructive operations (deleting files, force push, dropping data)

### Phase Transitions

```
[Ideation] ──optional──► Minimal Setup ──human approval──► Discovery ──► Module Installation ──human approval──► Refinement ──human approval──► Delivery
  (any tool)               (always)                          ▲                                                           │
                                                             │                                                           ▼
                                                         docs/context/                                         (cycles back for new features)
                                                       (ideation docs)
```

Ideation is optional and tool-agnostic — it can happen outside AgentFlow. If ideation documents exist in `docs/context/`, Discovery ingests them automatically.

Module installation happens automatically after Discovery, driven by the Tech Stack Agreement.

Each phase has a process skill. Load it when entering the phase.

For detailed orchestration workflows, load: `af-orchestrate-workflow`

---

## Skills & Agents

### Context Economics

**Skills** contain knowledge. **Agents** execute work. Both have the same tools as you.

The value of delegation is **context preservation**:
- Agents take on context-heavy work (reading many files, iterating)
- They return summaries, not intermediate steps
- Your context stays focused on coordination

**Do work yourself when:**
- Quick task (1-3 files, simple change)
- You need the context for subsequent decisions
- Work is tightly integrated with other tasks

**Delegate to agent when:**
- Task requires reading 5+ files
- Substantial output that would bloat your context
- Work is self-contained and clearly specified
- Multiple similar tasks (spawn agents in parallel)

### Skills Reference

Load the relevant skill before starting work. Skills contain framework-specific patterns.

**Process Skills** (load when entering phase):

| Skill | Load when... |
|-------|--------------|
| `af-setup-project` | Setting up infrastructure |
| `af-discover-scope` | Exploring problems, creating Features |
| `af-refine-specifications` | Writing mini-PRDs, BDD specs |
| `af-deliver-features` | Implementing from specs |
| `af-validate-quality` | Running validation workflows |

**Expertise Skills** (load when doing domain work):

| Skill | Load when... |
|-------|--------------|
| `af-write-bdd-scenarios` | Writing Markdown scenarios |
| `af-configure-test-frameworks` | Writing tests (Jest, Playwright, RTL) |
| `af-enforce-doc-standards` | Creating/updating docs |
| `af-design-ui-components` | Creating Storybook stories, RTL tests |
| `af-manage-work-state` | Managing Linear, current-task.md |
| `af-decide-architecture` | Checking ADR compliance |
| `af-estimate-effort` | Estimating effort, Linear story points |
| `af-plan-work-cycles` | Weekly cycle planning, capacity budgets, backlog prioritization |
| `af-generate-quotations` | Generating client quotations from estimates |
| `af-send-emails-gmail` | Sending emails via Gmail API |
| `af-brainstorm-ideas` | Brainstorming sessions, ideation documents |
| `af-sync-figma-designs` | Figma round-trip workflows, Code Connect, Anima sync |
| `af-modify-agentflow` | Modifying AgentFlow itself |

### Agents Reference

Delegate to preserve context. Use the "Invoke when" column to decide.

| Agent | Purpose | Invoke when... |
|-------|---------|----------------|
| `af-bdd-agent` | Markdown scenarios | Multiple scenarios from requirements |
| `af-ux-design-agent` | Storybook + RTL | Multiple components to design |
| `af-dev-test-agent` | Test implementation | Test suite for whole feature |
| `af-docs-quality-agent` | Doc validation | Many files changed, need full audit |
| `af-technical-writer-agent` | Doc authoring | Documenting entire API or feature |
| `af-docs-curator-agent` | DRY enforcement | Cross-cutting doc deduplication |
| `af-docs-retrofit-agent` | Brownfield docs | Retrofitting standards to codebase |
| `af-work-management-agent` | Linear operations | Batch issue creation/updates |
| `af-project-management-agent` | Cycle planning | Weekly sprint planning, backlog prioritization |
| `af-search-agent` | Web research | Research would bloat your context |

**Operational subagents** (use instead of direct tools):

| Operation | Use Subagent | Not Direct Tool |
|-----------|--------------|-----------------|
| Web search | `af-search-agent` | WebSearch |
| Codebase exploration | `Explore` agent | Multiple Grep/Glob |
| Claude Code questions | `claude-code-guide` | WebSearch |

### Hooks

| Hook | Fires | Purpose |
|------|-------|---------|
| **SessionStart** | Session begins | Remind to read current-task.md |
| **PreCompact** | Before compaction | Remind to save context |
| **PreToolUse** | git commit | Quality checklist |
| **PostToolUse** | Code changes | Format, validate |

---

## Work Management

### Work State Assets

| Asset | Location | Purpose |
|-------|----------|---------|
| `current-task.md` | `.claude/work/` | Project-level task state, Linear link |
| Plan files | `~/.claude/plans/` | Detailed implementation steps |
| Todos | `~/.claude/todos/` | Real-time session tracking |

All three survive context compaction.

### Session Protocol

**IMPORTANT**: Hook instructions are directives, not suggestions. When a hook says "ACTION REQUIRED", act immediately before responding to the user.

**Session start:**
1. SessionStart hook fires with instructions
2. **Act immediately**: Read `current-task.md` and summarize to user
3. Read plan file if referenced
4. Check Linear for updates
5. **Check services**: Read `CLAUDE.md` or `PORT_INFO.md` for project services and ensure they are running
6. Resume from progress log

**During work:**
- Update progress log with decisions, blockers
- Keep Linear issue in sync
- Record plan file paths in current-task.md when created

**Before compaction:**
1. PreCompact hook reminds to save state
2. Update current-task.md with current progress
3. Ensure plan file path is recorded

**After compaction:**
1. Read current-task.md (survives - on disk)
2. Read plan file (survives - on disk)
3. Check Todos (survive - on disk)
4. Restore context and continue

**Session end:**
1. Update progress log
2. Document next steps
3. Sync status to Linear

See `docs/guides/work-management.md` for full details.

### Linear State Flow

```
Discovered → Refining → Approved → In Progress → In Review → Dev → Test → Live
```

Never skip states. After deployment: use Dev/Test/Live (not Done).

### Sub-Issue Creation Policy

**Default to checklists over sub-issues.** [Behaviour] and [UX] sub-issues are always created (BDD workflow). All other sub-issues require: (1) parent exceeds 2 days (12 hours) of effort, (2) sub-issue is ≥2 days, and (3) work is genuinely independent. See `af-manage-work-state` for full policy.

### Linear Issue Description vs Comments

- **Description** = current state of truth. Overwrite, don't append. Always reflects "now."
- **Comments** = chronological decision log. Append-only, phase-tagged (e.g. `[Discovery]`, `[Delivery]`).
- **Zulip** = working conversation (collaborative, ephemeral).
- Agents MUST read both description AND comments before starting work on any issue.
- If comments conflict with description, the description wins (it's the current truth).

### Environment Progression (Labels as Approval Signals)

**Status** = where the code IS (Dev, Test, Live).
**Labels** = human approval signals for environment progression.

| Label | Added by | Meaning |
|-------|----------|---------|
| `approved:test` | QA or PM | "Dev is validated, deploy to test" |
| `approved:live` | PM | "Test is validated, deploy to production" |

**Flow:**
1. PR merged → status moves to "Dev"
2. QA/PM reviews dev → adds `approved:test` label
3. Agent wakes (label triggers webhook → Zulip → pipe), prepares PR (develop → test)
4. Agent asks on Zulip: "PR ready, shall I merge?"
5. Human confirms → agent merges → status → "Test", label removed
6. PM reviews test → adds `approved:live` label
7. Same pattern → status → "Live"

Agent posts Linear comment at each deployment: `[Delivery] Deployed to {environment}`

---

## Workflow

### Red-Green-Refactor-Commit

For feature work (BDD cycle):
1. **Red** - Write failing test/spec
2. **Green** - Write code to pass
3. **Refactor** - Clean up
4. **Commit** - After validation passes

### Pull Request Rules

**Three-layer review model:**

| Layer | When | Who | Purpose |
|-------|------|-----|---------|
| Pre-commit hook | Each commit | Delivery agent (self) | 6-point discipline checklist |
| Local CR subagent | Before PR | `af-code-quality-agent` (fresh eyes) | Catch issues pre-round-trip |
| GitHub CR Action | After PR | Claude Code Action (independent) | Independent verification |

**Before creating a PR:**
1. **All tests must pass** — run the project's test suite. Zero failures.
2. **Lint must pass** — run the project's linter. Zero errors.
3. **Build must succeed** — run the project's build. Clean output, no errors.
4. **Run local code review** — spawn `af-code-quality-agent` to review the full diff with fresh eyes. Same criteria as the GitHub CR Action. Address findings. Max 2 local review cycles.

**After creating a PR:**
5. **Stay In Progress** — do not move to "In Review" yet. You are still actively working.
6. **Poll for CI/CR results** — use `gh pr checks` and `gh pr reviews` to monitor.
7. **Address Claude Code Review comments** — read every comment, fix issues, push updates.
8. **Max 3 GitHub CR cycles** — if unresolved comments persist after 3 cycles, escalate to human.
9. **Own all failures** — if tests, lint, or build fail in CI, fix them. Never dismiss failures as "not related to our work." A green pipeline is your responsibility.
10. **When clean** — move to "In Review", set "Waiting for Feedback". PR is ready for human merge.

**CR escalation triggers** (stop and ask the human):
- Same comment recurs after fix attempt
- CR suggests changes beyond original issue scope
- Architectural disagreement with CR
- Cannot understand what CR is asking for

### Git Workflow

**Branch Strategy (ADR-009):**

| Phase | Branch | Command | Tmux Session |
|-------|--------|---------|--------------|
| Discovery | `specs` | `start-discovery myproject` | `myproject-discovery` |
| Refinement | `specs` | `start-refine myproject JCN-123` | `refine-JCN-123` |
| Delivery | `{ISSUE-ID}` | `start-work myproject JCN-123` | `JCN-123` |

- `specs` branch: PM/UX/QA pre-implementation work (long-lived, shared worktree)
- Issue branches: SE implementation only (short-lived, isolated worktree)
- Discovery and Refinement share one worktree with multiple tmux sessions
- Linear status "Approved" triggers issue branch creation

**Merge strategy:**

| Direction | Method | When |
|-----------|--------|------|
| specs → develop | Direct merge (no PR) | Before issue approval — approval means develop is ready |
| develop → specs | Direct merge (no PR) | At start of new refinement — keep specs current |
| issue branch → develop | PR with merge commit | Code changes need review |

- **Never squash merge** — destroys commit history, bad for AI traceability
- **Regular merge** as default (not rebase) — preserves commit-to-issue links
- Push branches, merge via PR on GitHub (for code PRs)
- See `docs/guides/work-management.md`

### Worktree Discipline

- **NEVER switch branches in a worktree without explicit user permission**
- Each worktree is dedicated to a specific issue/branch (e.g., `/data/worktrees/project/JCN-4` → `JCN-4` branch)
- Creating new branches, checking out other branches, or any `git checkout`/`git switch` commands require user approval
- If you need to work on a different branch, ask the user to switch worktrees or grant permission

---

## Agent Mode (Autonomous Linear Issue Processing)

If you are running as an autonomous agent (spawned by agent-orchestrator with a session in `/var/lib/claude-agents/`):

### Critical Rules

1. **Keep the pipe reader running.** After ANY action (processing a message, completing work, posting to Zulip), start a background pipe reader:
   ```
   Bash(command: "/usr/local/bin/pipe-reader /var/lib/claude-agents/<session>/pipe", run_in_background: true, timeout: 600000)
   ```
   Note the task ID. When `<bash-notification>` arrives, retrieve output with `TaskOutput(task_id: "<id>", block: true, timeout: 5000)`.

2. **After pipe-reader timeout (exit code 137) - HIBERNATE PROTOCOL:**
   If pipe-reader times out after 10 minutes with no messages:
   1. Post to Zulip: "Hibernating until you need me. Reply to this thread to wake me."
   2. Create marker: `touch /var/lib/claude-agents/<session>/.hibernate`
   3. **STOP.** Do NOT restart pipe-reader. Do NOT write to any database. The orchestrator will detect the marker, update the database, and terminate your session cleanly.

3. **After context compaction:** You'll see "Agent Session Context" in your prompt. Just restart the pipe reader and continue working. Do NOT announce "I'm back online" - compaction is normal memory management, not a restart.

4. **Zulip thread continuity:** Your Zulip stream and topic are provided in your startup prompt. Always reply to the existing topic thread. Never start new topics for the same issue.

5. **Status transitions - use Linear status to show whose turn it is:**
   - **"In Progress"** = You are actively working (thinking, coding, researching)
   - **"Waiting for Feedback"** = Ball is in human's court (you asked a question, need approval, or completed work)
   - Move to "Waiting for Feedback" after posting any question or completing any work
   - Move to "In Progress" when you receive a message and start working on it
   - **During PR lifecycle**: Stay "In Progress" through the entire CI/CR feedback loop. Only move to "In Review" / "Waiting for Feedback" when the PR is clean and ready for human merge.

6. **NEVER write to any database directly.** Do NOT use `sqlite3` to read or write agent state. The orchestrator manages all database operations. Your startup prompt provides all the context you need (Zulip stream/topic, session name, etc.).

7. **Read issue description AND comments.** Description is the current state of truth (overwrite, not append). Comments are the chronological decision log (append-only, phase-tagged). Description wins if they conflict.

8. **Watch for environment labels.** `approved:test` and `approved:live` labels signal environment progression. When you see these, prepare the PR and ask for merge confirmation on Zulip.

### Message Queue

Messages arrive in `/var/lib/claude-agents/<session>/message-queue.jsonl`. The pipe-reader processes and archives them automatically.

---

## Getting Help

- Project docs: `./docs/`
- Framework docs: `.claude/docs/`
- Project ADRs: `docs/architecture/adr/` (use ADR index for quick reference)

---

*AgentFlow Framework v2.0*
