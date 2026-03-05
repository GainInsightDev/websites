/**
 * File system helpers for GainInsight Stack tests
 *
 * Provides utilities for checking files and directories.
 */
import * as fs from 'fs';
import * as path from 'path';
import { getProjectRoot } from './config.js';

/**
 * Check if a file exists in the project
 */
export function fileExists(relativePath: string): boolean {
  const fullPath = path.join(getProjectRoot(), relativePath);
  return fs.existsSync(fullPath);
}

/**
 * Check if a directory exists in the project
 */
export function dirExists(relativePath: string): boolean {
  const fullPath = path.join(getProjectRoot(), relativePath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
}

/**
 * Read a project file
 */
export function readProjectFile(relativePath: string): string {
  const fullPath = path.join(getProjectRoot(), relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${relativePath}`);
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

/**
 * Read and parse package.json
 */
export function readPackageJson(): Record<string, unknown> {
  const content = readProjectFile('package.json');
  return JSON.parse(content);
}

/**
 * Check if package.json has a dependency
 */
export function hasDependency(packageName: string, type: 'dependencies' | 'devDependencies' = 'devDependencies'): boolean {
  const pkg = readPackageJson();
  const deps = (pkg[type] || {}) as Record<string, string>;
  return packageName in deps;
}

/**
 * Check if package.json has a script
 */
export function hasScript(scriptName: string): boolean {
  const pkg = readPackageJson();
  const scripts = (pkg.scripts || {}) as Record<string, string>;
  return scriptName in scripts;
}

/**
 * Get a script from package.json
 */
export function getScript(scriptName: string): string | null {
  const pkg = readPackageJson();
  const scripts = (pkg.scripts || {}) as Record<string, string>;
  return scripts[scriptName] || null;
}

/**
 * Check if a file contains specific content
 */
export function fileContains(relativePath: string, content: string): boolean {
  try {
    const fileContent = readProjectFile(relativePath);
    return fileContent.includes(content);
  } catch {
    return false;
  }
}

/**
 * Check if a file has valid frontmatter
 */
export function hasValidFrontmatter(relativePath: string): {
  valid: boolean;
  hasTitle?: boolean;
  hasCreated?: boolean;
  hasTags?: boolean;
} {
  try {
    const content = readProjectFile(relativePath);

    if (!content.startsWith('---\n') || !content.includes('\n---\n')) {
      return { valid: false };
    }

    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return { valid: false };
    }

    const frontmatter = frontmatterMatch[1];

    return {
      valid: true,
      hasTitle: frontmatter.includes('title:'),
      hasCreated: frontmatter.includes('created:'),
      hasTags: frontmatter.includes('tags:'),
    };
  } catch {
    return { valid: false };
  }
}

/**
 * List files in a directory matching a pattern
 */
export function listFiles(relativePath: string, pattern?: RegExp): string[] {
  const fullPath = path.join(getProjectRoot(), relativePath);

  if (!fs.existsSync(fullPath)) {
    return [];
  }

  const files = fs.readdirSync(fullPath);

  if (pattern) {
    return files.filter((f) => pattern.test(f));
  }

  return files;
}
