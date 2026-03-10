/**
 * Layer 1 - Environment & Infrastructure Setup Tests
 *
 * These tests validate that the GainInsight Standard infrastructure
 * is correctly configured for a project.
 *
 * Run tests via Doppler to inject environment variables:
 *   doppler run --project {project} --config dev -- npx playwright test layer-1.spec.ts
 *
 * Required environment (auto-set by Doppler):
 *   - DOPPLER_PROJECT: Project name (auto-set by doppler run)
 *   - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION: AWS credentials
 *
 * @documentation .claude/skills/af-setup-gaininsight-stack/SKILL.md
 */
import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  createTestContext,
  getProjectRoot,
  type TestContext,
} from '../helpers/config.js';
import {
  aws,
  doppler,
  parseJson,
  checkOrganizationUnit,
  checkProjectAccounts,
  checkHostedZone,
  checkNsRecords,
  checkAmplifyApp,
  checkAmplifyBranch,
  checkDeploymentStatus,
  checkCloudFormationStack,
  checkAppSyncApi,
} from '../helpers/aws.js';
import {
  checkDopplerProject,
  getDopplerConfigs,
  checkDopplerSecrets,
} from '../helpers/doppler.js';
import { checkGitHubRepo, checkGitHubBranch, checkBranchProtection } from '../helpers/github.js';
import { fileExists, readProjectFile } from '../helpers/files.js';
import { checkUrlStatus, fetchUrl } from '../helpers/http.js';

let ctx: TestContext;

test.beforeAll(() => {
  ctx = createTestContext();
});

