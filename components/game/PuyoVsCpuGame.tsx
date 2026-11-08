import React, { useLayoutEffect, useRef, useState } from 'react';
import { AttackBeamLayer, useAttackBeams } from './AttackBeams';
import { useChainFx, type PopRecord } from './ChainFx';
import { GameGrid } from './GameGrid';
import { ErrorBoundary } from '../ErrorBoundary';
import { GameErrorFallback } from './GameErrorFallback';
import { TouchControls } from './TouchControls';
import { NextPiecePreview } from './NextPiecePreview';
import { OjamaNotice } from './OjamaNotice';
import { useVsCpuGame } from '../../hooks/useVsCpuGame';
import { useCpuCharacterReactions } from '../../hooks/game/useCpuCharacterReactions';
import { useVsGameSound } from '../../hooks/game/useVsGameSound';
import { isMuted, setMuted, unlockAudio } from '../../utils/gameAudio';
import './wapop.css';
import { CpuCharacterPanel, CpuCutinOverlay, KitanCredit, PlayerPanel } from './CpuCharacter';
import { FANWORKS_URL, characterById } from '../../constants/cpuCharacters';
import { countOjama, isPinch, topRow } from '../../utils/boardStatus';
import type { GameDifficulty, GameResult } from '../../types/game';

// 強さの呼び名（和ポップ）。相手えらびの画面でも使う
export const DIFFICULTY_LABELS: Record<GameDifficulty, string> = {
  easy: 'やさしい',
  normal: 'ふつう',
  hard: 'つよい'
};

interface PuyoVsCpuGameProps {
  initialDifficulty?: GameDifficulty;
  /** 対戦相手のキャラ（強さとは別に選ぶ） */
  characterId: string;
  /** 「あいてをかえる」で相手えらびに戻る */
  onChangeOpponent?: () => void;
}

// Utility functions
const getGameResult = (isGameOver: boolean, winner: string | null, player: 'player' | 'cpu'): GameResult => {
  if (!isGameOver) return null;
  if (winner === player) return 'win';
  return 'lose';
};

/** れんさ欄の1マス。勝っている側を桜色にし、数ははんこで押す */
const ChainBox: React.FC<{ label: string; count: number; lead: boolean }> = ({ label, count, lead }) => (
  <div className={`rounded-xl border-2 border-coffee-dark py-2 text-center ${lead ? 'bg-[#fde7ee]' : 'bg-white'}`}>
    <div className="text-[11px] font-serif text-coffee-dark/70 truncate px-1">{label}</div>
    {count > 0 ? (
      <span key={count} className="wp-hanko wp-hanko-in mt-1 px-2 py-0.5 text-sm">{count}れんさ</span>
    ) : (
      <div className="mt-1 text-sm font-serif text-coffee-dark/30">—</div>
    )}
  </div>
);

/** 盤面の下の枠に乗せる、とくてんの札 */
const ScorePill: React.FC<{ score: number; accent?: boolean }> = ({ score, accent = false }) => (
  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 wp-tag !px-3 !py-1.5 whitespace-nowrap" style={{ background: '#fffdf7' }}>
    <span className="text-[10px] text-coffee-dark/60 mr-1.5">とくてん</span>
    <span className={`text-base ${accent ? 'text-[#e5598a]' : 'text-coffee-dark'}`}>{score.toLocaleString()}</span>
  </div>
);

