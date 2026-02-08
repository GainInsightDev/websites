# Websites Documentation

## Guides

| Document | Description |
|----------|-------------|
| [Migration Guide](./migration-guide.md) | React to Astro migration patterns and approach |

## Architecture

- **Monorepo**: Turborepo + pnpm workspaces
- **Sites**: Each site is an independent Astro app in `apps/`
- **Shared**: Common utilities and site config in `packages/shared/`
- **CMS**: Sanity Studio in `packages/sanity-studio/`, shared across all sites
- **Deploy**: GitHub Actions with per-site path filtering → S3 + CloudFront
