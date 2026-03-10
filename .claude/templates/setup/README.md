---
title: Setup Templates
created: 2026-01-02
updated: 2026-01-02
last_checked: 2026-01-02
tags: [templates, setup, greenfield, brownfield]
parent: ../README.md
children:
  - ./greenfield-claudemd.md
  - ./brownfield-claudemd.md
code_files:
  - ./greenfield-handoff.txt
  - ./brownfield-handoff.txt
---

# Setup Templates

Templates used by the setup process for creating new projects.

## Contents

| Template | Purpose |
|----------|---------|
| `greenfield-claudemd.md` | CLAUDE.md template for new greenfield projects |
| `brownfield-claudemd.md` | CLAUDE.md template for brownfield (existing) projects |
| `greenfield-handoff.txt` | User handoff message after greenfield setup |
| `brownfield-handoff.txt` | User handoff message after brownfield setup |

## Usage

These templates are referenced by `af-setup-project` skill. Replace placeholders:

- `[Project Name]` - Human-readable project name
- `[KEY]` - Linear team key (e.g., "MYA")
- `[repo-name]` - Repository name
- `[owner]` - GitHub owner (org or user)
- `[channel]` - Zulip stream name
- `{ISSUE-ID}` - Linear issue identifier
- `{branch}` - Git branch name
