import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
  },
  server: {
    proxy: {
      '/token': {
        target: 'https://xml-to-bc-backend.onrender.com/token',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  worker: {
    format: 'es',  // Make sure web worker bundles as ES modules (required for import.meta.url in worker constructor)
  },
});
