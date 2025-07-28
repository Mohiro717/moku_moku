import React from 'react';
import { MAZE_STYLES } from '../constants/gameConstants';
import { MazeCell } from './MazeCell';
import type { Grid, PlayerPosition, MonsterPosition, TrapPosition } from '../types';
import { MAZE_SIZE } from '../utils/mazeUtils';

interface MazeGridProps {
  grid: Grid;
  playerPosition: PlayerPosition;
  monsters: MonsterPosition[];
  revealedTraps: TrapPosition[];
  orbsCollected: number;
  totalOrbs: number;
  trapWarningLevel: string;
  onCellTap: (x: number, y: number) => void;
}

export const MazeGrid: React.FC<MazeGridProps> = ({
  grid,
  playerPosition,
  monsters,
  revealedTraps,
  orbsCollected,
  totalOrbs,
  trapWarningLevel,
  onCellTap,
}) => {
  const getBorderColor = () => {
    switch (trapWarningLevel) {
      case 'danger': return MAZE_STYLES.GRID.BORDER_COLORS.DANGER;
      case 'warning': return MAZE_STYLES.GRID.BORDER_COLORS.WARNING;
      case 'caution': return MAZE_STYLES.GRID.BORDER_COLORS.CAUTION;
      default: return MAZE_STYLES.GRID.BORDER_COLORS.SAFE;
    }
  };

  const getGridStyle = () => ({
    gridTemplateColumns: `repeat(${MAZE_SIZE}, 1fr)`,
    maxWidth: MAZE_STYLES.GRID.SIZE.MAX_SIZE,
    maxHeight: MAZE_STYLES.GRID.SIZE.MAX_SIZE,
    width: '100%',
    aspectRatio: MAZE_STYLES.GRID.SIZE.ASPECT_RATIO,
  });

  return (
    <div 
      className={`${MAZE_STYLES.GRID.BASE} ${getBorderColor()}`}
      style={getGridStyle()}
    >
      {grid.map((row, y) =>
        row.map((cell, x) => {
          const isPlayer = playerPosition.x === x && playerPosition.y === y;
          const isGoal = x === MAZE_SIZE - 1 && y === MAZE_SIZE - 1;
          const monster = monsters.find(m => m.x === x && m.y === y);
          
          // 罠が表示されるかどうかを判定
          const trapRevealed = revealedTraps.some(
            trap => trap.x === x && trap.y === y && trap.revealed
          );
          const shouldShowTrap = cell.occupant === 'trap' && trapRevealed;
          
          return (
            <MazeCell
              key={`${x}-${y}`}
              cell={cell}
              x={x}
              y={y}
              isPlayer={isPlayer}
              isGoal={isGoal}
              monster={monster}
              shouldShowTrap={shouldShowTrap}
              isUnlocked={orbsCollected === totalOrbs}
              onCellTap={onCellTap}
            />
          );
        })
      )}
    </div>
  );
};