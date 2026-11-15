import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LoadingScreen } from '../components/LoadingScreen';
import { NubatamaGame } from '../components/game/NubatamaGame';
import { applyPerfLite } from '../utils/perfLite';

// ぬばたま落とし単独サイトの入口（npm run build:nubatama → dist-nubatama/ を Cloudflare Pages に置く）。
// もくもくハウスのゲームセクションにあるカードは出さず、読み込み画面のあとすぐタイトル画面にする（オーナー 11-15）。
// 遊びの中身は もくもくハウスと同じ部品（components/game/NubatamaGame.tsx）。
applyPerfLite();

const NubatamaApp: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <>
      <LoadingScreen isLoading={isLoading} onComplete={() => setIsLoading(false)} title="ぬばたま落とし" />
      {!isLoading && (
        <main className="min-h-screen bg-ivory py-2 sm:py-6">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <NubatamaGame />
          </div>
        </main>
      )}
    </>
  );
};

const container = document.getElementById('root');
if (container) createRoot(container).render(<NubatamaApp />);
