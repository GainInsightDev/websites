#!/usr/bin/env node
/**
 * Validates TypeScript/JavaScript files have proper documentation tags.
 * Ensures all code files reference their documentation.
 * @documentation .claude/docs/standards/documentation-standards.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { globSync } from 'glob';

interface CodeValidationIssue {
  file: string;
  issues: string[];
}

interface CodeValidationReport {
  valid: string[];
  invalid: CodeValidationIssue[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

function extractDocTag(filepath: string): string | null {
  const content = fs.readFileSync(filepath, 'utf-8');
  
  // Look for @documentation tag in comments
  const docTagMatch = content.match(/@documentation\s+([^\s\n]+)/);
  if (docTagMatch) {
    return docTagMatch[1];
  }
  
  return null;
}

function validateCodeFile(filepath: string): string[] {
  const issues: string[] = [];
  const content = fs.readFileSync(filepath, 'utf-8');
  
  // Check for any JSDoc/TSDoc comment
  const hasDocComment = content.match(/\/\*\*[\s\S]*?\*\//);
  if (!hasDocComment) {
    issues.push('Missing JSDoc/TSDoc comment block');
    return issues;
  }
  
  // Check for @documentation tag
  const docTag = extractDocTag(filepath);
  if (!docTag) {
    issues.push('Missing @documentation tag');
  } else {
    // Verify the referenced doc file exists
    const docPath = path.resolve(path.dirname(filepath), docTag);
    const projectDocPath = path.resolve(docTag);
    
    if (!fs.existsSync(docPath) && !fs.existsSync(projectDocPath)) {
      issues.push(`Referenced documentation file not found: ${docTag}`);
    }
  }
  
  return issues;
}

function scanCodeFiles(): CodeValidationReport {
  const report: CodeValidationReport = {
    valid: [],
    invalid: [],
    summary: {
      total: 0,
      valid: 0,
      invalid: 0
    }
  };
  
  // Find all TypeScript and JavaScript files (cross-platform)
  const patterns = [
    '.claude/**/*.ts',
    '.claude/**/*.js',
    'src/**/*.ts',
    'src/**/*.js',
    'lib/**/*.ts',
    'lib/**/*.js'
  ];
  
  const allFiles: string[] = [];
  for (const pattern of patterns) {
    // Use posix:true for cross-platform compatibility
    const files = globSync(pattern, {
      posix: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });
    allFiles.push(...files);
  }
  
  for (const file of allFiles) {
    const issues = validateCodeFile(file);
    
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
  
  return report;
}

async function main() {
  try {
    const report = scanCodeFiles();
    
    // Output JSON report
    console.log(JSON.stringify(report, null, 2));
    
    // Exit with error code if invalid files found
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