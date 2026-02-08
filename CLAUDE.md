# GainInsight Websites

@.claude/CLAUDE-agentflow.md

## Project Overview

Monorepo for GainInsight marketing websites, migrating from React to Astro with Sanity CMS.

## Project Structure

| Directory | Contents |
|-----------|----------|
| `apps/recon1/` | recon1.co.uk - Astro site |
| `apps/pensionable/` | pensionable.ai - Astro site |
| `apps/senti/` | Senti website - Astro site |
| `packages/sanity-studio/` | Shared Sanity CMS Studio |
| `packages/shared/` | Shared utilities and site config |

## Tech Stack

- **Framework:** Astro 5 (static site generation)
- **CMS:** Sanity v3 (headless, SaaS)
- **Styling:** Tailwind CSS
- **Build:** Turborepo + pnpm workspaces
- **Hosting:** AWS S3 + CloudFront
- **CI/CD:** GitHub Actions

## Infrastructure

| Site | S3 Bucket | CloudFront ID |
|------|-----------|---------------|
| recon1.co.uk | `recon1.co.uk` | `E3JNPZRCHMTZGD` |
| pensionable.ai | `pensionable.ai` | `E1NJGGB30XPJ7W` |
| senti | TBD | TBD |

## Linear

- **Team:** Websites (WBS)
- **Workflow:** Discovered > Refining > Approved > To Do > In Progress > In Review > Dev > Live

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start all sites in dev mode
pnpm build            # Build all sites
pnpm --filter @websites/recon1 dev    # Dev single site
```
