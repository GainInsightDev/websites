---
title: AgentFlow Setup Command
created: 2025-12-09
updated: 2026-02-18
last_checked: 2026-02-18
tags: [command, setup, brownfield, greenfield]
parent: ./README.md
---

# AgentFlow Setup

You are setting up AgentFlow. Execute the setup procedures below based on the user's needs.

**Parameters available:**
- `--type`: Setup type (brownfield, greenfield, or standard)
- `--name`: Project name (for greenfield)
- `--stack`: Tech stack (next, minimal, or custom - for greenfield)
- `--repo`: Repository name (for brownfield)
- `--branch`: Branch name (for brownfield)
- `--vision`: Path to vision/brief document (for greenfield - helps detect stack)

## Step 1: Determine Setup Type

If `--type` parameter was provided:
- Use that type
- Skip to Step 2

If no `--type` provided, ask user using AskUserQuestion:
```json
{
  "questions": [{
    "question": "What type of setup do you need?",
    "header": "Setup Type",
    "multiSelect": false,
    "options": [
      {
        "label": "Brownfield - Add to existing project",
        "description": "Add AgentFlow to an existing codebase. Preserves your code."
      },
      {
        "label": "Greenfield - Start new project",
        "description": "Create new project with AgentFlow from day 1. Choose tech stack (Next.js or minimal)."
      },
      {
        "label": "GainInsight Standard - Full production stack",
        "description": "Complete setup with Next.js, Amplify, testing, CI/CD — uses module registry"
      }
    ]
  }]
}
```

Parse response:
- Option 1 → brownfield
- Option 2 → greenfield
- Option 3 → standard

## Step 2: Route to Setup Procedure

### If Brownfield Selected:

Execute brownfield setup procedure from `.claude/skills/af-setup-process/SKILL.md` Workflow: Brownfield Setup.

Key steps:
1. Validate environment (bare repo exists, Node.js available, AgentFlow path)
2. Detect or ask for branch
3. Create or use stable worktree at `/srv/worktrees/{repo}/{branch}`
4. Analyze project (detect tech stack)
5. Install dependencies (npm/yarn/pnpm/bun)
6. Run AgentFlow V2 sync: `npx ts-node {agentflow-path}/.claude/scripts/sync/sync-from-agentflow.ts`
7. Create/update CLAUDE.md (add @.claude/CLAUDE-agentflow.md import)
8. Commit and push framework files
9. Report summary with next steps

**Recommended Next Steps After Brownfield Setup:**
1. **Assess documentation**: Run `/docs:audit-project` to evaluate current documentation state
2. **Implement documentation standards** (if needed): Use `af-docs-retrofit-agent` to retrofit AgentFlow documentation standards to existing codebase
   - Adds frontmatter to existing docs
   - Creates bidirectional linking
   - Establishes parent-child relationships
   - See: `.claude/agents/af-docs-retrofit-agent.md`

### If Greenfield Selected:

Execute the enhanced greenfield setup with stack detection.

#### Step 2.1: Check for Vision Document

If `--vision` parameter provided, read the document and extract tech decisions.

If not provided, ask:
```json
{
  "questions": [{
    "question": "Do you have a project brief or vision document I can reference to understand your tech stack?",
    "header": "Vision Doc",
    "multiSelect": false,
    "options": [
      {
        "label": "Yes, I'll provide the path",
        "description": "I have a document describing the project's technology choices"
      },
      {
        "label": "No, I'll answer questions",
        "description": "I'll specify the tech stack through questions"
      }
    ]
  }]
}
```

If user has a vision doc:
- Ask for the file path
- Read the document
- Extract tech decisions (look for keywords: Next.js, Amplify, DynamoDB, Cognito, Flutter, etc.)
- Present detected stack for confirmation

#### Step 2.2: Gather Tech Stack Information

Ask about each layer of the stack. Skip questions if already determined from vision doc.

