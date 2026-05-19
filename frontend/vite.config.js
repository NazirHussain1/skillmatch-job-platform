import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const vendorChunks = {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
  'ui-vendor': ['lucide-react', 'react-hot-toast'],
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'],
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          for (const [chunkName, packages] of Object.entries(vendorChunks)) {
            if (packages.some((packageName) => id.includes(`/node_modules/${packageName}/`))) {
              return chunkName;
            }
          }

          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  preview: {
    port: 3000,
  },
});
