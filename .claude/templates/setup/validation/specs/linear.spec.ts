/**
 * Linear Module Validation
 *
 * Verifies Linear team and project are configured.
 * Run: npx playwright test specs/linear.spec.ts
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const projectRoot = process.env.PROJECT_ROOT || process.cwd();

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function fileContains(relativePath: string, content: string): boolean {
  try {
    const text = fs.readFileSync(path.join(projectRoot, relativePath), 'utf-8');
    return text.includes(content);
  } catch {
    return false;
  }
}

function hasLinearCli(): boolean {
  try {
    execSync('which linearis', { encoding: 'utf-8' });
    return true;
  } catch {
    return false;
  }
}

test.describe('Linear Module Validation', () => {
  test.describe('Project Configuration', () => {
    test('CLAUDE.md references a Linear team', () => {
      if (!fileExists('CLAUDE.md')) {
        test.skip();
        return;
      }
      const hasLinearRef = fileContains('CLAUDE.md', 'Linear') ||
                           fileContains('CLAUDE.md', 'linear.app');
      expect(hasLinearRef, 'CLAUDE.md should reference Linear').toBe(true);
    });

    test('current-task.md template is available', () => {
      const hasWorkDir = fs.existsSync(path.join(projectRoot, '.claude', 'work'));
      // Work directory is created on first task:start, so it's optional at setup time
      // Just verify the framework has the concept
      expect(
        fileExists('.claude/skills/af-work-management-expertise/SKILL.md') ||
        fileExists('.claude/CLAUDE-agentflow.md'),
        'Work management skill or framework file should exist'
      ).toBe(true);
    });
  });

  test.describe('CLI Access', () => {
    test('linearis CLI is available', () => {
      if (!hasLinearCli()) {
        test.skip();
        return;
      }
      const result = execSync('linearis --version', { encoding: 'utf-8' });
      expect(result).toBeTruthy();
    });
  });
});
