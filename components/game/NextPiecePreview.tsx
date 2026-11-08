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
      className="bg-[#fbf5e9] border-2 border-dashed border-coffee-dark/30 rounded-xl p-1.5 flex items-end justify-center gap-1"
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
