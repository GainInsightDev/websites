# React to Astro Migration Guide

## Overview

All three sites (recon1, pensionable, senti) are being migrated from React to Astro 5. The migration follows the same pattern for each site.

## Migration Approach

### 1. Content Audit

Before migrating, audit the existing React site:
- Pages and routes
- Components (which are interactive, which are static)
- Assets (images, fonts, icons)
- Third-party integrations (analytics, forms, etc.)
- SEO metadata (titles, descriptions, OG tags)

### 2. Page Migration

Astro pages replace React Router routes:

| React | Astro |
|-------|-------|
| `src/pages/Home.tsx` | `src/pages/index.astro` |
| `src/pages/About.tsx` | `src/pages/about.astro` |
| React Router `<Route>` | File-based routing in `src/pages/` |

### 3. Component Strategy

Most marketing site components are static (no client-side interactivity). Convert these directly to Astro components:

```astro
---
// Hero.astro - static component (no JS shipped to client)
const { title, subtitle } = Astro.props;
---
<section class="hero">
  <h1>{title}</h1>
  <p>{subtitle}</p>
</section>
```

For components that need interactivity (forms, modals, carousels), use Astro's client directives:

```astro
---
import ContactForm from '../components/ContactForm.tsx';
---
<ContactForm client:visible />
```

### 4. Styling

All existing sites use Tailwind CSS, which carries over directly. Tailwind classes in JSX work the same in Astro templates.

### 5. Sanity CMS Integration

Static content currently hardcoded in React should be moved to Sanity where appropriate:
- Page content, headings, body text
- Team bios, testimonials
- Blog posts, news items

Query Sanity from Astro pages:

```astro
---
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'qt7mj7sy',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
});

const pages = await client.fetch('*[_type == "page" && site == "recon1"]');
---
```

### 6. Assets

Copy static assets (images, fonts, favicons) from the React `public/` directory to the Astro `public/` directory. Astro serves these identically.

## Per-Site Notes

### recon1 (WBS-2)
- React 19 + Vite + TypeScript
- Existing S3 bucket and CloudFront distribution
- GitHub Actions deployment already configured on old repo

### pensionable (WBS-3)
- React + Vite + TypeScript
- Existing S3 bucket and CloudFront distribution
- GitHub Actions deployment already configured on old repo

### senti (WBS-4)
- React (CRA) + Tailwind
- S3 bucket and CloudFront distribution **exist** but IDs are not discoverable via CLI — ask user for bucket name and CloudFront distribution ID
- Consider migrating to Vite patterns during Astro conversion (CRA-specific patterns won't carry over)

## Build and Deploy

Each site builds independently via Turborepo. The GitHub Actions workflow uses path-based filtering (dorny/paths-filter) so only changed sites are built and deployed on push to main.

```bash
pnpm --filter @websites/recon1 build    # Build single site
pnpm build                               # Build all sites
```

Output goes to `apps/<site>/dist/` which is synced to the site's S3 bucket.
