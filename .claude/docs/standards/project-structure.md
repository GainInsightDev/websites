---
title: AgentFlow Project Structure Standard
sidebar_label: Project Structure
created: 2025-09-06
updated: 2026-02-07
last_checked: 2026-02-07
tags: [project-structure, standards, file-system, agentflow]
parent: ./README.md
children: []
code_files: []
related:
  - ./documentation-standards.md
---

# AgentFlow Project Structure Standard

This document defines the standard file system hierarchy for all AgentFlow projects. All orchestrators and agents must follow this structure consistently.

## Complete Project Structure

```
project-root/
├── .claude/                      # AgentFlow framework (synced)
│   ├── CLAUDE-agentflow.md       # Core framework instructions
│   ├── agents/                   # Agent definitions
│   ├── skills/                   # Process and expertise skills (includes orchestration)
│   ├── commands/                 # Slash commands
│   ├── docs/                     # Framework documentation
│   ├── hooks/                    # Automation hooks
│   ├── scripts/                  # Utility scripts
│   ├── templates/                # Project templates
│   ├── reports/                  # Agent-generated reports (gitignored)
│   │   ├── librarian/            # Documentation optimization reports
│   │   ├── quality/              # Code quality reports
│   │   ├── coverage/             # Documentation coverage reports
│   │   └── optimization/         # General optimization reports
│   └── work/                     # Working files (gitignored)
│       ├── current-task.md       # Delivery phase context
│       └── current-requirement.md # Requirements phase context
│
├── amplify/                      # AWS Amplify backend
│   ├── backend/
│   │   ├── api/                  # GraphQL API definitions
│   │   │   └── [api-name]/
│   │   │       └── schema.graphql
│   │   ├── auth/                 # Authentication config
│   │   ├── storage/              # S3 storage config
│   │   └── function/             # Lambda functions
│   └── team-provider-info.json
│
├── docs/                         # Project documentation
│   ├── README.md                 # Documentation index
│   ├── api/                      # API documentation
│   ├── architecture/             # Architecture docs
│   │   ├── adr/                  # Architecture Decision Records
│   │   └── integration-architecture.md
│   ├── components/               # UI component docs
│   ├── deployment/               # Deployment guides
│   ├── design/                   # Design system
│   │   └── design-system.md
│   ├── glossary.yml              # Project glossary
│   └── requirements/             # Discovery outputs
│       ├── project-overview.md
│       ├── user-analysis.md
│       └── feature-roadmap.md
│
├── features/                     # E2E test specifications
│   └── [feature-name].spec.ts    # Playwright E2E tests
│
├── scripts/                      # Project scripts
│   ├── seed-test-data.ts        # Test data seeding
│   └── migrate/                  # Database migrations
│
├── src/                          # Source code
│   ├── API.ts                    # Generated GraphQL types
│   ├── app/                      # Next.js App Router
│   ├── components/               # React components (Atomic Design)
│   │   ├── atoms/                # Smallest primitives (Button, Input, Label)
│   │   │   └── ui/               # shadcn/ui generated components
│   │   ├── molecules/            # Composed atom groups (FormField, SearchBar)
│   │   ├── organisms/            # Feature compositions (SignupForm, DataTable)
│   │   │   └── [feature]/        # Grouped by feature domain
│   │   └── templates/            # Page layouts (DashboardLayout, AuthLayout)
│   ├── graphql/                  # Generated GraphQL operations
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   └── subscriptions.ts
│   ├── hooks/                    # React hooks
│   ├── lib/                      # Utility libraries
│   └── stories/                  # Storybook stories (mirrors atomic hierarchy)
│
├── test/                         # Test files
│   ├── e2e/                      # End-to-end tests
│   ├── factories/                # Test data factories
│   ├── fixtures/                 # Test fixtures
│   ├── mocks/                    # API mocks
│   ├── setup.ts                  # Test setup
│   └── unit/                     # Unit tests
│
├── .github/                      # GitHub configuration
│   └── workflows/                # GitHub Actions
│
├── .storybook/                   # Storybook configuration
├── .vscode/                      # VS Code settings
├── .gitignore
├── .env.local                    # Local environment variables
├── amplify.yml                   # Amplify build config
├── CLAUDE.md                     # Project AI instructions
├── jest.config.js                # Jest configuration
├── next.config.js                # Next.js config (if Next.js)
├── package.json
├── playwright.config.ts          # Playwright config
├── README.md                     # Project README
└── tsconfig.json                 # TypeScript config
```

