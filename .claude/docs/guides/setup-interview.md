---
title: AgentFlow Setup Requirements Interview
sidebar_label: Setup Interview
created: 2025-09-07
updated: 2025-12-03
last_checked: 2025-12-03
tags: [setup, requirements, interview, phase-1]
interviewer: Claude
interviewee: Andy
purpose: Capture detailed requirements for AgentFlow setup process
parent: ./README.md
children: []
related:
  - ./setup-guide.md
  - ../setup/README.md
---

# AgentFlow Setup Requirements Interview

## Interview Context
This interview captures the detailed requirements for the AgentFlow setup process, including the MVP application, testing strategy, and the division of responsibilities between the setup script and the setup orchestrator.

## Interview Questions and Responses

### Question 1: Doppler Integration for Secrets Management

**Claude**: You mentioned using Doppler for secrets management. Let me understand the specifics:

1. Should the setup script check for Doppler CLI installation as a prerequisite, or should the orchestrator handle Doppler setup entirely?
2. What specific secrets need to be configured initially for the MVP to work? (AWS credentials, API keys, etc.)
3. Should we provide a template `.doppler.yaml` file, and if so, what environments should it define?
4. How should local development secrets be handled - through Doppler or a local .env file?

**Andy**: Yeah, the setup script should install the Doppler CLI. I guess we need whatever secrets we need to get AWS Amplify working. At the moment, we're only concerned about the dev local, which is an Amplify Sandbox environment, and the dev environment, which will be merged and deployed to Amplify automatically by GitHub from the Develop branch. I think like all secrets in Doppler is that just makes things better than having Doppler and .env files.

---

### Question 2: Amplify MVP Architecture

**Claude**: Now let's clarify the Amplify implementation details for the Hello World MVP:

1. For the API, should we use GraphQL (AppSync) or REST API Gateway? GraphQL would be more aligned with modern Amplify patterns.
2. Does the MVP need any authentication (Cognito), or should it be completely public for simplicity?
3. Do we need any data persistence (DynamoDB) for the MVP, or just a simple Lambda function that returns the greeting?
4. Should the backend validate or transform the name in any way, or just return "Hello, [name]!" as-is?

**Andy**: Okay, we decided we were going to use GraphQL and AppSync. The MVP doesn't need any authentication to start off with. In fact, the first way I'm going to test the MVP is by asking the discovery agent to discover authentication, a feature that I need that will end up with us implementing Cognito. We also don't need any data persistence. I think we have a simple lambda function that returns the greeting. Doesn't need to do anything more than that. We're just validating that Amplify is configured properly front and back, and the local sandbox works.

---

### Question 3: Testing Structure and Strategy

**Claude**: Let's clarify the testing approach for the MVP:

1. For the BDD feature file, should the step definitions be in TypeScript or JavaScript?
2. Where specifically should the step definitions live? (`/features/step-definitions/` or `/test/step-definitions/` or somewhere else?)
3. For E2E tests with Playwright, should they test against:
   - Local dev server (localhost:3000)?
   - Amplify Sandbox?
   - Or both?
4. Do we need test fixtures or mock data for the MVP, or is the simple "enter name, get greeting" flow enough without fixtures?
5. Should the unit tests cover just the React components, or also test the Lambda function logic separately?

**Andy**: TypeScript would be better for the BDD step definitions - we're using Cucumber.js. The folder structure is in the project-structure.md document - step definitions go in `/features/step-definitions/`. The E2E tests should run against the local dev server on port 3000. The simple test is fine (enter name, get greeting). For unit tests, cover both React components AND test the Lambda function logic separately - we want good coverage reporting and the Lambda needs to be covered.

---

### Question 4: Orchestrator Invocation

**Claude**: Now let's understand how the setup orchestrator integrates with the setup script:

1. How does the user trigger the setup orchestrator after the script completes?
2. Should the setup script automatically suggest running the orchestrator with `/bootstrap-project`?
3. What command specifically invokes the orchestrator? (Is it `/bootstrap-project` or something else?)
4. Should the orchestrator run automatically after script completion, or wait for user readiness?

**Andy**: Start with the script doing the project setup, then at the end it should say "run the orchestrator". When you run the orchestrator, it might ask other questions and run other scripts - we'll have to see how it evolves. At the end of the orchestrator setup, it should say "right, next you should go into the discovery phase" and explain how to do it. We have `/bootstrap-project` but it's basically empty - we could rename it to something like `/setup-project` if that's better.

---

### Question 5: Environment and Deployment Strategy

**Claude**: Let's clarify the environment and deployment approach:

1. For the MVP, are we just having two environments: dev local (Amplify Sandbox) and dev (auto-deployed from develop branch)?
2. How should environment-specific configurations be handled? Through Doppler environment variables?
3. What's the git branching strategy? Is it main, develop, and feature branches?
4. Should the setup script configure GitHub Actions for auto-deployment from the develop branch?

