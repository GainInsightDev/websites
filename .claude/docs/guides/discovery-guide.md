---
title: Discovery Phase Guide
created: 2025-09-06
updated: 2026-02-06
last_checked: 2026-02-06
tags: [guide, discovery, orchestrator, phase-2]
parent: ./README.md
related:
  - ../../skills/af-orchestrate-workflow/SKILL.md
  - ../../skills/af-discover-scope/SKILL.md
  - ../../agents/af-search-agent.md
---

# Discovery Phase Guide

**Phase 2 of 4 - Product-Level Exploration**

This guide demonstrates the Discovery Orchestrator workflow using a practical example.

## When to Use Discovery

**✅ Appropriate Discovery Scope** (product/project level):
- "Create a cost allocation system that imports data from Xero, allows users to allocate costs, and reports on them"
- "Build a SaaS platform for project management"
- "Develop a learning management system"

**❌ Not Appropriate** (feature level - belongs in Refinement):
- "Add user authentication"
- "Create a dashboard widget" 
- "Implement email notifications"

## Discovery Workflow Example

### Example Scenario
User requests: *"I want to create a cost allocation system that imports data from Xero, allows users to allocate costs to projects, and generates reports on cost distribution."*

### Step 1: Context Gathering

**Discovery Orchestrator asks these 4 questions:**

**Q1: Business Driver**
*"What's driving this need? What problem are you trying to solve?"*

**Example User Response:**
*"We're a consulting firm with multiple projects running simultaneously. Currently we manually track costs in spreadsheets, which is error-prone and time-consuming. We need to accurately allocate overhead costs like rent, utilities, and staff time to specific client projects for better profitability analysis and client billing."*

**Q2: User Context** 
*"Who are the users and what's their current experience with this type of system?"*

**Example User Response:**
*"Primary users are our finance team (3 people) and project managers (8 people). Finance team is comfortable with Xero but struggles with Excel formulas. Project managers are non-technical but need visibility into project costs. Currently they email finance for cost reports and wait 2-3 days."*

**Q3: Technical Constraints**
*"Any technical constraints, existing systems, or technology preferences?"*

**Example User Response:**
*"We use Xero for accounting (must integrate), Office 365 for everything else. Prefer web-based solutions accessible from anywhere. Small team so can't maintain complex infrastructure - cloud hosting preferred. Budget under $50k for development."*

**Q4: Success Criteria**
*"What does success look like? How will you measure it?"*

**Example User Response:**
*"Success means project managers can see real-time cost data, finance team can allocate monthly overhead in under 2 hours (currently takes 2 days), and we can generate client bills with detailed cost breakdowns. Measure by time savings and billing accuracy improvements."*

### Step 2: Optional External Research

**Discovery Orchestrator evaluates if external research is needed:**

In this cost allocation example, external research IS needed for Xero API integration patterns, so:

**Discovery Orchestrator delegates to search-agent:**

```
Task tool invocation:
"Research Xero API integration patterns, authentication methods, and data import limitations for cost allocation systems. Focus on integration approaches, rate limits, and technical constraints relevant to our consulting firm use case."
```

**Search-agent provides focused summary of key findings, protecting orchestrator context.**

**Note**: If user had provided detailed technical constraints or API documentation, this step could be skipped.

### Step 3: Create Discovery Deliverables

**Based on context gathering and search results, Discovery Orchestrator creates multiple focused deliverables:**

#### 1. Project Overview (`/docs/requirements/project-overview.md`)
```markdown
# Cost Allocation System - Project Overview

## Business Case
- **Problem**: Manual spreadsheet-based cost allocation taking 2 days monthly
- **Impact**: Delayed billing, inaccurate project profitability, poor decision making
- **Value Proposition**: Automate allocation, reduce time to 2 hours, enable real-time visibility

## Success Criteria  
- Time reduction: 2 days → 2 hours monthly allocation
- User adoption: 100% of project managers using cost dashboards within 3 months
- Billing accuracy: Detailed cost breakdowns for all client bills

## Scope Boundaries
- **Included**: Xero integration, cost allocation engine, reporting dashboards
- **Excluded**: Time tracking integration, mobile applications, other accounting systems

## Project Vision
Cloud-based cost allocation platform that seamlessly integrates with existing Xero workflows to provide real-time project profitability insights for consulting teams.
```

