import React, { useRef, useState } from 'react';
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
import { CpuCharacterPanel, CpuCutinOverlay, KitanCredit } from './CpuCharacter';
import { FANWORKS_URL, characterById } from '../../constants/cpuCharacters';
import { countOjama, isPinch, topRow } from '../../utils/boardStatus';
import type { GameDifficulty, GameResult, PuyoPair } from '../../types/game';

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

/** 盤面のすぐ横に置く「つぎ」と「とくてん」（本家と同じく、目線を盤面から外さずに読める位置）。children はその下に足す */
const SideInfo: React.FC<{ nextPair: PuyoPair | null; score: number; accent?: boolean; className?: string; children?: React.ReactNode }> = ({ nextPair, score, accent = false, className = '', children }) => (
  // 上の余白はおじゃま予告の高さ（OjamaNotice の h-10 + mb-1.5）。盤面の上端にそろえる
  <div className={`mt-[2.875rem] w-[5.5rem] flex flex-col items-stretch gap-2 ${className}`}>
    {/* つぎ＝木札、とくてん＝小判（和ポップの地のまま、目が行く部品だけ道具にする） */}
    <div className="wp-kifuda-wrap">
      <div className="wp-wood wp-kifuda">
        <div className="text-xs font-serif mb-1">つぎ</div>
        <NextPiecePreview nextPair={nextPair} />
      </div>
    </div>
    <div className="wp-koban">
      <div className="text-[10px] font-serif opacity-80">とくてん</div>
      <div className={`font-serif text-sm sm:text-base tabular-nums leading-tight ${accent ? 'text-[#b8324f]' : ''}`}>{score.toLocaleString()}</div>
    </div>
    {children}
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
  // ひとやすみは試合の途中（ひとやすみ中も含む）だけ押せる
  const inMatch = gameState.isPlaying && !gameState.isGameOver;

  // 自分の盤面に重ねるボタン：はじまる前・ひとやすみ・勝ち負けのとき、目線の先で押せるように
  const startPrompt = !gameState.isPlaying && !gameState.isGameOver ? (
    <div className="wp-pop-in flex flex-col items-center gap-3">
      <button type="button" onClick={handleStart} className="wp-btn wp-btn-sakura px-8 py-3 text-xl">はじめる</button>
      <div className="hidden sm:block text-[11px] text-coffee-dark/70 font-serif text-center leading-relaxed">
        ←→ うごかす　Z / X まわす<br />↓ はやく　Space おとす
      </div>
      <div className="sm:hidden text-[11px] text-coffee-dark/70 font-serif text-center leading-relaxed">
        なぞって うごかす<br />タップ まわす　下にはじく おとす
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
      <div className="wp-seigaiha puyo-vs max-w-7xl mx-auto px-3 py-3 sm:px-5 sm:py-4 rounded-3xl border-[3px] border-coffee-dark shadow-[0_6px_0_#3b2f2f]">
        {/* 見出し：タイトル・つよさ・おと */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="font-serif text-lg sm:text-2xl text-coffee-dark flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-[#f79ab7] border-2 border-coffee-dark" />
            もくもくぷよ
          </h3>
          <div className="flex items-center gap-2 ml-auto">
            <span className="wp-tag !hidden sm:!inline-block" style={{ background: '#fff4d6' }}>つよさ：{DIFFICULTY_LABELS[gameState.difficulty]}</span>
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

        {/* 盤面まわり。並びは puyoAnimations.css の .puyo-vs-grid（本家型）：
            lg 以上: 自分の盤面 | 自分のつぎ・とくてん | 相手のつぎ・とくてん | 相手の盤面
            lg 未満: 自分の盤面を大きく、右に自分のつぎ・とくてんと相手の小さな盤面 */}
        <div className="puyo-vs-grid relative">
          <div className="[grid-area:p-head] self-stretch hidden lg:flex items-end font-serif text-lg text-coffee-dark pl-1">あなた</div>
          {/* 台詞の長さで列が広がらないように（広がると相手の盤面が伸び、つぎ・とくてんが盤面から離れる） */}
          <div className="[grid-area:c-head] [contain:inline-size]">
            <CpuCharacterPanel character={character} line={line} />
          </div>

          <div className="[grid-area:p-field]">
            <div ref={playerNoticeRef}>
              <OjamaNotice
                count={gameState.pendingOjamaPlayer}
                ready={gameState.isPlaying && !gameState.cpu.isChaining}
                hit={hits.player}
              />
            </div>
            <div ref={playerBoardRef} className="relative">
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
            </div>
          </div>
          <SideInfo className="[grid-area:p-side]" nextPair={gameState.player.nextPair} score={gameState.player.score} accent>
            {/* ひとやすみ・やりなおすは、いつでも盤面のすぐ横で押せるように常に出す */}
            <button type="button" onClick={handlePause} disabled={!inMatch} className="wp-plank wp-wood whitespace-nowrap py-1.5 text-xs sm:text-sm">
              {gameState.isPaused ? 'つづける' : 'ひとやすみ'}
            </button>
            <button type="button" onClick={handleRestart} className="wp-plank wp-wood wp-plank-light whitespace-nowrap py-1.5 text-xs sm:text-sm">
              やりなおす
            </button>
          </SideInfo>

          <SideInfo className="[grid-area:c-side] hidden lg:flex" nextPair={gameState.cpu.nextPair} score={gameState.cpu.score} />
          <div className="[grid-area:c-field] puyo-vs-cpu-field">
            <div ref={cpuNoticeRef}>
              <OjamaNotice
                count={gameState.pendingOjamaCpu}
                ready={gameState.isPlaying && !gameState.player.isChaining}
                hit={hits.cpu}
              />
            </div>
            <div ref={cpuBoardRef} className="relative">
              <GameGrid
                grid={gameState.cpu.grid}
                currentPair={gameState.cpu.currentPair}
                getPairPositions={getCpuPairPositions}
                isGameOver={gameState.cpu.isGameOver}
                isPaused={gameState.isPaused}
                gameResult={getGameResult(gameState.isGameOver, gameState.winner, 'cpu')}
                chainStep={gameState.cpu.currentChainStep}
              />
            </div>
          </div>
          {/* 必殺カットイン：lg 以上は相手の盤面に、スマホでは盤面まわり全体に重ねる */}
          <div className="puyo-vs-cutin pointer-events-none absolute inset-0">
            <CpuCutinOverlay cutin={cutin} name={character.name} />
          </div>
        </div>

        <AttackBeamLayer beams={beams} />

        <div className="mt-3 text-center">
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
