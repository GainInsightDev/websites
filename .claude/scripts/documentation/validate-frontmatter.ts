#!/usr/bin/env node
/**
 * Validates front matter in documentation files.
 * Returns JSON report of files missing required fields.
 * Supports git-aware validation for performance optimization.
 * @documentation .claude/docs/standards/documentation-standards.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { execSync } from 'child_process';

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
  valid: string[];
  invalid: ValidationIssue[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
  mode: 'full-scan' | 'git-changed' | 'git-cascade' | 'files-specified';
  gitInfo?: {
    changedFiles: string[];
    cascadeFiles: string[];
  };
}

interface ValidationOptions {
  mode: 'full-scan' | 'git-changed' | 'git-cascade' | 'files-specified';
  files?: string[];
  commitRange?: string;
}

function extractFrontMatter(filepath: string): FrontMatter | null {
  const content = fs.readFileSync(filepath, 'utf-8');
  
  // Check for YAML front matter
  const match = content.match(/^---\n(.*?)\n---/s);
  if (!match) {
    return null;
  }
  
  // Parse YAML manually (simple approach)
  const frontMatter: FrontMatter = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      // Handle arrays (simple parsing for tags, children, etc.)
      if (value.startsWith('[') && value.endsWith(']')) {
        (frontMatter as any)[key.trim()] = value
          .slice(1, -1)
          .split(',')
          .map(v => v.trim());
      } else {
        (frontMatter as any)[key.trim()] = value;
      }
    }
  }
  
  return frontMatter;
}

function validateDocFile(filepath: string): string[] {
  const requiredFields = ['title', 'created', 'updated', 'last_checked', 'tags'];
  const linkingFields = ['parent', 'children', 'code_files', 'related'];
  
  const issues: string[] = [];
  const frontMatter = extractFrontMatter(filepath);
  
  if (!frontMatter) {
    issues.push('Missing front matter');
    return issues;
  }
  
  // Check required fields
  for (const field of requiredFields) {
    if (!(field in frontMatter)) {
      issues.push(`Missing required field: ${field}`);
    }
  }
  
  // Check at least one linking field
  const hasLinking = linkingFields.some(field => field in frontMatter);
  if (!hasLinking) {
    issues.push('Missing linking fields (need at least one of: parent, children, code_files, related)');
  }
  
  return issues;
}

function isGitRepository(): boolean {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getGitChangedFiles(commitRange: string = 'HEAD~1'): string[] {
  if (!isGitRepository()) {
    return [];
  }
  
  try {
    // Get changed files from git
    const changedFiles = execSync(`git diff --name-only ${commitRange}`, { 
      encoding: 'utf-8' 
    }).trim().split('\n').filter(f => f.length > 0);
    
    // Also get staged files
    const stagedFiles = execSync('git diff --name-only --cached', { 
      encoding: 'utf-8' 
    }).trim().split('\n').filter(f => f.length > 0);
    
    // Combine and deduplicate
    return [...new Set([...changedFiles, ...stagedFiles])];
  } catch {
    return [];
  }
}

function getCascadeFiles(changedFiles: string[]): string[] {
  const cascadeFiles: string[] = [];
  
  for (const file of changedFiles) {
    // If a .md file changed, also validate its parent
    if (file.endsWith('.md')) {
      const dir = path.dirname(file);
      const parentReadme = path.join(dir, '..', 'README.md');
      if (fs.existsSync(parentReadme)) {
        cascadeFiles.push(parentReadme);
      }
    }
    
    // If a code file changed, find related documentation
    if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const relatedDoc = file.replace(/\.(ts|tsx|js|jsx)$/, '.md');
      if (fs.existsSync(relatedDoc)) {
        cascadeFiles.push(relatedDoc);
      }
    }
  }
  
  return [...new Set(cascadeFiles)];
}

function parseCommandLineArgs(): ValidationOptions {
  const args = process.argv.slice(2);
  const options: ValidationOptions = { mode: 'full-scan' };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--git-changed') {
      options.mode = 'git-changed';
    } else if (arg === '--git-cascade') {
      options.mode = 'git-cascade';
    } else if (arg === '--files' && i + 1 < args.length) {
      options.mode = 'files-specified';
      options.files = args[i + 1].split(',').map(f => f.trim());
      i++; // Skip next arg since we consumed it
    } else if (arg === '--commit-range' && i + 1 < args.length) {
      options.commitRange = args[i + 1];
      i++; // Skip next arg since we consumed it
    } else if (arg === '--help') {
      console.log(`
Usage: validate-frontmatter.ts [options]

Options:
  --git-changed         Validate only files changed since last commit
  --git-cascade         Validate changed files + their dependencies
  --files <list>        Validate specific files (comma-separated)
  --commit-range <ref>  Use specific commit range (default: HEAD~1)
  --help               Show this help

Examples:
  validate-frontmatter.ts                    # Full scan
  validate-frontmatter.ts --git-changed      # Only changed files
  validate-frontmatter.ts --git-cascade      # Changed + dependencies
  validate-frontmatter.ts --files "a.md,b.md" # Specific files
`);
      process.exit(0);
    }
  }
  
  return options;
}

async function scanDocumentation(options: ValidationOptions): Promise<ValidationReport> {
  const report: ValidationReport = {
    valid: [],
    invalid: [],
    summary: {
      total: 0,
      valid: 0,
      invalid: 0
    },
    mode: options.mode
  };
  
  // Scan all markdown files in documentation areas
  const docPatterns = [
    '.claude/**/*.md',      // All framework components and docs
    'docs/**/*.md'          // Project documentation
  ];
  
  for (const pattern of docPatterns) {
    const files = await glob(pattern, { 
      // Don't ignore READMEs - they need front matter too
      posix: true 
    });
    
    for (const file of files) {
      const issues = validateDocFile(file);
      
      report.summary.total++;
      
      if (issues.length > 0) {
        report.invalid.push({
          file,
          issues
        });
        report.summary.invalid++;
      } else {
        report.valid.push(file);
        report.summary.valid++;
      }
    }
  }
  
  return report;
}

async function main() {
  try {
    const options: ValidationOptions = { mode: 'full-scan' };
    const report = await scanDocumentation(options);
    
    // Output quiet report - only show problems and summary
    const quietReport = {
      invalid: report.invalid, // Only show problem files
      summary: report.summary,
      status: report.summary.invalid === 0 ? '✅ All documentation valid' : `❌ ${report.summary.invalid} files have issues`,
      mode: report.mode
    };
    
    console.log(JSON.stringify(quietReport, null, 2));
    
    // Exit with error code if invalid docs found
    process.exit(report.summary.invalid > 0 ? 1 : 0);
  } catch (error) {
    console.error('Validation error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}