#### 2. User Analysis (`/docs/requirements/user-analysis.md`)
```markdown
# Cost Allocation System - User Analysis

## User Personas
### Finance Users (3 people)
- **Current Experience**: Comfortable with Xero, struggle with Excel formulas
- **Needs**: Simplified allocation workflows, batch processing capabilities
- **Access Level**: Full control over allocation rules and monthly processing

### Project Managers (8 people) 
- **Current Experience**: Non-technical, currently email finance for cost reports
- **Needs**: Visual cost dashboards, quick report generation, budget monitoring
- **Access Level**: Read-only with export capabilities

## Key User Journeys
### Monthly Allocation Process (Finance)
1. Review new Xero transactions → 2. Configure allocation rules → 3. Run batch processing → 4. Review and approve

### Daily Cost Monitoring (Project Managers)
1. Check project dashboard → 2. Compare actual vs budget → 3. Export reports for clients → 4. Plan future estimates

## Current Pain Points
- 2-3 day delay for cost reports from finance team
- Manual Excel processes prone to errors
- No real-time visibility into project profitability
- Difficult to generate detailed client billing reports

## Behavioral Calibration

| Dimension | Finance Users | Project Managers | UI Impact |
|-----------|--------------|-----------------|-----------|
| Risk tolerance | Low — handles money | Med — reviews only | Finance: confirm before batch processing. PMs: no confirmation on read-only actions |
| Info density pref | High — spreadsheet users | Med — wants visual dashboards | Finance: dense tables. PMs: card-based dashboards |
| Automation trust | Cautious — wants to verify | High — just show the result | Finance: preview before apply. PMs: auto-refresh OK |
| Context-switch freq | Low — monthly deep-dive | High — checks multiple projects daily | Finance: stateless OK. PMs: persist last-viewed project |
```

#### 3. Entity Model (`/docs/discovery/entity-model.md`)
```markdown
# Cost Allocation System - Entity Model

## Central Entity: Cost Allocation
The thing users care most about — every other entity serves or describes an allocation.

## Entities

### User-Facing Entities
| Entity | Description | Central? |
|--------|-------------|----------|
| Cost Allocation | Assignment of a cost to a project | YES |
| Project | Client project receiving allocated costs | |
| Report | Generated cost breakdown for clients | |

### Behind-the-Scenes Entities
| Entity | Description |
|--------|-------------|
| Xero Transaction | Raw financial data imported from Xero |
| Allocation Rule | Logic for distributing overhead costs |

## Entity Capabilities (become Linear features)

### Cost Allocation
- Display allocation details
- Create/edit allocations
- Batch allocation processing
- Allocation history

### Project
- Project cost dashboard
- Budget vs actual comparison

### Report
- Generate cost breakdown report
- Export to PDF/CSV

## Composition Views
- **Finance Dashboard** = Allocation processing + Rule management + Batch controls
- **Project Manager View** = Project costs + Budget comparison + Report generation
```

**Note:** Entity Model replaces the Feature Roadmap deliverable. Prioritization happens in Linear using milestones, cycles, and priority flags — not version labels (v1, v2, future) in documents.

#### 4. Technical ADRs (Multiple documents in `/docs/architecture/adr/`)