**Frontend:**
```json
{
  "questions": [{
    "question": "What frontend framework will you use?",
    "header": "Frontend",
    "multiSelect": false,
    "options": [
      {"label": "Next.js (Recommended)", "description": "React framework with SSR, routing, and API routes"},
      {"label": "React SPA", "description": "Client-side React application (Vite or CRA)"},
      {"label": "None - API/Admin only", "description": "No custom frontend (using Directus Admin, Supabase Studio, etc.)"}
    ]
  }]
}
```

**Backend:**
```json
{
  "questions": [{
    "question": "What backend technology will you use?",
    "header": "Backend",
    "multiSelect": false,
    "options": [
      {"label": "AWS Amplify Gen 2", "description": "AppSync GraphQL + DynamoDB + Cognito (GainInsight Standard)"},
      {"label": "Custom API", "description": "Build your own API (Express, Fastify, etc.)"},
      {"label": "None yet", "description": "Decide during Discovery phase"}
    ]
  }]
}
```

**Hosting:**
```json
{
  "questions": [{
    "question": "Where will this be hosted?",
    "header": "Hosting",
    "multiSelect": false,
    "options": [
      {"label": "AWS Multi-account (GI Standard)", "description": "Separate AWS accounts for dev/test/prod with Amplify"},
      {"label": "AWS Lightsail", "description": "Simple VPS for Docker/containers"},
      {"label": "Decide later", "description": "Choose during Discovery phase"}
    ]
  }]
}
```

> **Note:** All hosting is AWS-based. Module selection (auth, email, testing, CI/CD, analytics, etc.) happens during Discovery via the Tech Stack Agreement. See `.claude/docs/reference/module-registry.yml`.

#### Step 2.3: Offer À La Carte Components

Based on stack choices, offer relevant components:

**Universal components (offer to all):**
- Testing Framework (Jest + Playwright)
- CI/CD Workflows (GitHub Actions)
- Security Config (Dependabot, npm audit)
- Linear Integration (if using Linear)

**Conditional components:**
- AWS Infrastructure → If hosting on AWS (Amplify, Lightsail, ECS)
- shadcn/ui + Storybook → Only if Next.js frontend
- Doppler Integration → If not using platform-native secrets (skip for Vercel)
- Flutter Mobile → Only if Amplify backend (shared backend pattern) - offered after Layer 1

```json
{
  "questions": [{
    "question": "Which components would you like to include?",
    "header": "Components",
    "multiSelect": true,
    "options": [
      {"label": "Testing Framework", "description": "Jest unit tests + Playwright E2E"},
      {"label": "CI/CD Workflows", "description": "GitHub Actions for lint, test, build"},
      {"label": "Security Config", "description": "Dependabot + npm audit in CI"},
      {"label": "AWS Infrastructure", "description": "AWS accounts, Doppler secrets, DNS (required for Amplify/Lightsail)"},
      {"label": "Linear Integration", "description": "Linear CLI + issue tracking setup"}
    ]
  }]
}
```

**If AWS Infrastructure selected, ask for environment model:**
```json
{
  "questions": [{
    "question": "How many environments do you need?",
    "header": "Environments",
    "multiSelect": false,
    "options": [
      {"label": "Standard (dev + prod)", "description": "Two environments - recommended for most projects"},
      {"label": "Simple (prod only)", "description": "Single production environment for prototypes"},
      {"label": "Full (dev + test + prod)", "description": "Three environments for enterprise/regulated projects"}
    ]
  }]
}
```

**If AWS Infrastructure selected, ask for hosting type:**
```json
{
  "questions": [{
    "question": "Which AWS hosting will you use?",
    "header": "Hosting",
    "multiSelect": false,
    "options": [
      {"label": "Amplify", "description": "Next.js SSR + GraphQL + DynamoDB (GainInsight Standard)"},
      {"label": "Lightsail", "description": "Docker containers, Directus, PostgreSQL"},
      {"label": "Other/Later", "description": "Set up AWS accounts now, choose hosting later"}
    ]
  }]
}
```

Note: Only show options relevant to the detected stack. Detailed module selection (auth, email, analytics, mobile, etc.) happens during Discovery via the Tech Stack Agreement — see `.claude/docs/reference/module-registry.yml`.

