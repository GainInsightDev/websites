/**
 * Doppler CLI helpers for GainInsight Stack tests
 *
 * Provides wrappers for Doppler CLI commands.
 */
import { execSync } from 'child_process';

/**
 * Check if Doppler project exists
 */
export function checkDopplerProject(projectName: string): boolean {
  try {
    execSync(`doppler projects get ${projectName} --json`, { encoding: 'utf-8' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get Doppler project configs
 */
export function getDopplerConfigs(projectName: string): string[] {
  try {
    const result = execSync(`doppler configs --project ${projectName} --json`, {
      encoding: 'utf-8',
    });
    const configs = JSON.parse(result) as Array<{ name: string }>;
    return configs.map((c) => c.name);
  } catch {
    return [];
  }
}

/**
 * Check if Doppler config has required secrets
 */
export function checkDopplerSecrets(
  projectName: string,
  config: string,
  requiredSecrets: string[]
): { hasAll: boolean; missing: string[] } {
  try {
    const result = execSync(
      `doppler secrets --project ${projectName} --config ${config} --json`,
      { encoding: 'utf-8' }
    );
    const secrets = JSON.parse(result) as Record<string, unknown>;
    const secretNames = Object.keys(secrets);

    const missing = requiredSecrets.filter((secret) => {
      // Handle AWS_REGION vs AWS_DEFAULT_REGION
      const secretName = secret === 'AWS_REGION' ? 'AWS_DEFAULT_REGION' : secret;
      return !secretNames.includes(secretName);
    });

    return { hasAll: missing.length === 0, missing };
  } catch {
    return { hasAll: false, missing: requiredSecrets };
  }
}

/**
 * Get a specific secret from Doppler
 */
export function getDopplerSecret(
  projectName: string,
  config: string,
  secretName: string
): string | null {
  try {
    return execSync(
      `doppler secrets get ${secretName} --project ${projectName} --config ${config} --plain`,
      { encoding: 'utf-8' }
    ).trim();
  } catch {
    return null;
  }
}
