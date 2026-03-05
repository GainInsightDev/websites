/**
 * Configuration helpers for GainInsight Stack tests
 *
 * Provides project name, GitHub org, and test context.
 */
import { execSync } from 'child_process';

/**
 * Get project name from DOPPLER_PROJECT env var (auto-set by doppler run)
 */
export function getProjectName(): string {
  const projectName = process.env.TEST_PROJECT_NAME || process.env.DOPPLER_PROJECT;

  if (!projectName) {
    throw new Error(
      'Project name not found. Run tests via: doppler run --project {project} --config dev -- npx playwright test'
    );
  }

  return projectName;
}

/**
 * Derive GitHub org from git remote URL
 * Supports both SSH (git@github.com:org/repo.git) and HTTPS (https://github.com/org/repo.git)
 */
export function getGitHubOrg(): string {
  // Allow override via environment
  if (process.env.GITHUB_ORG) {
    return process.env.GITHUB_ORG;
  }

  try {
    const remoteUrl = execSync('git remote get-url origin', {
      encoding: 'utf-8',
    }).trim();

    // SSH format: git@github.com:org/repo.git
    const sshMatch = remoteUrl.match(/git@github\.com:([^/]+)\//);
    if (sshMatch) {
      return sshMatch[1];
    }

    // HTTPS format: https://github.com/org/repo.git
    const httpsMatch = remoteUrl.match(/github\.com\/([^/]+)\//);
    if (httpsMatch) {
      return httpsMatch[1];
    }

    throw new Error(`Could not parse GitHub org from remote URL: ${remoteUrl}`);
  } catch (error) {
    throw new Error(
      `Failed to get GitHub org. Set GITHUB_ORG env var or ensure git remote is configured.\n${error}`
    );
  }
}

/**
 * Get project root directory
 */
export function getProjectRoot(): string {
  // Navigate up from tests/gaininsight-stack to project root
  if (process.cwd().includes('tests/gaininsight-stack')) {
    return process.cwd().replace(/\/tests\/gaininsight-stack.*$/, '');
  }
  return process.cwd();
}

/**
 * Interface for test context shared across tests
 */
export interface TestContext {
  projectName: string;
  dopplerProject: string;
  githubOrg: string;
  awsAccounts: {
    dev: string;
    test: string;
    prod: string;
  };
  amplifyApps: {
    dev: string;
    test: string;
    prod: string;
  };
  hostedZoneId: string;
}

/**
 * Create test context from environment
 */
export function createTestContext(): TestContext {
  const projectName = getProjectName();
  const githubOrg = getGitHubOrg();

  return {
    projectName,
    dopplerProject: projectName,
    githubOrg,
    awsAccounts: {
      dev: getAwsAccountId(projectName, 'dev'),
      test: getAwsAccountId(projectName, 'stg'),
      prod: getAwsAccountId(projectName, 'prd'),
    },
    amplifyApps: {
      dev: getDopplerSecret(projectName, 'dev', 'AMPLIFY_APP_ID'),
      test: getDopplerSecret(projectName, 'stg', 'AMPLIFY_APP_ID'),
      prod: getDopplerSecret(projectName, 'prd', 'AMPLIFY_APP_ID'),
    },
    hostedZoneId: getDopplerSecret(projectName, 'dev', 'HOSTED_ZONE_ID'),
  };
}

/**
 * Get a secret from Doppler for a specific config
 */
function getDopplerSecret(project: string, config: string, secretName: string): string {
  try {
    return execSync(
      `doppler secrets get ${secretName} --project ${project} --config ${config} --plain`,
      { encoding: 'utf-8' }
    ).trim();
  } catch {
    return '';
  }
}

/**
 * Get AWS account ID from STS for a specific Doppler config
 */
function getAwsAccountId(project: string, config: string): string {
  try {
    const result = execSync(
      `doppler run --project ${project} --config ${config} -- aws sts get-caller-identity --query Account --output text`,
      { encoding: 'utf-8' }
    ).trim();
    return result;
  } catch {
    return '';
  }
}
