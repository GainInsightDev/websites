---
title: Delivery Phase Guide
created: 2025-09-07
updated: 2025-12-09
last_checked: 2025-12-09
tags: [guide, delivery, phase-4, implementation]
parent: ./README.md
related:
  - ../../skills/af-orchestration/SKILL.md
  - ../../skills/af-delivery-process/SKILL.md
  - ./requirements-guide.md
  - ../standards/documentation-standards.md
---

# Delivery Phase Guide

Complete guide to the AgentFlow Delivery phase - transforming validated requirements into working code through iterative local development.

## Phase Overview

**Phase 4 of 4**: Implementation from complete specifications

The Delivery phase takes the mini-PRD from Requirements and implements it as working code, focusing on:
- Local development environment (localhost:3000 + sandbox)
- Iterative testing and refinement
- Documentation creation
- Pull request preparation

## Entry Criteria

Before entering Delivery phase:
1. ✅ **Complete mini-PRD** from Requirements phase
2. ✅ **Approved BDD scenarios** (`approval:bdd-approved` label on parent issue)
3. ✅ **Visual specifications** (`approval:ux-approved` label on parent issue, if applicable)
4. ✅ **Linear issue** in "In Development" status
5. ✅ **Development environment** ready (Setup phase complete)

## Core Workflow

### 1. Implementation Cycle

The delivery orchestrator follows this iterative pattern:

```
Implement → Test → Fix → Retest → Document → PR
```

#### A. Implement Feature
- Start with failing BDD tests (Red)
- Implement minimal code to pass (Green)
- Refactor for quality (Refactor)
- Follow existing code patterns

#### B. Run Tests Iteratively
Since dev-test-agent is stateless when invoked via Task tool:
```
Task → dev-test-agent: "Run unit tests for authentication"
[Fix issues if found]
Task → dev-test-agent: "Re-run unit tests for authentication"
[Repeat until clean]
```

#### C. Documentation
After implementation is stable:
```
Task → technical-writer-agent: "Create API documentation for auth endpoints"
Task → technical-writer-agent: "Add JSDoc comments to auth service"
```

#### D. Final Validation
```
Task → docs-quality-agent: "Validate all documentation"
Task → quality-agent: "Check code quality standards"
```

### 2. Background Process Management

**Important:** Port numbers and backend configuration are defined in your project's `CLAUDE.md` file. Do not assume default ports (like 3000) - always check the project documentation.

For applications with frontend and backend:

#### Frontend (varies by framework)
```bash
# Next.js, React, Vue, Svelte, etc.
npm run dev &  # Start in background (port specified in CLAUDE.md)

# Check status (use actual port from CLAUDE.md)
Task → dev-test-agent: "Check if frontend is running on <port>"

# Monitor for errors
Task → dev-test-agent: "Check frontend console for errors"
```

#### Backend (varies by stack)

**AWS Amplify Sandbox (AgentFlow default):**
```bash
# Start Amplify sandbox
npx ampx sandbox

# Verify APIs responding
Task → dev-test-agent: "Check if backend APIs are responding"
```

**Other Backend Stacks:**
AgentFlow supports various backend technologies. Each project's `CLAUDE.md` defines:
- Backend framework (Express, Django, Flask, FastAPI, NestJS, etc.)
- Startup commands
- Port configuration
- Environment requirements

Common patterns:
- **Express/Node**: `npm run dev` or `node server.js`
- **Django**: `python manage.py runserver <port>`
- **Flask**: `flask run --port <port>`
- **FastAPI**: `uvicorn main:app --port <port>`
- **Docker**: `docker-compose up`

Refer to your project's `CLAUDE.md` for specific backend setup instructions.

### 3. Testing Strategy

#### Unit Tests
- Test individual functions/components
- Mock external dependencies
- Verify business logic

#### Integration Tests
- Test API endpoints
- Verify data flow
- Check service interactions

#### E2E Tests (if configured)
- Test complete user flows
- Verify UI interactions
- Check cross-component behavior

### 4. Human-in-the-Loop Checkpoints

The delivery orchestrator pauses for human input at:

