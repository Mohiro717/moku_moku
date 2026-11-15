import React, { useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { NubatamaLoading } from '../components/game/title/NubatamaLoading';
import { NubatamaGame } from '../components/game/NubatamaGame';
import { applyPerfLite } from '../utils/perfLite';
import { FitToScreen } from './FitToScreen';

// ぬばたま落とし単独サイトの入口（npm run build:nubatama → dist-nubatama/ を Cloudflare Pages に置く）。
// もくもくハウスのゲームセクションにあるカードは出さず、読み込み画面のあとすぐタイトル画面にする（オーナー 11-15）。
// 読み込み画面・ページの地・タブのアイコンは、ぬばたま落としの見た目（タイトル案3b の5色）にそろえる（オーナー 11-15）。
// 遊びの中身は もくもくハウスと同じ部品（components/game/NubatamaGame.tsx）。
applyPerfLite();

const NubatamaApp: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const finish = useCallback(() => setIsLoading(false), []);
  return (
    <>
      {isLoading ? (
        <NubatamaLoading onComplete={finish} />
      ) : (
        <main className="min-h-screen flex flex-col justify-center px-3 py-3 text-center">
          <FitToScreen>
            <NubatamaGame />
          </FitToScreen>
        </main>
      )}
    </>
  );
};

const container = document.getElementById('root');
if (container) createRoot(container).render(<NubatamaApp />);
