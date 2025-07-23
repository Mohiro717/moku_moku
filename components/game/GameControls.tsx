import React from 'react';
import { Button } from '../ui/Button';
import { NextPiecePreview } from './NextPiecePreview';
import { GameStats } from './GameStats';
import { GameStatusIndicator } from './GameStatusIndicator';
import { GameInstructionsCommon } from './GameInstructionsCommon';
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
        <GameStats 
          score={gameState.score} 
          chainCount={gameState.chainCount}
          isChaining={gameState.isChaining}
          chainAnimationStep={gameState.chainAnimationStep}
          currentChainStep={gameState.currentChainStep}
        />
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col space-y-2">
        {!gameState.isPlaying ? (
          <button
            onClick={onStart}
            className="w-full py-3 px-4 bg-gradient-to-r from-vivid-pink to-vivid-green text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-vivid-pink/90 hover:to-vivid-green/90"
          >
            {gameState.isGameOver ? 'New Game' : 'Start Game'}
          </button>
        ) : (
          <button
            onClick={onPause}
            className="w-full py-3 px-4 bg-gradient-to-r from-vivid-pink to-vivid-green text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-vivid-pink/90 hover:to-vivid-green/90"
          >
            {gameState.isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
        
        <button
          onClick={onRestart}
          className="w-full py-2 px-4 bg-gradient-to-r from-coffee-light to-coffee-mid text-white rounded-xl font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 hover:from-coffee-light/90 hover:to-coffee-mid/90"
        >
          Restart
        </button>
      </div>

      {/* Game Instructions */}
      <GameInstructionsCommon />
    </div>
  );
};