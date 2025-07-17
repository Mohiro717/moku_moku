import React, { useMemo } from 'react';
import { Puyo } from './Puyo';
import type { PuyoCell, PuyoPair, Position } from '../../types/game';

interface GameGridProps {
  grid: PuyoCell[][];
  currentPair: PuyoPair | null;
  getPairPositions: (pair: PuyoPair) => { main: Position; sub: Position };
  isGameOver: boolean;
}

export const GameGrid: React.FC<GameGridProps> = ({ 
  grid, 
  currentPair,
  getPairPositions,
  isGameOver 
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

  return (
    <div className="relative bg-ivory border-4 border-coffee-dark rounded-2xl p-4 shadow-lg">
      {/* Grid container */}
      <div 
        className="grid gap-1" 
        style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 6}, 1fr)` }}
      >
        {visibleGrid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                relative 
                transition-all duration-200
                rounded-lg
                ${(cell as any).isFalling ? 'bg-yellow-100' : ''}
              `}
            >
              <Puyo
                color={cell.color}
                isConnected={cell.isConnected}
                willDelete={cell.willDelete}
                isAnimating={(cell as any).isFalling}
              />
            </div>
          ))
        )}
      </div>

      {/* Game Over Line Indicator (all columns) */}
      <div 
        className="absolute top-4 left-4 right-4 grid gap-1 pointer-events-none"
        style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 6}, 1fr)` }}
      >
        {Array.from({ length: grid[0]?.length || 6 }, (_, index) => (
          <div key={index} className="h-1 bg-red-400 rounded-full opacity-50"></div>
        ))}
      </div>


      {/* Game Over overlay */}
      {isGameOver && (
        <div className="absolute inset-0 bg-coffee-dark/50 rounded-2xl flex items-center justify-center">
          <div className="text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
          </div>
        </div>
      )}
    </div>
  );
};