export const PuyoVsCpuGame: React.FC<PuyoVsCpuGameProps> = ({ initialDifficulty = 'normal', characterId, onChangeOpponent }) => {
  try {
    const {
      gameState,
      startGame,
      pauseGame,
      restartGame,
      movePlayerPair,
      rotatePlayerPair,
      hardDropPlayerPair,
      getPlayerPairPositions,
      getCpuPairPositions
    } = useVsCpuGame(initialDifficulty);

    // 攻撃の光：盤面と予告欄の位置を取るための参照
    const playerBoardRef = useRef<HTMLDivElement>(null);
    const cpuBoardRef = useRef<HTMLDivElement>(null);
    const playerNoticeRef = useRef<HTMLDivElement>(null);
    const cpuNoticeRef = useRef<HTMLDivElement>(null);
    // 連鎖の演出：消えたぷよの位置を覚え、攻撃の光の出発点にする
    const playerPops = useRef<PopRecord | null>(null);
    const cpuPops = useRef<PopRecord | null>(null);
    useChainFx(gameState?.player, playerBoardRef, playerPops);
    useChainFx(gameState?.cpu, cpuBoardRef, cpuPops);
    const { beams, hits } = useAttackBeams({
      pending: { player: gameState?.pendingOjamaPlayer ?? 0, cpu: gameState?.pendingOjamaCpu ?? 0 },
      chaining: { player: !!gameState?.player.isChaining, cpu: !!gameState?.cpu.isChaining },
      boards: { player: playerBoardRef, cpu: cpuBoardRef },
      notices: { player: playerNoticeRef, cpu: cpuNoticeRef },
      pops: { player: playerPops, cpu: cpuPops }
    });

    const character = characterById(characterId);
    const idleSide = { isChaining: false, currentChainStep: 0 };
    const cpuPinch = gameState ? isPinch(gameState.cpu.grid) : false;
    const playerPinch = gameState ? isPinch(gameState.player.grid) : false;
    // 相手の「ピンチ」の台詞は、相手のほうが高く積もっているときだけ（こちらが危ないのに相手があせるのを防ぐ）
    const cpuLosing = !!gameState && cpuPinch && topRow(gameState.cpu.grid) < topRow(gameState.player.grid);
    const { line, lineKind, lineIndex, lineTick, cutin } = useCpuCharacterReactions({
      character,
      isGameOver: !!gameState?.isGameOver,
      winner: gameState?.winner ?? null,
      player: gameState?.player ?? idleSide,
      cpu: gameState?.cpu ?? idleSide,
      cpuOjama: gameState ? countOjama(gameState.cpu.grid) : 0,
      cpuPinch: cpuLosing
    });

    useVsGameSound({ gameState, character, lineKind, lineIndex, lineTick, cutin, pinch: cpuPinch || playerPinch });

    // 左右の盤面の上端をそろえる：相手の札（台詞で高さが変わる）の高さを自分の札にも使う
    const cpuPanelRef = useRef<HTMLDivElement>(null);
    const [panelHeight, setPanelHeight] = useState<number>();
    useLayoutEffect(() => {
      const el = cpuPanelRef.current;
      if (!el) return;
      const observer = new ResizeObserver(() => setPanelHeight(el.offsetHeight));
      observer.observe(el);
      return () => observer.disconnect();
    }, [!!gameState]);
    const [muted, setMutedState] = useState(isMuted);
    const toggleMuted = () => {
      unlockAudio();
      setMuted(!muted);
      setMutedState(!muted);
    };

    if (!gameState) {
      return (
        <div className="wp-seigaiha max-w-7xl mx-auto p-6 rounded-3xl text-center font-serif text-coffee-dark">
          じゅんびちゅう…
        </div>
      );
    }

  const handleStart = () => {
    unlockAudio();
    startGame();
  };

  const handlePause = () => {
    unlockAudio();
    pauseGame();
  };

  const handleRestart = () => {
    unlockAudio();
    restartGame();
  };


  // タッチ操作用のハンドラー（キーボード操作はusePuyoGameが自動処理）
  const handlePlayerMove = (direction: 'left' | 'right' | 'down') => {
    movePlayerPair(direction);
  };

  const handlePlayerRotateClockwise = () => {
    rotatePlayerPair(true);
  };

  const handlePlayerRotateCounterClockwise = () => {
    rotatePlayerPair(false);
  };

  const playing = gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver;

  // 自分の盤面に重ねるボタン：はじまる前・ひとやすみ・勝ち負けのとき、目線の先で押せるように
  const startPrompt = !gameState.isPlaying && !gameState.isGameOver ? (
    <div className="wp-pop-in flex flex-col items-center gap-3">
      <div className="font-serif text-coffee-dark text-sm">VS {character.name}</div>
      <button type="button" onClick={handleStart} className="wp-btn wp-btn-sakura px-8 py-3 text-xl">はじめる</button>
      <div className="text-[11px] text-coffee-dark/70 font-serif text-center leading-relaxed">
        ←→ うごかす　Z / X まわす<br />↓ はやく　Space おとす
      </div>
    </div>
  ) : undefined;

  const resultActions = gameState.isGameOver ? (
    <>
      <button type="button" onClick={handleRestart} className="wp-btn wp-btn-sakura py-2.5 text-base">もういちど</button>
      {onChangeOpponent && (
        <button type="button" onClick={onChangeOpponent} className="wp-btn wp-btn-kinari py-2 text-sm">あいてをかえる</button>
      )}
    </>
  ) : gameState.isPaused ? (
    <button type="button" onClick={handlePause} className="wp-btn wp-btn-sakura py-2.5 text-base">つづける</button>
  ) : null;

  return (
    <ErrorBoundary fallback={GameErrorFallback}>
      <div className="wp-seigaiha max-w-7xl mx-auto px-3 py-4 sm:p-5 rounded-3xl border-[3px] border-coffee-dark shadow-[0_6px_0_#3b2f2f]">
        {/* 見出し：タイトルと、いまの相手・強さ */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="font-serif text-xl sm:text-2xl text-coffee-dark flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-[#f79ab7] border-2 border-coffee-dark" />
            ぬばたま落とし
            <span className="text-xs text-coffee-dark/60">CPUたいせん</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="wp-tag">VS {character.name}</span>
            <span className="wp-tag" style={{ background: '#fff4d6' }}>つよさ：{DIFFICULTY_LABELS[gameState.difficulty]}</span>
          </div>
        </div>

        {/* Main Game Layout
            xl 以上: 自分 | 情報 | CPU の3列
            md〜xl: 情報を上に横長で置き、その下に2つの盤面を横並び
            md 未満: 縦に積む */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 items-start">

          {/* Player Field - Left Side */}
          <div className="md:col-span-1 xl:col-span-2 order-2 xl:order-1">
            <PlayerPanel minHeight={panelHeight} />
            <div ref={playerNoticeRef}>
              <OjamaNotice
                count={gameState.pendingOjamaPlayer}
                ready={gameState.isPlaying && !gameState.cpu.isChaining}
                hit={hits.player}
              />
            </div>

            {/* Player Game Grid */}
            <div ref={playerBoardRef} className="relative flex justify-center pb-4">
              <TouchControls
                onMove={(direction) => handlePlayerMove(direction)}
                onRotateClockwise={handlePlayerRotateClockwise}
                onRotateCounterClockwise={handlePlayerRotateCounterClockwise}
                onHardDrop={hardDropPlayerPair}
                isActive={playing}
              >
                <GameGrid
                  grid={gameState.player.grid}
                  currentPair={gameState.player.currentPair}
                  getPairPositions={getPlayerPairPositions}
                  isGameOver={gameState.player.isGameOver}
                  isPaused={gameState.isPaused}
                  gameResult={getGameResult(gameState.isGameOver, gameState.winner, 'player')}
                  chainStep={gameState.player.currentChainStep}
                  startPrompt={startPrompt}
                  actions={resultActions}
                />
              </TouchControls>
              <ScorePill score={gameState.player.score} accent />
            </div>
          </div>

          {/* Central Info Area */}
          <div className="md:col-span-2 xl:col-span-1 order-1 xl:order-2">
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-1 gap-3">

              {/* つぎのぷよ（自分と相手） */}
              <div className="wp-card p-3 col-span-1">
                <div className="text-center text-sm font-serif text-coffee-dark mb-2">つぎ</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="text-[11px] text-coffee-dark/70 mb-1 font-serif">あなた</div>
                    <NextPiecePreview nextPair={gameState.player.nextPair} />
                  </div>
                  <div className="text-center">
                    <div className="text-[11px] text-coffee-dark/70 mb-1 font-serif truncate">{character.name}</div>
                    <NextPiecePreview nextPair={gameState.cpu.nextPair} />
                  </div>
                </div>
              </div>

              {/* れんさ */}
              <div className="wp-card p-3 col-span-1">
                <div className="text-center text-sm font-serif text-coffee-dark mb-2">れんさ</div>
                <div className="grid grid-cols-2 gap-2">
                  <ChainBox label="あなた" count={gameState.player.chainCount} lead={gameState.player.chainCount > gameState.cpu.chainCount} />
                  <ChainBox label={character.name} count={gameState.cpu.chainCount} lead={gameState.cpu.chainCount > gameState.player.chainCount} />
                </div>
              </div>

              {/* Game Controls */}
              <div className="col-span-2 xl:col-span-1 flex flex-col gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={gameState.isPlaying ? handlePause : handleStart}
                  className={`wp-btn ${playing ? 'wp-btn-kinari' : 'wp-btn-sakura'} w-full py-2.5 text-base`}
                  disabled={gameState.isGameOver}
                >
                  {gameState.isGameOver ? 'しょうぶあり' :
                   gameState.isPlaying ? (gameState.isPaused ? 'つづける' : 'ひとやすみ') : 'はじめる'}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={handleRestart} className="wp-btn wp-btn-yamabuki py-2 text-sm">
                    やりなおす
                  </button>
                  <button
                    type="button"
                    onClick={toggleMuted}
                    aria-pressed={!muted}
                    aria-label={muted ? 'おとを出す' : 'おとを消す'}
                    className="wp-btn wp-btn-kinari py-2 text-sm"
                  >
                    {muted ? '🔇 おと' : '🔊 おと'}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* CPU Field - Right Side */}
          <div className="relative md:col-span-1 xl:col-span-2 order-3">
            <CpuCharacterPanel ref={cpuPanelRef} character={character} line={line} />
            <div ref={cpuNoticeRef}>
              <OjamaNotice
                count={gameState.pendingOjamaCpu}
                ready={gameState.isPlaying && !gameState.player.isChaining}
                hit={hits.cpu}
              />
            </div>

            {/* CPU Game Grid */}
            <div ref={cpuBoardRef} className="relative flex justify-center pb-4">
                <GameGrid
                  grid={gameState.cpu.grid}
                  currentPair={gameState.cpu.currentPair}
                  getPairPositions={getCpuPairPositions}
                  isGameOver={gameState.cpu.isGameOver}
                  isPaused={gameState.isPaused}
                  gameResult={getGameResult(gameState.isGameOver, gameState.winner, 'cpu')}
                  chainStep={gameState.cpu.currentChainStep}
                />
              <ScorePill score={gameState.cpu.score} />
            </div>
            <CpuCutinOverlay cutin={cutin} name={character.name} />
          </div>
        </div>

        <AttackBeamLayer beams={beams} />

        <div className="mt-4 text-center">
          <KitanCredit url={FANWORKS_URL} />
        </div>
      </div>
    </ErrorBoundary>
  );
  } catch (error) {
    console.error('PuyoVsCpuGame error:', error);
    return (
      <div className="max-w-7xl mx-auto p-6 bg-red-100 rounded-3xl shadow-lg">
        <div className="text-center">
          <h3 className="text-3xl font-serif text-red-800 mb-2">
            エラーが発生しました
          </h3>
          <p className="text-sm text-red-600 mb-4">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            ページをリロード
          </button>
        </div>
      </div>
    );
  }
};
