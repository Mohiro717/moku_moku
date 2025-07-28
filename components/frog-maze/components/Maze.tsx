import React, { useReducer, useEffect, useCallback } from 'react';
import { 
  generateMaze, 
  canMove, 
  moveMonster, 
  MAZE_SIZE, 
  NUM_ORBS,
  calculateDistanceToNearestTrap,
  getTrapWarningLevel 
} from '../utils/mazeUtils';
import type { Grid, PlayerPosition, MonsterPosition, TrapPosition } from '../types';
import { GAME_TEXT, MAZE_STYLES, GAME_FONT } from '../constants/gameConstants';
import { GameStatus } from './GameStatus';
import { MazeGrid } from './MazeGrid';
import { GameControls } from './GameControls';

interface MazeProps {
  onWin: () => void;
}

interface GameData {
  grid: Grid;
  playerPosition: PlayerPosition;
  monsters: MonsterPosition[];
  revealedTraps: TrapPosition[];
  orbsCollected: number;
  totalOrbs: number;
  gameWon: boolean;
  gameOver: boolean;
  trapWarningLevel: string;
}

type GameAction =
  | { type: 'MOVE_PLAYER'; direction: { x: number; y: number } }
  | { type: 'MOVE_MONSTERS' }
  | { type: 'RESET_GAME' };

const initialGameData: GameData = {
  grid: [],
  playerPosition: { x: 0, y: 0 },
  monsters: [],
  revealedTraps: [],
  orbsCollected: 0,
  totalOrbs: NUM_ORBS,
  gameWon: false,
  gameOver: false,
  trapWarningLevel: 'safe'
};

function gameReducer(state: GameData, action: GameAction): GameData {
  switch (action.type) {
    case 'MOVE_PLAYER': {
      if (state.gameWon || state.gameOver) return state;

      const newPosition = {
        x: state.playerPosition.x + action.direction.x,
        y: state.playerPosition.y + action.direction.y
      };

      if (!canMove(state.playerPosition, newPosition, state.grid)) {
        return state;
      }

      const cell = state.grid[newPosition.y][newPosition.x];
      let newOrbsCollected = state.orbsCollected;
      let newGrid = [...state.grid];

      // Check for orb collection
      if (cell.occupant === 'orb') {
        newOrbsCollected++;
        newGrid = state.grid.map(row => row.map(c => 
          c.x === newPosition.x && c.y === newPosition.y 
            ? { ...c, occupant: null }
            : c
        ));
      }

      // Check for trap - reveal and return to start
      let newRevealedTraps = state.revealedTraps;
      if (cell.occupant === 'trap') {
        // 罠を踏んだ場合、その罠を表示してスタート地点に戻る
        newRevealedTraps = [
          ...state.revealedTraps,
          { x: newPosition.x, y: newPosition.y, revealed: true }
        ];
        
        const trapDistance = calculateDistanceToNearestTrap({ x: 0, y: 0 }, newGrid);
        const warningLevel = getTrapWarningLevel(trapDistance);
        
        return { 
          ...state, 
          playerPosition: { x: 0, y: 0 }, // スタート地点に戻る
          revealedTraps: newRevealedTraps,
          grid: newGrid,
          trapWarningLevel: warningLevel
        };
      }

      // Check for monster collision - return to start
      const hitMonster = state.monsters.some(monster => 
        monster.x === newPosition.x && monster.y === newPosition.y
      );
      
      if (hitMonster) {
        const trapDistance = calculateDistanceToNearestTrap({ x: 0, y: 0 }, state.grid);
        const warningLevel = getTrapWarningLevel(trapDistance);
        
        return { 
          ...state, 
          playerPosition: { x: 0, y: 0 }, // スタート地点に戻る
          trapWarningLevel: warningLevel
        };
      }

      // Check for win condition (reached goal with all orbs)
      const reachedGoal = newPosition.x === MAZE_SIZE - 1 && newPosition.y === MAZE_SIZE - 1;
      if (reachedGoal && newOrbsCollected === NUM_ORBS) {
        return {
          ...state,
          playerPosition: newPosition,
          orbsCollected: newOrbsCollected,
          grid: newGrid,
          revealedTraps: newRevealedTraps,
          gameWon: true
        };
      }

      // 罠警告レベルを計算
      const trapDistance = calculateDistanceToNearestTrap(newPosition, newGrid);
      const warningLevel = getTrapWarningLevel(trapDistance);

      return {
        ...state,
        playerPosition: newPosition,
        orbsCollected: newOrbsCollected,
        grid: newGrid,
        revealedTraps: newRevealedTraps,
        trapWarningLevel: warningLevel
      };
    }

    case 'MOVE_MONSTERS': {
      if (state.gameWon) return state;

      const newMonsters = state.monsters.map(monster => 
        moveMonster(monster, state.grid)
      );

      // Check for player-monster collision after monster movement
      const collision = newMonsters.some(monster => 
        monster.x === state.playerPosition.x && monster.y === state.playerPosition.y
      );

      if (collision) {
        const trapDistance = calculateDistanceToNearestTrap({ x: 0, y: 0 }, state.grid);
        const warningLevel = getTrapWarningLevel(trapDistance);
        
        return { 
          ...state, 
          playerPosition: { x: 0, y: 0 }, // スタート地点に戻る
          monsters: newMonsters,
          trapWarningLevel: warningLevel
        };
      }

      return { ...state, monsters: newMonsters };
    }

    case 'RESET_GAME': {
      const { grid, playerPosition, monsters } = generateMaze();
      const trapDistance = calculateDistanceToNearestTrap(playerPosition, grid);
      const warningLevel = getTrapWarningLevel(trapDistance);
      
      return {
        grid,
        playerPosition,
        monsters,
        revealedTraps: [],
        orbsCollected: 0,
        totalOrbs: NUM_ORBS,
        gameWon: false,
        gameOver: false,
        trapWarningLevel: warningLevel
      };
    }

    default:
      return state;
  }
}

