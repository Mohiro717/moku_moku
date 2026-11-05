import React, { useMemo, useRef } from 'react';
import { Puyo, BRIDGE_COLORS, dropDuration } from './Puyo';
import type { PuyoCell, PuyoColor, PuyoPair, Position, GameResult } from '../../types/game';

// Constants for styling
const GAME_GRID_STYLES = {
  container: 'relative bg-ivory border-4 border-coffee-dark rounded-2xl p-4 shadow-lg',
  grid: 'relative grid gap-1 transition-opacity duration-300',
  cell: 'relative rounded-lg',
  pausedOpacity: 'opacity-30',
  gameOverLine: 'absolute top-4 left-4 right-4 grid gap-1 pointer-events-none',
  gameOverIndicator: 'h-1 bg-red-400 rounded-full opacity-50'
} as const;

const OVERLAY_STYLES = {
  base: 'absolute inset-0 rounded-2xl flex items-center justify-center',
  pause: 'bg-coffee-dark/70',
  win: 'bg-gradient-to-br from-yellow-400/80 to-green-400/80 animate-pulse',
  lose: 'bg-gray-800/80',
  fallback: 'bg-coffee-dark/50'
} as const;

interface GameGridProps {
  grid: PuyoCell[][];
  currentPair: PuyoPair | null;
  getPairPositions: (pair: PuyoPair) => { main: Position; sub: Position };
  isGameOver: boolean;
  isPaused?: boolean;
  gameResult?: GameResult;
  /** 連鎖中の段（0始まり。puyo hooks の currentChainStep） */
  chainStep?: number;
}

// ========================================
// 着地アニメーションの追跡
// セルの id は重力処理のたびに作り直されるので、列ごとに「下から k 番目」どうしを
// 前回の盤面と突き合わせて、どれだけ落ちたか・新しく来たかを割り出す。
// ========================================

interface CellAnim {
  version: number;
  fallRows: number;
  landed: boolean;
}

const useLandingTracker = (grid: PuyoCell[][], pairCells: Position[] | null): CellAnim[][] => {
  const snapshot = useRef<PuyoColor[][] | null>(null);
  const anims = useRef<CellAnim[][]>([]);
  const lastPair = useRef<Position[] | null>(null);

  const height = grid.length;
  const width = grid[0]?.length ?? 0;
  if (anims.current.length !== height) {
    anims.current = grid.map(row => row.map(() => ({ version: 0, fallRows: 0, landed: false })));
  }

  const colors = grid.map(row => row.map(cell => cell.color));
  const prev = snapshot.current;

  if (prev && prev.length === height) {
    let usedPair = false;
    for (let x = 0; x < width; x++) {
      const before: Array<{ y: number; color: PuyoColor }> = [];
      const after: Array<{ y: number; color: PuyoColor }> = [];
      for (let y = height - 1; y >= 0; y--) {
        if (prev[y][x]) before.push({ y, color: prev[y][x] });
        if (colors[y][x]) after.push({ y, color: colors[y][x] });
      }

      // 操作中ペアがこの列にいたなら、新しく来たぷよはそこから落ちてくる
      const pairStarts = (lastPair.current ?? []).filter(p => p.x === x).map(p => p.y).sort((a, b) => b - a);
      let spawnOffset = 0;

      after.forEach((cur, k) => {
        const old = before[k];
        if (old && old.color === cur.color) {
          if (old.y === cur.y) return; // 動いていない
          anims.current[cur.y][x] = {
            version: anims.current[cur.y][x].version + 1,
            fallRows: Math.max(0, cur.y - old.y),
            landed: true
          };
          return;
        }
        // 新しく来たぷよ（置いたペア、または降ってきたおじゃま）
        let start: number;
        if (pairStarts.length > 0) {
          start = pairStarts.shift()!;
          usedPair = true;
        } else {
          start = -1 - spawnOffset++;
        }
        anims.current[cur.y][x] = {
          version: anims.current[cur.y][x].version + 1,
          fallRows: Math.max(0, cur.y - start),
          landed: true
        };
      });
    }
    if (usedPair) lastPair.current = null;
  }

  if (pairCells) lastPair.current = pairCells;
  snapshot.current = colors;
  return anims.current;
};

