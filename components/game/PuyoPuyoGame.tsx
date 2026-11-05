import React from 'react';
import { GameGrid } from './GameGrid';
import { GameControls } from './GameControls';
import { TouchControls } from './TouchControls';
import { ErrorBoundary } from '../ErrorBoundary';
import { GameErrorFallback } from './GameErrorFallback';
import { usePuyoGame } from '../../hooks/usePuyoGame';

export const PuyoPuyoGame: React.FC = () => {
  const {
    gameState,
    startGame,
    pauseGame,
    restartGame,
    getPairPositions,
    movePair,
    rotatePair,
    rotateClockwise,
    rotateCounterClockwise,
    hardDropPair
  } = usePuyoGame();

  return (
    <ErrorBoundary fallback={GameErrorFallback}>
      <div className="max-w-4xl mx-auto p-6 bg-ivory rounded-3xl shadow-lg">
        {/* Game Title */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-serif text-coffee-dark mb-2">
            Moku Moku Puyo - シングルプレイ
          </h3>
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
            <TouchControls
              onMove={movePair}
              onRotateClockwise={rotateClockwise}
              onRotateCounterClockwise={rotateCounterClockwise}
              onHardDrop={hardDropPair}
              isActive={gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver}
            >
              <GameGrid
                grid={gameState.grid}
                currentPair={gameState.currentPair}
                getPairPositions={getPairPositions}
                isGameOver={gameState.isGameOver}
                isPaused={gameState.isPaused}
                chainStep={gameState.currentChainStep}
              />
            </TouchControls>
          </div>
        </div>

        {/* Game focus reminder */}
        <div className="mt-6 text-center text-xs text-coffee-dark/60 font-serif">
          <p className="mt-1 font-serif">
            {gameState.isPlaying && !gameState.isPaused 
              ? "ゲーム中です！集中してプレイしましょう 🎮" 
              : "リラックスタイムにぴったりなパズルゲームです ☕"
            }
          </p>
        </div>
      </div>
    </ErrorBoundary>
  );
};