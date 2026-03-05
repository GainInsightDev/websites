/**
 * CI/CD Component Validation
 *
 * Verifies GitHub Actions workflows are correctly configured.
 * Run: npx playwright test specs/cicd.spec.ts
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const projectRoot = process.env.PROJECT_ROOT || process.cwd();

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function readYaml(relativePath: string): Record<string, unknown> | null {
  try {
    const content = fs.readFileSync(path.join(projectRoot, relativePath), 'utf-8');
    return yaml.load(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

test.describe('CI/CD Component Validation', () => {
  test.describe('Directory Structure', () => {
    test('.github/workflows/ directory exists', () => {
      expect(fileExists('.github/workflows'), '.github/workflows/ should exist').toBe(true);
    });
  });

  test.describe('CI Workflow', () => {
    test('ci.yml exists', () => {
      expect(fileExists('.github/workflows/ci.yml'), 'ci.yml should exist').toBe(true);
    });

    test('ci.yml is valid YAML', () => {
      const workflow = readYaml('.github/workflows/ci.yml');
      expect(workflow, 'ci.yml should be valid YAML').not.toBeNull();
    });

    test('ci.yml has required structure', () => {
      const workflow = readYaml('.github/workflows/ci.yml');
      expect(workflow).not.toBeNull();
      if (!workflow) return;

      expect(workflow.name, 'Workflow should have a name').toBeTruthy();
      expect(workflow.on, 'Workflow should have triggers').toBeTruthy();
      expect(workflow.jobs, 'Workflow should have jobs').toBeTruthy();
    });

    test('ci.yml triggers on pull_request', () => {
      const workflow = readYaml('.github/workflows/ci.yml');
      expect(workflow).not.toBeNull();
      if (!workflow) return;

      const triggers = workflow.on as Record<string, unknown>;
      const hasPRTrigger = triggers.pull_request !== undefined ||
                          (Array.isArray(triggers) && triggers.includes('pull_request'));
      expect(hasPRTrigger, 'CI should trigger on pull_request').toBe(true);
    });

    test('ci.yml has validate job', () => {
      const workflow = readYaml('.github/workflows/ci.yml');
      expect(workflow).not.toBeNull();
      if (!workflow) return;

      const jobs = workflow.jobs as Record<string, unknown>;
      const hasValidateJob = jobs.validate !== undefined || jobs.Validate !== undefined;
      expect(hasValidateJob, 'CI should have a validate job').toBe(true);
    });
  });

  test.describe('Claude Review Workflow (Optional)', () => {
    test('claude-review.yml exists if Claude review enabled', () => {
      // This is optional - skip if not installed
      if (!fileExists('.github/workflows/claude-review.yml')) {
        test.skip();
        return;
      }

      const workflow = readYaml('.github/workflows/claude-review.yml');
      expect(workflow, 'claude-review.yml should be valid YAML').not.toBeNull();
    });
  });
});
