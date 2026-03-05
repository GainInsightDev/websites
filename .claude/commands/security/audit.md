---
name: security:audit
description: Audit project security posture and create missing configurations
title: Security Audit Command
created: 2026-01-06
updated: 2026-01-06
last_checked: 2026-01-06
tags: [command, security, audit, dependabot, vulnerabilities]
parent: ./README.md
related:
  - ../../skills/af-security-expertise/SKILL.md
---

# Security Audit Command

Checks the current project's security tooling configuration and offers to create missing pieces.

## Procedure

1. **Load security expertise:**
   ```
   @.claude/skills/af-security-expertise/SKILL.md
   ```

2. **Check Dependabot configuration:**
   ```bash
   if [ -f ".github/dependabot.yml" ]; then
     echo "✅ Dependabot configured"
   else
     echo "❌ Missing .github/dependabot.yml"
   fi
   ```

3. **Check npm audit in CI:**
   ```bash
   if grep -rq "npm audit" .github/workflows/*.yml 2>/dev/null; then
     echo "✅ npm audit in CI workflow"
   else
     echo "⚠️  No npm audit step found in CI workflows"
   fi
   ```

4. **Run npm audit:**
   ```bash
   npm audit --audit-level=high 2>/dev/null
   if [ $? -eq 0 ]; then
     echo "✅ No high/critical vulnerabilities"
   else
     echo "❌ Vulnerabilities found - run 'npm audit' for details"
   fi
   ```

5. **Check for hardcoded secrets (basic):**
   ```bash
   if grep -rE "(password|secret|api_key|apikey)\s*[:=]\s*['\"][^'\"]{8,}['\"]" \
      --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" \
      src/ app/ 2>/dev/null; then
     echo "⚠️  Possible hardcoded secrets detected"
   else
     echo "✅ No obvious hardcoded secrets"
   fi
   ```

6. **Report GitHub secret scanning:**
   ```
   ⚠️  GitHub Secret Scanning - check manually:
      Settings → Security → Secret scanning → Enable
   ```

7. **Offer to create missing configs:**

   If Dependabot missing, ask:
   > "Create .github/dependabot.yml? [Y/n]"

   If confirmed, copy from template:
   ```bash
   mkdir -p .github
   cp .claude/templates/github/dependabot.yml .github/dependabot.yml
   ```

8. **Summary:**
   ```
   Security Audit Complete

   ✅ Passed: X checks
   ❌ Failed: Y checks
   ⚠️  Manual: Z items

   Next steps:
   - [List any remediation needed]
   ```

## Example Output

```
🔒 Security Audit Results

Tooling Configuration:
  ✅ Dependabot configured (.github/dependabot.yml)
  ✅ npm audit in CI workflow (ci.yml)
  ⚠️  GitHub secret scanning - check manually

Vulnerability Scan:
  ✅ No high/critical vulnerabilities found

Code Scan:
  ✅ No obvious hardcoded secrets

Summary: 4/5 checks passed, 1 manual verification needed

Manual action required:
  → Enable GitHub secret scanning: https://github.com/[owner]/[repo]/settings/security_analysis
```

## Related

- Skill: `af-security-expertise`
- Template: `.claude/templates/github/dependabot.yml`
