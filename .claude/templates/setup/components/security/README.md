---
title: Security Component Template
created: 2026-01-25
updated: 2026-01-25
tags: [template, component, security, dependabot]
parent: ../README.md
---

# Security Component

Adds Dependabot for automated dependency updates and security alerts.

## What Gets Installed

### Files Created
```
.github/
└── dependabot.yml    # Dependabot configuration
```

## Features

### Dependency Updates
- Weekly checks for npm dependency updates
- Weekly checks for GitHub Actions updates
- Groups minor/patch updates to reduce PR noise
- Conventional commit prefixes (`chore(deps)`, `chore(ci)`)

### Security Alerts
- GitHub automatically enables security alerts when Dependabot is configured
- Vulnerability alerts appear in Security tab
- Automated PRs for security fixes

## Installation Steps

1. Create `.github/` directory if not exists
2. Copy `dependabot.yml` to `.github/`
3. Push to GitHub - Dependabot activates automatically

## Validation

After installation, verify:
- `.github/dependabot.yml` exists
- GitHub Security tab shows Dependabot enabled
- Within a week, you should see Dependabot PRs (if updates available)

## CI Integration

The CI workflow includes `npm audit` for additional security checking:

```yaml
- name: Security audit
  run: npm audit --audit-level=high
```

## Customization

### Change schedule
```yaml
schedule:
  interval: "daily"  # or "monthly"
```

### Ignore specific packages
```yaml
ignore:
  - dependency-name: "some-package"
    update-types: ["version-update:semver-major"]
```

### Add more ecosystems
```yaml
- package-ecosystem: "docker"
  directory: "/"
  schedule:
    interval: "weekly"
```