**ADR-001: Technology Stack Selection**
```markdown
# ADR-001: Cost Allocation System Technology Stack

## Status: Accepted

## Context
Need to select technology stack that aligns with AgentFlow standards while supporting Xero integration requirements and team capabilities.

## Decision
- **Frontend**: Next.js 14+ with TypeScript
- **Database**: PostgreSQL for allocation rules and history
- **Authentication**: Azure AD (existing) + OAuth 2.0 for Xero
- **Hosting**: AWS Amplify for alignment with AgentFlow

## Rationale
Next.js provides excellent API integration capabilities for Xero. PostgreSQL handles complex allocation calculations reliably. Azure AD leverages existing Office 365 infrastructure.

## Consequences
- Positive: Consistent with AgentFlow standards, team familiarity
- Negative: Learning curve for Xero API integration patterns
```

**ADR-002: Xero Integration Approach** 
```markdown
# ADR-002: Xero API Integration Strategy

## Status: Accepted

## Context
Need reliable, real-time data synchronization with Xero while respecting API rate limits and ensuring data consistency.

## Decision
Use Xero OAuth 2.0 with webhook subscriptions for real-time transaction updates

## Rationale
Webhooks prevent constant polling, OAuth 2.0 provides secure authentication, real-time updates enable live dashboards.

## Consequences
- Positive: Real-time data, efficient API usage, secure authentication
- Negative: Webhook endpoint complexity, need for robust error handling
```

#### 5. Integration Architecture (`/docs/architecture/integration-architecture.md`)
```markdown
# Cost Allocation System - Integration Architecture

## System Integration Overview
```
External Systems:
Xero API ←→ Cost Allocation Engine ←→ Dashboard UI
    ↓                ↓                     ↑
Azure AD         PostgreSQL         Project Managers
```

## Data Flow Architecture
1. **Xero Transactions** → Real-time webhook → **Allocation Engine**
2. **Allocation Rules** → Applied to transactions → **Cost Database**  
3. **Dashboard Queries** → Aggregated data → **UI Components**
4. **Report Generation** → PDF export → **Client Deliverables**

## Authentication Strategy
- **User Authentication**: Azure AD integration (SSO with Office 365)
- **Xero Integration**: OAuth 2.0 with refresh token management
- **API Security**: Rate limiting, encrypted data storage, audit logging

## Deployment Architecture  
- **Production**: AWS Amplify hosting with RDS PostgreSQL
- **Development**: Local development with Docker containers
- **Staging**: Amplify branch deployment for testing
```

### Step 4: Documentation Validation & Linear Features

**A. Documentation Validation**
```
Discovery Orchestrator invokes docs-agent:
"Validate project overview document at /docs/requirements/project-overview.md for documentation standards compliance. Fix frontmatter, linking, and formatting as needed."
```

**B. Linear Features Creation**
```
Discovery Orchestrator invokes af-work-management-agent:
"Create Linear epic 'Cost Allocation System' with entity features from the entity model. Attach project documentation links."
```

Entity-driven example (from entity model above):
```markdown
📋 "Cost Allocation System" (Epic)
  ├── 📦 "Cost Allocation" (Entity Epic)
  │     ├── "Display allocation details" (sub-issue)
  │     ├── "Create/edit allocations" (sub-issue)
  │     ├── "Batch allocation processing" (sub-issue)
  │     └── "Allocation history" (sub-issue)
  ├── 📦 "Project" (Entity Epic)
  │     ├── "Project cost dashboard" (sub-issue)
  │     └── "Budget vs actual comparison" (sub-issue)
  ├── 📦 "Report" (Entity Epic)
  │     ├── "Generate cost breakdown report" (sub-issue)
  │     └── "Export to PDF/CSV" (sub-issue)
  └── 📊 "Xero Integration & Data Import" (Feature)
```

**Linear Defaults Applied:**
- State: `Backlog`
- Effort: `1` (Refinement will refine)
- Priority: `2` (medium)
- Entity parent issues labeled as Epic in Linear

**Prioritization:** Use Linear milestones, cycles, and priority flags. Do not use version labels (v1, v2, future).

**Context Attached:**
- Project Overview document linked
- Entity Model document linked
- Technical ADRs referenced
- Search findings and competitive analysis
- User workflow documentation

