import type { Grid, Cell, PlayerPosition, MonsterPosition } from '../types';
import { GAME_CONFIG } from '../constants/gameConstants';

export const { NUM_ORBS, NUM_TRAPS, NUM_MONSTERS, MAZE_SIZE } = GAME_CONFIG;

export function generateMaze(): {
  grid: Grid;
  playerPosition: PlayerPosition;
  monsters: MonsterPosition[];
} {
  const grid: Grid = [];
  
  // Initialize grid
  for (let y = 0; y < MAZE_SIZE; y++) {
    grid[y] = [];
    for (let x = 0; x < MAZE_SIZE; x++) {
      grid[y][x] = {
        x,
        y,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false,
        occupant: null
      };
    }
  }

  // Generate maze using recursive backtracking
  const stack: Cell[] = [];
  const startCell = grid[0][0];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current, grid);

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      removeWall(current, next);
      next.visited = true;
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  // 通路を広げるために追加の壁を除去
  widenPassages(grid);

  // Place orbs
  const availableCells = getAllEmptyCells(grid);
  for (let i = 0; i < NUM_ORBS; i++) {
    if (availableCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      const cell = availableCells.splice(randomIndex, 1)[0];
      grid[cell.y][cell.x].occupant = 'orb';
    }
  }

  // Place traps
  for (let i = 0; i < NUM_TRAPS; i++) {
    if (availableCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      const cell = availableCells.splice(randomIndex, 1)[0];
      grid[cell.y][cell.x].occupant = 'trap';
    }
  }

  // Set player position (top-left)
  const playerPosition: PlayerPosition = { x: 0, y: 0 };

  // Place monsters
  const monsters: MonsterPosition[] = [];
  for (let i = 0; i < NUM_MONSTERS; i++) {
    if (availableCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      const cell = availableCells.splice(randomIndex, 1)[0];
      monsters.push({ x: cell.x, y: cell.y, id: i });
    }
  }

  return { grid, playerPosition, monsters };
}

function getUnvisitedNeighbors(cell: Cell, grid: Grid): Cell[] {
  const neighbors: Cell[] = [];
  const { x, y } = cell;

  // Top
  if (y > 0 && !grid[y - 1][x].visited) {
    neighbors.push(grid[y - 1][x]);
  }
  // Right
  if (x < MAZE_SIZE - 1 && !grid[y][x + 1].visited) {
    neighbors.push(grid[y][x + 1]);
  }
  // Bottom
  if (y < MAZE_SIZE - 1 && !grid[y + 1][x].visited) {
    neighbors.push(grid[y + 1][x]);
  }
  // Left
  if (x > 0 && !grid[y][x - 1].visited) {
    neighbors.push(grid[y][x - 1]);
  }

  return neighbors;
}

function removeWall(current: Cell, next: Cell): void {
  const dx = current.x - next.x;
  const dy = current.y - next.y;

  if (dx === 1) {
    current.walls.left = false;
    next.walls.right = false;
  } else if (dx === -1) {
    current.walls.right = false;
    next.walls.left = false;
  } else if (dy === 1) {
    current.walls.top = false;
    next.walls.bottom = false;
  } else if (dy === -1) {
    current.walls.bottom = false;
    next.walls.top = false;
  }
}

function getAllEmptyCells(grid: Grid): Cell[] {
  const cells: Cell[] = [];
  for (let y = 0; y < MAZE_SIZE; y++) {
    for (let x = 0; x < MAZE_SIZE; x++) {
      if (!(x === 0 && y === 0) && !(x === MAZE_SIZE - 1 && y === MAZE_SIZE - 1)) {
        cells.push(grid[y][x]);
      }
    }
  }
  return cells;
}

export function canMove(from: PlayerPosition, to: PlayerPosition, grid: Grid): boolean {
  if (to.x < 0 || to.x >= MAZE_SIZE || to.y < 0 || to.y >= MAZE_SIZE) {
    return false;
  }

  const currentCell = grid[from.y][from.x];
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (dx === 1 && currentCell.walls.right) return false;
  if (dx === -1 && currentCell.walls.left) return false;
  if (dy === 1 && currentCell.walls.bottom) return false;
  if (dy === -1 && currentCell.walls.top) return false;

  return true;
}

export function moveMonster(monster: MonsterPosition, grid: Grid): MonsterPosition {
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 1, y: 0 },  // right
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }  // left
  ];

  const validMoves = directions.filter(dir => {
    const newPos = { x: monster.x + dir.x, y: monster.y + dir.y };
    return canMove(monster, newPos, grid);
  });

  if (validMoves.length === 0) {
    return monster;
  }

  const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
  return {
    ...monster,
    x: monster.x + randomMove.x,
    y: monster.y + randomMove.y
  };
}

