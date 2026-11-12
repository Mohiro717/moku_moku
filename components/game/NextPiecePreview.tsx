import React, { memo } from 'react';
import { Puyo } from './Puyo';
import type { PuyoPair } from '../../types/game';

interface NextPiecePreviewProps {
  nextPair: PuyoPair | null;
  /** 次の次。つぎの右下に小さく出す */
  nextNextPair?: PuyoPair | null;
}

const PairColumn: React.FC<{ pair: PuyoPair }> = ({ pair }) => (
  <div className="flex flex-col items-center space-y-1">
    <Puyo color={pair.sub} />
    <Puyo color={pair.main} />
  </div>
);

export const NextPiecePreview: React.FC<NextPiecePreviewProps> = memo(({ nextPair, nextNextPair }) => {
  if (!nextPair) return null;

  return (
    // 次の次は、つぎの7割の大きさ。--puyo-size を自分で参照すると循環するので、外側の大きさを一度 --next-size に写す
    <div
      className="kf-window bg-[#fbf5e9] border-2 border-dashed border-coffee-dark/30 rounded-xl p-1.5 flex items-end justify-center gap-1"
      style={{ '--next-size': 'var(--puyo-size)' } as React.CSSProperties}
    >
      <PairColumn pair={nextPair} />
      {nextNextPair && (
        <div className="opacity-80" style={{ '--puyo-size': 'calc(var(--next-size) * 0.7)' } as React.CSSProperties}>
          <PairColumn pair={nextNextPair} />
        </div>
      )}
    </div>
  );
});

// ========================================
// 【見比べ用・開発のみ】対戦の「つぎ」の木札の3案。?next=a|b|c でゲームの中、?nextsheet で並べて見る。
//   a 木札（ムラのある木目・焼印の字・紅白の紐・彫り込んだ窓）
//   b 漆の札（黒漆・朱の縁・金の字・金の縁の窓）
//   c 絵馬（屋根の形・朱の印の字・和紙の窓）
//   d お守り（オーナーが外のサービスで生成した画像 public/images/game/kifuda_omamori.png を border-image で9分割して伸ばす）
// オーナーが選んだら1案だけ残し、ほかの案・?next・NextTagSheet.tsx を消す（wapop.css の「見比べ用」も）
// ========================================
export type KifudaLook = 'now' | 'a' | 'b' | 'c' | 'd';
export const KIFUDA_LOOKS: { id: KifudaLook; name: string }[] = [
  { id: 'now', name: 'いま' },
  { id: 'a', name: 'a 木札' },
  { id: 'b', name: 'b 漆の札' },
  { id: 'c', name: 'c 絵馬' },
  { id: 'd', name: 'd お守り（生成画像）' }
];
const URL_KIFUDA: KifudaLook = (() => {
  if (!import.meta.env.DEV || typeof location === 'undefined') return 'now';
  const v = new URLSearchParams(location.search).get('next');
  return v === 'a' || v === 'b' || v === 'c' || v === 'd' ? v : 'now';
})();

/** 対戦の「つぎ」＝木札（和ポップの地のまま、目が行く部品だけ道具にする） */
export const NextTag: React.FC<{ nextPair: PuyoPair | null; nextNextPair?: PuyoPair | null; className?: string; look?: KifudaLook }> = ({ nextPair, nextNextPair, className = '', look = URL_KIFUDA }) => (
  <div
    className={`wp-kifuda-wrap ${look === 'now' ? '' : `kf-look-${look}`} ${className}`}
    style={look === 'd' ? ({ '--kf-img': `url(${import.meta.env.BASE_URL}images/game/kifuda_omamori.png)` } as React.CSSProperties) : undefined}
  >
    <div className="wp-wood wp-kifuda">
      <div className="kf-label text-xs font-serif mb-1">つぎ</div>
      <NextPiecePreview nextPair={nextPair} nextNextPair={nextNextPair} />
    </div>
  </div>
);