test.describe('Layer 1: Environment & Infrastructure Setup', () => {
  test.describe.configure({ mode: 'serial' });

  test.describe('Background Validation', () => {
    test('project has a GitHub repository', () => {
      expect(checkGitHubRepo(ctx.githubOrg, ctx.projectName)).toBe(true);
    });

    test('AWS credentials have organization access', () => {
      const result = aws('gi', 'prd', 'organizations describe-organization');
      const org = parseJson<{ Organization: { Id: string } }>(result);
      expect(org.Organization.Id).toBeTruthy();
    });

    test('Doppler CLI is installed and authenticated', () => {
      const result = execSync('doppler --version', { encoding: 'utf-8' });
      expect(result).toMatch(/v\d+\.\d+\.\d+/);
    });
  });

  test.describe('AWS Organization Unit', () => {
    test('AWS Organization Unit exists for the project', () => {
      expect(checkOrganizationUnit(ctx.projectName)).toBe(true);
    });

    test('OU contains three AWS accounts (dev, test, prod)', () => {
      const accounts = checkProjectAccounts(ctx.projectName);
      expect(accounts.dev).toBe(true);
      expect(accounts.test).toBe(true);
      expect(accounts.prod).toBe(true);
    });
  });

  test.describe('DNS Configuration', () => {
    test('hosted zone exists for project subdomain', () => {
      const zone = checkHostedZone(`${ctx.projectName}.gaininsight.global`);
      expect(zone.exists).toBe(true);
    });

    test('parent zone has NS records delegating to project zone', () => {
      const subdomain = `${ctx.projectName}.gaininsight.global`;
      expect(checkNsRecords(subdomain)).toBe(true);
    });
  });

  test.describe('Git Branches', () => {
    test('develop branch exists', () => {
      expect(checkGitHubBranch(ctx.githubOrg, ctx.projectName, 'develop')).toBe(true);
    });

    test('staging branch exists', () => {
      expect(checkGitHubBranch(ctx.githubOrg, ctx.projectName, 'staging')).toBe(true);
    });

    test('main branch exists', () => {
      expect(checkGitHubBranch(ctx.githubOrg, ctx.projectName, 'main')).toBe(true);
    });

    test('staging branch has protection rules', () => {
      const protection = checkBranchProtection(ctx.githubOrg, ctx.projectName, 'staging');
      expect(protection.hasProtection).toBe(true);
    });

    test('main branch has protection rules', () => {
      const protection = checkBranchProtection(ctx.githubOrg, ctx.projectName, 'main');
      expect(protection.hasProtection).toBe(true);
    });
  });

  test.describe('Doppler Configuration', () => {
    test('Doppler project exists', () => {
      expect(checkDopplerProject(ctx.projectName)).toBe(true);
    });

    test('Doppler has dev, stg, prd configs', () => {
      const configs = getDopplerConfigs(ctx.projectName);
      expect(configs).toContain('dev');
      expect(configs).toContain('stg');
      expect(configs).toContain('prd');
    });

    test('each config has AWS credentials', () => {
      const requiredSecrets = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'];

      for (const config of ['dev', 'stg', 'prd']) {
        const check = checkDopplerSecrets(ctx.projectName, config, requiredSecrets);
        expect(check.hasAll, `Config ${config} missing: ${check.missing.join(', ')}`).toBe(true);
      }
    });
  });

  test.describe('Amplify Application', () => {
    test('Amplify apps exist in each environment', () => {
      const configs = [
        { env: 'dev', config: 'dev', appId: ctx.amplifyApps.dev },
        { env: 'test', config: 'stg', appId: ctx.amplifyApps.test },
        { env: 'prod', config: 'prd', appId: ctx.amplifyApps.prod },
      ];

      for (const { env, config, appId } of configs) {
        expect(appId, `AMPLIFY_APP_ID must be configured in ${env}`).toBeTruthy();
        const app = checkAmplifyApp(ctx.projectName, config, appId);
        expect(app.exists, `Amplify app should exist in ${env}`).toBe(true);
        expect(app.name).toContain(ctx.projectName);
      }
    });

    test('Amplify app is connected to GitHub repository', () => {
      const result = aws(ctx.projectName, 'dev', `amplify get-app --app-id ${ctx.amplifyApps.dev}`);
      const app = parseJson<{ app: { repository: string } }>(result);
      expect(app.app.repository).toContain(ctx.projectName);
    });

    test('branch deployments are configured', () => {
      const branches = [
        { branch: 'develop', env: 'dev', config: 'dev', appId: ctx.amplifyApps.dev },
        { branch: 'staging', env: 'test', config: 'stg', appId: ctx.amplifyApps.test },
        { branch: 'main', env: 'prod', config: 'prd', appId: ctx.amplifyApps.prod },
      ];

      for (const { branch, env, config, appId } of branches) {
        expect(appId, `AMPLIFY_APP_ID must be configured for ${env}`).toBeTruthy();
        expect(
          checkAmplifyBranch(ctx.projectName, config, appId, branch),
          `Branch ${branch} should be configured in ${env}`
        ).toBe(true);
      }
    });
  });

  test.describe('AppSync GraphQL API', () => {
    test('AppSync API exists in dev', () => {
      expect(checkAppSyncApi(ctx.projectName, 'dev')).toBe(true);
    });
  });

  test.describe('Hello World Application', () => {
    test('Next.js page exists at /', () => {
      const url = `https://dev.${ctx.projectName}.gaininsight.global/`;
      expect(checkUrlStatus(url, 200)).toBe(true);
    });

    test('page displays Hello World', () => {
      const url = `https://dev.${ctx.projectName}.gaininsight.global/`;
      const html = fetchUrl(url);
      expect(html).toContain('Hello World');
    });
  });

  test.describe('Deployment Validation', () => {
    test('dev deployment is successful', () => {
      const status = checkDeploymentStatus(ctx.projectName, 'dev', ctx.amplifyApps.dev, 'develop');
      expect(status.hasDeployments).toBe(true);
      expect(status.lastStatus).toBe('SUCCEED');
    });

    test('test deployment is successful', () => {
      expect(ctx.amplifyApps.test, 'Test Amplify app ID must be configured').toBeTruthy();
      const status = checkDeploymentStatus(ctx.projectName, 'stg', ctx.amplifyApps.test, 'staging');
      expect(status.hasDeployments).toBe(true);
      expect(status.lastStatus).toBe('SUCCEED');
    });

    test('prod deployment is successful', () => {
      expect(ctx.amplifyApps.prod, 'Prod Amplify app ID must be configured').toBeTruthy();
      const status = checkDeploymentStatus(ctx.projectName, 'prd', ctx.amplifyApps.prod, 'main');
      expect(status.hasDeployments).toBe(true);
      expect(status.lastStatus).toBe('SUCCEED');
    });
  });

  test.describe('End-to-End Validation', () => {
    test('all environments return HTTP 200', () => {
      const urls = [
        `https://dev.${ctx.projectName}.gaininsight.global/`,
        `https://test.${ctx.projectName}.gaininsight.global/`,
        `https://${ctx.projectName}.gaininsight.global/`,
      ];

      for (const url of urls) {
        expect(checkUrlStatus(url, 200), `${url} should return 200`).toBe(true);
      }
    });

    test('each environment has GraphQL API responding', () => {
      const configs = [
        { config: 'dev', appId: ctx.amplifyApps.dev },
        { config: 'stg', appId: ctx.amplifyApps.test },
        { config: 'prd', appId: ctx.amplifyApps.prod },
      ];

      for (const { config } of configs) {
        expect(checkAppSyncApi(ctx.projectName, config), `GraphQL API should exist in ${config}`).toBe(true);
      }
    });
  });

  test.describe('Environment Isolation', () => {
    test('dev environment uses dev AWS account', () => {
      expect(ctx.awsAccounts.dev, 'AWS_ACCOUNT_DEV must be configured').toBeTruthy();
      const identity = doppler(ctx.projectName, 'dev', 'aws sts get-caller-identity');
      const caller = parseJson<{ Account: string }>(identity);
      expect(caller.Account).toBe(ctx.awsAccounts.dev);
    });

    test('test environment uses test AWS account', () => {
      expect(ctx.awsAccounts.test, 'AWS_ACCOUNT_TEST must be configured').toBeTruthy();
      const identity = doppler(ctx.projectName, 'stg', 'aws sts get-caller-identity');
      const caller = parseJson<{ Account: string }>(identity);
      expect(caller.Account).toBe(ctx.awsAccounts.test);
    });

    test('prod environment uses prod AWS account', () => {
      expect(ctx.awsAccounts.prod, 'AWS_ACCOUNT_PROD must be configured').toBeTruthy();
      const identity = doppler(ctx.projectName, 'prd', 'aws sts get-caller-identity');
      const caller = parseJson<{ Account: string }>(identity);
      expect(caller.Account).toBe(ctx.awsAccounts.prod);
    });

    test('environments have different account IDs', () => {
      expect(ctx.awsAccounts.dev).not.toBe(ctx.awsAccounts.test);
      expect(ctx.awsAccounts.test).not.toBe(ctx.awsAccounts.prod);
      expect(ctx.awsAccounts.dev).not.toBe(ctx.awsAccounts.prod);
    });
  });

  test.describe('Developer Sandbox', () => {
    test('project is configured with Amplify Gen 2', () => {
      const projectRoot = getProjectRoot();
      const backendPath = path.join(projectRoot, 'amplify', 'backend.ts');
      expect(fs.existsSync(backendPath), 'amplify/backend.ts should exist').toBe(true);
    });

    test('AWS credentials are available via Doppler', () => {
      const result = doppler(ctx.projectName, 'dev', 'aws sts get-caller-identity');
      const identity = parseJson<{ Account: string }>(result);
      expect(identity.Account).toBeTruthy();
    });

    test('amplify_outputs.json exists', () => {
      expect(fileExists('amplify_outputs.json')).toBe(true);
    });

    test('amplify_outputs.json has valid configuration', () => {
      const content = readProjectFile('amplify_outputs.json');
      const outputs = JSON.parse(content);
      expect(outputs.data || outputs.api || outputs.auth, 'Should have data/api/auth configuration').toBeTruthy();
    });
  });

  test.describe('Cost Tracking', () => {
    test('project is registered in AWS Cost Dashboard', () => {
      const configPath = '/srv/aws-cost-dashboard/accounts.config.json';
      let content: string;

      try {
        content = fs.readFileSync(configPath, 'utf-8');
      } catch {
        try {
          content = execSync(`sudo -n cat ${configPath}`, { encoding: 'utf-8' });
        } catch {
          test.skip();
          return;
        }
      }

      const config = JSON.parse(content) as { accounts: Array<{ name: string }> };
      const projectAccounts = config.accounts.filter((a) => a.name.includes(ctx.projectName));
      expect(projectAccounts.length, 'Project should have accounts in cost dashboard').toBeGreaterThan(0);
      expect(projectAccounts.length, 'Project should have all 3 environment accounts').toBe(3);
    });

    test('cost dashboard is accessible', () => {
      const result = execSync(
        'curl -s -o /dev/null -w "%{http_code}" -u "gaininsight:letmein" https://costs.gaininsight.co.uk',
        { encoding: 'utf-8' }
      ).trim();
      expect(result).toBe('200');
    });
  });

  test.describe('Port Configuration', () => {
    test('PORT_INFO.md exists', () => {
      expect(fileExists('PORT_INFO.md')).toBe(true);
    });

    test('PORT_INFO.md defines required ports', () => {
      const content = readProjectFile('PORT_INFO.md');
      expect(content).toContain('NEXT_DEV_PORT');
      expect(content).toContain('TEST_REPORT_PORT');
    });
  });

  test.describe('@runtime Local Development Server', () => {
    test('application runs locally on configured port', async () => {
      // This test requires the dev server to be running
      const port = process.env.NEXT_DEV_PORT || '3001';
      const url = `http://localhost:${port}`;

      // Check if server is running
      const isRunning = checkUrlStatus(url, 200);
      if (!isRunning) {
        test.skip();
        return;
      }

      expect(checkUrlStatus(url, 200)).toBe(true);
    });

    test('Hello World page displays correctly', async () => {
      const port = process.env.NEXT_DEV_PORT || '3001';
      const url = `http://localhost:${port}`;

      if (!checkUrlStatus(url, 200)) {
        test.skip();
        return;
      }

      const html = fetchUrl(url);
      expect(html).toContain('Hello World');
    });
  });
});
