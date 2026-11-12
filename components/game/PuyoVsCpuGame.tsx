import React, { useEffect, useRef, useState } from 'react';
import { AttackBeamLayer, useAttackBeams } from './AttackBeams';
import { useChainFx, type PopRecord } from './ChainFx';
import { GameGrid } from './GameGrid';
import { ErrorBoundary } from '../ErrorBoundary';
import { GameErrorFallback } from './GameErrorFallback';
import { TouchControls } from './TouchControls';
import { NextPiecePreview } from './NextPiecePreview';
import { OjamaNotice } from './OjamaNotice';
import { useVsCpuGame } from '../../hooks/useVsCpuGame';
import { useCharacterReactions } from '../../hooks/game/useCpuCharacterReactions';
import { useVsGameSound } from '../../hooks/game/useVsGameSound';
import { isMuted, playSe, playVoice, setMuted, unlockAudio } from '../../utils/gameAudio';
import { COUNT_MS, GO_MS, VS_LEAD_MS, MoodIcon, VsIntroOverlay, nextMood, type IntroStep, type Mood } from './VsIntro';
import './wapop.css';
import { AllyCharacterPanel, CpuCharacterPanel, CpuCutinOverlay, KitanCredit } from './CpuCharacter';
import {
  FANWORKS_URL,
  allAllyVoicesOf,
  allVoicesOf,
  allyLinesOf,
  allyVoiceOf,
  characterById,
  voiceOf
} from '../../constants/cpuCharacters';
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
  /** プレイヤーが選んだ自分のキャラ（あるじどのの味方。性能の差はなく、見た目と声だけ） */
  playerCharacterId: string;
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
const NextTag: React.FC<{ nextPair: PuyoPair | null; nextNextPair?: PuyoPair | null; className?: string }> = ({ nextPair, nextNextPair, className = '' }) => (
  <div className={`wp-kifuda-wrap ${className}`}>
    <div className="wp-wood wp-kifuda">
      <div className="text-xs font-serif mb-1">つぎ</div>
      <NextPiecePreview nextPair={nextPair} nextNextPair={nextNextPair} />
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

/** lg 以上：盤面のすぐ下の名前の帯。アイコンは外側の端（自分は左端、相手は右端） */
const NameBand: React.FC<{ name: string; icon?: string; accent?: boolean; iconSide?: 'left' | 'right'; mood?: Mood }> = ({ name, icon, accent = false, iconSide = 'right', mood = 'even' }) => {
  // 顔は帯より大きく、上下にはみ出させる。優勢・劣勢・勝ち・負けで動きが変わる
  const img = icon && (
    <MoodIcon src={icon} mood={mood} className={`w-16 h-16 -my-5 ${iconSide === 'left' ? '-ml-4' : '-mr-4'}`} />
  );
  return (
    <div
      className="w-full flex items-center gap-2 px-3 py-1 rounded-full border-[3px] border-coffee-dark font-serif text-base text-coffee-dark"
      style={{ background: accent ? '#fbd3df' : '#fff4d6' }}
    >
      {iconSide === 'left' && img}
      <span className="flex-1 truncate text-center">{name}</span>
      {iconSide === 'right' && img}
    </div>
  );
};

// 上の余白はおじゃま予告の高さ（OjamaNotice の h-10 + mb-1.5）。盤面の上端にそろえる
const BOARD_TOP = 'mt-[2.875rem]';

/** スマホ・タブレット用：盤面のすぐ横に「つぎ」と「とくてん」を縦に積む。children はその下に足す */
const SideInfo: React.FC<{ nextPair: PuyoPair | null; nextNextPair?: PuyoPair | null; score: number; accent?: boolean; className?: string; children?: React.ReactNode }> = ({ nextPair, nextNextPair, score, accent = false, className = '', children }) => (
  <div className={`${BOARD_TOP} w-[5.5rem] flex flex-col items-stretch gap-2 ${className}`}>
    <NextTag nextPair={nextPair} nextNextPair={nextNextPair} />
    <ScoreKoban score={score} accent={accent} />
    {children}
  </div>
);

export const PuyoVsCpuGame: React.FC<PuyoVsCpuGameProps> = ({ initialDifficulty = 'normal', characterId, playerCharacterId, onChangeOpponent }) => {
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
    const playerCharacter = characterById(playerCharacterId);
    const idleSide = { isChaining: false, currentChainStep: 0 };
    const cpuPinch = gameState ? isPinch(gameState.cpu.grid) : false;
    const playerPinch = gameState ? isPinch(gameState.player.grid) : false;
    // 「ピンチ」の台詞は、その側のほうが高く積もっているときだけ（向かいが危ないのにあせるのを防ぐ）
    const cpuLosing = !!gameState && cpuPinch && topRow(gameState.cpu.grid) < topRow(gameState.player.grid);
    const playerLosing = !!gameState && playerPinch && topRow(gameState.player.grid) < topRow(gameState.cpu.grid);
    const isGameOver = !!gameState?.isGameOver;
    const cpuSide = useCharacterReactions({
      character,
      lines: character.lines,
      isGameOver,
      won: gameState?.winner === 'cpu',
      self: gameState?.cpu ?? idleSide,
      opponent: gameState?.player ?? idleSide,
      selfOjama: gameState ? countOjama(gameState.cpu.grid) : 0,
      selfPending: gameState?.pendingOjamaCpu ?? 0,
      selfPinch: cpuLosing
    });
    // 自分の側：あるじどのの味方として、味方用の台詞を言う
    const allySide = useCharacterReactions({
      character: playerCharacter,
      lines: allyLinesOf(playerCharacter),
      isGameOver,
      won: gameState?.winner === 'player',
      self: gameState?.player ?? idleSide,
      opponent: gameState?.cpu ?? idleSide,
      selfOjama: gameState ? countOjama(gameState.player.grid) : 0,
      selfPending: gameState?.pendingOjamaPlayer ?? 0,
      selfPinch: playerLosing
    });
    const { line, lineTick, cutin } = cpuSide;

    useVsGameSound({
      gameState,
      cpu: { ...cpuSide, character, voiceSrc: (kind, n) => voiceOf(character, kind, n), voices: allVoicesOf(character) },
      ally: { ...allySide, character: playerCharacter, voiceSrc: (kind, n) => allyVoiceOf(playerCharacter, kind, n), voices: allAllyVoicesOf(playerCharacter) },
      pinch: cpuPinch || playerPinch
    });

    // はじまり：「たいせん する！」で VS の絵と 3・2・1 を同時に出し、はじめ！ で自動で始める。
    // もういちど・やりなおすは VS の絵なしでカウントだけ
    const [intro, setIntro] = useState<IntroStep | null>(null);
    const [showVs, setShowVs] = useState(false);
    const [introRun, setIntroRun] = useState(0);
    const introTimers = useRef<number[]>([]);
    const startGameRef = useRef(startGame);
    startGameRef.current = startGame;
    const runIntro = (withVs: boolean) => {
      introTimers.current.forEach(clearTimeout);
      introTimers.current = [];
      const at = (ms: number, fn: () => void) => introTimers.current.push(window.setTimeout(fn, ms));
      // VS の絵だけを先に見せる時間（見比べ中の案だけ。今の形は 0 で、絵とカウントが同時）
      const lead = withVs ? VS_LEAD_MS : 0;
      setShowVs(withVs);
      setIntro(lead > 0 ? 'vs' : 3);
      playSe(withVs ? 'cutin' : 'move');
      setIntroRun(n => n + 1);
      if (lead > 0) at(lead, () => {
        setIntro(3);
        playSe('move');
      });
      ([2, 1] as const).forEach((n, i) => at(lead + (i + 1) * COUNT_MS, () => {
        setIntro(n);
        playSe('move');
      }));
      at(lead + 3 * COUNT_MS, () => {
        setIntro('go');
        setShowVs(false);
        startGameRef.current();
      });
      at(lead + 3 * COUNT_MS + GO_MS, () => setIntro(null));
    };
    useEffect(() => {
      runIntro(true);
      return () => introTimers.current.forEach(clearTimeout);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // はじめの台詞は VS のあいだに言う。自分の側が先、相手が返す。
    // やりなおしで声を止める処理（useVsGameSound）のあとに鳴らすため、効果の中で鳴らす
    useEffect(() => {
      if (introRun === 0) return;
      playVoice(allyVoiceOf(playerCharacter, 'intro', allySide.lineIndex));
      if (character.lines.intro.length > 0) playVoice(voiceOf(character, 'intro', cpuSide.lineIndex), 'after');
    }, [introRun]); // eslint-disable-line react-hooks/exhaustive-deps

    // 名前の帯の顔：優勢・ふつう・劣勢・勝ち・負け
    const playerMoodRef = useRef<Mood>('even');
    const cpuMoodRef = useRef<Mood>('even');
    let playerMood: Mood = 'even';
    let cpuMood: Mood = 'even';
    if (gameState && (gameState.isPlaying || gameState.isGameOver)) {
      const over = gameState.isGameOver;
      playerMood = nextMood(playerMoodRef.current, gameState.player, gameState.cpu, gameState.pendingOjamaPlayer, gameState.pendingOjamaCpu,
        over ? (gameState.winner === 'player' ? 'win' : 'lose') : null);
      cpuMood = nextMood(cpuMoodRef.current, gameState.cpu, gameState.player, gameState.pendingOjamaCpu, gameState.pendingOjamaPlayer,
        over ? (gameState.winner === 'cpu' ? 'win' : 'lose') : null);
    }
    playerMoodRef.current = playerMood;
    cpuMoodRef.current = cpuMood;

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
    runIntro(false);
  };

  const handlePause = () => {
    unlockAudio();
    pauseGame();
  };

  const handleRestart = () => {
    unlockAudio();
    restartGame();
    runIntro(false);
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
  // はじまりは自動（VS → カウント）。演出が無いのに止まっているとき（ふだんは無い）だけ出す
  const startPrompt = !gameState.isPlaying && !gameState.isGameOver && intro === null ? (
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
          <div className="[grid-area:c-head] [contain:inline-size] lg:hidden flex flex-col gap-2">
            <AllyCharacterPanel character={playerCharacter} line={allySide.line} mood={playerMood} />
            <CpuCharacterPanel character={character} line={line} mood={cpuMood} />
          </div>

          {/* lg 以上のまんなかの列：上の両端に各自の「つぎ」（盤面の上の内側の角）、中段は空け、下端にボタン */}
          <div className={`[grid-area:center] ${BOARD_TOP} hidden lg:flex flex-col self-stretch px-3`}>
            <div className="flex justify-between">
              <NextTag nextPair={gameState.player.nextPair} nextNextPair={gameState.player.nextNextPair} className="w-[5rem]" />
              <NextTag nextPair={gameState.cpu.nextPair} nextNextPair={gameState.cpu.nextNextPair} className="w-[5rem]" />
            </div>
            {/* 自分の側の台詞：自分の盤面を隠さないよう、空いている中段にふきだしで出す */}
            <div className="relative mt-6">
              <div key={`${allySide.line}-${allySide.lineTick}`} className="puyo-vs-bubble pointer-events-none">
                <div className="px-3 py-1.5 rounded-2xl border-[3px] border-coffee-dark bg-[#fde7ee] font-serif text-xs leading-snug text-coffee-dark shadow-[0_3px_0_#3b2f2f]">
                  「{allySide.line}」
                </div>
              </div>
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
              {/* 必殺カットインは揺れる盤面の枠（この div）の中に置く。外に置くと、連鎖の揺れで
                  盤面だけが動いてカットインが浮いて見え、上のおじゃま予告の列にもはみ出す。
                  同キャラ戦でも分かるよう、じぶん／あいての札を出す */}
              <CpuCutinOverlay cutin={allySide.cutin} name={playerCharacter.name} side="player" />
              {/* lg 未満は相手の盤面が小さいので、相手のカットインも自分の盤面に重ねる */}
              <div className="lg:hidden pointer-events-none absolute inset-0 z-20">
                <CpuCutinOverlay cutin={cutin} name={character.name} side="cpu" />
              </div>
            </div>
          </div>
          <SideInfo className="[grid-area:p-side] lg:hidden" nextPair={gameState.player.nextPair} nextNextPair={gameState.player.nextNextPair} score={gameState.player.score} accent>
            {controlButtons}
          </SideInfo>
          {/* lg 以上：名前の帯は盤面のすぐ下。アイコンは外側の端（本家と同じ位置） */}
          <div className="[grid-area:p-foot] hidden lg:flex mt-2">
            <NameBand name={playerCharacter.name} icon={playerCharacter.icon} iconSide="left" accent mood={playerMood} />
          </div>
          <div className="[grid-area:c-foot] hidden lg:flex mt-2">
            <NameBand name={character.name} icon={character.icon} mood={cpuMood} />
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
              <div className="hidden lg:block pointer-events-none absolute inset-0 z-20">
                <CpuCutinOverlay cutin={cutin} name={character.name} side="cpu" />
              </div>
            </div>
          </div>
          {/* はじまりの演出：VS の絵に 3・2・1 を重ね、はじめ！ */}
          <VsIntroOverlay step={intro} showVs={showVs} player={playerCharacter} cpu={character} />
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