// Overlay Components
const PauseOverlay: React.FC = () => (
  <div className={`${OVERLAY_STYLES.base} ${OVERLAY_STYLES.pause}`}>
    <div className="text-center text-white">
      <h3 className="text-4xl font-serif tracking-wider animate-pulse">PAUSE</h3>
    </div>
  </div>
);

const WinOverlay: React.FC = () => (
  <div className={`${OVERLAY_STYLES.base} ${OVERLAY_STYLES.win}`}>
    <div className="text-center">
      <h3 className="text-4xl font-serif text-white drop-shadow-lg mb-2">🎉 WIN! 🎉</h3>
      <div className="text-lg font-serif text-white drop-shadow">Victory!</div>
    </div>
  </div>
);

const LoseOverlay: React.FC = () => (
  <div className={`${OVERLAY_STYLES.base} ${OVERLAY_STYLES.lose}`}>
    <div className="text-center">
      <h3 className="text-3xl font-serif text-gray-300 mb-2">💀 LOSE 💀</h3>
      <div className="text-md font-serif text-gray-400">Defeated...</div>
    </div>
  </div>
);

const GameOverOverlay: React.FC = () => (
  <div className={`${OVERLAY_STYLES.base} ${OVERLAY_STYLES.fallback}`}>
    <div className="text-center text-white">
      <h3 className="text-2xl font-serif mb-2">Game Over!</h3>
    </div>
  </div>
);

// Game Over Line Component
interface GameOverLineProps {
  columnCount: number;
}

const GameOverLine: React.FC<GameOverLineProps> = ({ columnCount }) => (
  <div 
    className={GAME_GRID_STYLES.gameOverLine}
    style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
  >
    {Array.from({ length: columnCount }, (_, index) => (
      <div key={index} className={GAME_GRID_STYLES.gameOverIndicator}></div>
    ))}
  </div>
);

