/**
 * HTTP helpers for GainInsight Stack tests
 *
 * Provides utilities for making HTTP requests.
 */
import { execSync, spawn, ChildProcess } from 'child_process';
import * as http from 'http';
import * as https from 'https';

/**
 * Check if a URL returns a specific status code
 */
export function checkUrlStatus(url: string, expectedStatus: number = 200): boolean {
  try {
    const result = execSync(`curl -s -o /dev/null -w "%{http_code}" "${url}"`, {
      encoding: 'utf-8',
    }).trim();
    return parseInt(result) === expectedStatus;
  } catch {
    return false;
  }
}

/**
 * Fetch URL content
 */
export function fetchUrl(url: string): string {
  try {
    return execSync(`curl -s "${url}"`, { encoding: 'utf-8' });
  } catch {
    return '';
  }
}

/**
 * Check if a URL is accessible with basic auth
 */
export function checkUrlWithAuth(url: string, username: string, password: string): boolean {
  try {
    const result = execSync(
      `curl -s -o /dev/null -w "%{http_code}" -u "${username}:${password}" ${url}`,
      { encoding: 'utf-8' }
    ).trim();
    return result === '200';
  } catch {
    return false;
  }
}

/**
 * Wait for a URL to be accessible
 */
export async function waitForUrl(
  url: string,
  maxWaitMs: number = 30000,
  intervalMs: number = 2000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    if (checkUrlStatus(url, 200)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return false;
}

/**
 * Make an HTTP GET request using Node.js http module
 */
export function httpGet(url: string): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode || 0, body }));
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Server process manager for test servers
 */
export class TestServer {
  private process: ChildProcess | null = null;
  private port: number;

  constructor(port: number) {
    this.port = port;
  }

  /**
   * Start a server with the given command
   */
  start(command: string, args: string[], cwd: string): void {
    this.process = spawn(command, args, {
      cwd,
      detached: true,
      stdio: 'ignore',
    });
  }

  /**
   * Wait for the server to be ready
   */
  async waitUntilReady(maxWaitMs: number = 30000): Promise<boolean> {
    return waitForUrl(`http://localhost:${this.port}`, maxWaitMs);
  }

  /**
   * Stop the server
   */
  stop(): void {
    if (this.process && this.process.pid) {
      try {
        process.kill(-this.process.pid, 'SIGTERM');
      } catch {
        // Process may already be dead
      }
      this.process = null;
    }
  }

  /**
   * Check if server is running
   */
  isRunning(): boolean {
    return this.process !== null;
  }
}
