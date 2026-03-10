---
title: Testiny API Reference
created: 2026-01-05
updated: 2026-01-26
last_checked: 2026-01-26
tags: [reference, testiny, api, integration, exploratory-testing, qa]
parent: ./README.md
---

# Testiny API Reference

Reference documentation for integrating Testiny test management platform with AgentFlow projects.

## Goal

Provide QA engineers with a **test surface map** for exploratory testing after E2E tests pass on staging.

**Testiny is NOT for:**
- Strict step-by-step UAT sign-off
- Tracking automated test results (E2E already does this)

**Testiny IS for:**
- Showing QA what the automated test surface covers
- Guiding exploratory testing beyond the scripts
- Capturing defects/improvements found → Linear issues

### Workflow Vision

```
Delivery phase: E2E tests written → Import to Testiny
                                          ↓
Staging deploy: E2E runs automatically (pass/fail in CI)
                                          ↓
QA Exploratory: QA uses Testiny as guide on test environment
                - See test surface organized by feature
                - Explore beyond automated coverage
                - Capture issues in Linear via Testiny integration
```

### Folder Strategy

Organize Testiny folders by **functional area** (maps to `test.describe()` blocks):
- `Auth` - Authentication flows
- `Admin` - Administrative functions
- `Settings` - User/org settings

Linear feature references are stored in test case preconditions, not folder names. Each folder contains test cases showing what E2E tests cover for that functional area.

## API Basics

- **Base URL**: `https://app.testiny.io/api/v1`
- **Auth**: `X-Api-Key` header
- **Project ID**: Required for most endpoints (Junkan = 1)

## Endpoints Discovered

**IMPORTANT:** Use hyphens for GET endpoints, underscores for mapping endpoints!

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/project/{id}` | GET | Get project details |
| `/testcase` | GET | List test cases (`?project_id=X`) |
| `/testcase` | POST | Create test case |
| `/testcase/{id}` | GET | Get single test case |
| `/testcase/{id}` | PUT | Update test case (requires `_etag`) |
| `/testcase/{id}` | DELETE | Delete test case |
| `/testcase-folder` | GET | List folders (`?project_id=X`) |
| `/testcase-folder` | POST | Create folder |
| `/testcase-folder/{id}` | GET | Get single folder |
| `/testcase-folder/{id}` | DELETE | Delete folder |
| `/testcase/mapping/bulk/testcase_folder` | POST | Assign test cases to folders |
| `/testrun` | GET | List test runs (`?project_id=X`) |
| `/testrun` | POST | Create test run |
| `/testrun/{id}` | DELETE | Delete test run |

## Folder Assignment (CRITICAL)

The `testcase_folder_id` field is **ignored** when creating test cases via POST /testcase. Folder assignment requires a **separate mapping API call**.

### Mapping Endpoint

```
POST /testcase/mapping/bulk/testcase_folder?op=add_or_update
```

### Request Body

```json
[
  {
    "ids": {
      "testcase_id": 2,
      "testcase_folder_id": 4
    }
  },
  {
    "ids": {
      "testcase_id": 3,
      "testcase_folder_id": 4
    }
  }
]
```

### Response

Empty object `{}` on success. The mapping works even though `testcase_folder_id` remains `null` in GET /testcase responses - the UI shows the correct folder assignment.

**Note:** Use `testcase_folder` (underscore) in the mapping endpoint, not `testcase-folder` (hyphen).

## Test Case Structure

```json
{
  "project_id": 1,
  "title": "Test case title",
  "priority": 2,              // 1=Critical, 2=High, 3=Medium, 4=Low
  "template": "TEXT",         // MUST be uppercase: "TEXT" or "STEPS"
  "precondition_text": "User is not logged in",
  "steps_text": "1. Step one\n2. Step two",
  "expected_result_text": "User sees dashboard"
}
```

**CRITICAL:** The `testcase_folder_id` field is **ignored** on POST /testcase. See Folder Assignment section below.

## Querying Test Cases

Query: `GET /testcase?project_id=<PROJECT_ID>`

Example response structure:
| ID | Title | Folder |
|----|-------|--------|
| 1 | 1.1 New user can sign up | (unassigned) |

## Folder Structure

- Folders created via POST to `/testcase_folder`
- Required fields: `project_id`, `title`
- Optional: `parent_id` for nesting
- Can query via `GET /testcase-folder?project_id=X`

## Querying Folders

Query: `GET /testcase-folder?project_id=<PROJECT_ID>`

Example folder structure (organized by Linear feature):
| ID | Title | Linear | Parent |
|----|-------|--------|--------|
| 1 | 1. B2C Self-Serve Signup (JCN-4) | JCN-4 | root |
| 2 | 2. Organisation Tenant Creation (JCN-5) | JCN-5 | root |
| 3 | 3. Super Admin Authorization (JCN-8) | JCN-8 | root |

**Folder structure strategy**: Organize by functional area (test.describe), Linear reference in preconditions

## Linear Integration

- Testiny has native Linear integration
- Configured in Testiny settings
- Links test cases to Linear issues
- Enables bidirectional traceability

## Import Strategy

### Source of Truth

```
Mini-PRD (BDD scenarios) → Playwright E2E tests → Testiny test cases
```

- Playwright tests are the executable specifications
- Testiny receives test surface info from Playwright (replaces UAT.md)
- Import runs after E2E tests are written (end of Delivery phase)

### Mapping

| Playwright | Testiny |
|------------|---------|
| File with `@see JCN-X` | Folder named after Linear feature |
| `test.describe('Name')` | Subfolder (optional grouping) |
| `test('name')` | Test Case |
| File header `@see JCN-X` | Linear issue link |

**Note:** Folders should be organized by Linear feature (JCN-X), not by `test.describe()` name alone.

## Configuration

- **Doppler**: `TESTINY_API_KEY` stored in central GainInsight Doppler (shared across projects)
- **Project ID**: Stored in project's `CLAUDE.md` (e.g., `TESTINY_PROJECT_ID=1`)

### MCP Server (Not Working)

Testiny provides an MCP server at `https://app.testiny.io/api/v1/mcp-server`, but it uses **OAuth flow** requiring localhost callback. This doesn't work on remote/server environments.

