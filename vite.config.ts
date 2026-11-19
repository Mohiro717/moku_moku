import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// ホーム画面アプリで先にしまうアイコン（nubatama/index.html と manifest.webmanifest が指しているもの）
const PWA_ICONS = ['icon-32.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'].map((f) => `./images/nubatama/${f}`);

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
    // OGP の画像と URL は絶対 URL でないと X や LINE が読まない。公開先は NUBATAMA_SITE_URL（例 https://nubatama.pages.dev）、
    // 無ければ Cloudflare Pages がビルド中に渡す CF_PAGES_URL（その公開の URL）。どちらも無い手元では相対パスにしておく
    const siteUrl = (process.env.NUBATAMA_SITE_URL || process.env.CF_PAGES_URL || '.').replace(/\/+$/, '');
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
        {
          // ホーム画面アプリ（PWA）の名札と見張り役。中身と仕組みは nubatama/pwa/ の2つのファイルに書いてある。
          // 見張り役には、ビルドの版と「先にしまうファイル」（ページ本体・プログラム・アイコン）を埋める。
          // public/ はもくもくハウスと共用なので、音・動画・画像は先にしまわず、遊んだときにしまう
          name: 'nubatama-pwa',
          apply: 'build' as const,
          enforce: 'post' as const,
          generateBundle(_options: unknown, bundle: Record<string, unknown>) {
            const read = (p: string) => readFileSync(here(p), 'utf8');
            const built = Object.keys(bundle).filter((f) => f !== '_headers' && f !== 'index.html' && !f.endsWith('.map'));
            const precache = ['./', ...PWA_ICONS, ...built.map((f) => `./${f}`), './manifest.webmanifest'];
            const template = read('./nubatama/pwa/sw.js');
            if (template.split('__VERSION__').length !== 2 || template.split('__PRECACHE__').length !== 2) {
              throw new Error('nubatama/pwa/sw.js: __VERSION__ と __PRECACHE__ はそれぞれ1回だけ書く（コメントにも書かない）');
            }
            const sw = template.replace('__VERSION__', Date.now().toString(36)).replace('__PRECACHE__', JSON.stringify(precache));
            this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: read('./nubatama/pwa/manifest.webmanifest') });
            this.emitFile({ type: 'asset', fileName: 'sw.js', source: sw });
          },
        },
        {
          name: 'nubatama-site-url',
          transformIndexHtml: { order: 'pre' as const, handler: (html: string) => html.replaceAll('%NUBATAMA_SITE_URL%', siteUrl) },
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