1. **After initial implementation** - "Does this approach look correct?"
2. **When tests fail repeatedly** - "Need help with this test failure"
3. **Before major refactoring** - "Should I refactor this for better structure?"
4. **Before creating PR** - "Ready to create PR with these changes?"

## Agent Coordination

### Primary Agents

#### dev-test-agent (Stateless Testing)
- Runs tests and reports results
- Each invocation is independent
- Must be called iteratively for continuous testing

#### technical-writer-agent (Documentation)
- Creates API documentation
- Writes component docs
- Adds JSDoc/TSDoc comments
- Authors user guides

#### quality-agent (Code Quality)
- Enforces coding standards
- Reviews patterns
- Suggests improvements

#### docs-quality-agent (Validation)
- Validates documentation
- Checks links and references
- Ensures completeness

### Iterative Testing Pattern

Since dev-test-agent is stateless:

```markdown
**Bad Pattern** (Won't work):
Task → dev-test-agent: "Monitor tests while I fix issues"

**Good Pattern** (Will work):
Task → dev-test-agent: "Run authentication tests"
[Agent reports 3 failures]
[Orchestrator fixes issues]
Task → dev-test-agent: "Run authentication tests again"
[Agent reports 1 failure]
[Orchestrator fixes issue]
Task → dev-test-agent: "Run authentication tests once more"
[Agent reports all passing]
```

## Output Artifacts

By end of Delivery phase, you have:

### 1. Working Code
- ✅ Feature implementation
- ✅ All tests passing
- ✅ Code quality validated
- ✅ Follows project patterns

### 2. Documentation
- ✅ API documentation
- ✅ Component documentation  
- ✅ JSDoc/TSDoc comments
- ✅ User guides (if needed)
- ✅ Architecture diagrams (if needed)

### 3. Pull Request
- ✅ Clean commit history
- ✅ Descriptive PR description
- ✅ Links to Linear issue
- ✅ Test summary included
- ✅ Ready for review

## Common Patterns

### Starting Fresh Implementation
```
1. Create feature branch
2. Start with BDD tests
3. Implement incrementally
4. Test after each component
5. Document when stable
```

### Fixing Failing Tests
```
1. Run specific test suite
2. Identify failure pattern
3. Fix implementation
4. Re-run same test suite
5. Confirm fix works
```

### Adding Missing Tests
```
1. Identify untested code
2. Write test cases
3. Run tests (may fail)
4. Fix if needed
5. Achieve coverage target
```

## Troubleshooting

### Tests Keep Failing
- Check test assumptions match implementation
- Verify mocks are correctly configured
- Look for environment issues
- Review BDD scenarios for accuracy

### Frontend Won't Start
- Check port 3000 availability
- Verify dependencies installed
- Check for syntax errors
- Review console output

### Backend Connection Issues
- Verify sandbox is running
- Check API Gateway URLs
- Review authentication setup
- Check CORS configuration

## Exit Criteria

Delivery phase completes when:
1. ✅ All BDD scenarios passing
2. ✅ Code quality validated
3. ✅ Documentation complete
4. ✅ PR created and ready
5. ✅ Linear issue updated

## Handoff to CI/CD

After PR creation:
- CI/CD pipeline takes over
- Automated tests run
- Code review process begins
- Deployment to staging/production handled by pipeline

The delivery orchestrator's responsibility ends at PR creation. The CI/CD system handles everything beyond local development.

## Best Practices

### Do's
- ✅ Test incrementally and often
- ✅ Follow TDD/BDD principles
- ✅ Document as you implement
- ✅ Keep commits atomic and clear
- ✅ Ask for human input when stuck

### Don'ts
- ❌ Skip tests to save time
- ❌ Implement without specifications
- ❌ Create massive commits
- ❌ Deploy directly to production
- ❌ Ignore failing tests

## See Also

- [Orchestration Skill](../../skills/af-orchestration/SKILL.md) - Coordination workflows
- [Delivery Process](../../skills/af-delivery-process/SKILL.md) - TDD implementation workflow
- [Requirements Guide](./requirements-guide.md) - Previous phase
- [Dev Test Agent](../../agents/af-dev-test-agent.md) - Testing agent details
- [Technical Writer Agent](../../agents/af-technical-writer-agent.md) - Documentation agent