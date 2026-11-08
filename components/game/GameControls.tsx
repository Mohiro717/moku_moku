import React from 'react';
import { NextPiecePreview } from './NextPiecePreview';
import type { GameState } from '../../types/game';
import './wapop.css';

interface GameControlsProps {
  gameState: GameState;
  onPause: () => void;
  onRestart: () => void;
}

/** ひとりであそぶ：盤面の横の札（つぎ・とくてん・れんさ・ボタン）
 *  はじめる・もういちど・つづける は盤面に重ねて出すので、ここには置かない（2つ並んでいた）。
 *  ここは対戦の画面と同じ木の板で、ひとやすみ・やりなおす だけ */
export const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onPause,
  onRestart
}) => {
  // ひとやすみは試合の途中（ひとやすみ中も含む）だけ押せる
  const inMatch = gameState.isPlaying && !gameState.isGameOver;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
      <div className="wp-card p-3 text-center">
        <div className="text-sm font-serif text-coffee-dark mb-2">つぎ</div>
        <div className="inline-block">
          <NextPiecePreview nextPair={gameState.nextPair} nextNextPair={gameState.nextNextPair} />
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

      <div className="col-span-2 lg:col-span-1 flex lg:flex-col justify-center items-center gap-2 pt-1">
        <button type="button" onClick={onPause} disabled={!inMatch} className="wp-plank wp-wood whitespace-nowrap w-[6.5rem] py-1.5 text-xs sm:text-sm">
          {gameState.isPaused ? 'つづける' : 'ひとやすみ'}
        </button>
        <button type="button" onClick={onRestart} className="wp-plank wp-wood wp-plank-light whitespace-nowrap w-[6.5rem] py-1.5 text-xs sm:text-sm">
          やりなおす
        </button>
      </div>
    </div>
  );
};
