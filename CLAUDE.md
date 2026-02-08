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

## Credentials

| Service | Location | Notes |
|---------|----------|-------|
| AWS (deploy) | Doppler `websites/prd` | Also set as GitHub Actions secrets |
| Sanity CMS | Bitwarden | Account: `admins@gaininsight.global` |
| Sanity IDs | Doppler `websites/prd` | Project: `qt7mj7sy`, Org: `ohEzilKD7` |

- Sanity project credentials are stored in Bitwarden under the WBS/Websites entry
- AWS credentials are shared with the central `gi` Doppler project
- GitHub Actions secrets are configured on the `GainInsightDev/websites` repo

## Existing Sites (Migration Source)

The original React sites live on the GI Dev server. These are the source for migration:

| Site | Source Location | Framework | Deployment |
|------|----------------|-----------|------------|
| recon1 | `/srv/sites/recon1-app` | React 19 + Vite + TS | S3 + CloudFront (existing) |
| pensionable | `/srv/sites/pensionable.ai` | React + Vite + TS | S3 + CloudFront (existing) |
| senti | `/srv/sites/senti-website` | React (CRA) + Tailwind | **None** - needs new infrastructure |

- All use Tailwind CSS (good - carries over to Astro)
- senti has NO S3 bucket, CloudFront distribution, or GitHub Actions pipeline - these must be created during WBS-4

## Documentation

See `docs/` for detailed guides:

| Doc | Contents |
|-----|----------|
| `docs/README.md` | Documentation index |
| `docs/migration-guide.md` | React → Astro migration patterns |

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start all sites in dev mode
pnpm build            # Build all sites
pnpm --filter @websites/recon1 dev    # Dev single site
```
