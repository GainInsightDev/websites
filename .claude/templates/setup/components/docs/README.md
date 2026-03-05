---
title: Documentation Component Template
created: 2026-01-25
updated: 2026-01-25
tags: [template, component, docs]
parent: ../README.md
---

# Documentation Component

Adds AgentFlow documentation structure.

## What Gets Installed

### Files Created
```
docs/
├── _category_.json     # Docusaurus category config
├── README.md           # Documentation index
├── architecture/       # Architecture docs
│   └── adr/           # Architecture Decision Records
└── guides/            # How-to guides
```

## Installation Steps

1. Create `docs/` directory
2. Copy `_category_.json`
3. Copy `docs-README.md` as `docs/README.md`
4. Create subdirectories: `architecture/adr/`, `guides/`
5. Replace `{DATE}` placeholders with current date

## Validation

After installation, verify:
- `docs/` directory exists
- `docs/README.md` has valid frontmatter
- Subdirectories created

## AgentFlow Documentation Standards

All documentation should include:

```yaml
---
title: Document Title
created: 2026-01-25
updated: 2026-01-25
tags: [relevant, tags]
parent: ./README.md
---
```

See `.claude/skills/af-documentation-standards/SKILL.md` for full standards.
