import React, { useEffect, useRef, useState } from 'react';
import { GameGrid } from './GameGrid';
import {
  applyGravity,
  createEmptyGrid,
  findChainsToHighlight,
  getPairPositions,
  markPuyosForDeletion,
  removeDeletedPuyos
} from '../../utils/puyoGameLogic';
import { dropOjamaPuyos } from '../../utils/ojamaSystem';
import { playSe, unlockAudio } from '../../utils/gameAudio';
import { GAME_TIMINGS } from '../../constants/gameTimings';
import type { ColoredPuyoColor, PuyoCell, PuyoPair } from '../../types/game';
import './wapop.css';

// タイトル動画のあとに流す「見本れんさ」（オーナー 11-12 の選択 D）。
// 決まった盤面にペアを1つ落として3れんさを起こし、相手の盤面にぬばたま（おじゃま）を7個降らせる。
// れんさの判定・消去・重力はゲーム本体と同じ関数を使うので、見本の動きはゲームの動きそのもの。

type C = ColoredPuyoColor;
const R: C = 'red', B: C = 'blue', G: C = 'green', Y: C = 'yellow';

/**
 * 列ごとに下から積む。3れんさになる並び:
 * ペア（赤の上に青）を2列目に落とす → 赤4つ → 落ちた青が青4つ → 落ちた緑が緑4つ。
 * 3段目のあと黄は3つしかつながらないので、ここで止まる
 */
const PLAYER_COLUMNS: C[][] = [
  [G, B, R, R, B, G],
  [G, B, R],
  [G, Y, Y],
  [Y, R, B],
  [B, Y],
  [R, B]
];
const RIVAL_COLUMNS: C[][] = [[Y], [R, R], [B], [G, Y], [R], [B, B]];

const PAIR_COLUMN = 1;
const PAIR_LANDING_ROW = 9;
/** 3れんさで送る量（ojamaSystem の式: 1 + 2 + 4） */
const OJAMA_SENT = 7;

const buildGrid = (columns: C[][]): PuyoCell[][] => {
  const grid = createEmptyGrid();
  const bottom = grid.length - 1;
  columns.forEach((stack, x) => stack.forEach((color, i) => {
    grid[bottom - i][x] = { color, id: `${x}-${i}-${color}` };
  }));
  return grid;
};

const CAPTIONS = [
  'おなじ色を 4つ つなげると きえる',
  'つづけて きえると れんさ！',
  'れんさで あいてに ぬばたまを おとす！'
];

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

interface Props {
  onDone: () => void;
}

export const TitleChainDemo: React.FC<Props> = ({ onDone }) => {
  const [playerGrid, setPlayerGrid] = useState(() => buildGrid(PLAYER_COLUMNS));
  const [rivalGrid, setRivalGrid] = useState(() => buildGrid(RIVAL_COLUMNS));
  const [pair, setPair] = useState<PuyoPair | null>({ main: R, sub: B, x: PAIR_COLUMN, y: 1, rotation: 0 });
  const [chainStep, setChainStep] = useState(0);
  const [caption, setCaption] = useState(0);
  const [beam, setBeam] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    let cancelled = false;
    const step = async (ms: number) => {
      await wait(ms);
      if (cancelled) throw new Error('cancelled');
    };

    const run = async () => {
      unlockAudio();
      await step(500);

      // ペアが2列目をまっすぐ落ちる
      for (let y = 2; y <= PAIR_LANDING_ROW; y++) {
        setPair(p => (p ? { ...p, y } : p));
        await step(70);
      }
      let grid = buildGrid(PLAYER_COLUMNS);
      const { main, sub } = getPairPositions({ main: R, sub: B, x: PAIR_COLUMN, y: PAIR_LANDING_ROW, rotation: 0 });
      grid[main.y][main.x] = { color: R, id: 'pair-main' };
      grid[sub.y][sub.x] = { color: B, id: 'pair-sub' };
      setPair(null);
      setPlayerGrid(grid);
      playSe('land');
      await step(GAME_TIMINGS.landing);

      // れんさ：判定・消去・重力はゲーム本体と同じ順と間
      for (let n = 0; ; n++) {
        const found = findChainsToHighlight(grid);
        if (!found.chainOccurred) break;
        if (n === 1) setCaption(1);
        setChainStep(n);
        setPlayerGrid(found.newGrid);
        playSe('charge', n + 1);
        await step(GAME_TIMINGS.highlight);
        const marked = markPuyosForDeletion(found.newGrid);
        setPlayerGrid(marked);
        playSe('pop', n + 1);
        await step(GAME_TIMINGS.deletion);
        grid = applyGravity(removeDeletedPuyos(marked));
        setPlayerGrid(grid);
        await step(GAME_TIMINGS.falling + GAME_TIMINGS.complete);
      }

      // 相手の盤面へ光が飛び、ぬばたまが降る
      setCaption(2);
      setBeam(true);
      await step(550);
      setBeam(false);
      setRivalGrid(g => dropOjamaPuyos(g, OJAMA_SENT));
      playSe('ojama', OJAMA_SENT);
      await step(1800);
      doneRef.current();
    };

    run().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="absolute inset-0 z-20 wp-veil flex flex-col items-center justify-center gap-[2%] p-[2%] animate-fade-in-up">
      <FitBox>
        <div className="flex items-center gap-6">
          <DemoBoard label="あなた" grid={playerGrid} pair={pair} chainStep={chainStep} />
          <div className={`text-5xl text-[#e5598a] transition-all duration-500 ${beam ? 'opacity-100 translate-x-3 scale-125' : 'opacity-30'}`} aria-hidden="true">
            ➜
          </div>
          <DemoBoard label="あいて" grid={rivalGrid} pair={null} chainStep={0} />
        </div>
      </FitBox>
      {/* 字幕は盤面の下（上だと、スマホで右上の「とばす」と重なる） */}
      <div key={caption} className="wp-tag text-[11px] sm:text-base px-3 py-1 wp-pop-in whitespace-nowrap">
        {CAPTIONS[caption]}
      </div>
    </div>
  );
};

/**
 * 中身をふだんの大きさで組んでから、枠に収まるよう丸ごと縮める。
 * 盤面だけ縮めると「連鎖!」の札（固定の大きさ）が盤面からはみ出すので、札ごと縮める
 */
const FitBox: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const fit = () => {
      if (!outer.current || !inner.current) return;
      const w = inner.current.offsetWidth, h = inner.current.offsetHeight;
      if (!w || !h) return;
      setScale(Math.min(outer.current.clientWidth / w, outer.current.clientHeight / h));
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (outer.current) ro.observe(outer.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={outer} className="relative flex-1 min-h-0 w-full">
      <div
        ref={inner}
        className="absolute left-1/2 top-1/2"
        style={{ transform: `translate(-50%, -50%) scale(${scale})`, visibility: scale ? 'visible' : 'hidden' }}
      >
        {children}
      </div>
    </div>
  );
};

const DemoBoard: React.FC<{ label: string; grid: PuyoCell[][]; pair: PuyoPair | null; chainStep: number }> = ({ label, grid, pair, chainStep }) => (
  <div className="flex flex-col items-center gap-2">
    <span className="wp-tag text-sm px-3 py-0.5">{label}</span>
    <div className="w-[260px]">
      <GameGrid grid={grid} currentPair={pair} getPairPositions={getPairPositions} isGameOver={false} chainStep={chainStep} />
    </div>
  </div>
);
