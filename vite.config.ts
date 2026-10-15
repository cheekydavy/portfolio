import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` keeps asset URLs relative, so the built site works from a domain
// root (Vercel, Netlify, Cloudflare Pages) and from a sub-path (GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    // Mermaid is loaded on demand (only when an architecture view opens), so its
    // chunks are large by design and kept out of the initial bundle.
    chunkSizeWarningLimit: 2500,
  },
});
