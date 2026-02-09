import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'qt7mj7sy',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

const SITE = 'pensionable';

export async function fetchOne<T = any>(type: string, extraFilter = ''): Promise<T> {
  const filter = extraFilter ? ` && ${extraFilter}` : '';
  return client.fetch<T>(`*[_type == "${type}" && site == "${SITE}"${filter}][0]`);
}

export async function fetchAll<T = any>(type: string, order = 'order asc'): Promise<T[]> {
  return client.fetch<T[]>(`*[_type == "${type}" && site == "${SITE}"] | order(${order})`);
}

export async function fetchBySlug<T = any>(type: string, slug: string): Promise<T> {
  return client.fetch<T>(`*[_type == "${type}" && site == "${SITE}" && slug.current == $slug][0]`, { slug });
}

export { client, SITE };
