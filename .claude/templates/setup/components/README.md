---
title: Setup Component Templates
created: 2026-01-25
updated: 2026-01-25
last_checked: 2026-01-25
tags: [template, setup, components]
parent: ../README.md
children:
  - ./testing/README.md
  - ./cicd/README.md
  - ./security/README.md
  - ./docs/README.md
  - ./aws-infrastructure/README.md
  - ./hosting-amplify/README.md
  - ./hosting-lightsail/README.md
---

# Setup Component Templates

Modular components that can be installed during greenfield setup.

## Available Components

### Universal Components

| Component | Description | Always Offered |
|-----------|-------------|----------------|
| [Testing](./testing/) | Jest + Playwright setup | Yes |
| [CI/CD](./cicd/) | GitHub Actions workflows | Yes |
| [Security](./security/) | Dependabot configuration | Yes |
| [Documentation](./docs/) | AgentFlow docs structure | Yes |

### AWS Components

| Component | Description | Condition |
|-----------|-------------|-----------|
| [AWS Infrastructure](./aws-infrastructure/) | AWS accounts, Doppler, DNS | If hosting on AWS |
| [Amplify Hosting](./hosting-amplify/) | CDK, Amplify apps, domains | Requires AWS Infrastructure |
| [Lightsail Hosting](./hosting-lightsail/) | Docker, Directus, PostgreSQL | Requires AWS Infrastructure |

### Component Relationships

```
                    ┌─────────────────────┐
                    │  AWS Infrastructure │
                    │  (foundation layer) │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌───────────┐
    │ Amplify Hosting │ │Lightsail Hosting│ │ ECS (TBD) │
    │   (Next.js)     │ │   (Directus)    │ │           │
    └─────────────────┘ └─────────────────┘ └───────────┘
```

**GainInsight Standard** = AWS Infrastructure + Amplify Hosting + Testing + CI/CD + Security

## Usage

During `/af:setup`, users select which components to install. The setup process:

1. Copies relevant template files to project
2. Merges scripts into `package.json`
3. Installs dependencies
4. Runs validation to confirm installation

## Component Structure

Each component directory contains:

```
{component}/
├── README.md           # Installation guide and validation steps
├── *.config.*          # Configuration files to copy
├── package-scripts.json # Scripts to merge (if applicable)
└── sample-*.ts         # Sample files (if applicable)
```

## Adding New Components

1. Create directory under `components/`
2. Add README.md with frontmatter and installation steps
3. Add template files
4. Add validation test in `../validation/specs/`
5. Update setup command to offer the component