## Handoff to Refinement phase

**Session Complete Criteria:**
- ✅ All 4 context questions answered
- ✅ Search approach selected and executed
- ✅ All 6 deliverables created (5 if no UI)
- ✅ Entity model with central entity identified and capabilities listed
- ✅ Linear features created with proper defaults (entity capabilities as independent sub-issues)
- ✅ No version labels used — prioritization via Linear milestones/cycles/priority
- ✅ Discovery documentation attached to Linear issues
- ✅ User acknowledges readiness for Refinement phase

**Next Phase:**
Refinement Orchestrator will:
- Select Linear features for detailed specification
- Refine effort estimates using `af-estimate-effort` (decompose by functional area, estimate hours, convert to fibonacci story points)
- For features > 3 points: create sub-issues with individual estimates; hours AND points roll up to parent feature
- Tag refined estimates as `[Refined Estimate]` in Linear comments (vs Discovery's `[Discovery Estimate]`)
- Create BDD scenarios with Markdown format
- Complete mini-PRD Section 7 (Effort Estimation) with full breakdown
- Obtain human approval before implementation

## Tips for Effective Discovery

### For Users
- **Be Specific**: Provide concrete examples of current pain points
- **Think Holistically**: Consider all user types and workflows
- **Share Context**: Mention existing tools, constraints, and preferences
- **Define Success**: Clear metrics help guide technical decisions

### For Discovery Orchestrator
- **Stay Product-Level**: Resist diving into implementation details
- **Use Search-Agent**: Delegate research to prevent context bloat
- **Document Decisions**: Write ADRs for major architectural choices
- **Prepare Handoff**: Ensure Refinement phase has complete context

## Troubleshooting

### "User provided feature-level request, not product-level"

**Symptoms:**
- User asks to "add authentication" or "create dashboard widget"
- Request is too specific for Discovery phase

**Solution:**
```
Redirect to Refinement phase:
"This appears to be a feature-level request. Discovery is for product/project-level exploration.
Let me help you create a detailed specification for this feature using the Refinement process."

Then invoke: af-refine-specifications skill
```

### "Not sure if external research is needed"

**Decision criteria:**
- ✅ **Need research if**: Unfamiliar API, complex integration patterns, competitive analysis needed
- ❌ **Skip research if**: User provided docs, standard tech stack, team has expertise

**When in doubt**: Ask the user directly if they want research or have sufficient context

### "Too many ADRs being created"

**Guideline:**
- **Minimum**: 1 ADR (technology stack)
- **Typical**: 2-3 ADRs (stack, integration, authentication)
- **Complex**: 4-6 ADRs (add deployment, data model, security)

**Rule of thumb**: Create ADR for decisions that:
- Affect multiple features
- Have significant technical trade-offs
- Future developers will question "why did they choose this?"

### "Linear features not created properly"

**Common issues:**
- Entity capabilities bundled into parent instead of separate sub-issues
- Wrong state (should be `Backlog`)
- Effort not set to 1 (Refinement refines later)
- Missing documentation attachments
- Entity parent issues not labeled as Epic

**Solution:**
Verify af-work-management-agent invocation includes:
- Epic name from project overview
- Entity parent issues labeled as Epics
- Each capability as a separate sub-issue (not bundled)
- All discovery docs linked in description
- Prioritization via Linear milestones/cycles/priority (not version labels)

### "Documentation validation failed"

**Common frontmatter issues:**
- Missing `parent` field
- Wrong date format (use YYYY-MM-DD)
- Missing `tags` array
- Broken relative paths

**Solution:**
Run docs-quality-agent explicitly:
```
Task tool → docs-quality-agent
"Validate all documents in /docs/requirements/ and /docs/architecture/ for documentation standards compliance"
```

### "User answers incomplete for context questions"

**Symptoms:**
- Vague responses like "we need better reporting"
- Missing user personas
- No technical constraints mentioned

**Solution:**
Follow up with specific prompts:
```
Q1 follow-up: "Can you describe a specific scenario where the current process fails?"
Q2 follow-up: "Tell me about a typical user - what's their role, technical level, and daily workflow?"
Q3 follow-up: "Are there any existing systems that must integrate with this solution?"
Q4 follow-up: "What specific metrics would prove this is successful in 6 months?"
```

## Feature Decomposition Approaches

Discovery can use different approaches to break a product into features. The skill provides a quick decision table; this section explains each approach in detail.

### Top-Down (Workflow/View-Driven)

Start with what users see and do, then break into features:

```
Product → Views/Workflows → Features
```

**When it works well:** Users think in workflows (sign up, check out, onboard). Views are relatively independent. Domain is simple.

**Example:** A signup flow decomposes into Email Signup, Social Login, Email Verification — each is a standalone feature.

### Entity-Driven (Bottom-Up)

Start with the "things" in the system, identify capabilities per entity, then derive features:

```
Product → Entities → Capabilities per entity → Features (Linear sub-issues)
                   → Composition Views (combine entity capabilities)
```

**When it works well:** Rich shared entities appear across multiple views. Users care deeply about one central entity. Capabilities can ship independently.

**Process:**
1. List all entities (what are the "things"?)
2. Identify the central entity ("what's THE thing users care most about?")
3. Classify: user-facing (Task, User, Project) vs behind-the-scenes (Agent, Worktree)
4. List capabilities per entity — each becomes a Linear sub-issue
5. Identify composition views — views that combine capabilities from multiple entities

**The key insight:** Entity capabilities are independently prioritizable delivery chunks. A "Task" entity might have Display, Status Lifecycle, Estimates, and Deep Links — each can ship on its own.

### Hybrid

Start top-down, then realize entities are shared across views. Switch to entity-driven for the shared entities while keeping top-down for independent views.

### Discovery Sketches, Refinement Specifies

Whichever approach you use, remember: Discovery captures what you know at a sketch level. Refinement does the detailed specification.

- **Discovery depth:** Entities, relationships, capabilities, indicative attributes
- **Refinement depth:** Exact API contracts, BDD scenarios, Storybook stories, selector contracts
- Deeper Discovery knowledge is helpful context for Refinement but doesn't constrain it
- Refinement always does its own Three Amigos analysis and may revise Discovery's sketch

## Case Study: Agentview (Entity-Driven)

During Agentview's discovery, we initially created features top-down (My View, Claude Usage, etc.) but found that the same entities (Task, User, Project, Transcript) appeared across multiple views. This led to an entity-driven decomposition.

**Central entity identification:** "Task" — not "Agent". Agents are a mechanism (behind-the-scenes); Tasks are what users actually care about tracking.

**Entity classification:**
| User-Facing | Behind-the-Scenes |
|-------------|-------------------|
| Task, User, Project, Transcript, Token Metrics, Cost | Agent, Worktree, Tmux Session |

**Result:** 7 entity parent issues in Linear, each with capability sub-issues. The Task entity alone had 13 sub-issues (display, status lifecycle, estimates, 10 deep link types).

**Lessons learned:**
1. Don't bundle capabilities — each needs to be independently prioritizable
2. Composition views (My View, Project View) reference entity capabilities rather than owning them
3. Behind-the-scenes entities don't need their own features unless users interact with them directly
4. The entity model replaced the feature roadmap — with entities captured, a separate roadmap was redundant

---

**Related Documents:**
- [Orchestration Skill](../../skills/af-orchestrate-workflow/SKILL.md)
- [Discovery Process](../../skills/af-discover-scope/SKILL.md)
- [Search Agent Definition](../../agents/af-search-agent.md)
- [Work Management Expertise](../../skills/af-manage-work-state/SKILL.md)
- [Documentation Standards](../standards/documentation-standards.md)