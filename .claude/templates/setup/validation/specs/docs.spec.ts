/**
 * Documentation Component Validation
 *
 * Verifies AgentFlow documentation structure is in place.
 * Run: npx playwright test specs/docs.spec.ts
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const projectRoot = process.env.PROJECT_ROOT || process.cwd();

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function dirExists(relativePath: string): boolean {
  try {
    return fs.statSync(path.join(projectRoot, relativePath)).isDirectory();
  } catch {
    return false;
  }
}

function hasFrontmatter(relativePath: string): boolean {
  try {
    const content = fs.readFileSync(path.join(projectRoot, relativePath), 'utf-8');
    return content.startsWith('---') && content.indexOf('---', 3) > 3;
  } catch {
    return false;
  }
}

test.describe('Documentation Component Validation', () => {
  test.describe('Directory Structure', () => {
    test('docs/ directory exists', () => {
      expect(dirExists('docs'), 'docs/ should exist').toBe(true);
    });

    test('docs/README.md exists', () => {
      expect(fileExists('docs/README.md'), 'docs/README.md should exist').toBe(true);
    });
  });

  test.describe('Docusaurus Configuration', () => {
    test('docs/_category_.json exists', () => {
      expect(fileExists('docs/_category_.json'), 'docs/_category_.json should exist').toBe(true);
    });

    test('_category_.json is valid JSON', () => {
      if (!fileExists('docs/_category_.json')) {
        test.skip();
        return;
      }

      try {
        const content = fs.readFileSync(path.join(projectRoot, 'docs/_category_.json'), 'utf-8');
        JSON.parse(content);
      } catch {
        throw new Error('_category_.json should be valid JSON');
      }
    });
  });

  test.describe('AgentFlow Standards', () => {
    test('docs/README.md has frontmatter', () => {
      if (!fileExists('docs/README.md')) {
        test.skip();
        return;
      }

      expect(hasFrontmatter('docs/README.md'), 'docs/README.md should have frontmatter').toBe(true);
    });

    test('CLAUDE.md exists', () => {
      expect(fileExists('CLAUDE.md'), 'CLAUDE.md should exist').toBe(true);
    });

    test('CLAUDE.md imports AgentFlow framework', () => {
      if (!fileExists('CLAUDE.md')) {
        test.skip();
        return;
      }

      const content = fs.readFileSync(path.join(projectRoot, 'CLAUDE.md'), 'utf-8');
      const importsFramework = content.includes('@.claude/CLAUDE-agentflow.md') ||
                               content.includes('.claude/CLAUDE-agentflow.md');
      expect(importsFramework, 'CLAUDE.md should import AgentFlow framework').toBe(true);
    });
  });
});
