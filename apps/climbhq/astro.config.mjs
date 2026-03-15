import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://climbhq.co.uk',
  server: {
    port: 18003,
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['wbs-16.gaininsight.co.uk'],
    },
  },
  output: 'static',
});
