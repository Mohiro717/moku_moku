import React from 'react';
import { NextPiecePreview } from './NextPiecePreview';
import type { GameState } from '../../types/game';
import './wapop.css';

interface GameControlsProps {
  gameState: GameState;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
}

/** ひとりであそぶ：盤面の横の札（つぎ・とくてん・れんさ・ボタン） */
export const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onStart,
  onPause,
  onRestart
}) => {
  const playing = gameState.isPlaying && !gameState.isPaused;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
      <div className="wp-card p-3 text-center">
        <div className="text-sm font-serif text-coffee-dark mb-2">つぎ</div>
        <div className="inline-block">
          <NextPiecePreview nextPair={gameState.nextPair} />
        </div>
      </div>

      <div className="wp-card p-3 text-center flex flex-col justify-center gap-3">
        <div>
          <div className="text-[11px] font-serif text-coffee-dark/70">とくてん</div>
          <div className="text-xl font-serif text-[#e5598a]">{gameState.score.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[11px] font-serif text-coffee-dark/70">れんさ</div>
          {gameState.chainCount > 0 ? (
            <span key={gameState.chainCount} className="wp-hanko wp-hanko-in mt-1 px-2 py-0.5 text-sm">{gameState.chainCount}れんさ</span>
          ) : (
            <div className="text-sm font-serif text-coffee-dark/30">—</div>
          )}
        </div>
      </div>

      <div className="col-span-2 lg:col-span-1 flex flex-col gap-2.5 pt-1">
        <button
          type="button"
          onClick={gameState.isPlaying ? onPause : onStart}
          className={`wp-btn ${playing ? 'wp-btn-kinari' : 'wp-btn-sakura'} w-full py-2.5 text-base`}
        >
          {!gameState.isPlaying ? (gameState.isGameOver ? 'もういちど' : 'はじめる') : gameState.isPaused ? 'つづける' : 'ひとやすみ'}
        </button>
        <button type="button" onClick={onRestart} className="wp-btn wp-btn-yamabuki w-full py-2 text-sm">
          やりなおす
        </button>
      </div>
    </div>
  );
};