function widenPassages(grid: Grid): void {
  // 迷路の基本的な通路を確保した上で、戦略的に通路を広げる
  
  // 1. メイン通路を作成（縦横の主要な通路）
  for (let y = 0; y < MAZE_SIZE; y += 4) {
    for (let x = 0; x < MAZE_SIZE - 1; x++) {
      // 水平な主要通路
      grid[y][x].walls.right = false;
      grid[y][x + 1].walls.left = false;
    }
  }
  
  for (let x = 0; x < MAZE_SIZE; x += 4) {
    for (let y = 0; y < MAZE_SIZE - 1; y++) {
      // 垂直な主要通路
      grid[y][x].walls.bottom = false;
      grid[y + 1][x].walls.top = false;
    }
  }
  
  // 2. 既存の通路を適度に拡張（2マス幅の通路を作る）
  for (let y = 0; y < MAZE_SIZE; y++) {
    for (let x = 0; x < MAZE_SIZE; x++) {
      const cell = grid[y][x];
      
      // 右に通路がある場合、その下も通路にして2マス幅にする
      if (!cell.walls.right && y < MAZE_SIZE - 1 && x < MAZE_SIZE - 1) {
        if (Math.random() < 0.6) {
          grid[y + 1][x].walls.right = false;
          grid[y + 1][x + 1].walls.left = false;
        }
      }
      
      // 下に通路がある場合、その右も通路にして2マス幅にする  
      if (!cell.walls.bottom && x < MAZE_SIZE - 1 && y < MAZE_SIZE - 1) {
        if (Math.random() < 0.6) {
          grid[y][x + 1].walls.bottom = false;
          grid[y + 1][x + 1].walls.top = false;
        }
      }
    }
  }
  
  // 3. ランダムに広い部屋エリアを作成（3x3の小部屋）
  for (let attempt = 0; attempt < 8; attempt++) {
    const centerX = Math.floor(Math.random() * (MAZE_SIZE - 4)) + 2;
    const centerY = Math.floor(Math.random() * (MAZE_SIZE - 4)) + 2;
    
    // 3x3エリアの壁をすべて除去
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;
        
        if (x >= 0 && x < MAZE_SIZE && y >= 0 && y < MAZE_SIZE) {
          // 右の壁を除去
          if (x < MAZE_SIZE - 1) {
            grid[y][x].walls.right = false;
            grid[y][x + 1].walls.left = false;
          }
          // 下の壁を除去
          if (y < MAZE_SIZE - 1) {
            grid[y][x].walls.bottom = false;
            grid[y + 1][x].walls.top = false;
          }
        }
      }
    }
  }
  
  // 4. 行き止まりを減らすため、追加の接続を作成
  for (let y = 1; y < MAZE_SIZE - 1; y++) {
    for (let x = 1; x < MAZE_SIZE - 1; x++) {
      const cell = grid[y][x];
      
      // 周囲の壁の数を数える
      let wallCount = 0;
      if (cell.walls.top) wallCount++;
      if (cell.walls.right) wallCount++;
      if (cell.walls.bottom) wallCount++;
      if (cell.walls.left) wallCount++;
      
      // 3つ以上の壁がある（行き止まり状態）の場合、1つの壁を除去
      if (wallCount >= 3 && Math.random() < 0.5) {
        const directions = ['top', 'right', 'bottom', 'left'];
        const wallDirections = directions.filter(dir => cell.walls[dir]);
        
        if (wallDirections.length > 0) {
          const randomDir = wallDirections[Math.floor(Math.random() * wallDirections.length)];
          
          if (randomDir === 'top' && y > 0) {
            cell.walls.top = false;
            grid[y - 1][x].walls.bottom = false;
          } else if (randomDir === 'right' && x < MAZE_SIZE - 1) {
            cell.walls.right = false;
            grid[y][x + 1].walls.left = false;
          } else if (randomDir === 'bottom' && y < MAZE_SIZE - 1) {
            cell.walls.bottom = false;
            grid[y + 1][x].walls.top = false;
          } else if (randomDir === 'left' && x > 0) {
            cell.walls.left = false;
            grid[y][x - 1].walls.right = false;
          }
        }
      }
    }
  }
}

export function calculateDistanceToNearestTrap(
  playerPos: PlayerPosition, 
  grid: Grid
): number {
  let minDistance = Infinity;
  
  for (let y = 0; y < MAZE_SIZE; y++) {
    for (let x = 0; x < MAZE_SIZE; x++) {
      if (grid[y][x].occupant === 'trap') {
        const distance = Math.abs(playerPos.x - x) + Math.abs(playerPos.y - y);
        minDistance = Math.min(minDistance, distance);
      }
    }
  }
  
  return minDistance === Infinity ? 10 : minDistance;
}

export function getTrapWarningLevel(distance: number): string {
  if (distance <= 1) return 'danger'; // 赤
  if (distance <= 3) return 'warning'; // オレンジ
  if (distance <= 5) return 'caution'; // 黄色
  return 'safe'; // 通常
}