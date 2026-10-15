import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The site is served from the root of its own (sub)domain and uses real URLs
// (/projects/pos), so assets must be absolute: base '/'.
// If you ever host it under a sub-path, change this and set SITE_URL for the prerender step.
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    // Mermaid is loaded on demand (only when a diagram opens), so its chunks are large by design
    // and kept out of the initial bundle.
    chunkSizeWarningLimit: 2500,
  },
});