**Andy**: For the MVP, yes just DevLocal and Dev deployed from the develop branch. We should note that eventually we'll want to push to test and production too - via merging develop → staging → main branches. Use Doppler for all secrets (though Amplify might handle some internally). For branching: work on feature branches locally (possibly using git worktree), with develop as primary. Develop syncs to GitHub and deploys to Amplify, then staging to test, and main to production. Yes, the setup script should configure GitHub Actions, but we need to be careful about how Amplify deploys (it's different from normal GitHub → AWS deployment). I want to work on multiple feature branches with multiple sandboxes simultaneously - git worktree with primary on develop might be the solution.

---

### Question 6: Linear Integration Details

**Claude**: Let's discuss how Linear should be configured for AgentFlow projects:

1. Which Linear workspace states are mandatory vs optional? (e.g., Discovered, Refining, Ready, In Progress, In Review, Dev, Test, Live, Canceled?)
2. Should the orchestrator create a Linear project automatically during setup?
3. What labels/tags should be pre-configured? (e.g., feature, bug, tech-debt, discovery, etc.)
4. How should features be tracked - one Linear issue per feature, or broken into sub-issues?

**Andy**: Linear configuration is more in the Discovery Orchestrator and Project Manager Agent's domain. The work-management guide and work-management-expertise skill have this information. The setup should just ensure Linear MCP is configured, not create projects or configure states.

---

### Question 7: CI/CD Pipeline Requirements

**Claude**: Let's clarify what CI/CD setup is needed initially:

1. What tests must pass before merging to develop? (unit tests, E2E tests, linting?)
2. Should we enforce PR reviews? How many approvals needed?
3. What branch protection rules are needed for develop and main branches?
4. Do we need deploy previews for pull requests, or is the sandbox sufficient?

**Andy**: All tests need to pass before merging feature branches to develop. Need PRs with one reviewer (accounting for solo developers). Protect develop from direct pushes. Protect main from everything except merges from staging. Also protect staging from everything except merges from develop. Amplify Sandbox is sufficient for testing changes - need to explore that workflow but should work.

---

### Question 8: Documentation and Onboarding

**Claude**: What documentation should the setup generate to help developers get started?

1. Should the setup generate a project-specific README with getting started instructions?
2. What VS Code extensions should be recommended or required? (Cucumber, Jest Runner, Playwright Test, others?)
3. Should we create an onboarding checklist for new developers joining the project?
4. Where should project-specific documentation live? (`/docs/` or somewhere else?)

**Andy**: Rely on the AgentFlow framework docs, no need for project-specific README. VS Code extensions: Cucumber, Jest Runner, Playwright Test, ESLint/Prettier, AWS Toolkit - we could install them via script using the `.vscode/extensions.json` file. The onboarding checklist is the technical-requirements.md file. Project-specific docs go in `/docs/` but the setup script doesn't need to create any starter documentation.

---

### Question 9: Error Handling and Recovery

**Claude**: How should the setup handle failures and edge cases?

1. What if Amplify setup fails partway through - should we have rollback capability?
2. Should we have a way to resume/retry failed steps, or always start fresh?
3. How should we handle if the target directory already exists? Abort, clean, or merge?
4. Should the script create a detailed log file for debugging setup issues?

**Andy**: If Amplify setup fails and it's being done by the agent, use interactive mode to get it fixed. If target directory exists, abort with error (don't overwrite). No detailed log file needed - not for MVP anyway.

---

### Question 10: Post-Setup Validation

**Claude**: After setup completes, how should we validate everything is working?

1. What smoke tests should run to confirm successful setup? (build, test suite, Storybook?)
2. Should we automatically open the browser to show the working app?
3. Should we generate a setup summary/report showing what was configured?
4. What specific next steps guidance should we provide? (e.g., "Run /setup-project to continue with AWS configuration")

**Andy**: Build the app and run the test suite, maybe start Storybook first then run tests (since Storybook and E2E tests would fail without it working). Yes, open browser with the working app at localhost:3000. No summary report needed at this stage. For next steps: if setup agent still needs to run, say "Run /setup-project", but if the agent already ran at the end of setup, say "Now to start discovering features you want to create, run /discover-features to start the discovery phase."

---

## Interview Summary

The interview has been completed. All 10 questions have been answered, providing clear requirements for the AgentFlow setup process.

### Key Decisions Made:
- **Stack**: Next.js 15, Tailwind v3, Storybook 9, shadcn/ui, TypeScript, Cucumber.js
- **Infrastructure**: AWS Amplify with GraphQL/AppSync, Doppler for secrets
- **Testing**: TypeScript BDD with Cucumber, E2E with Playwright, unit tests for components and Lambda
- **Git Flow**: feature → develop → staging → main with branch protection
- **CI/CD**: All tests must pass, PR reviews required, GitHub Actions for deployment
- **Validation**: Build app, run tests, start Storybook, open browser at localhost:3000

### Next Actions:
1. Update the setup script with Doppler CLI installation
2. Add Amplify GraphQL/AppSync configuration
3. Implement proper test structure with TypeScript
4. Configure VS Code extensions via `.vscode/extensions.json`
5. Add GitHub Actions workflow for CI/CD
6. Create orchestrator integration bridge
7. Implement post-setup validation steps