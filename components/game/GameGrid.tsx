import React, { useMemo } from 'react';
import { Puyo } from './Puyo';
import type { PuyoCell, PuyoPair, Position, GameResult } from '../../types/game';

// Constants for styling
const GAME_GRID_STYLES = {
  container: 'relative bg-ivory border-4 border-coffee-dark rounded-2xl p-4 shadow-lg',
  grid: 'grid gap-1 transition-all duration-300',
  cell: 'relative transition-all duration-200 rounded-lg',
  fallingCell: 'bg-yellow-100',
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
}

// Overlay Components
const PauseOverlay: React.FC = () => (
  <div className={`${OVERLAY_STYLES.base} ${OVERLAY_STYLES.pause}`}>
    <div className="text-center text-white">
      <h3 className="text-4xl font-bold tracking-wider animate-pulse">PAUSE</h3>
    </div>
  </div>
);

const WinOverlay: React.FC = () => (
  <div className={`${OVERLAY_STYLES.base} ${OVERLAY_STYLES.win}`}>
    <div className="text-center">
      <h3 className="text-4xl font-bold text-white drop-shadow-lg mb-2">🎉 WIN! 🎉</h3>
      <div className="text-lg font-bold text-white drop-shadow">Victory!</div>
    </div>
  </div>
);

const LoseOverlay: React.FC = () => (
  <div className={`${OVERLAY_STYLES.base} ${OVERLAY_STYLES.lose}`}>
    <div className="text-center">
      <h3 className="text-3xl font-bold text-gray-300 mb-2">💀 LOSE 💀</h3>
      <div className="text-md font-bold text-gray-400">Defeated...</div>
    </div>
  </div>
);

const GameOverOverlay: React.FC = () => (
  <div className={`${OVERLAY_STYLES.base} ${OVERLAY_STYLES.fallback}`}>
    <div className="text-center text-white">
      <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
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
  gameResult = null
}) => {
  // Memoize falling positions calculation
  const fallingPositions = useMemo(() => {
    return currentPair ? getPairPositions(currentPair) : null;
  }, [currentPair, getPairPositions]);

  // Memoize display grid creation
  const displayGrid = useMemo(() => {
    return grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        // Check if this position has a falling puyo
        if (fallingPositions) {
          if (fallingPositions.main.x === colIndex && fallingPositions.main.y === rowIndex) {
            return { ...cell, color: currentPair!.main, isFalling: true };
          }
          if (fallingPositions.sub.x === colIndex && fallingPositions.sub.y === rowIndex) {
            return { ...cell, color: currentPair!.sub, isFalling: true };
          }
        }
        return { ...cell, isFalling: false };
      })
    );
  }, [grid, fallingPositions, currentPair]);

  // Memoize visible grid
  const visibleGrid = useMemo(() => {
    return displayGrid.slice(1);
  }, [displayGrid]);

  // Memoize grid dimensions
  const columnCount = useMemo(() => grid[0]?.length || 6, [grid]);

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
        {visibleGrid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                ${GAME_GRID_STYLES.cell}
                ${(cell as any).isFalling ? GAME_GRID_STYLES.fallingCell : ''}
              `}
            >
              <Puyo
                color={cell.color}
                isConnected={cell.isConnected}
                willDelete={cell.willDelete}
                isDeleting={cell.isDeleting}
                isFalling={cell.isFalling || (cell as any).isFalling}
              />
            </div>
          ))
        )}
      </div>

      {/* Game Over Line Indicator */}
      <GameOverLine columnCount={columnCount} />

      {/* Dynamic overlay */}
      {renderOverlay()}
    </div>
  );
};