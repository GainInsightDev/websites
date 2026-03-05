/**
 * Playwright configuration for GainInsight Stack validation tests
 *
 * These tests validate infrastructure setup, NOT browser automation.
 * They run CLI commands, check files, and make HTTP requests.
 *
 * Run tests via Doppler to inject environment variables:
 *   doppler run --project {project} --config dev -- npx playwright test
 *
 * @documentation .claude/skills/af-gaininsight-standard/SKILL.md
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './specs',

  // Infrastructure tests can be slow (AWS operations, sandbox deployment)
  timeout: 300000, // 5 minutes per test

  // Infrastructure tests should not retry - failures indicate real issues
  retries: 0,

  // Run tests sequentially - infrastructure has dependencies
  workers: 1,
  fullyParallel: false,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'reports' }],
    ['list'],
  ],

  // Global setup/teardown if needed
  use: {
    // No browser needed - these are infrastructure tests
    trace: 'off',
  },

  // Test projects for different layer groups
  projects: [
    {
      name: 'layer-1',
      testMatch: 'layer-1.spec.ts',
    },
    {
      name: 'layer-2',
      testMatch: 'layer-2.spec.ts',
    },
    {
      name: 'layer-3',
      testMatch: 'layer-3.spec.ts',
    },
    {
      name: 'layer-4',
      testMatch: 'layer-4.spec.ts',
    },
    {
      name: 'sandbox',
      testMatch: 'sandbox.spec.ts',
    },
  ],
});
