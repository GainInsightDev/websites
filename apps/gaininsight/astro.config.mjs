import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    port: 18000,
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['wbs-6.gaininsight.co.uk', 'wbs-6-preview.gaininsight.co.uk'],
    },
    preview: {
      allowedHosts: ['wbs-6-preview.gaininsight.co.uk'],
    },
  },
  output: 'static',
});
