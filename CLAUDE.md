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
| senti | TBD (ask user) | TBD (ask user) |

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
| senti | `/srv/sites/senti-website` | React (CRA) + Tailwind | S3 + CloudFront (exists, ask user for IDs) |

- All use Tailwind CSS (good - carries over to Astro)
- senti S3/CloudFront infrastructure exists but bucket name and distribution ID are not in the current AWS account's CLI output — ask user for these details during WBS-4

## Documentation

See `docs/` for detailed guides:

| Doc | Contents |
|-----|----------|
| `docs/README.md` | Documentation index |
| `docs/migration-guide.md` | React → Astro migration patterns |

## Sanity CMS

- **Project ID:** `qt7mj7sy`, **Dataset:** `production`
- **Studio URL:** https://gaininsight-websites.sanity.studio/ (login: `admins@gaininsight.global`, creds in Bitwarden)
- Use `createImageUrlBuilder` (named export) from `@sanity/image-url`, NOT the deprecated default export
- Shared client in each app's `src/lib/sanity.ts` with `fetchOne(type)` and `fetchAll(type)` helpers
- Schemas live in `packages/sanity-studio/schemas/`
- **Auto-deploy:** A Sanity webhook triggers GitHub Actions on content publish. Flow: Sanity webhook → `webhooks.gaininsight.co.uk/webhooks/sanity-deploy/pensionable` → GitHub `repository_dispatch` → deploy workflow rebuilds and deploys the site
- To deploy the Studio: `cd packages/sanity-studio && npx sanity deploy`

## Development Conventions

### Port Allocation
Each worktree gets a port from the server registry. **Never use framework defaults** (e.g. Astro 4321).

```bash
project-registry find-by-team WBS       # "websites"
project-registry websites port_base     # 18000
/srv/gidev/bin/port-slot lookup websites <issue>  # slot number
# Port = port_base + slot. Both astro.config.mjs and Caddy must use this port.
```

### Fonts
Self-host fonts in `public/fonts/` with `@font-face` in `global.css`. Do NOT use Google Fonts CDN — it causes visible FOUT (Flash of Unstyled Text).

### Diagrams
Use static PNG images in `public/images/diagrams/` instead of client-side JS rendering (Mermaid, etc.). Static images eliminate FOUC, reduce JS bundle size, and render instantly.

### Images
All `<img>` tags must have explicit `width` and `height` attributes to prevent CLS. Use `loading="lazy"` for below-the-fold images.

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start all sites in dev mode
pnpm build            # Build all sites
pnpm --filter @websites/recon1 dev    # Dev single site
```
