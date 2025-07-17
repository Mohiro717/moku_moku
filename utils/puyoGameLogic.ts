import type { PuyoCell, PuyoColor, PuyoPair, Position, GameConfig } from '../types/game';

export const GAME_CONFIG: GameConfig = {
  gridWidth: 6,
  gridHeight: 13, // 12 + 1 for spawn area
  colors: ['red', 'blue', 'green', 'yellow'],
  minChainLength: 4,
  fallSpeed: 1000, // 1 second
  fastFallSpeed: 50, // fast drop
  gameOverLine: 1 // row 1 (top visible row)
};

export const createEmptyGrid = (): PuyoCell[][] => {
  return Array(GAME_CONFIG.gridHeight).fill(null).map(() =>
    Array(GAME_CONFIG.gridWidth).fill(null).map(() => ({
      color: null,
      id: Math.random().toString(36)
    }))
  );
};

export const getRandomColor = (): PuyoColor => {
  const colors = GAME_CONFIG.colors;
  return colors[Math.floor(Math.random() * colors.length)];
};

export const createRandomPair = (x: number = 2, y: number = 1): PuyoPair => ({
  main: getRandomColor(),
  sub: getRandomColor(),
  x,
  y,
  rotation: 0 // 0: sub on top of main
});

export const getPairPositions = (pair: PuyoPair): { main: Position; sub: Position } => {
  const { x, y, rotation } = pair;
  
  switch (rotation) {
    case 0: // sub on top
      return { main: { x, y }, sub: { x, y: y - 1 } };
    case 1: // sub on right
      return { main: { x, y }, sub: { x: x + 1, y } };
    case 2: // sub on bottom
      return { main: { x, y }, sub: { x, y: y + 1 } };
    case 3: // sub on left
      return { main: { x, y }, sub: { x: x - 1, y } };
    default:
      return { main: { x, y }, sub: { x, y: y - 1 } };
  }
};

export const isValidPosition = (pos: Position, grid: PuyoCell[][]): boolean => {
  return pos.x >= 0 && 
         pos.x < GAME_CONFIG.gridWidth && 
         pos.y >= 0 && 
         pos.y < GAME_CONFIG.gridHeight && 
         !grid[pos.y][pos.x].color;
};

export const canPlacePair = (grid: PuyoCell[][], pair: PuyoPair): boolean => {
  const positions = getPairPositions(pair);
  return isValidPosition(positions.main, grid) && isValidPosition(positions.sub, grid);
};

export const findLowestPosition = (grid: PuyoCell[][], col: number, startRow: number): number => {
  for (let row = GAME_CONFIG.gridHeight - 1; row >= startRow; row--) {
    if (!grid[row][col].color) {
      return row;
    }
  }
  return startRow; // Can't fall any lower
};

export const findConnectedPuyos = (
  grid: PuyoCell[][], 
  startRow: number, 
  startCol: number, 
  color: PuyoColor, 
  visited: Set<string>
): Position[] => {
  if (!color || visited.has(`${startRow}-${startCol}`) || 
      startRow < 0 || startRow >= GAME_CONFIG.gridHeight || 
      startCol < 0 || startCol >= GAME_CONFIG.gridWidth || 
      grid[startRow][startCol].color !== color) {
    return [];
  }

  visited.add(`${startRow}-${startCol}`);
  const connected: Position[] = [{ x: startCol, y: startRow }];

  // Check adjacent cells (up, down, left, right)
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dy, dx] of directions) {
    connected.push(...findConnectedPuyos(grid, startRow + dy, startCol + dx, color, visited));
  }

  return connected;
};

export const processChains = (grid: PuyoCell[][]): { 
  newGrid: PuyoCell[][]; 
  chainOccurred: boolean; 
  deletedCount: number 
} => {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell, willDelete: false, isConnected: false })));
  const visited = new Set<string>();
  let totalDeleted = 0;
  let chainOccurred = false;

  for (let row = 0; row < GAME_CONFIG.gridHeight; row++) {
    for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
      const cell = newGrid[row][col];
      if (cell.color && !visited.has(`${row}-${col}`)) {
        const connected = findConnectedPuyos(newGrid, row, col, cell.color, new Set());
        
        if (connected.length >= GAME_CONFIG.minChainLength) {
          chainOccurred = true;
          totalDeleted += connected.length;
          
          // Mark connected puyos for deletion
          connected.forEach(pos => {
            newGrid[pos.y][pos.x].willDelete = true;
            newGrid[pos.y][pos.x].isConnected = true;
            visited.add(`${pos.y}-${pos.x}`);
          });
        }
      }
    }
  }

  return { newGrid, chainOccurred, deletedCount: totalDeleted };
};

export const applyGravity = (grid: PuyoCell[][]): PuyoCell[][] => {
  const newGrid = createEmptyGrid();

  for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
    const columnCells: PuyoCell[] = [];
    
    // Collect non-deleted cells from bottom to top
    for (let row = GAME_CONFIG.gridHeight - 1; row >= 0; row--) {
      const cell = grid[row][col];
      if (cell.color && !cell.willDelete) {
        columnCells.push({
          ...cell,
          willDelete: false,
          isConnected: false,
          id: Math.random().toString(36)
        });
      }
    }

    // Place cells at bottom of column
    for (let i = 0; i < columnCells.length; i++) {
      const targetRow = GAME_CONFIG.gridHeight - 1 - i;
      newGrid[targetRow][col] = columnCells[i];
    }
  }

  return newGrid;
};

export const lockPairToGrid = (
  pair: PuyoPair, 
  grid: PuyoCell[][]
): { newGrid: PuyoCell[][]; isGameOver: boolean } => {
  const newGrid = grid.map(row => [...row]);
  const positions = getPairPositions(pair);

  // For same column pairs, need to handle them carefully
  if (positions.main.x === positions.sub.x) {
    // Same column - place them in order (bottom first, then top)
    const lowerY = Math.max(positions.main.y, positions.sub.y);
    const higherY = Math.min(positions.main.y, positions.sub.y);
    
    // Find positions for both puyos in the same column
    const lowerFinalY = findLowestPosition(newGrid, positions.main.x, lowerY);
    newGrid[lowerFinalY][positions.main.x] = {
      color: lowerY === positions.main.y ? pair.main : pair.sub,
      id: Math.random().toString(36)
    };
    
    // For the higher puyo, find position above the just-placed puyo
    const higherFinalY = findLowestPosition(newGrid, positions.main.x, higherY);
    newGrid[higherFinalY][positions.main.x] = {
      color: higherY === positions.main.y ? pair.main : pair.sub,
      id: Math.random().toString(36)
    };
  } else {
    // Different columns - apply gravity independently
    const mainFinalY = findLowestPosition(newGrid, positions.main.x, positions.main.y);
    const subFinalY = findLowestPosition(newGrid, positions.sub.x, positions.sub.y);

    newGrid[mainFinalY][positions.main.x] = {
      color: pair.main,
      id: Math.random().toString(36)
    };
    newGrid[subFinalY][positions.sub.x] = {
      color: pair.sub,
      id: Math.random().toString(36)
    };
  }

  // Check for game over (any column in top visible row has puyo)
  const isGameOver = newGrid[GAME_CONFIG.gameOverLine].some(cell => cell.color !== null);

  return { newGrid, isGameOver };
};

export const calculateChainScore = (deletedCount: number, chainCount: number): number => {
  const chainMultiplier = Math.pow(2, chainCount - 1);
  return deletedCount * 10 * chainMultiplier;
};