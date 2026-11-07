import React, { memo } from 'react';
import { Puyo } from './Puyo';
import type { PuyoPair } from '../../types/game';

interface NextPiecePreviewProps {
  nextPair: PuyoPair | null;
}

export const NextPiecePreview: React.FC<NextPiecePreviewProps> = memo(({ nextPair }) => {
  if (!nextPair) return null;

  return (
    <div className="bg-[#fbf5e9] border-2 border-dashed border-coffee-dark/30 rounded-xl p-2">
      <div className="flex flex-col items-center space-y-1">
        <Puyo color={nextPair.sub} />
        <Puyo color={nextPair.main} />
      </div>
    </div>
  );
});