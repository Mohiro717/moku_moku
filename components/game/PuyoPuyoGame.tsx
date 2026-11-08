import React from 'react';
import { GameGrid } from './GameGrid';
import { GameControls } from './GameControls';
import { TouchControls } from './TouchControls';
import { ErrorBoundary } from '../ErrorBoundary';
import { GameErrorFallback } from './GameErrorFallback';
import { usePuyoGame } from '../../hooks/usePuyoGame';
import './wapop.css';

export const PuyoPuyoGame: React.FC = () => {
  const {
    gameState,
    startGame,
    pauseGame,
    restartGame,
    getPairPositions,
    movePair,
    rotateClockwise,
    rotateCounterClockwise,
    hardDropPair
  } = usePuyoGame();

  // 盤面に重ねるボタン：はじまる前・ひとやすみ・おしまいのとき、目線の先で押せるように
  const startPrompt = !gameState.isPlaying && !gameState.isGameOver ? (
    <div className="wp-pop-in flex flex-col items-center gap-3">
      <button type="button" onClick={startGame} className="wp-btn wp-btn-sakura px-8 py-3 text-xl">はじめる</button>
      {/* スマホではキーボードの説明でなく指の説明を出す（対戦の画面と同じ文） */}
      <div className="hidden sm:block text-[11px] text-coffee-dark/70 font-serif text-center leading-relaxed">
        ←→ うごかす　Z / X まわす<br />↓ はやく　Space おとす
      </div>
      <div className="sm:hidden text-[11px] text-coffee-dark/70 font-serif text-center leading-relaxed">
        なぞって うごかす<br />タップ まわす　下にはじく おとす
      </div>
    </div>
  ) : undefined;

  const actions = gameState.isGameOver ? (
    <button type="button" onClick={startGame} className="wp-btn wp-btn-sakura py-2.5 text-base">もういちど</button>
  ) : gameState.isPaused ? (
    <button type="button" onClick={pauseGame} className="wp-btn wp-btn-sakura py-2.5 text-base">つづける</button>
  ) : null;

  return (
    <ErrorBoundary fallback={GameErrorFallback}>
      <div className="wp-seigaiha max-w-3xl mx-auto px-3 py-4 sm:p-5 rounded-3xl border-[3px] border-coffee-dark shadow-[0_6px_0_#3b2f2f]">
        {/* 見出し：語の途中で折り返さないよう、各語を nowrap にして、入らなければタグごと次の行へ */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <h3 className="font-serif text-lg sm:text-2xl text-coffee-dark flex items-center gap-2 whitespace-nowrap">
            <span className="inline-block w-3 h-3 rounded-full bg-[#f79ab7] border-2 border-coffee-dark" />
            ぬばたま落とし
            <span className="text-xs text-coffee-dark/60">ひとりで</span>
          </h3>
          <span className="wp-tag whitespace-nowrap ml-auto">のんびり れんさ</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <GameControls
              gameState={gameState}
              onPause={pauseGame}
              onRestart={restartGame}
            />
          </div>

          <div className="lg:col-span-3 order-1 lg:order-2 flex justify-center pb-2">
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
                startPrompt={startPrompt}
                actions={actions}
              />
            </TouchControls>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
