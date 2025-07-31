import React from 'react';
import { MAZE_STYLES } from '../constants/gameConstants';
import type { Cell, MonsterPosition } from '../types';
import { Player } from './Player';
import { Orb } from './Orb';
import { Goal } from './Goal';
import { Trap } from './Trap';
import { Monster } from './Monster';
import { MAZE_SIZE } from '../utils/mazeUtils';

interface MazeCellProps {
  cell: Cell;
  x: number;
  y: number;
  isPlayer: boolean;
  isGoal: boolean;
  monster?: MonsterPosition;
  shouldShowTrap: boolean;
  isUnlocked: boolean;
  onCellTap: (x: number, y: number) => void;
}

export const MazeCell: React.FC<MazeCellProps> = ({
  cell,
  x,
  y,
  isPlayer,
  isGoal,
  monster,
  shouldShowTrap,
  isUnlocked,
  onCellTap,
}) => {
  const getCellClasses = () => {
    const classes = [
      MAZE_STYLES.CELL.BASE,
      'overflow-visible',
      cell.walls.top ? MAZE_STYLES.CELL.BORDERS.TOP : '',
      cell.walls.right ? MAZE_STYLES.CELL.BORDERS.RIGHT : '',
      cell.walls.bottom ? MAZE_STYLES.CELL.BORDERS.BOTTOM : '',
      cell.walls.left ? MAZE_STYLES.CELL.BORDERS.LEFT : '',
      isGoal ? MAZE_STYLES.CELL.BACKGROUNDS.GOAL : MAZE_STYLES.CELL.BACKGROUNDS.NORMAL,
    ];
    return classes.filter(Boolean).join(' ');
  };

  const getCellStyle = () => ({
    minWidth: MAZE_STYLES.CELL.SIZE.MIN_WIDTH,
    minHeight: MAZE_STYLES.CELL.SIZE.MIN_HEIGHT,
    fontSize: MAZE_STYLES.CELL.SIZE.FONT_SIZE,
  });

  const handleInteraction = () => {
    onCellTap(x, y);
  };

  return (
    <div
      key={`${x}-${y}`}
      className={getCellClasses()}
      style={getCellStyle()}
      onClick={handleInteraction}
      onTouchStart={(e) => {
        e.preventDefault();
        handleInteraction();
      }}
    >
      {/* Occupants */}
      {cell.occupant === 'orb' && <Orb />}
      {shouldShowTrap && <Trap />}
      {monster && <Monster />}
      {isPlayer && <Player />}
      {isGoal && <Goal isUnlocked={isUnlocked} />}
    </div>
  );
};