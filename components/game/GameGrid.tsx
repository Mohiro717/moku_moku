import React, { useMemo, useRef } from 'react';
import { Puyo, dropDuration, LINK_RIGHT, LINK_DOWN, LINK_LEFT, LINK_UP } from './Puyo';
import './wapop.css';
import type { PuyoCell, PuyoColor, PuyoPair, Position, GameResult } from '../../types/game';

// Constants for styling（和ポップの見た目は wapop.css）
const GAME_GRID_STYLES = {
  container: 'wp-board relative p-3 sm:p-4',
  grid: 'relative grid gap-1 transition-opacity duration-300',
  cell: 'relative rounded-lg',
  pausedOpacity: 'opacity-30',
  gameOverLine: 'absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 pointer-events-none'
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
  /** まだ始まっていないときに盤面へ重ねる中身（はじめるボタンなど） */
  startPrompt?: React.ReactNode;
  /** 一時停止・勝ち負けの幕の下に出すボタン */
  actions?: React.ReactNode;
  /** 盤面の枠の中、マスの下に出すもの（対戦画面のとくてん） */
  footer?: React.ReactNode;
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
/**
 * 幕。判子と一言（center）はいつも盤面の上下まんなかに置き、ボタン（below）はその下に足す。
 * ボタンを一緒に真ん中寄せにすると、ボタンのある側（自分）だけ判子が上にずれ、
 * 隣の盤面（相手）の判子と高さがそろわない（11-12 オーナー「かち！、まけ…の高さのずれ」）
 */
const Veil: React.FC<{ dark?: boolean; center: React.ReactNode; below?: React.ReactNode; children?: React.ReactNode }> = ({ dark = false, center, below, children }) => (
  <div className={`absolute inset-0 z-30 rounded-[1rem] grid grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] justify-items-center p-4 overflow-hidden ${dark ? 'wp-veil-dark' : 'wp-veil'}`}>
    {children}
    <div className="row-start-2 flex flex-col items-center gap-4">{center}</div>
    {below && <div className="row-start-3 self-start mt-4 w-full flex justify-center">{below}</div>}
  </div>
);

const Petals: React.FC = () => (
  <>
    {Array.from({ length: 10 }, (_, i) => (
      <span
        key={i}
        className="wp-petal"
        style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 0.29).toFixed(2)}s`, animationDuration: `${2.4 + (i % 4) * 0.35}s` }}
      />
    ))}
  </>
);

const OVERLAY_TEXT: Record<'pause' | 'win' | 'lose' | 'over', { stamp: string; sub: string }> = {
  pause: { stamp: 'ひとやすみ', sub: 'おちゃでも どうぞ' },
  win: { stamp: 'かち！', sub: 'おみごと！' },
  lose: { stamp: 'まけ…', sub: 'もういっかい やってみよ' },
  over: { stamp: 'おしまい', sub: 'おつかれさま' }
};

const ResultOverlay: React.FC<{ kind: keyof typeof OVERLAY_TEXT; actions?: React.ReactNode }> = ({ kind, actions }) => {
  const { stamp, sub } = OVERLAY_TEXT[kind];
  return (
    <Veil
      dark={kind === 'lose'}
      center={<>
        <div className="wp-hanko wp-hanko-in px-4 py-2 text-3xl sm:px-5 sm:text-4xl whitespace-nowrap">{stamp}</div>
        <div className={`font-serif text-sm ${kind === 'lose' ? 'text-white' : 'text-coffee-dark'}`}>{sub}</div>
      </>}
      below={actions && <div className="relative flex flex-col items-stretch gap-2 w-full max-w-[13rem]">{actions}</div>}
    >
      {kind === 'win' && <Petals />}
    </Veil>
  );
};

/** 連鎖数の色：2〜3は朱、4〜5は金、6からは虹色に回る。光の筋も段ごとに増える */
const chainPopupTier = (n: number) => {
  if (n >= 6) return { fill: '#ff4f4f', rays: '#ffd23f', rayCount: 20, rainbow: true };
  if (n >= 4) return { fill: '#ffc21a', rays: '#ff7a3d', rayCount: 16, rainbow: false };
  return { fill: '#e8553d', rays: '#f6b93b', rayCount: 12, rainbow: false };
};

// Game Over Line Component：上端の危険ライン（朱の破線）
const GameOverLine: React.FC = () => (
  <div className={GAME_GRID_STYLES.gameOverLine}>
    <div className="wp-deadline" />
  </div>
);

export const GameGrid: React.FC<GameGridProps> = ({ 
  grid, 
  currentPair,
  getPairPositions,
  isGameOver,
  isPaused = false,
  gameResult = null,
  chainStep = 0,
  startPrompt,
  actions,
  footer
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

  // row 0（隠し行）のぷよとはつながない
  const isLinkable = (y: number, x: number): boolean => {
    const cell = grid[y]?.[x];
    return y >= 1 && !!cell && !!cell.color && cell.color !== 'ojama' && !cell.isDeleting;
  };
  const sameLink = (y: number, x: number, ny: number, nx: number) =>
    isLinkable(y, x) && isLinkable(ny, nx) && grid[ny][nx].color === grid[y][x].color;

  // つながったかたまりは同じ位相で呼吸させる（ばらばらだとつなぎ目がゆがむ）。
  // かたまりの中でいちばん左上のマスの番号から位相を決める
  const groupPhase: Array<Array<number | undefined>> = grid.map(row => row.map(() => undefined));
  grid.forEach((row, y) => row.forEach((_, x) => {
    if (groupPhase[y][x] !== undefined || !isLinkable(y, x)) return;
    const members: Array<[number, number]> = [];
    const stack: Array<[number, number]> = [[y, x]];
    const seen = new Set([`${y},${x}`]);
    while (stack.length) {
      const [cy, cx] = stack.pop()!;
      members.push([cy, cx]);
      for (const [ny, nx] of [[cy + 1, cx], [cy - 1, cx], [cy, cx + 1], [cy, cx - 1]]) {
        if (!seen.has(`${ny},${nx}`) && sameLink(cy, cx, ny, nx)) { seen.add(`${ny},${nx}`); stack.push([ny, nx]); }
      }
    }
    if (members.length < 2) return;
    const phase = ((y * columnCount + x) * 0.618034) % 1;
    members.forEach(([my, mx]) => { groupPhase[my][mx] = phase; });
  }));

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
        // 段が上がると文字が大きくなるので、端の列でも盤面からはみ出さないよう真ん中寄りに留める
        left: Math.min(67, Math.max(33, ((sumX / n + 0.5) / columnCount) * 100)),
        top: ((sumY / n + 0.5) / visibleRows) * 100
      };
    }
  }

  const popupTier = chainPopupTier(chainNumber);

  // Render overlay based on current state
  const renderOverlay = () => {
    if (isPaused) return <ResultOverlay kind="pause" actions={actions} />;
    if (gameResult === 'win') return <ResultOverlay kind="win" actions={actions} />;
    if (gameResult === 'lose') return <ResultOverlay kind="lose" actions={actions} />;
    if (isGameOver && !gameResult) return <ResultOverlay kind="over" actions={actions} />;
    if (startPrompt) return <Veil center={startPrompt} />;
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
            // 同じ色のとなりとのつながり。つなぎ目は、どちらかが落ちてくる途中なら着地を待って出す
            let links = 0;
            let linkWait = 0;
            const keyParts: string[] = [];
            for (const [bit, ny, nx] of [
              [LINK_RIGHT, y, colIndex + 1], [LINK_DOWN, y + 1, colIndex], [LINK_LEFT, y, colIndex - 1], [LINK_UP, y - 1, colIndex]
            ] as const) {
              if (!sameLink(y, colIndex, ny, nx)) continue;
              const other = anims[ny][nx];
              links |= bit;
              linkWait = Math.max(linkWait, anim.landed ? dropDuration(anim.fallRows) : 0, other.landed ? dropDuration(other.fallRows) : 0);
              keyParts.push(`${bit}:${other.version}`);
            }

            return (
              <div key={`${y}-${colIndex}`} className={GAME_GRID_STYLES.cell}>
                <Puyo
                  key={anim.version}
                  color={cell.color}
                  isConnected={cell.isConnected}
                  isDeleting={cell.isDeleting}
                  landed={anim.landed}
                  fallRows={anim.fallRows}
                  idle
                  links={links}
                  linkKey={`${links}-${keyParts.join('-')}`}
                  linkDelay={`${linkWait}ms`}
                  breathPhase={groupPhase[y][colIndex]}
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
            style={{
              left: `${chainPopup.left}%`,
              top: `${chainPopup.top}%`,
              // 段が上がるほど大きく、左右へ交互に傾く
              '--chain-scale': Math.min(1.7, 1 + (chainNumber - 2) * 0.13),
              '--chain-tilt': `${chainNumber % 2 ? 6 : -6}deg`
            } as React.CSSProperties}
          >
            <svg width="170" height="100" viewBox="-85 -50 170 100" className={`overflow-visible ${popupTier.rainbow ? 'chain-rainbow' : ''}`} aria-label={`${chainNumber}連鎖`}>
              <g className="chain-rays" fill={popupTier.rays} opacity="0.8">
                {Array.from({ length: popupTier.rayCount }, (_, i) => (
                  <path key={i} d="M0 0 L-4 -70 L4 -70 Z" transform={`rotate(${(i * 360) / popupTier.rayCount})`} />
                ))}
              </g>
              <g className="chain-text" fontSize="32" fontWeight="900" textAnchor="middle">
                <text x="0" y="11" fill="#fff" stroke="#fff" strokeWidth="8" strokeLinejoin="round">{chainNumber}連鎖!</text>
                <text x="0" y="11" fill={popupTier.fill} stroke="#3b2f2f" strokeWidth="1.4">{chainNumber}連鎖!</text>
              </g>
            </svg>
          </div>
        )}
      </div>

      {footer}

      {/* Game Over Line Indicator */}
      <GameOverLine />

      {/* Dynamic overlay */}
      {renderOverlay()}
    </div>
  );
};