**Decision:** Use REST API directly via import script instead of MCP.

## Rich Text (Slate Format)

Testiny uses **Slate.js** for rich text fields. Plain text and HTML don't render links - must use Slate JSON format.

### Slate Structure

```json
{
  "t": "slate",
  "v": 1,
  "c": [
    {
      "t": "p",
      "children": [
        {"text": "Plain text here"},
        {
          "t": "a",
          "url": "https://example.com",
          "children": [{"text": "Link text"}]
        }
      ]
    }
  ]
}
```

### Node Types

| Type | Code | Usage |
|------|------|-------|
| Paragraph | `"t": "p"` | Text block |
| Link | `"t": "a"` | Clickable link (requires `url` property) |
| Text | `{"text": "..."}` | Plain text node |

### Fields Supporting Slate

- `precondition_text` ✓
- `steps_text` ✓
- `expected_result_text` ✓
- `description` (test runs) ✓

**CRITICAL:** Slate JSON must be sent as a **string**, not a nested JSON object. The API validates that `*_text` fields are strings.

```bash
# ✅ Correct - JSON string
"precondition_text": "{\"t\":\"slate\",\"v\":1,\"c\":[...]}"

# ❌ Wrong - nested JSON object
"precondition_text": {"t":"slate","v":1,"c":[...]}
```

### Example: Link in Expected Result

```json
{
  "t": "slate",
  "v": 1,
  "c": [
    {
      "t": "p",
      "children": [
        {"text": "See design: "},
        {"t": "a", "url": "https://storybook.example.com", "children": [{"text": "Storybook"}]}
      ]
    }
  ]
}
```

## Known Limitations

1. **No bulk create endpoint** - test cases created one at a time (bulk mapping exists)
2. **Folder assignment ignored on create** - requires separate mapping call
3. **Rate limits unknown** - no documentation found
4. **MCP requires OAuth** with localhost callback (not usable on servers)
5. **Template must be uppercase** - "TEXT" or "STEPS", not lowercase
6. **Plain URLs not clickable** - must use Slate format for links
7. **Escaped characters break Slate rendering** - `\!` and other escaped characters in Slate JSON cause raw JSON to display instead of rendered content. Ensure special characters are unescaped in the final JSON string.

## Current Implementation

### Import Script Template

Projects should have `scripts/testiny-import.ts` that imports Playwright E2E tests into Testiny:
- Parses `test.describe()` → Testiny folders
- Parses `test()` → Testiny test cases
- Extracts `@see <LINEAR-ID>` → Linear references

**Usage pattern:**
```bash
doppler run --project <project> --config dev -- npx ts-node scripts/testiny-import.ts --dry-run
doppler run --project <project> --config dev -- npx ts-node scripts/testiny-import.ts
```

### Implementation Checklist (per project)

- [ ] Fix folder assignment (use mapping API)
- [ ] Populate test case content with steps, preconditions, expected results
- [ ] Add Storybook design reference links
- [ ] Add environment URLs and credentials to preconditions
- [ ] Use staging URLs for QA testing

### Design Decisions

- **Folder hierarchy**: By functional area (test.describe), not Linear feature
- **Traceability**: Testiny as hub (Linear ref in preconditions + native integration)
- **Sync timing**: Incremental during Delivery (after each test passes)
- **Test runs**: QA creates manually (not AI)
- **Defect workflow**: Linear Defect → backlog, QA decides blocking
- **Content population**: AI agent playbook, not automated parsing

### Framework Integration Checklist

- [ ] Store `TESTINY_API_KEY` in central GainInsight Doppler
- [ ] Store `TESTINY_PROJECT_ID` in project's `CLAUDE.md`
- [ ] Add deduplication (match by source file + test name)
- [ ] Add Linear reference + source file to preconditions
- [ ] Include Step 2.5 (Sync to Testiny) in af-deliver-features
- [ ] Create af-testiny-expertise skill
- [ ] Eliminate UAT.md generation (Testiny replaces it)

