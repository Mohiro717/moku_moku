import React from 'react';
import { Button } from '../ui/Button';
import type { GameState, GameDimensions } from '../../types/bananaGame';
import { BANANA_GAME_CONFIG } from '../../constants/bananaGameConfig';

interface GameAreaProps {
  gameState: GameState;
  dimensions: GameDimensions;
  onBananaClick: () => void;
  onStartGame: () => void;
  onResetGame: () => void;
}

export const GameArea: React.FC<GameAreaProps> = ({
  gameState,
  dimensions,
  onBananaClick,
  onStartGame,
  onResetGame,
}) => {
  return (
    <div 
      className="relative bg-coffee-dark rounded-xl overflow-hidden mb-6 mx-auto" 
      style={{ 
        width: `${dimensions.width}px`, 
        height: `${dimensions.height}px` 
      }}
    >
      {!gameState.isPlaying && !gameState.isGameOver ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={onStartGame}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-serif px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            🍌 ゲームスタート
          </Button>
        </div>
      ) : gameState.isGameOver ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-coffee-dark/90">
          <div className="text-white text-center">
            <div className="text-2xl font-serif mb-2">ゲーム終了！</div>
            <div className="text-xl font-serif mb-4">Score: {gameState.score}</div>
            <Button
              onClick={onResetGame}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-serif px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🔄 もう一度プレイ
            </Button>
          </div>
        </div>
      ) : (
        <button
          onTouchStart={onBananaClick}
          onMouseDown={onBananaClick}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 text-4xl hover:scale-110 transition-transform cursor-pointer select-none"
          style={{
            left: gameState.banana.x + BANANA_GAME_CONFIG.BANANA_SIZE / 2,
            top: gameState.banana.y + BANANA_GAME_CONFIG.BANANA_SIZE / 2,
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          🍌
        </button>
      )}
    </div>
  );
};