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
      className="kf-window bg-[#fffaf0] border-2 border-dashed border-[#221a1f]/25 rounded-xl p-1.5 flex items-end justify-center gap-1"
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

/**
 * 対戦の「つぎ」＝生成りの小札（とくてんの札と同じ墨の縁・藍の影。見た目は hanafuda.css の .nx）。
 * 11-12 から使っていたお守りの札（オーナー生成の画像）は、オーナー 11-14「予告鬼火の枠が赤いお守りだとくどい」で
 * 4案を比べ、A 生成りの小札に決めた
 */
export const NextTag: React.FC<{ nextPair: PuyoPair | null; nextNextPair?: PuyoPair | null; className?: string }> = ({ nextPair, nextNextPair, className = '' }) => (
  <div className={`nx ${className}`}>
    <div className="nx-label font-serif">つぎ</div>
    <NextPiecePreview nextPair={nextPair} nextNextPair={nextNextPair} />
  </div>
);
