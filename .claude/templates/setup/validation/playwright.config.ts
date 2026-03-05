import { defineConfig } from '@playwright/test';

/**
 * Module Validation Test Configuration
 *
 * Validates that setup modules were installed correctly.
 * Each module has its own Playwright project so you can run individually.
 *
 * Usage:
 *   PROJECT_ROOT=/path/to/project npx playwright test                    # All modules
 *   PROJECT_ROOT=/path/to/project npx playwright test --project=amplify  # Single module
 *
 * For AWS-dependent modules, run via Doppler:
 *   doppler run --project {project} --config dev -- npx playwright test --project=aws-infrastructure
 *
 * Or copy this to the project and run directly.
 */
export default defineConfig({
  testDir: './specs',
  timeout: 60000,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'reports' }],
    ['list'],
  ],
  projects: [
    // --- Core Modules (Minimal Setup) ---
    {
      name: 'agentflow',
      testMatch: 'agentflow.spec.ts',
    },
    {
      name: 'linear',
      testMatch: 'linear.spec.ts',
    },
    {
      name: 'git',
      testMatch: 'git.spec.ts',
    },
    {
      name: 'docs',
      testMatch: 'docs.spec.ts',
    },
    {
      name: 'doppler',
      testMatch: 'doppler.spec.ts',
    },
    // --- Infrastructure Modules ---
    {
      name: 'aws-infrastructure',
      testMatch: 'aws-infrastructure.spec.ts',
    },
    {
      name: 'amplify',
      testMatch: 'amplify.spec.ts',
    },
    // --- Auth & Email Modules ---
    {
      name: 'auth',
      testMatch: 'auth.spec.ts',
    },
    {
      name: 'email',
      testMatch: 'email.spec.ts',
    },
    // --- Testing Module ---
    {
      name: 'testing',
      testMatch: 'testing.spec.ts',
    },
    // --- UI Module ---
    {
      name: 'ui-styling',
      testMatch: 'ui-styling.spec.ts',
    },
    // --- CI/CD Module ---
    {
      name: 'cicd',
      testMatch: 'cicd.spec.ts',
    },
    // --- Analytics Module ---
    {
      name: 'posthog',
      testMatch: 'posthog.spec.ts',
    },
    // --- Mobile Module ---
    {
      name: 'flutter',
      testMatch: 'flutter.spec.ts',
    },
    // --- Security Module ---
    {
      name: 'security',
      testMatch: 'security.spec.ts',
    },
  ],
});
