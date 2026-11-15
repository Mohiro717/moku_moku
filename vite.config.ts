import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Cloudflare Pages が読むヘッダー（もくもくハウスの vercel.json と同じ中身）
const CLOUDFLARE_HEADERS = `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`;

export default defineConfig(({ mode }) => {
  // ぬばたま落とし単独サイト（npm run dev:nubatama / build:nubatama）。
  // 入口は nubatama/index.html、画像・音声は もくもくハウスと同じ public/ を使い、dist-nubatama/ に出す
  if (mode === 'nubatama') {
    return {
      plugins: [
        react(),
        {
          name: 'cloudflare-headers',
          apply: 'build' as const,
          generateBundle() {
            this.emitFile({ type: 'asset', fileName: '_headers', source: CLOUDFLARE_HEADERS });
          },
        },
      ],
      root: here('./nubatama'),
      publicDir: here('./public'),
      base: './',
      server: { port: 3014, open: false },
      build: { outDir: here('./dist-nubatama'), emptyOutDir: true, sourcemap: false },
      esbuild: { jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment' },
    };
  }

  return {
    plugins: [react()],
    base: process.env.NODE_ENV === 'production' ? './' : '/moku_moku/',
    server: {
      port: 3000,
      open: true,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
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
    },
    assetsInclude: ['**/*.webmanifest']
  };
});
