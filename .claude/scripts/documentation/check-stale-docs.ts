#!/usr/bin/env node
/**
 * Checks for stale documentation based on last_checked date.
 * Returns list of files that need review.
 * @documentation .claude/docs/standards/documentation-standards.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface StaleReport {
  stale: Array<{
    file: string;
    last_checked: string;
    days_old: number;
  }>;
  fresh: number;
  summary: {
    total: number;
    stale: number;
    fresh: number;
    threshold_days: number;
  };
}

function extractFrontMatter(filepath: string): any {
  const content = fs.readFileSync(filepath, 'utf-8');
  
  const match = content.match(/^---\n(.*?)\n---/s);
  if (!match) {
    return null;
  }
  
  const frontMatter: any = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      frontMatter[key.trim()] = value;
    }
  }
  
  return frontMatter;
}

function daysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

async function checkStaleDocs(thresholdDays: number = 30): Promise<StaleReport> {
  const report: StaleReport = {
    stale: [],
    fresh: 0,
    summary: {
      total: 0,
      stale: 0,
      fresh: 0,
      threshold_days: thresholdDays
    }
  };
  
  const docPatterns = [
    '.claude/docs/**/*.md',
    'docs/**/*.md'
  ];
  
  for (const pattern of docPatterns) {
    const files = await glob(pattern, { posix: true });
    
    for (const file of files) {
      const frontMatter = extractFrontMatter(file);
      
      if (!frontMatter) {
        // If no front matter at all, consider it stale
        report.stale.push({
          file,
          last_checked: 'no front matter',
          days_old: 9999
        });
        report.summary.stale++;
      } else if (!frontMatter.last_checked) {
        // If no last_checked date, consider it stale
        report.stale.push({
          file,
          last_checked: 'missing date',
          days_old: 9999
        });
        report.summary.stale++;
      } else {
        const days = daysSince(frontMatter.last_checked);
        
        if (days > thresholdDays) {
          report.stale.push({
            file,
            last_checked: frontMatter.last_checked,
            days_old: days
          });
          report.summary.stale++;
        } else {
          report.fresh++;
          report.summary.fresh++;
        }
      }
      
      report.summary.total++;
    }
  }
  
  // Sort stale docs by age (oldest first)
  report.stale.sort((a, b) => b.days_old - a.days_old);
  
  return report;
}

async function main() {
  // Check for custom threshold from command line
  const args = process.argv.slice(2);
  const thresholdDays = args[0] ? parseInt(args[0]) : 30;
  
  try {
    const report = await checkStaleDocs(thresholdDays);
    
    // Output quiet report - only show stale files
    const quietReport = {
      stale: report.stale,  // Only show stale files
      summary: report.summary,
      status: report.summary.stale === 0 
        ? `✅ All documentation fresh (checked within ${thresholdDays} days)` 
        : `⚠️ ${report.summary.stale} files are stale (older than ${thresholdDays} days)`
    };
    
    console.log(JSON.stringify(quietReport, null, 2));
    
    if (report.summary.stale > 0) {
      // Keep the helpful stderr messages for human users
      console.error(`\nTo update these docs, run:`);
      process.exit(1);
    } else {
      console.error(`\n✅ All documentation is fresh (checked within ${thresholdDays} days)`);
      process.exit(0);
    }
  } catch (error) {
    console.error('Error checking stale docs:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}