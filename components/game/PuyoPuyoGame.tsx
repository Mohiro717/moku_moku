import React, { useRef, useState } from 'react';
import { GameGrid } from './GameGrid';
import { useChainFx } from './ChainFx';
import { GameControls } from './GameControls';
import { TouchControls } from './TouchControls';
import { ErrorBoundary } from '../ErrorBoundary';
import { GameErrorFallback } from './GameErrorFallback';
import { usePuyoGame } from '../../hooks/usePuyoGame';
import { useCharacterReactions } from '../../hooks/game/useCpuCharacterReactions';
import { useSoloGameSound } from '../../hooks/game/useVsGameSound';
import { isMuted, setMuted, unlockAudio } from '../../utils/gameAudio';
import { isPinch } from '../../utils/boardStatus';
import { FANWORKS_URL, allAllyVoicesOf, allyLinesOf, allyVoiceOf, characterById } from '../../constants/cpuCharacters';
import { AllyCharacterPanel, CpuCutinOverlay, KitanCredit } from './CpuCharacter';
import './wapop.css';

interface PuyoPuyoGameProps {
  /** いっしょにあそぶキャラ（見た目と声だけ。性能の差はない） */
  playerCharacterId: string;
  /** おしまいの「キャラをかえる」で、キャラえらびに戻る */
  onChangeCharacter?: () => void;
}

const IDLE_SIDE = { isChaining: false, currentChainStep: 0 };

export const PuyoPuyoGame: React.FC<PuyoPuyoGameProps> = ({ playerCharacterId, onChangeCharacter }) => {
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

  // 選んだキャラが、あるじどのの味方として横で言う（対戦の自分の側と同じ台詞・声。相手がいないので、受ける・勝つ台詞は出ない）
  const character = characterById(playerCharacterId);
  const ally = useCharacterReactions({
    character,
    lines: allyLinesOf(character),
    isGameOver: gameState.isGameOver,
    won: false,
    self: gameState,
    opponent: IDLE_SIDE,
    selfOjama: 0,
    selfPinch: isPinch(gameState.grid)
  });
  useSoloGameSound({
    gameState,
    ally: { ...ally, character, voiceSrc: (kind, n) => allyVoiceOf(character, kind, n), voices: allAllyVoicesOf(character) }
  });

  // 連鎖の演出（火花・衝撃の輪・揺れ・集中線・判子）。対戦と同じもの
  const boardRef = useRef<HTMLDivElement>(null);
  useChainFx(gameState, boardRef);

  const [muted, setMutedState] = useState(isMuted);
  const toggleMuted = () => {
    unlockAudio();
    setMuted(!muted);
    setMutedState(!muted);
  };
  const handleStart = () => {
    unlockAudio();
    startGame();
  };

  // 盤面に重ねるボタン：はじまる前・ひとやすみ・おしまいのとき、目線の先で押せるように
  const startPrompt = !gameState.isPlaying && !gameState.isGameOver ? (
    <div className="wp-pop-in flex flex-col items-center gap-3">
      <button type="button" onClick={handleStart} className="wp-btn wp-btn-sakura px-8 py-3 text-xl">はじめる</button>
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
    <>
      <button type="button" onClick={handleStart} className="wp-btn wp-btn-sakura py-2.5 text-base">もういちど</button>
      {onChangeCharacter && (
        <button type="button" onClick={onChangeCharacter} className="wp-btn wp-btn-kinari py-2 text-sm">キャラをかえる</button>
      )}
    </>
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
          {/* タグと おと のボタンは ひとかたまりで、入らなければ いっしょに次の行へ */}
          <div className="flex items-center gap-2 ml-auto whitespace-nowrap">
            <span className="wp-tag whitespace-nowrap">のんびり れんさ</span>
            <button
              type="button"
              onClick={toggleMuted}
              aria-pressed={!muted}
              aria-label={muted ? 'おとを出す' : 'おとを消す'}
              className="wp-btn wp-btn-kinari whitespace-nowrap px-3 py-1 text-xs sm:text-sm"
            >
              {muted ? '🔇 おと' : '🔊 おと'}
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto mb-4 [contain:inline-size]">
          <AllyCharacterPanel character={character} line={ally.line} />
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
              <div ref={boardRef} className="relative">
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
              {/* 3連鎖から、選んだキャラの必殺カットインを盤面に重ねる */}
              <CpuCutinOverlay cutin={ally.cutin} name={character.name} />
              </div>
            </TouchControls>
          </div>
        </div>

        <div className="mt-3 text-center">
          <KitanCredit url={FANWORKS_URL} />
        </div>
      </div>
    </ErrorBoundary>
  );
};
