---
title: Check All Documentation
description: Calls the docs-quality-agent in full audit mode 
created: 2025-09-04
updated: 2025-09-06
last_checked: 2025-09-06
tags: [command, documentation, validation, audit]
parent: ./README.md
---

# /docs-check-all

Invoke the docs-quality-agent to run a comprehensive documentation audit.

## Usage

```
/docs-check-all
```

## What This Command Does

I will invoke the docs-quality-agent via the Task tool with:

```
Task: Run comprehensive documentation audit
```

This comprehensive audit will:
1. Check ALL documentation files
2. Run all validation scripts
3. Validate entire documentation structure  
4. Check for stale documentation (>7 days)
5. Verify parent-child relationships
6. Fix broken references and frontmatter
7. Update all metadata
8. Provide full report of documentation health

## When to Use

- **Weekly audits** - Regular documentation health check
- **Before releases** - Ensure documentation quality
- **After major changes** - Validate entire structure
- **Initial setup** - Baseline documentation state
- **When explicitly needed** - Full validation of all docs

## What the Agent Will Do

The docs-quality-agent will perform its full workflow:
1. **Run validation scripts** on all files
2. **Check every document** for issues
3. **Repair what it can** automatically
4. **Update metadata** on all validated files
5. **Report comprehensive results**

## Note on Git-Aware Mode

If you want a faster, focused check of only changed files, the docs-quality-agent supports that mode internally. But this command always runs the full audit as its purpose is comprehensive validation.

For git-aware checks, the docs-quality-agent is automatically triggered by Stop hooks after changes.

## Example Output

```
Documentation Audit Results:
===========================
Mode: Comprehensive audit (checking all files)

Files Checked: 127
Issues Found: 8
- Stale: 3 documents over 7 days old
- Missing frontmatter: 2 files
- Broken links: 2 references
- Orphaned document: 1 file

Fixed Automatically: 5
- Updated frontmatter: 2 files
- Fixed parent-child links: 2 files  
- Updated last_checked dates: 127 files

Manual Action Required: 3
- Update stale documentation (3 files)

All validation checks completed ✓
```

## Output Example

```
Documentation Audit Results:
===========================
Mode: Git-aware (checking 5 modified files)

Issues Found: 3
- Stale: /docs/api/endpoints.md (14 days old)
- Broken link: /docs/guides/setup.md -> /docs/missing.md
- Missing parent: /docs/new-feature.md

Fixed Automatically: 2
- Updated frontmatter: /docs/new-feature.md
- Fixed parent-child: /docs/guides/setup.md

Manual Action Required: 1
- Update stale documentation: /docs/api/endpoints.md

All validation checks passed ✓
```