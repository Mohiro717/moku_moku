import React from 'react';
import { Button } from '../ui/Button';
import { NextPiecePreview } from './NextPiecePreview';
import { GameStats } from './GameStats';
import { GameStatusIndicator } from './GameStatusIndicator';
import { GameInstructions } from './GameInstructions';
import type { GameState } from '../../types/game';

interface GameControlsProps {
  gameState: GameState;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onStart,
  onPause,
  onRestart
}) => {
  return (
    <div className="space-y-4">
      {/* Next Puyo Preview */}
      <NextPiecePreview nextPair={gameState.nextPair} />

      {/* Game Status */}
      <div className="text-center space-y-2">
        <GameStats score={gameState.score} chainCount={gameState.chainCount} />
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col space-y-2">
        {!gameState.isPlaying ? (
          <Button
            onClick={onStart}
            variant="primary"
            size="lg"
          >
            {gameState.isGameOver ? 'New Game' : 'Start Game'}
          </Button>
        ) : (
          <Button
            onClick={onPause}
            variant="primary"
            size="lg"
          >
            {gameState.isPaused ? 'Resume' : 'Pause'}
          </Button>
        )}
        
        <Button
          onClick={onRestart}
          variant="secondary"
          size="sm"
        >
          Restart
        </Button>
      </div>

      {/* Game Instructions */}
      <GameInstructions />

      {/* Game Status Indicators */}
      <GameStatusIndicator gameState={gameState} />
    </div>
  );
};