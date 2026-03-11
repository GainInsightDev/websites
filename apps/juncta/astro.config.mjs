import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://juncta.ai',
  server: {
    port: 18000,
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['wbs-13.gaininsight.co.uk'],
    },
  },
  output: 'static',
});
