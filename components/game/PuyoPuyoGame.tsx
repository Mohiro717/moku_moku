import React, { useRef, useState } from 'react';
import { BACK_TARGET_LABEL } from '../../constants/layout';
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
import { HfFrame, HfTitle } from './HanafudaUi';

interface PuyoPuyoGameProps {
  /** いっしょにあそぶキャラ（見た目と声だけ。性能の差はない） */
  playerCharacterId: string;
  /** おしまいの「キャラをかえる」で、キャラえらびに戻る */
  onChangeCharacter?: () => void;
  /** 見出しの「もどる」で、ゲームえらびに戻る */
  onBack?: () => void;
}

const IDLE_SIDE = { isChaining: false, currentChainStep: 0 };

export const PuyoPuyoGame: React.FC<PuyoPuyoGameProps> = ({ playerCharacterId, onChangeCharacter, onBack }) => {
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
    selfPending: 0,
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
      <button type="button" onClick={handleStart} className="hf-btn hf-btn-sumi hf-dot px-8 py-3 text-xl">はじめる</button>
      {/* スマホではキーボードの説明でなく指の説明を出す（対戦の画面と同じ文） */}
      <div className="hidden sm:block text-xs text-[#221a1f]/80 font-serif text-center leading-relaxed">
        ←→ うごかす　Z / X まわす<br />↓ はやく　Space おとす
      </div>
      <div className="sm:hidden text-xs text-[#221a1f]/80 font-serif text-center leading-relaxed">
        なぞって うごかす<br />タップ まわす　下にはじく おとす
      </div>
    </div>
  ) : undefined;

  const actions = gameState.isGameOver ? (
    <>
      <button type="button" onClick={handleStart} className="hf-btn hf-btn-sumi hf-dot py-2.5 text-base">もういちど</button>
      {onChangeCharacter && (
        <button type="button" onClick={onChangeCharacter} className="hf-btn hf-btn-kinari hf-dot py-2 text-sm">キャラをかえる</button>
      )}
    </>
  ) : gameState.isPaused ? (
    <button type="button" onClick={pauseGame} className="hf-btn hf-btn-sumi hf-dot py-2.5 text-base">つづける</button>
  ) : null;

  return (
    <ErrorBoundary fallback={GameErrorFallback}>
      <HfFrame className="max-w-3xl mx-auto px-3 py-4 sm:p-5">
        {/* 見出し（案3b の題字。盤面の画面なので跳ねさせない）：入らなければタグごと次の行へ */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <div className="flex items-baseline gap-2 whitespace-nowrap pl-1">
            <HfTitle text="ぬばたま落とし" gold={[4]} className="text-xl sm:text-[1.75rem]" />
            <span className="hf-ink text-xs font-serif">ひとりで</span>
          </div>
          {/* タグと おと・もどる のボタンは ひとかたまりで、入らなければ いっしょに次の行へ */}
          <div className="flex items-center gap-2 ml-auto whitespace-nowrap">
            <span className="hf-chip">のんびり れんさ</span>
            <button
              type="button"
              onClick={toggleMuted}
              aria-pressed={!muted}
              aria-label={muted ? 'おとを出す' : 'おとを消す'}
              className="hf-chip"
            >
              {muted ? '🔇 おと' : '🔊 おと'}
            </button>
            {onBack && (
              // ゲームえらびに戻る：枠の外にあったのを、見出しの小札へ（オーナー「一体にしたい」。ボタンは枠の外に出さない）
              <button type="button" onClick={onBack} aria-label={`${BACK_TARGET_LABEL} もどる`} className="hf-chip">
                ← <span className="hidden sm:inline">{BACK_TARGET_LABEL} </span>もどる
              </button>
            )}
          </div>
        </div>

        <div className="max-w-md mx-auto mb-4 [contain:inline-size]">
          <AllyCharacterPanel character={character} line={ally.line} />
        </div>

        {/* PC では横の札を盤面のすぐ横に寄せ、ふたつをまとめて真ん中に置く（4列のグリッドだと札と盤面のあいだが空いた。オーナー 11-14） */}
        <div className="flex flex-col lg:flex-row lg:justify-center gap-6 items-stretch lg:items-start">
          <div className="lg:w-[10.5rem] order-2 lg:order-1">
            <GameControls
              gameState={gameState}
              onPause={pauseGame}
              onRestart={restartGame}
            />
          </div>

          <div className="order-1 lg:order-2 flex justify-center pb-2">
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
      </HfFrame>
    </ErrorBoundary>
  );
};
