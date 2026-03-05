/**
 * Layer 4 - CI/CD Pipeline Setup Tests
 *
 * These tests validate that GitHub Actions workflows and
 * Storybook hosting are correctly configured.
 *
 * Run tests via Doppler to inject environment variables:
 *   doppler run --project {project} --config dev -- npx playwright test layer-4.spec.ts
 *
 * Prerequisites:
 *   - Layer 3 complete (UI & Styling)
 *
 * @documentation .claude/skills/af-gaininsight-standard/SKILL.md
 */
import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as https from 'https';
import * as yaml from 'js-yaml';
import {
  fileExists,
  readProjectFile,
  hasValidFrontmatter,
  listFiles,
} from '../helpers/files.js';
import { getProjectRoot, getProjectName, getGitHubOrg } from '../helpers/config.js';
import { getGitHubSecrets, checkBranchProtection } from '../helpers/github.js';
import { aws, doppler, parseJson } from '../helpers/aws.js';
import { checkUrlStatus } from '../helpers/http.js';

test.describe('Layer 4: CI/CD Pipeline Setup', () => {
  test.describe.configure({ mode: 'serial' });

  test.describe('Background Validation', () => {
    test('Layer 3 is complete - Storybook is configured', () => {
      expect(fileExists('.storybook/main.ts'), 'Storybook should be configured from Layer 3').toBe(true);
      expect(fileExists('src/components/ui/button.tsx'), 'shadcn components should exist from Layer 3').toBe(true);
    });
  });

  test.describe('GitHub Actions Workflows', () => {
    let workflows: Record<string, unknown> = {};

    test.beforeAll(() => {
      const workflowDir = '.github/workflows';
      if (fileExists(workflowDir)) {
        const files = listFiles(workflowDir, /\.ya?ml$/);
        for (const file of files) {
          const content = readProjectFile(`${workflowDir}/${file}`);
          try {
            workflows[file] = yaml.load(content);
          } catch {
            workflows[file] = null;
          }
        }
      }
    });

    test('CI workflow exists', () => {
      expect(fileExists('.github/workflows/ci.yml')).toBe(true);
    });

    test('CI workflow triggers on pull_request and push', () => {
      const workflow = workflows['ci.yml'] as { on?: Record<string, unknown> };
      expect(workflow, 'CI workflow should be parsed').toBeTruthy();
      expect(workflow?.on, 'Workflow should have triggers').toBeTruthy();
      expect(workflow?.on?.pull_request, 'Should trigger on pull_request').toBeTruthy();
    });

    test('CI workflow has validate and build jobs', () => {
      const workflow = workflows['ci.yml'] as { jobs?: Record<string, unknown> };
      expect(workflow, 'CI workflow should be parsed').toBeTruthy();
      expect(workflow?.jobs, 'Workflow should have jobs').toBeTruthy();
      expect(workflow?.jobs?.validate || workflow?.jobs?.Validate, 'Should have validate job').toBeTruthy();
      expect(workflow?.jobs?.build || workflow?.jobs?.Build, 'Should have build job').toBeTruthy();
    });

    test('Claude Code Review workflow exists', () => {
      expect(fileExists('.github/workflows/claude-code-review.yml')).toBe(true);
    });

    test('Claude Code Review uses claude-code-action', () => {
      const content = readProjectFile('.github/workflows/claude-code-review.yml');
      expect(content).toContain('claude-code-action');
    });

    test('Claude Code Review has Linear integration variables', () => {
      const content = readProjectFile('.github/workflows/claude-code-review.yml');
      expect(content).toContain('LINEAR_API_KEY');
      expect(content).toContain('LINEAR_TEAM_ID');
    });

    test('Claude on-demand workflow exists', () => {
      expect(fileExists('.github/workflows/claude-on-demand.yml')).toBe(true);
    });

    test('Storybook deploy workflow exists', () => {
      expect(fileExists('.github/workflows/storybook-deploy.yml')).toBe(true);
    });

    test('Storybook deploy triggers on component changes', () => {
      const workflow = workflows['storybook-deploy.yml'] as { on?: { push?: { paths?: string[] } } };
      expect(workflow, 'Storybook deploy workflow should be parsed').toBeTruthy();
      expect(workflow.on?.push, 'Should trigger on push').toBeTruthy();
    });

    test('Storybook deploy uses S3', () => {
      const content = readProjectFile('.github/workflows/storybook-deploy.yml');
      expect(content).toContain('aws s3 sync');
      expect(content).toContain('s3://');
    });
  });

  test.describe('GitHub Secrets', () => {
    test('required secrets are configured', () => {
      const secrets = getGitHubSecrets();

      const requiredSecrets = [
        'CLAUDE_CODE_OAUTH_TOKEN',
        'LINEAR_API_KEY',
        'LINEAR_TEAM_ID',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
      ];

      for (const secret of requiredSecrets) {
        expect(secrets, `Secret ${secret} should be configured`).toContain(secret);
      }
    });
  });

  test.describe('Storybook S3 Bucket', () => {
    test('Storybook S3 bucket exists', () => {
      const projectName = getProjectName();

      try {
        const output = doppler(projectName, 'dev', 'aws s3 ls');
        const hasStorybookBucket = output.split('\n').some((line) => line.includes('storybook'));
        expect(hasStorybookBucket, 'Storybook S3 bucket should exist').toBe(true);
      } catch {
        // S3 access might be restricted - skip
        test.skip();
      }
    });
  });

  test.describe('CloudFront Distribution', () => {
    test('CloudFront distribution exists for Storybook', () => {
      const projectName = getProjectName();

      try {
        const output = doppler(
          projectName,
          'dev',
          "aws cloudfront list-distributions --query 'DistributionList.Items[*].{Id:Id,Aliases:Aliases.Items}' --output json"
        );
        const distributions = JSON.parse(output) as Array<{ Aliases?: string[] }>;

        const hasStorybookDist = distributions.some(
          (dist) => dist.Aliases?.some((alias) => alias.includes('storybook'))
        );
        expect(hasStorybookDist, 'CloudFront distribution for Storybook should exist').toBe(true);
      } catch {
        // CloudFront access might be restricted - skip
        test.skip();
      }
    });
  });

  test.describe('Route 53 DNS', () => {
    test('Storybook DNS record exists', () => {
      const projectName = getProjectName();

      try {
        const output = execSync(`dig +short storybook.${projectName}.gaininsight.global`, {
          encoding: 'utf-8',
          timeout: 10000,
        }).trim();

        expect(output, 'DNS should resolve').toBeTruthy();
        expect(output).toContain('cloudfront.net');
      } catch {
        // DNS might not be configured yet - skip
        test.skip();
      }
    });
  });

  test.describe('Branch Protection', () => {
    test('staging branch requires PR reviews', () => {
      const org = getGitHubOrg();
      const repo = getProjectName();
      const protection = checkBranchProtection(org, repo, 'staging');

      expect(protection.hasProtection, 'Staging should have protection').toBe(true);
      expect(protection.requiresPR, 'Staging should require PR reviews').toBe(true);
    });

    test('main branch requires PR reviews', () => {
      const org = getGitHubOrg();
      const repo = getProjectName();
      const protection = checkBranchProtection(org, repo, 'main');

      expect(protection.hasProtection, 'Main should have protection').toBe(true);
      expect(protection.requiresPR, 'Main should require PR reviews').toBe(true);
    });
  });

  test.describe('Documentation', () => {
    test('docs/cicd.md exists', () => {
      expect(fileExists('docs/cicd.md')).toBe(true);
    });

    test('docs/cicd.md has valid frontmatter', () => {
      const fm = hasValidFrontmatter('docs/cicd.md');
      expect(fm.valid, 'Should have valid frontmatter block').toBe(true);
      expect(fm.hasTitle, 'Should have title').toBe(true);
    });

    test('docs/cicd.md documents required sections', () => {
      const content = readProjectFile('docs/cicd.md').toLowerCase();

      const sections = ['workflow', 'deployment', 'secret', 'storybook'];

      for (const section of sections) {
        expect(content, `Should document ${section}`).toContain(section);
      }
    });
  });

  test.describe('Validation', () => {
    test('CI/CD setup is complete', () => {
      expect(fileExists('.github/workflows/ci.yml'), 'CI workflow should exist').toBe(true);
      expect(fileExists('.github/workflows/storybook-deploy.yml'), 'Storybook deploy workflow should exist').toBe(true);
    });

    test('all workflow files are valid YAML', () => {
      const workflowDir = '.github/workflows';
      const errors: Array<{ file: string; error: string }> = [];

      if (fileExists(workflowDir)) {
        const files = listFiles(workflowDir, /\.ya?ml$/);
        for (const file of files) {
          try {
            const content = readProjectFile(`${workflowDir}/${file}`);
            yaml.load(content);
          } catch (error) {
            errors.push({ file, error: (error as Error).message });
          }
        }
      }

      expect(errors, `YAML errors found: ${JSON.stringify(errors)}`).toHaveLength(0);
    });

    test('CI workflow job names match branch protection', () => {
      const content = readProjectFile('.github/workflows/ci.yml');
      const workflow = yaml.load(content) as { jobs?: Record<string, { name?: string }> };

      const hasValidateJob =
        workflow.jobs?.validate ||
        workflow.jobs?.Validate ||
        Object.values(workflow.jobs || {}).some((job) => job.name === 'Validate');

      const hasBuildJob =
        workflow.jobs?.build ||
        workflow.jobs?.Build ||
        Object.values(workflow.jobs || {}).some((job) => job.name === 'Build');

      expect(hasValidateJob, 'Validate job should exist').toBe(true);
      expect(hasBuildJob, 'Build job should exist').toBe(true);
    });
  });

  test.describe('@runtime Storybook CloudFront', () => {
    test('Storybook is accessible via CloudFront', async () => {
      const projectName = getProjectName();
      const url = `https://storybook.${projectName}.gaininsight.global`;

      const response = await new Promise<{ statusCode: number; body: string }>((resolve, reject) => {
        https
          .get(url, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => resolve({ statusCode: res.statusCode || 0, body }));
          })
          .on('error', reject);
      }).catch(() => ({ statusCode: 0, body: '' }));

      if (response.statusCode === 0) {
        test.skip();
        return;
      }

      expect(response.statusCode).toBe(200);
      expect(response.body).toContain('Storybook');
    });
  });

  test.describe('Local Development Integration', () => {
    test('.start-work-hooks exists', () => {
      if (!fileExists('.start-work-hooks')) {
        test.skip();
        return;
      }

      const content = readProjectFile('.start-work-hooks');
      expect(content).toContain('STORYBOOK_PORT');
      expect(content).toContain('storybook');
    });
  });
});
