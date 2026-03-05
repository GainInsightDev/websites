/**
 * AWS CLI helpers for GainInsight Stack tests
 *
 * Provides wrappers for AWS CLI commands via Doppler.
 */
import { execSync } from 'child_process';

/**
 * Run a Doppler command
 */
export function doppler(project: string, config: string, command: string): string {
  const fullCommand = `doppler run --project ${project} --config ${config} -- ${command}`;
  try {
    return execSync(fullCommand, { encoding: 'utf-8' }).trim();
  } catch (error) {
    throw new Error(`Doppler command failed: ${fullCommand}\n${error}`);
  }
}

/**
 * Run an AWS CLI command via Doppler
 */
export function aws(project: string, config: string, awsCommand: string): string {
  return doppler(project, config, `aws ${awsCommand} --output json`);
}

/**
 * Parse JSON safely
 */
export function parseJson<T>(json: string): T {
  return JSON.parse(json) as T;
}

/**
 * Check if an AWS Organization Unit exists
 */
export function checkOrganizationUnit(projectName: string, parentOuId: string = 'ou-tmup-nfmu3ia2'): boolean {
  try {
    const result = aws('gi', 'prd', `organizations list-organizational-units-for-parent --parent-id ${parentOuId}`);
    const ous = parseJson<{ OrganizationalUnits: Array<{ Name: string; Id: string }> }>(result);
    return ous.OrganizationalUnits.some((ou) => ou.Name === projectName);
  } catch {
    return false;
  }
}

/**
 * Check if AWS accounts exist for a project
 */
export function checkProjectAccounts(projectName: string): { dev: boolean; test: boolean; prod: boolean } {
  try {
    const result = aws('gi', 'prd', 'organizations list-accounts');
    const accounts = parseJson<{ Accounts: Array<{ Name: string; Status: string }> }>(result);

    const activeAccounts = accounts.Accounts.filter((a) => a.Status === 'ACTIVE');

    return {
      dev: activeAccounts.some((a) => a.Name === `${projectName}-dev`),
      test: activeAccounts.some((a) => a.Name === `${projectName}-test`),
      prod: activeAccounts.some((a) => a.Name === `${projectName}-prod`),
    };
  } catch {
    return { dev: false, test: false, prod: false };
  }
}

/**
 * Check if a hosted zone exists in Route53
 */
export function checkHostedZone(zoneName: string): { exists: boolean; zoneId?: string } {
  try {
    const result = doppler(
      'gi',
      'prd',
      `bash -c 'AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY AWS_DEFAULT_REGION=eu-west-2 aws route53 list-hosted-zones --output json'`
    );
    const zones = parseJson<{ HostedZones: Array<{ Name: string; Id: string }> }>(result);
    const zone = zones.HostedZones.find((z) => z.Name === `${zoneName}.`);

    if (zone) {
      return { exists: true, zoneId: zone.Id.replace('/hostedzone/', '') };
    }
    return { exists: false };
  } catch {
    return { exists: false };
  }
}

/**
 * Check if NS records exist for a subdomain
 */
export function checkNsRecords(subdomain: string, parentZoneId: string = 'Z08261483JJZ016GFVDDQ'): boolean {
  try {
    const result = doppler(
      'gi',
      'prd',
      `bash -c 'AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY AWS_DEFAULT_REGION=eu-west-2 aws route53 list-resource-record-sets --hosted-zone-id ${parentZoneId} --query "ResourceRecordSets[?Name==\\x60${subdomain}.\\x60 && Type==\\x60NS\\x60]" --output json'`
    );
    const records = parseJson<Array<{ Name: string; Type: string }>>(result);
    return records.length > 0;
  } catch {
    return false;
  }
}

/**
 * Check Amplify app exists
 */
export function checkAmplifyApp(project: string, config: string, appId: string): { exists: boolean; name?: string } {
  try {
    const result = aws(project, config, `amplify get-app --app-id ${appId}`);
    const app = parseJson<{ app: { name: string } }>(result);
    return { exists: true, name: app.app.name };
  } catch {
    return { exists: false };
  }
}

/**
 * Check Amplify branch exists
 */
export function checkAmplifyBranch(
  project: string,
  config: string,
  appId: string,
  branchName: string
): boolean {
  try {
    const result = aws(project, config, `amplify get-branch --app-id ${appId} --branch-name ${branchName}`);
    const branch = parseJson<{ branch: { branchName: string } }>(result);
    return branch.branch.branchName === branchName;
  } catch {
    return false;
  }
}

/**
 * Check Amplify deployment status
 */
export function checkDeploymentStatus(
  project: string,
  config: string,
  appId: string,
  branchName: string
): { hasDeployments: boolean; lastStatus?: string } {
  try {
    const result = aws(project, config, `amplify list-jobs --app-id ${appId} --branch-name ${branchName} --max-items 1`);
    const jobs = parseJson<{ jobSummaries: Array<{ status: string }> }>(result);

    if (jobs.jobSummaries.length > 0) {
      return { hasDeployments: true, lastStatus: jobs.jobSummaries[0].status };
    }
    return { hasDeployments: false };
  } catch {
    return { hasDeployments: false };
  }
}

/**
 * Check CloudFormation stack exists
 */
export function checkCloudFormationStack(
  project: string,
  config: string,
  stackNamePattern: string
): boolean {
  try {
    const result = aws(
      project,
      config,
      'cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE'
    );
    const stacks = parseJson<{ StackSummaries: Array<{ StackName: string }> }>(result);
    return stacks.StackSummaries.some((s) => s.StackName.includes(stackNamePattern));
  } catch {
    return false;
  }
}

/**
 * Check AppSync API exists
 */
export function checkAppSyncApi(project: string, config: string): boolean {
  try {
    const result = aws(project, config, 'appsync list-graphql-apis');
    const apis = parseJson<{ graphqlApis: Array<{ name: string }> }>(result);
    return apis.graphqlApis.some(
      (api) => api.name.includes('amplifyData') || api.name.includes(project)
    );
  } catch {
    return false;
  }
}