## Directory Purposes

### Framework Directories (.claude/)
- **Managed by AgentFlow sync** - Do not modify directly
- Contains all framework components and documentation
- `.claude/work/` is gitignored for session context
- `.claude/reports/` is gitignored for agent-generated reports

### Application Code (src/)
- **app/**: Next.js App Router pages and layouts
- **components/**: React components, organized by Atomic Design levels
  - **atoms/**: Smallest UI primitives (Button, Input, Label, Badge). Primarily shadcn/ui components.
  - **atoms/ui/**: shadcn/ui generated components
  - **molecules/**: Composed from atoms (FormField, SearchBar, DataCell)
  - **organisms/**: Feature-specific compositions grouped by domain (auth/SignupForm, data/DataTable)
  - **templates/**: Page-level layouts (DashboardLayout, AuthLayout)
- **hooks/**: Custom React hooks
- **lib/**: Utility functions and helpers
- **graphql/**: Generated GraphQL operations
- **API.ts**: Generated TypeScript types from GraphQL

### Testing (test/ and features/)
- **features/**: Playwright E2E tests
- **test/e2e/**: Playwright end-to-end tests
- **test/unit/**: Jest unit tests
- **test/factories/**: Test data factories (Fishery)
- **test/mocks/**: API and service mocks

### Documentation (docs/)
- **requirements/**: Discovery phase outputs
- **architecture/**: System design and ADRs
- **api/**: API documentation
- **components/**: Component documentation
- **design/**: Design system specifications

### Backend (amplify/)
- **backend/api/**: GraphQL schema definitions
- **backend/function/**: Lambda functions
- **backend/auth/**: Cognito configuration
- **backend/storage/**: S3 bucket configuration

## File Naming Conventions

### TypeScript/JavaScript Files
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Tests**: Same name with `.test.ts` or `.spec.ts`
- **Stories**: Same name with `.stories.tsx`

### Documentation Files
- **Guides**: kebab-case (e.g., `setup-guide.md`)
- **ADRs**: `adr-XXX-description.md`
- **Features**: kebab-case (e.g., `user-authentication.feature`)

### Configuration Files
- Follow tool conventions (e.g., `jest.config.js`, `tsconfig.json`)

## Path Aliases

Projects should configure these TypeScript path aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"]
    }
  }
}
```

## Environment Configuration

All secrets and environment variables are managed via **Doppler** (no `.env` files):

| Environment | Doppler Config | Usage |
|-------------|----------------|-------|
| Local Dev | `dev` | `doppler run -- npm run dev` |
| Testing | `dev` or `stg` | `doppler run -- npm test` |
| Production | `prd` | Injected via CI/CD or hosting platform |

**Key files:**
- `doppler.yaml` - Project/config binding for local development
- Never commit secrets or `.env` files to repository

## Generated Files

These files are generated and should be gitignored:
- `src/API.ts` - Generated GraphQL types
- `src/graphql/*` - Generated GraphQL operations
- `.next/` - Next.js build output
- `node_modules/` - Dependencies
- `.amplify/` - Amplify local files
- `amplify/#current-cloud-backend/` - Amplify cloud state
- `.claude/reports/` - Agent-generated reports
- `.claude/work/` - Working context files

## Context Files

Working context files (gitignored):
- `.claude/work/current-task.md` - Delivery phase context
- `.claude/work/current-requirement.md` - Requirements phase context

## Validation

To validate project structure compliance:

```bash
# Run structure validation
npm run validate:structure

# Or use docs-quality-agent
Use Task tool: "Validate project structure against AgentFlow standards"
```

## Migration from Existing Projects

When adopting AgentFlow in an existing project:
1. Create `.claude/` directory structure
2. Move BDD specs to `features/`
3. Organize tests under `test/`
4. Create `docs/` hierarchy
5. Update path references in imports

---

**Note**: This structure is optimized for Next.js + AWS Amplify projects. Variations may be needed for other frameworks, which will be addressed in AgentFlow V2.