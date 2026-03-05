#!/usr/bin/env node
/**
 * Comprehensive documentation validation for AgentFlow
 * Checks frontmatter, parent-child bidirectional links, broken links, and deleted file references
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface FrontMatter {
  title?: string;
  created?: string;
  updated?: string;
  last_checked?: string;
  tags?: string[];
  parent?: string;
  children?: string[];
  code_files?: string[];
  related?: string[];
}

interface ValidationIssue {
  file: string;
  issues: string[];
}

interface ValidationReport {
  totalFiles: number;
  issues: ValidationIssue[];
  status: 'pass' | 'fail';
}

const DELETED_FILES = [
  'setup-orchestrator-prompt.md',
  'discovery-orchestrator-prompt.md',
  'requirements-orchestrator-prompt.md',
  'delivery-orchestrator-prompt.md',
  'ci-test-agent.md',
  'comms-agent.md',
  'infrastructure-agent.md'
];

const EXCLUDE_PATTERNS = [
  '.claude/work/',
  '.claude/.archive/',
  'node_modules/'
];

function shouldExclude(filepath: string): boolean {
  return EXCLUDE_PATTERNS.some(pattern => filepath.includes(pattern));
}

function extractFrontMatter(filepath: string): FrontMatter | null {
  try {
    // Check if it's a symlink or directory
    const stats = fs.lstatSync(filepath);
    if (stats.isSymbolicLink() || stats.isDirectory()) {
      return null;
    }

    const content = fs.readFileSync(filepath, 'utf-8');
    const match = content.match(/^---\n(.*?)\n---/s);
    if (!match) return null;

  const frontMatter: FrontMatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      if (value.startsWith('[') && value.endsWith(']')) {
        (frontMatter as any)[key.trim()] = value
          .slice(1, -1)
          .split(',')
          .map((v: string) => v.trim());
      } else {
        (frontMatter as any)[key.trim()] = value;
      }
    }
  }

  return frontMatter;
  } catch (error) {
    console.error(`Error extracting frontmatter from ${filepath}:`, error);
    return null;
  }
}

function resolvePath(basePath: string, targetPath: string): string {
  if (path.isAbsolute(targetPath)) {
    return targetPath;
  }
  const baseDir = path.dirname(basePath);
  return path.normalize(path.join(baseDir, targetPath));
}

function fileExists(filepath: string): boolean {
  return fs.existsSync(filepath);
}

function validateFile(filepath: string, allFiles: Set<string>): string[] {
  const issues: string[] = [];
  const frontMatter = extractFrontMatter(filepath);

  // 1. Check frontmatter exists
  if (!frontMatter) {
    issues.push('Missing frontmatter');
    return issues;
  }

  // 2. Check required fields
  const requiredFields = ['title', 'created', 'updated', 'last_checked', 'tags'];
  for (const field of requiredFields) {
    if (!(field in frontMatter)) {
      issues.push(`Missing required field: ${field}`);
    }
  }

  // 3. Check for references to deleted files
  const content = fs.readFileSync(filepath, 'utf-8');
  for (const deletedFile of DELETED_FILES) {
    if (content.includes(deletedFile)) {
      issues.push(`References deleted file: ${deletedFile}`);
    }
  }

  // 4. Check parent link
  if (frontMatter.parent) {
    const parentPath = resolvePath(filepath, frontMatter.parent);
    if (!fileExists(parentPath)) {
      issues.push(`Parent file does not exist: ${frontMatter.parent}`);
    } else {
      // Check bidirectional link - does parent list this file as a child?
      const parentFrontMatter = extractFrontMatter(parentPath);
      if (parentFrontMatter && parentFrontMatter.children) {
        const relativePath = path.relative(path.dirname(parentPath), filepath);
        if (!parentFrontMatter.children.includes(relativePath)) {
          issues.push(`Parent ${frontMatter.parent} does not list this file in children`);
        }
      }
    }
  }

  // 5. Check children links
  if (frontMatter.children) {
    for (const child of frontMatter.children) {
      const childPath = resolvePath(filepath, child);
      if (!fileExists(childPath)) {
        issues.push(`Child file does not exist: ${child}`);
      } else {
        // Check bidirectional link - does child reference this as parent?
        const childFrontMatter = extractFrontMatter(childPath);
        if (childFrontMatter && childFrontMatter.parent) {
          const relativePath = path.relative(path.dirname(childPath), filepath);
          if (childFrontMatter.parent !== relativePath) {
            issues.push(`Child ${child} does not reference this file as parent`);
          }
        }
      }
    }
  }

  // 6. Check related links
  if (frontMatter.related) {
    for (const related of frontMatter.related) {
      const relatedPath = resolvePath(filepath, related);
      if (!fileExists(relatedPath)) {
        issues.push(`Related file does not exist: ${related}`);
      }
    }
  }

  // 7. Check code_files links
  if (frontMatter.code_files) {
    for (const codeFile of frontMatter.code_files) {
      const codePath = resolvePath(filepath, codeFile);
      if (!fileExists(codePath)) {
        issues.push(`Code file does not exist: ${codeFile}`);
      }
    }
  }

  return issues;
}

async function main() {
  const report: ValidationReport = {
    totalFiles: 0,
    issues: [],
    status: 'pass'
  };

  // Find all markdown files
  const patterns = ['.claude/**/*.md', 'docs/**/*.md'];
  const allFiles = new Set<string>();

  for (const pattern of patterns) {
    const files = await glob(pattern, { posix: true, nodir: true });
    for (const file of files) {
      try {
        const stats = fs.lstatSync(file);
        if (!shouldExclude(file) && stats.isFile() && !stats.isSymbolicLink()) {
          allFiles.add(file);
        }
      } catch (error) {
        // Skip files that can't be accessed
        continue;
      }
    }
  }

  // Validate each file
  for (const file of allFiles) {
    try {
      // Extra safety check
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        console.error(`Skipping non-file: ${file}`);
        continue;
      }

      report.totalFiles++;
      const issues = validateFile(file, allFiles);

      if (issues.length > 0) {
        report.issues.push({ file, issues });
        report.status = 'fail';
      }
    } catch (error) {
      console.error(`Error validating ${file}:`, error);
      report.issues.push({
        file,
        issues: [`Validation error: ${(error as Error).message}`]
      });
      report.status = 'fail';
    }
  }

  // Output report
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.status === 'pass' ? 0 : 1);
}

main();
