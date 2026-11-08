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

// つぎ＝木札、とくてん＝小判（和ポップの地のまま、目が行く部品だけ道具にする）
const NextTag: React.FC<{ nextPair: PuyoPair | null; className?: string }> = ({ nextPair, className = '' }) => (
  <div className={`wp-kifuda-wrap ${className}`}>
    <div className="wp-wood wp-kifuda">
      <div className="text-xs font-serif mb-1">つぎ</div>
      <NextPiecePreview nextPair={nextPair} />
    </div>
  </div>
);

const ScoreKoban: React.FC<{ score: number; accent?: boolean; className?: string }> = ({ score, accent = false, className = '' }) => (
  <div className={`wp-koban ${className}`}>
    <div className="text-[10px] font-serif opacity-80">とくてん</div>
    <div className={`font-serif text-sm sm:text-base tabular-nums leading-tight ${accent ? 'text-[#b8324f]' : ''}`}>{score.toLocaleString()}</div>
  </div>
);

/** lg 以上：盤面の枠の下端に出すとくてん（本家と同じく8桁） */
const BoardScore: React.FC<{ score: number; accent?: boolean }> = ({ score, accent = false }) => (
  // 幕（z-30）がかかっても本家と同じく常に見えるように、幕より上に置く
  <div className={`hidden lg:block relative z-40 mt-2 -mb-1 text-center font-serif text-2xl leading-none tabular-nums tracking-wider ${accent ? 'text-[#b8324f]' : 'text-coffee-dark'}`}>
    {String(score).padStart(8, '0')}
  </div>
);

/** lg 以上：盤面のすぐ下の名前の帯。アイコンは外側の端（相手は右端） */
const NameBand: React.FC<{ name: string; icon?: string; accent?: boolean }> = ({ name, icon, accent = false }) => (
  <div
    className="w-full flex items-center gap-2 px-3 py-1 rounded-full border-[3px] border-coffee-dark font-serif text-sm text-coffee-dark"
    style={{ background: accent ? '#fbd3df' : '#fff4d6' }}
  >
    <span className="flex-1 truncate text-center">{name}</span>
    {icon && <img src={icon} alt="" width={28} height={28} className="w-7 h-7 -my-1 -mr-2 rounded-full object-cover border-2 border-coffee-dark" />}
  </div>
);

// 上の余白はおじゃま予告の高さ（OjamaNotice の h-10 + mb-1.5）。盤面の上端にそろえる
const BOARD_TOP = 'mt-[2.875rem]';

/** スマホ・タブレット用：盤面のすぐ横に「つぎ」と「とくてん」を縦に積む。children はその下に足す */
const SideInfo: React.FC<{ nextPair: PuyoPair | null; score: number; accent?: boolean; className?: string; children?: React.ReactNode }> = ({ nextPair, score, accent = false, className = '', children }) => (
  <div className={`${BOARD_TOP} w-[5.5rem] flex flex-col items-stretch gap-2 ${className}`}>
    <NextTag nextPair={nextPair} />
    <ScoreKoban score={score} accent={accent} />
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

  const controlButtons = (
    <>
      <button type="button" onClick={handlePause} disabled={!inMatch} className="wp-plank wp-wood whitespace-nowrap py-1.5 text-xs sm:text-sm">
        {gameState.isPaused ? 'つづける' : 'ひとやすみ'}
      </button>
      <button type="button" onClick={handleRestart} className="wp-plank wp-wood wp-plank-light whitespace-nowrap py-1.5 text-xs sm:text-sm">
        やりなおす
      </button>
    </>
  );

  return (
    <ErrorBoundary fallback={GameErrorFallback}>
      <div className="wp-seigaiha puyo-vs max-w-7xl mx-auto px-3 py-3 sm:px-5 sm:py-4 rounded-3xl border-[3px] border-coffee-dark shadow-[0_6px_0_#3b2f2f]">
        {/* 見出し：タイトル・つよさ・おと */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="font-serif text-lg sm:text-2xl text-coffee-dark flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-[#f79ab7] border-2 border-coffee-dark" />
            ぬばたま落とし
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

        {/* 盤面まわり。並びは puyoAnimations.css の .puyo-vs-grid：
            lg 以上（本家の対戦画面の並び）: 自分の盤面 | まんなか（両者のつぎ・相手の顔と台詞・ボタン）| 相手の盤面、とくてんは盤面の下
            lg 未満: 自分の盤面を大きく、右に自分のつぎ・とくてんと相手の小さな盤面、台詞は下 */}
        <div className="puyo-vs-grid relative">
          {/* 台詞の長さで列が広がらないように（広がると相手の盤面が伸び、つぎ・とくてんが盤面から離れる） */}
          <div className="[grid-area:c-head] [contain:inline-size] lg:hidden">
            <CpuCharacterPanel character={character} line={line} />
          </div>

          {/* lg 以上のまんなかの列：上の両端に各自の「つぎ」（盤面の上の内側の角）、中段は空け、下端にボタン */}
          <div className={`[grid-area:center] ${BOARD_TOP} hidden lg:flex flex-col self-stretch px-3`}>
            <div className="flex justify-between">
              <NextTag nextPair={gameState.player.nextPair} className="w-[5rem]" />
              <NextTag nextPair={gameState.cpu.nextPair} className="w-[5rem]" />
            </div>
            {/* ひとやすみ・やりなおすは、いつでも盤面のすぐ横で押せるように常に出す */}
            <div className="mt-auto mx-auto flex flex-col gap-2 w-[6.5rem]">{controlButtons}</div>
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
                  footer={<BoardScore score={gameState.player.score} accent />}
                />
              </TouchControls>
            </div>
          </div>
          <SideInfo className="[grid-area:p-side] lg:hidden" nextPair={gameState.player.nextPair} score={gameState.player.score} accent>
            {controlButtons}
          </SideInfo>
          {/* lg 以上：名前の帯は盤面のすぐ下。アイコンは外側の端（本家と同じ位置） */}
          <div className="[grid-area:p-foot] hidden lg:flex mt-2">
            <NameBand name="あなた" accent />
          </div>
          <div className="[grid-area:c-foot] hidden lg:flex mt-2">
            <NameBand name={character.name} icon={character.icon} />
          </div>
          <div className="[grid-area:c-field] puyo-vs-cpu-field">
            <div ref={cpuNoticeRef}>
              <OjamaNotice
                count={gameState.pendingOjamaCpu}
                ready={gameState.isPlaying && !gameState.player.isChaining}
                hit={hits.cpu}
              />
            </div>
            <div ref={cpuBoardRef} className="relative">
              {/* lg 以上：相手の台詞は盤面の上のほうに短いふきだしで出し、数秒で消す（本家の画面には台詞が無いので、盤面を隠す時間を短く） */}
              <div key={`${line}-${lineTick}`} className="puyo-vs-bubble hidden lg:block absolute z-20 top-5 left-4 right-4 pointer-events-none">
                <div className="px-3 py-1.5 rounded-2xl border-[3px] border-coffee-dark bg-[#fffaf0] font-serif text-xs leading-snug text-coffee-dark shadow-[0_3px_0_#3b2f2f]">
                  「{line}」
                </div>
              </div>
              <GameGrid
                grid={gameState.cpu.grid}
                currentPair={gameState.cpu.currentPair}
                getPairPositions={getCpuPairPositions}
                isGameOver={gameState.cpu.isGameOver}
                isPaused={gameState.isPaused}
                gameResult={getGameResult(gameState.isGameOver, gameState.winner, 'cpu')}
                chainStep={gameState.cpu.currentChainStep}
                footer={<BoardScore score={gameState.cpu.score} />}
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
