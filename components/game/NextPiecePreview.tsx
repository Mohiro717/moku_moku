import React, { memo } from 'react';
import { Puyo } from './Puyo';
import type { PuyoPair } from '../../types/game';

interface NextPiecePreviewProps {
  nextPair: PuyoPair | null;
}

export const NextPiecePreview: React.FC<NextPiecePreviewProps> = memo(({ nextPair }) => {
  if (!nextPair) return null;

  return (
    <div className="bg-coffee-light/20 rounded-lg p-3">
      <div className="text-coffee-dark/60 text-xs mb-2 text-center">NEXT</div>
      <div className="flex flex-col items-center space-y-1">
        <Puyo color={nextPair.sub} />
        <Puyo color={nextPair.main} />
      </div>
    </div>
  );
});