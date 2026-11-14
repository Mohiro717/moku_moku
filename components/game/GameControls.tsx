import React from 'react';
import { NextPiecePreview } from './NextPiecePreview';
import type { GameState } from '../../types/game';
import './wapop.css';
import './hanafuda.css';

interface GameControlsProps {
  gameState: GameState;
  onPause: () => void;
  onRestart: () => void;
}

/** ひとりであそぶ：盤面の横の札（つぎ・とくてん・れんさ・ボタン）
 *  はじめる・もういちど・つづける は盤面に重ねて出すので、ここには置かない（2つ並んでいた）。
 *  ここは対戦の画面と同じ生成りの小さなボタン（案3b）で、ひとやすみ・やりなおす だけ */
export const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onPause,
  onRestart
}) => {
  // ひとやすみは試合の途中（ひとやすみ中も含む）だけ押せる
  const inMatch = gameState.isPlaying && !gameState.isGameOver;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
      <div className="hf-panel p-3 text-center">
        <div className="text-sm font-serif mb-2">つぎ</div>
        <div className="inline-block">
          <NextPiecePreview nextPair={gameState.nextPair} nextNextPair={gameState.nextNextPair} />
        </div>
      </div>

      <div className="hf-panel p-3 text-center flex flex-col justify-center gap-3">
        <div>
          <div className="text-xs font-serif opacity-80">とくてん</div>
          <div className="text-xl font-serif text-[#e04a36]">{gameState.score.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs font-serif opacity-80">れんさ</div>
          {gameState.chainCount > 0 ? (
            <span key={gameState.chainCount} className="wp-hanko wp-hanko-in mt-1 px-2 py-0.5 text-sm">{gameState.chainCount}れんさ</span>
          ) : (
            <div className="text-sm font-serif opacity-40">—</div>
          )}
        </div>
      </div>

      <div className="col-span-2 lg:col-span-1 flex lg:flex-col justify-center items-center gap-2 pt-1">
        <button type="button" onClick={onPause} disabled={!inMatch} className="hf-btn hf-btn-kinari hf-btn-sm w-[6.5rem] py-1.5 text-xs sm:text-sm">
          {gameState.isPaused ? 'つづける' : 'ひとやすみ'}
        </button>
        <button type="button" onClick={onRestart} className="hf-btn hf-btn-kinari hf-btn-sm w-[6.5rem] py-1.5 text-xs sm:text-sm">
          やりなおす
        </button>
      </div>
    </div>
  );
};
