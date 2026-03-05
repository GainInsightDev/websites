/**
 * Validation state management for AgentFlow quality agents.
 * 
 * @description This module provides utilities for agents to track what they've validated,
 * enabling incremental validation from their last known good state.
 * @features Tracks validation commits, manages agent state, provides incremental validation
 * @category Quality Management
 * @documentation .claude/docs/standards/documentation-standards.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface AgentValidationState {
  lastValidatedCommit: string | null;
  lastValidatedAt: string | null;
  filesChecked: number;
  issues: any[];
}

interface ValidationState {
  agents: {
    [agentName: string]: AgentValidationState;
  };
}

export class ValidationStateManager {
  private stateFile: string;
  
  constructor(gitRoot?: string) {
    const root = gitRoot || this.findGitRoot();
    if (!root) {
      throw new Error('Not in a git repository');
    }
    this.stateFile = path.join(root, '.claude', 'validation-state.json');
  }
  
  private findGitRoot(): string | null {
    let current = process.cwd();
    
    while (current !== path.dirname(current)) {
      if (fs.existsSync(path.join(current, '.git'))) {
        return current;
      }
      current = path.dirname(current);
    }
    
    return null;
  }
  
  private getCurrentCommit(): string {
    return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  }
  
  /**
   * Read the current validation state.
   */
  read(): ValidationState {
    if (!fs.existsSync(this.stateFile)) {
      // Return default state if file doesn't exist
      return {
        agents: {}
      };
    }
    
    try {
      const content = fs.readFileSync(this.stateFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading validation state:', error);
      return { agents: {} };
    }
  }
  
  /**
   * Get validation state for a specific agent.
   */
  getAgentState(agentName: string): AgentValidationState | null {
    const state = this.read();
    return state.agents[agentName] || null;
  }
  
  /**
   * Update validation state for a specific agent.
   */
  updateAgentState(agentName: string, validationResult: {
    filesChecked: number;
    issues: any[];
  }): void {
    const state = this.read();
    
    state.agents[agentName] = {
      lastValidatedCommit: this.getCurrentCommit(),
      lastValidatedAt: new Date().toISOString(),
      filesChecked: validationResult.filesChecked,
      issues: validationResult.issues
    };
    
    // Ensure directory exists
    const dir = path.dirname(this.stateFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write updated state
    fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
  }
  
  /**
   * Get files changed since last validation for an agent.
   */
  getChangedFiles(agentName: string, filePatterns?: string[]): string[] {
    const agentState = this.getAgentState(agentName);
    const lastCommit = agentState?.lastValidatedCommit;
    
    let command: string;
    if (lastCommit) {
      // Get changes since last validation
      command = `git diff --name-only ${lastCommit}..HEAD`;
    } else {
      // First run - get all tracked files
      command = 'git ls-files';
    }
    
    try {
      const output = execSync(command, { encoding: 'utf-8' });
      let files = output.split('\n').filter(Boolean);
      
      // Filter by patterns if provided
      if (filePatterns && filePatterns.length > 0) {
        files = files.filter(file => 
          filePatterns.some(pattern => {
            if (pattern.includes('*')) {
              // Simple glob matching
              const regex = pattern.replace(/\*/g, '.*');
              return new RegExp(regex).test(file);
            }
            return file.includes(pattern);
          })
        );
      }
      
      return files;
    } catch (error) {
      console.error('Error getting changed files:', error);
      return [];
    }
  }
  
  /**
   * Check if validation is needed for an agent based on file changes.
   */
  needsValidation(agentName: string, filePatterns?: string[]): boolean {
    const changedFiles = this.getChangedFiles(agentName, filePatterns);
    return changedFiles.length > 0;
  }
}

// Export singleton instance for convenience
export const validationState = new ValidationStateManager();