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

// 本番の BASE_URL は './'（相対）。CSS 変数に入れた url() の相対パスは、使う側の CSS ファイル（assets/）を起点に解かれて
// assets/images/… を探してしまう（11-12 公開後に画像が出なかった）。ページを起点にした絶対の URL にしてから渡す
const OMAMORI_SRC = `${import.meta.env.BASE_URL}images/game/kifuda_omamori.png`;
const OMAMORI_IMG = `url("${typeof document === 'undefined' ? OMAMORI_SRC : new URL(OMAMORI_SRC, document.baseURI).href}")`;

/**
 * 対戦の「つぎ」＝お守りの札（オーナー 11-12 が外のサービスで生成した画像。木札・漆・絵馬の3案のあと「d で決める」）。
 * 画像は wapop.css の .kf-omamori が窓のふちで9分割して貼る。紐と縁は伸ばさず、窓だけを中身に合わせて伸ばす
 */
export const NextTag: React.FC<{ nextPair: PuyoPair | null; nextNextPair?: PuyoPair | null; className?: string }> = ({ nextPair, nextNextPair, className = '' }) => (
  <div className={`kf-omamori-wrap ${className}`}>
    <div className="kf-omamori" style={{ '--kf-img': OMAMORI_IMG } as React.CSSProperties}>
      <div className="kf-label text-xs font-serif mb-1">つぎ</div>
      <NextPiecePreview nextPair={nextPair} nextNextPair={nextNextPair} />
    </div>
  </div>
);
