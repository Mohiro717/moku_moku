import React from 'react';
import { createRoot } from 'react-dom/client';
import { NubatamaGame } from '../components/game/NubatamaGame';
import { applyPerfLite } from '../utils/perfLite';
import { FitToScreen } from './FitToScreen';

// ぬばたま落とし単独サイトの入口（npm run build:nubatama → dist-nubatama/ を Cloudflare Pages に置く）。
// もくもくハウスのゲームセクションにあるカードは出さず、すぐタイトル画面（OP から）にする（オーナー 11-15）。
// 読み込み画面は OP のあとに出す（オーナー 11-16「OP→読み込み画面→タイトル画面」）。出すのは NubatamaTitleScreen。
// 読み込み画面・ページの地・タブのアイコンは、ぬばたま落としの見た目（タイトル案3b の5色）にそろえる（オーナー 11-15）。
// 遊びの中身は もくもくハウスと同じ部品（components/game/NubatamaGame.tsx）。
applyPerfLite();

// ホーム画面アプリ（PWA）の見張り役。ビルドした版だけ（開発中に入れると古い版が残って紛らわしい）
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

const NubatamaApp: React.FC = () => (
  <main>
    <FitToScreen>
      <NubatamaGame />
    </FitToScreen>
  </main>
);

const container = document.getElementById('root');
if (container) createRoot(container).render(<NubatamaApp />);
