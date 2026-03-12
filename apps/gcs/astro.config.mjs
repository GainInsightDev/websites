import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://globalclimbingstandard.com',
  server: {
    port: 18000,
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['wbs-14.gaininsight.co.uk'],
    },
  },
  output: 'static',
});
