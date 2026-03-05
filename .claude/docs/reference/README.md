---
title: Reference Documentation
sidebar_label: Reference
sidebar_position: 6
created: 2025-12-09
updated: 2026-02-18
last_checked: 2026-02-18
tags: [reference, api, schema, documentation]
parent: ../README.md
children:
  - ./template-manifest-schema.md
  - ./testiny-api-reference.md
  - ./module-registry.yml
---

# Reference Documentation

Technical reference documentation for AgentFlow framework schemas, APIs, and specifications.

## Available References

### [Template Manifest Schema](./template-manifest-schema.md)

Complete schema reference for `template-manifest.json` - the file that defines how AgentFlow framework is distributed to projects via the sync system.

**Key sections:**
- Schema structure and field definitions
- Namespace conventions (af- prefix)
- Sync behavior configuration
- Validation rules and requirements
- Migration guidance from V1 to V2

**Use this when:**
- Understanding sync system architecture
- Modifying sync behavior
- Troubleshooting sync issues
- Contributing framework changes

### [Testiny API Reference](./testiny-api-reference.md)

Complete API reference for Testiny test management platform integration, documenting the REST API, Slate rich text format, and AgentFlow integration patterns.

**Key sections:**
- API endpoints and authentication
- Slate JSON format for rich text fields
- Folder assignment via mapping API
- AgentFlow integration design decisions
- Content population playbook

**Use this when:**
- Setting up Testiny integration for a project
- Creating or updating test cases via API
- Understanding QA exploratory testing workflow
- Implementing af-testiny-expertise skill

### [Module Registry](./module-registry.yml)

Composable module definitions for AgentFlow's setup process. After Discovery selects a tech stack, modules are installed in dependency order using this registry.

**Key sections:**
- Core modules (always included)
- Infrastructure, auth, email, testing, UI, CI/CD, analytics, mobile, security modules
- Cross-module integration guide references
- Known-good combinations (e.g., gaininsight-standard)

**Use this when:**
- Running post-Discovery module installation
- Understanding module dependencies and install order
- Finding integration guides for module combinations
- Planning a project's tech stack during Discovery

---

**Total References:** 3
**Last Updated:** 2026-02-18
