// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';   // ← NEW

export default defineConfig({
  root: '.',
  base: '/',
  plugins: [react()],                     // ← NEW (enables JSX/TSX)
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
  server: {
    // Proxy API requests to Flask dev server
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});