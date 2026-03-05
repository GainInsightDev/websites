---
name: security:README
description: Security Commands
title: Security Commands
created: 2026-01-06
updated: 2026-01-06
last_checked: 2026-01-06
tags: [command, security, index, navigation]
parent: ../README.md
children:
  - ./audit.md
---

# Security Commands

Commands for managing project security configuration.

## Available Commands

| Command | Description |
|---------|-------------|
| `/security:audit` | Audit security posture and create missing configs |

## Quick Start

Run a security audit on your project:
```
/security:audit
```

This will check for:
- Dependabot configuration
- npm audit in CI workflows
- Known vulnerabilities in dependencies
- Hardcoded secrets in code
- GitHub secret scanning status

## Related

- Skill: [af-security-expertise](../../skills/af-security-expertise/SKILL.md)
- Template: [dependabot.yml](../../templates/github/dependabot.yml)
