import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// The dashboard imports ../drawingCapture.js and ../advanced-final.js as raw text at build time,
// so the engine it runs and every code fact it shows come from the repo, never typed by hand.
// Served under /drawing_modal/dashboard/ so the product app keeps the Pages root.
export default defineConfig({
  base: '/drawing_modal/dashboard/',
  plugins: [react()],
  server: { fs: { allow: ['..'] } },
});
