import { defineConfig } from 'vite';

// base './' lets the built site work on GitHub Pages under /<repo>/ and on any static host.
export default defineConfig({
  base: './',
  build: { outDir: 'dist', sourcemap: false },
});
