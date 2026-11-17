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

const NubatamaApp: React.FC = () => (
  <main>
    <FitToScreen>
      <NubatamaGame />
    </FitToScreen>
  </main>
);

const container = document.getElementById('root');
if (container) createRoot(container).render(<NubatamaApp />);
