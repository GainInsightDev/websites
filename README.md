# GainInsight Websites

Monorepo for GainInsight marketing websites, built with Astro and Sanity CMS.

## Sites

| Site | Directory | Domain | S3 Bucket | CloudFront |
|------|-----------|--------|-----------|------------|
| Recon1 | `apps/recon1` | recon1.co.uk | `recon1.co.uk` | `E3JNPZRCHMTZGD` |
| Pensionable | `apps/pensionable` | pensionable.ai | `pensionable.ai` | `E1NJGGB30XPJ7W` |
| Senti | `apps/senti` | TBD | TBD (ask user) | TBD (ask user) |

## Structure

```
websites/
├── apps/
│   ├── recon1/          # recon1.co.uk - Astro site
│   ├── pensionable/     # pensionable.ai - Astro site
│   └── senti/           # senti website - Astro site
├── packages/
│   ├── sanity-studio/   # Shared Sanity CMS Studio
│   └── shared/          # Shared utilities and config
├── .claude/             # AgentFlow framework
├── .github/workflows/   # CI/CD pipelines
├── turbo.json           # Turborepo config
└── pnpm-workspace.yaml  # pnpm workspace config
```

## Getting Started

```bash
pnpm install
pnpm dev           # Start all sites in dev mode
pnpm build         # Build all sites
```

## Deployment

Push to `main` triggers GitHub Actions. Only changed sites are deployed (via path-based filtering). Each site builds independently and deploys to its S3 bucket with CloudFront invalidation.

## Tech Stack

- **Framework:** Astro 5 (static site generation)
- **CMS:** Sanity (headless CMS, SaaS)
- **Styling:** Tailwind CSS
- **Build:** Turborepo + pnpm workspaces
- **Hosting:** AWS S3 + CloudFront
- **CI/CD:** GitHub Actions