export const GameGrid: React.FC<GameGridProps> = ({ 
  grid, 
  currentPair,
  getPairPositions,
  isGameOver,
  isPaused = false,
  gameResult = null,
  chainStep = 0
}) => {
  // Memoize falling positions calculation
  const fallingPositions = useMemo(() => {
    return currentPair ? getPairPositions(currentPair) : null;
  }, [currentPair, getPairPositions]);

  const anims = useLandingTracker(
    grid,
    fallingPositions ? [fallingPositions.main, fallingPositions.sub] : null
  );

  // ペアが出るたびに別の要素にする（前のペアの位置から滑ってこないように）
  const spawnCount = useRef(0);
  const hadPair = useRef(false);
  if (currentPair && !hadPair.current) spawnCount.current++;
  hadPair.current = !!currentPair;

  const columnCount = grid[0]?.length || 6;
  const visibleRows = grid.length - 1; // row 0 は出現用の隠し行

  const isLinkable = (y: number, x: number): boolean => {
    const cell = grid[y]?.[x];
    return !!cell && !!cell.color && cell.color !== 'ojama' && !cell.isDeleting;
  };

  // 消えるぷよの重心に連鎖数を出す
  const chainNumber = chainStep + 1;
  let chainPopup: { left: number; top: number } | null = null;
  if (chainNumber >= 2) {
    let sumX = 0, sumY = 0, n = 0;
    grid.forEach((row, y) => row.forEach((cell, x) => {
      if (y >= 1 && cell.color && (cell.isConnected || cell.isDeleting)) {
        sumX += x; sumY += y - 1; n++;
      }
    }));
    if (n > 0) {
      chainPopup = {
        left: ((sumX / n + 0.5) / columnCount) * 100,
        top: ((sumY / n + 0.5) / visibleRows) * 100
      };
    }
  }

  // Render overlay based on current state
  const renderOverlay = () => {
    if (isPaused) return <PauseOverlay />;
    if (gameResult === 'win') return <WinOverlay />;
    if (gameResult === 'lose') return <LoseOverlay />;
    if (isGameOver && !gameResult) return <GameOverOverlay />;
    return null;
  };

  return (
    <div className={GAME_GRID_STYLES.container}>
      {/* Grid container */}
      <div 
        className={`${GAME_GRID_STYLES.grid} ${isPaused ? GAME_GRID_STYLES.pausedOpacity : ''}`}
        style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
      >
        {grid.slice(1).map((row, visibleIndex) =>
          row.map((cell, colIndex) => {
            const y = visibleIndex + 1;
            const anim = anims[y][colIndex];
            const linkRight = isLinkable(y, colIndex) && isLinkable(y, colIndex + 1) && grid[y][colIndex + 1].color === cell.color;
            const linkDown = isLinkable(y, colIndex) && isLinkable(y + 1, colIndex) && grid[y + 1][colIndex].color === cell.color;
            const delayWith = (other: CellAnim) =>
              `${Math.max(anim.landed ? dropDuration(anim.fallRows) : 0, other.landed ? dropDuration(other.fallRows) : 0)}ms`;

            return (
              <div key={`${y}-${colIndex}`} className={GAME_GRID_STYLES.cell}>
                {linkRight && (
                  <div
                    key={`r-${anim.version}-${anims[y][colIndex + 1].version}`}
                    className={`puyo-bridge absolute left-1/2 top-[22%] h-[56%] ${BRIDGE_COLORS[cell.color!]}`}
                    style={{ width: 'calc(100% + 4px)', '--bridge-delay': delayWith(anims[y][colIndex + 1]) } as React.CSSProperties}
                  />
                )}
                {linkDown && (
                  <div
                    key={`d-${anim.version}-${anims[y + 1][colIndex].version}`}
                    className={`puyo-bridge absolute top-1/2 left-[22%] w-[56%] ${BRIDGE_COLORS[cell.color!]}`}
                    style={{ height: 'calc(100% + 4px)', '--bridge-delay': delayWith(anims[y + 1][colIndex]) } as React.CSSProperties}
                  />
                )}
                <Puyo
                  key={anim.version}
                  color={cell.color}
                  isConnected={cell.isConnected}
                  isDeleting={cell.isDeleting}
                  landed={anim.landed}
                  fallRows={anim.fallRows}
                  idle
                />
              </div>
            );
          })
        )}

        {/* 操作中のペア：マスの上に重ねて、すべるように動かす */}
        {currentPair && fallingPositions &&
          [
            { pos: fallingPositions.main, color: currentPair.main, part: 'main' },
            { pos: fallingPositions.sub, color: currentPair.sub, part: 'sub' }
          ].map(({ pos, color, part }) => (
            <div
              key={`pair-${spawnCount.current}-${part}`}
              className="puyo-active absolute top-0 left-0 z-10"
              style={{
                transform: `translate(calc(${pos.x} * (100% + 4px)), calc(${pos.y - 1} * (100% + 4px)))`,
                opacity: pos.y >= 1 ? 1 : 0
              }}
            >
              <Puyo color={color} />
            </div>
          ))}

        {chainPopup && (
          <div
            key={`chain-${chainNumber}`}
            className="chain-popup absolute z-20 pointer-events-none font-serif"
            style={{ left: `${chainPopup.left}%`, top: `${chainPopup.top}%` }}
          >
            <svg width="170" height="100" viewBox="-85 -50 170 100" className="overflow-visible" aria-label={`${chainNumber}連鎖`}>
              <g className="chain-rays" fill="#ffe27a" opacity="0.8">
                {Array.from({ length: 12 }, (_, i) => (
                  <path key={i} d="M0 0 L-4 -70 L4 -70 Z" transform={`rotate(${i * 30})`} />
                ))}
              </g>
              <g className="chain-text" fontSize="32" fontWeight="900" textAnchor="middle">
                <text x="0" y="11" fill="#fff" stroke="#fff" strokeWidth="8" strokeLinejoin="round">{chainNumber}連鎖!</text>
                <text x="0" y="11" fill="#ff4f9a" stroke="#c2185b" strokeWidth="1.2">{chainNumber}連鎖!</text>
              </g>
            </svg>
          </div>
        )}
      </div>

      {/* Game Over Line Indicator */}
      <GameOverLine columnCount={columnCount} />

      {/* Dynamic overlay */}
      {renderOverlay()}
    </div>
  );
};