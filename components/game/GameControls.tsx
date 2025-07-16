import React from 'react';
import { Puyo } from './Puyo';
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
      {gameState.nextPair && (
        <div className="bg-coffee-light/20 rounded-lg p-3">
          <div className="text-coffee-dark/60 text-xs mb-2 text-center">NEXT</div>
          <div className="flex flex-col items-center space-y-1">
            <Puyo color={gameState.nextPair.sub} />
            <Puyo color={gameState.nextPair.main} />
          </div>
        </div>
      )}

      {/* Game Status */}
      <div className="text-center space-y-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-coffee-light/20 rounded-lg p-3">
            <div className="text-coffee-dark/60 text-xs">SCORE</div>
            <div className="text-xl font-bold text-coffee-dark">
              {gameState.score.toLocaleString()}
            </div>
          </div>
          <div className="bg-coffee-light/20 rounded-lg p-3">
            <div className="text-coffee-dark/60 text-xs">CHAIN</div>
            <div className="text-xl font-bold text-coffee-dark">
              {gameState.chainCount}
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col space-y-2">
        {!gameState.isPlaying ? (
          <button
            onClick={onStart}
            className="
              px-6 py-3 
              bg-vivid-green text-white 
              rounded-lg font-bold 
              transition-all duration-200 
              hover:bg-vivid-green/80 hover:scale-105
              active:scale-95
              shadow-lg
            "
          >
            {gameState.isGameOver ? 'New Game' : 'Start Game'}
          </button>
        ) : (
          <button
            onClick={onPause}
            className="
              px-6 py-3 
              bg-vivid-pink text-white 
              rounded-lg font-bold 
              transition-all duration-200 
              hover:bg-vivid-pink/80 hover:scale-105
              active:scale-95
              shadow-lg
            "
          >
            {gameState.isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
        
        <button
          onClick={onRestart}
          className="
            px-4 py-2 
            bg-coffee-mid text-white 
            rounded-lg font-medium text-sm
            transition-all duration-200 
            hover:bg-coffee-dark hover:scale-105
            active:scale-95
            shadow-md
          "
        >
          Restart
        </button>
      </div>

      {/* Game Instructions */}
      <div className="text-xs text-coffee-dark/60 text-center space-y-1">
        <p className="font-medium">操作方法:</p>
        <div className="hidden md:block space-y-1">
          <p>← → 左右移動</p>
          <p>↑ 回転</p>
          <p>↓ 高速落下</p>
        </div>
        <div className="md:hidden space-y-1">
          <p>📱 タップ: 回転</p>
          <p>👆 スライド: 移動・落下</p>
          <p>⚡ フリック↓: 瞬間落下</p>
        </div>
        <p className="mt-2 font-medium">ルール:</p>
        <p>同色4個以上つなげて消去</p>
        <p>連鎖でボーナス得点!</p>
        <p className="text-red-400">上端ラインに達するとゲームオーバー</p>
      </div>

      {/* Game Status Indicators */}
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
    </div>
  );
};