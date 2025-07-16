import React from 'react';
import { GameGrid } from './GameGrid';
import { GameControls } from './GameControls';
import { usePuyoGame } from '../../hooks/usePuyoGame';

export const PuyoPuyoGame: React.FC = () => {
  const {
    gameState,
    startGame,
    pauseGame,
    restartGame,
    getPairPositions
  } = usePuyoGame();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-ivory rounded-3xl shadow-lg">
      {/* Game Title */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-coffee-dark mb-2">
          Moku Moku Puyo
        </h3>
        <p className="text-sm text-coffee-mid">
          2つ1組のぷよを操作して、同色4個以上つなげて消そう！
        </p>
      </div>

      {/* Game Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Game Controls - Left side on desktop */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <GameControls
            gameState={gameState}
            onStart={startGame}
            onPause={pauseGame}
            onRestart={restartGame}
          />
        </div>

        {/* Game Grid - Center/Right on desktop */}
        <div className="lg:col-span-3 order-1 lg:order-2 flex justify-center">
          <GameGrid
            grid={gameState.grid}
            currentPair={gameState.currentPair}
            getPairPositions={getPairPositions}
            isGameOver={gameState.isGameOver}
          />
        </div>
      </div>

      {/* Game focus reminder */}
      <div className="mt-6 text-center text-xs text-coffee-dark/60">
        <p>ゲーム開始後、キーボードの矢印キーで操作できます</p>
        <p className="mt-1">
          {gameState.isPlaying && !gameState.isPaused 
            ? "ゲーム中です！集中してプレイしましょう 🎮" 
            : "リラックスタイムにぴったりなパズルゲームです ☕"
          }
        </p>
      </div>
    </div>
  );
};