## Test Case Content Population

Test cases should be populated with:

### Content Structure

| Field | Content |
|-------|---------|
| **Preconditions** | Environment URL (Dev), credentials, setup state |
| **Steps** | Numbered action steps from Playwright tests |
| **Expected Result** | Outcomes + Storybook design reference link |

### Example Content

```
Precondition:
- Environment: https://test.<project>.gaininsight.global (clickable)
- Credentials: <test-user>@<domain> / <password>
- User is signed in and on /settings/security page
- Linear: JCN-4
- Source: tests/e2e/auth/signup.spec.ts

Steps:
1. Navigate to /signup
2. Fill email with unique test email
3. Fill password (8+ chars, uppercase, lowercase, number, symbol)
4. Click Sign Up button

Expected Result:
- User is redirected to /dashboard and authenticated
- Design: B2C Signup Form Story (clickable link to Storybook)
```

### Manual Population Approach

For this initial implementation, test case content was populated manually via API calls rather than automated script parsing. This approach:

**Advantages:**
- Higher quality content (human-readable steps, not raw test code)
- Includes context QA needs (credentials, environment URLs)
- Links to Storybook for design verification
- Can include notes about limitations (e.g., Cognito session management)

**Future Enhancement:**
- Consider AI agent approach for bulk population
- Could parse BDD scenarios: Given → preconditions, When → steps, Then → expected
- Would need to enrich with environment URLs and Storybook links

## Linear Integration Setup

1. Go to **Project Settings → Integrations → Linear**
2. Authorize Testiny to access Linear workspace
3. **IMPORTANT:** Set permissions to **Read-Write** (not Read-Only) to create issues from test runs
4. Now QA can create Linear issues directly from failed tests

## AgentFlow Integration Design

These decisions inform the `af-testiny-expertise` skill for AgentFlow framework.

### Configuration

| Setting | Location | Notes |
|---------|----------|-------|
| `TESTINY_API_KEY` | Central GainInsight Doppler | Shared across projects |
| `TESTINY_PROJECT_ID` | Project's `CLAUDE.md` | Per-project setting |
| Linear integration | Testiny UI Settings | Must be Read-Write for defect creation |

### Gap Resolutions

#### 1. Test Runs
- **Decision:** QA creates test runs manually in Testiny UI
- **Naming convention:** "Release 1.2.0 - Staging" or "JCN-4 Feature Verification"
- **Linear linking:** Include milestone in description (no automatic linking)
- **AI does not create test runs** - this is QA's domain

#### 2. Defect Workflow
```
QA finds issue in Testiny → Creates Linear Defect → Backlog
                                                      ↓
                              QA communicates with dev if blocker
                                                      ↓
                              Fix prioritized (or release proceeds)
```
- Testiny Linear integration configured for "defects" creates issues as Defect type
- No automation for blocking decisions - human judgment
- No special labels needed beyond "Defect" issue type

#### 3. Environment URLs
- **Decision:** Use staging environment (`test.<project>.gaininsight.global`)
- QA knows which environment they're testing
- URLs are clickable in preconditions - must point to correct environment

#### 4. Sync/Updates & Traceability
- **Decision:** Testiny is the traceability hub (not Playwright frontmatter)
- **In Testiny preconditions:**
  ```
  Linear: <LINEAR-ID>
  Source: tests/e2e/auth/signup.spec.ts
  Storybook: https://storybook.<project>.gaininsight.global/?path=/story/auth-form--default
  ```
- Plus use Testiny's native Linear integration to link test cases to requirements
- **Deduplication:** Match by source file path + test name
- Keeps Playwright tests clean (no Testiny-specific metadata)

#### 5. Storybook Mapping
- **Decision:** Include in Testiny preconditions, not Playwright frontmatter
- AI agent determines matching story when populating test case content
- QA sees design reference directly in test case

#### 6. When to Import
- **Decision:** Incremental during Delivery, after each test passes
- **Not** a CI job - AI-driven workflow
- **Flow:**
  ```
  Write E2E test → Test passes → Sync to Testiny → Next test
                                      ↓
                              (repeat for each test)
                                      ↓
                          All synced → Create PR
  ```
- Part of TDD loop (Step 2.5), not separate phase at end
- Test surface builds incrementally during Delivery

### Folder Hierarchy
- Folders organised by functional area (Auth, Admin, Settings)
- Maps to `test.describe()` blocks in Playwright
- Linear feature reference in preconditions (not folder name)
- Already implemented in Juncan project

### Content Population
- **Approach:** AI agent playbook, not automated script parsing
- Script creates structure (folders, titles from test.describe/test)
- AI agent populates content (preconditions, steps, expected results)
- Includes: environment URLs, credentials, Storybook links, Linear reference

### Skill Requirements

The `af-testiny-expertise` skill should include:
- API reference (endpoints, Slate format, quirks)
- Configuration pattern (Doppler key, project ID)
- Content population playbook for AI agent

Related updates:
- `af-deliver-features` should include Step 2.5: Sync to Testiny
- Import script template for projects (structure only)
- Documentation on Testiny project setup and Linear integration
