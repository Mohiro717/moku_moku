import React, { memo } from 'react';
import type { GameState } from '../../types/game';

interface GameStatusIndicatorProps {
  gameState: GameState;
}

export const GameStatusIndicator: React.FC<GameStatusIndicatorProps> = memo(({ gameState }) => {
  return (
    <div className="text-center">
      {gameState.isChaining && (
        <div className="text-sm text-vivid-green font-medium animate-pulse">
          ⚡ CHAIN {gameState.chainCount}!
        </div>
      )}
      {gameState.isPaused && (
        <div className="text-sm text-vivid-pink font-medium">
          ⏸️ PAUSED
        </div>
      )}
      {gameState.isGameOver && (
        <div className="text-sm text-coffee-dark font-medium">
          💀 GAME OVER
        </div>
      )}
      {gameState.isPlaying && !gameState.isPaused && !gameState.isChaining && (
        <div className="text-sm text-vivid-green font-medium">
          ▶️ PLAYING
        </div>
      )}
    </div>
  );
});