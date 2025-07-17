import React, { memo } from 'react';

interface GameStatsProps {
  score: number;
  chainCount: number;
}

export const GameStats: React.FC<GameStatsProps> = memo(({ score, chainCount }) => {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="bg-coffee-light/20 rounded-lg p-3">
        <div className="text-coffee-dark/60 text-xs">SCORE</div>
        <div className="text-xl font-bold text-coffee-dark">
          {score.toLocaleString()}
        </div>
      </div>
      <div className="bg-coffee-light/20 rounded-lg p-3">
        <div className="text-coffee-dark/60 text-xs">CHAIN</div>
        <div className="text-xl font-bold text-coffee-dark">
          {chainCount}
        </div>
      </div>
    </div>
  );
});