#### Step 2.4: Execute Setup

Store stack choices in setup context, then proceed:

1. Validate project name (must match `^[a-z][a-z0-9-]*$`)
2. Check directory doesn't exist at `/srv/worktrees/{project-name}`
3. Scaffold project based on frontend choice:
   - Next.js: `npx create-next-app@latest {name} --typescript --tailwind --app`
   - React SPA: `npm create vite@latest {name} -- --template react-ts`
   - None: `mkdir {name} && cd {name} && npm init -y`
4. Initialize git repository
5. Run AgentFlow V2 sync
6. Create stack-aware CLAUDE.md (see template below)
7. Apply selected components:
   - **Testing**: Copy configs, install deps, add npm scripts
   - **CI/CD**: Copy workflow files to `.github/workflows/`
   - **Security**: Copy dependabot.yml
   - **AWS Infrastructure**: Follow `.claude/templates/setup/components/aws-infrastructure/setup-guide.md`
   - **Hosting (if AWS selected)**:
     - Amplify: Follow `.claude/templates/setup/components/hosting-amplify/setup-guide.md`
     - Lightsail: Follow `.claude/templates/setup/components/hosting-lightsail/setup-guide.md`
8. Commit framework files
9. Report summary with stack info and next steps

**Component templates:** `.claude/templates/setup/components/`

#### Stack-Aware CLAUDE.md Generation

Generate CLAUDE.md content based on stack choices. Use `.claude/templates/setup/greenfield-claudemd.md` as base, then add stack-specific sections:

**For Amplify projects, add:**
```markdown
## Tech Stack
- **Backend**: AWS Amplify Gen 2
- **Database**: DynamoDB via AppSync
- **Auth**: Amazon Cognito

## Amplify Patterns
- Backend defined in `amplify/` directory
- Use `npx ampx sandbox` for local development
- See GainInsight Standard guides for full setup
```

See `.claude/skills/af-setup-process/SKILL.md` for complete workflow details.

### If Standard Selected:

Load the `af-gaininsight-standard` skill and execute its workflows.

This is a shortcut that selects the `gaininsight-standard` combination from the module registry — equivalent to selecting all standard modules during Discovery.

**Prerequisites check:**
1. Greenfield setup must be complete first (repo exists, `.claude/` synced)
2. Linear team must exist
3. User must have AWS account access

**If prerequisites not met:**
Ask user to complete greenfield setup first, then return for GI Standard layers.

**If prerequisites met:**
Execute module installation using the `gaininsight-standard` combination from `.claude/docs/reference/module-registry.yml`.

The module registry defines the install order and integration guides:
1. aws-infrastructure → amplify → auth → email → testing → ui-styling → cicd → posthog → security
2. Cross-module integration guides are loaded automatically based on selected modules
3. See `.claude/skills/af-setup-process/SKILL.md` for the Module Setup workflow

**Layer guides (for reference):**
- Layer 1: `.claude/docs/guides/gaininsight-standard/layer-1-infrastructure.md`
- **Flutter Mobile (Optional)**: `.claude/docs/guides/gaininsight-standard/flutter-mobile-setup.md`
- Layer 2: `.claude/docs/guides/gaininsight-standard/layer-2-testing.md`
- Layer 3: `.claude/docs/guides/gaininsight-standard/layer-3-ui-styling.md`
- Layer 4: `.claude/docs/guides/gaininsight-standard/layer-4-cicd.md`

## Reference Documentation

**For detailed procedures:**
- `.claude/skills/af-setup-process/SKILL.md` - Complete setup workflows with all steps
- `.claude/docs/reference/module-registry.yml` - Module definitions, dependencies, and combinations
- `.claude/docs/guides/integrations/` - Cross-module integration guides

**For understanding setup types:**
- **Brownfield**: Add AgentFlow to existing project (preserves code)
- **Greenfield**: Create new project with AgentFlow (Next.js or minimal)
- **GainInsight Standard**: Full production stack using module registry combination