export const Maze: React.FC<MazeProps> = ({ onWin }) => {
  const [gameData, dispatch] = useReducer(gameReducer, initialGameData);

  // Initialize game
  useEffect(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  // Handle win condition
  useEffect(() => {
    if (gameData.gameWon) {
      onWin();
    }
  }, [gameData.gameWon, onWin]);

  // Move monsters periodically
  useEffect(() => {
    const monsterTimer = setInterval(() => {
      dispatch({ type: 'MOVE_MONSTERS' });
    }, 1500);

    return () => clearInterval(monsterTimer);
  }, []);

  // Handle keyboard input
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameData.gameWon || gameData.gameOver) return;

    const directions: { [key: string]: { x: number; y: number } } = {
      'ArrowUp': { x: 0, y: -1 },
      'ArrowDown': { x: 0, y: 1 },
      'ArrowLeft': { x: -1, y: 0 },
      'ArrowRight': { x: 1, y: 0 },
      'w': { x: 0, y: -1 },
      's': { x: 0, y: 1 },
      'a': { x: -1, y: 0 },
      'd': { x: 1, y: 0 }
    };

    const direction = directions[event.key];
    if (direction) {
      event.preventDefault();
      dispatch({ type: 'MOVE_PLAYER', direction });
    }
  }, [gameData.gameWon, gameData.gameOver]);

  // Handle cell tap/click
  const handleCellTap = useCallback((targetX: number, targetY: number) => {
    if (gameData.gameWon || gameData.gameOver) return;

    const playerX = gameData.playerPosition.x;
    const playerY = gameData.playerPosition.y;

    // Calculate direction to move (one step at a time)
    let direction = { x: 0, y: 0 };

    if (targetX > playerX) {
      direction.x = 1; // Move right
    } else if (targetX < playerX) {
      direction.x = -1; // Move left
    } else if (targetY > playerY) {
      direction.y = 1; // Move down
    } else if (targetY < playerY) {
      direction.y = -1; // Move up
    }

    // Only move if there's a valid direction
    if (direction.x !== 0 || direction.y !== 0) {
      dispatch({ type: 'MOVE_PLAYER', direction });
    }
  }, [gameData.gameWon, gameData.gameOver, gameData.playerPosition]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (gameData.grid.length === 0) {
    return (
      <div className="text-center py-8" style={{ fontFamily: GAME_FONT }}>
        {GAME_TEXT.LOADING}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${MAZE_STYLES.CONTAINER.SPACING} ${MAZE_STYLES.CONTAINER.WIDTH}`}>
      <GameStatus
        orbsCollected={gameData.orbsCollected}
        totalOrbs={gameData.totalOrbs}
        gameOver={gameData.gameOver}
      />

      <MazeGrid
        grid={gameData.grid}
        playerPosition={gameData.playerPosition}
        monsters={gameData.monsters}
        revealedTraps={gameData.revealedTraps}
        orbsCollected={gameData.orbsCollected}
        totalOrbs={gameData.totalOrbs}
        trapWarningLevel={gameData.trapWarningLevel}
        onCellTap={handleCellTap}
      />

      <GameControls />
    </div>
  );
};