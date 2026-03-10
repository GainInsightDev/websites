import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    port: 18000,
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['wbs-13.gaininsight.co.uk'],
    },
  },
  output: 'static',
});
