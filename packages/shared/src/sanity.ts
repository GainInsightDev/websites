import { createClient } from '@sanity/client';
import type { SiteName } from './index';

const projectId = process.env.SANITY_PROJECT_ID || 'qt7mj7sy';
const dataset = process.env.SANITY_DATASET || 'production';

/**
 * Create a Sanity client for fetching content.
 * Uses the public API (no token needed for published content).
 */
export function getSanityClient() {
  return createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: true,
  });
}

/**
 * Create an authenticated Sanity client for mutations.
 * Requires SANITY_API_TOKEN environment variable.
 */
export function getSanityWriteClient() {
  const token = process.env.SANITY_API_TOKEN;
  if (!token) {
    throw new Error('SANITY_API_TOKEN is required for write operations');
  }
  return createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: false,
    token,
  });
}

/** Helper to filter content by site in GROQ queries. */
export function siteFilter(site: SiteName): string {
  return `site == "${site}"`;
}
