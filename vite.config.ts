import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/moku_moku/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  }
});