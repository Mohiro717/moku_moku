import type { PuyoCell, PuyoColor, ColoredPuyoColor, PuyoPair, Position, GameConfig } from '../types/game';
import { removeAdjacentOjama } from './ojamaSystem';

export const GAME_CONFIG: GameConfig = {
  gridWidth: 6,
  gridHeight: 13, // 12 + 1 for spawn area
  colors: ['red', 'blue', 'green', 'yellow'],
  minChainLength: 4,
  fallSpeed: 800, // 0.8 second
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

export const getRandomColor = (): ColoredPuyoColor => {
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
  for (let row = GAME_CONFIG.gridHeight - 1; row >= 0; row--) {
    if (!grid[row][col].color) {
      return row;
    }
  }
  return 0; // Top row if column is full
};

export const findConnectedPuyos = (
  grid: PuyoCell[][], 
  startRow: number, 
  startCol: number, 
  color: PuyoColor, 
  visited: Set<string>
): Position[] => {
  // おじゃまぷよは連鎖しない
  if (!color || color === 'ojama' || visited.has(`${startRow}-${startCol}`) || 
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

// Find chains for highlighting (step 1)
export const findChainsToHighlight = (grid: PuyoCell[][]): { 
  newGrid: PuyoCell[][]; 
  chainOccurred: boolean; 
  deletedCount: number 
} => {
  const newGrid = grid.map(row => row.map(cell => ({ 
    ...cell, 
    willDelete: false, 
    isConnected: false,
    isDeleting: false,
    isFalling: false
  })));
  const visited = new Set<string>();
  let totalDeleted = 0;
  let chainOccurred = false;
  let chainsFound = 0;

  // まず全体をスキャンしてお邪魔ぷよの数をカウント
  let ojamaCount = 0;
  for (let row = 0; row < GAME_CONFIG.gridHeight; row++) {
    for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
      if (newGrid[row][col].color === 'ojama') {
        ojamaCount++;
      }
    }
  }

  for (let row = 0; row < GAME_CONFIG.gridHeight; row++) {
    for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
      const cell = newGrid[row][col];
      // おじゃまぷよは連鎖対象外（厳格にチェック）
      if (cell.color && cell.color !== 'ojama' && cell.color !== null && !visited.has(`${row}-${col}`)) {
        const connected = findConnectedPuyos(newGrid, row, col, cell.color, new Set());
        
        if (connected.length >= GAME_CONFIG.minChainLength) {
          chainOccurred = true;
          totalDeleted += connected.length;
          chainsFound++;
          
          
          // Mark connected puyos for highlighting
          connected.forEach(pos => {
            newGrid[pos.y][pos.x].isConnected = true;
            visited.add(`${pos.y}-${pos.x}`);
          });
        }
      }
    }
  }

  
  // 異常検知: 削除数が全セル数を超える場合
  if (totalDeleted > GAME_CONFIG.gridWidth * GAME_CONFIG.gridHeight) {
    console.error(`[CHAIN DETECTION] ERROR: Total deleted (${totalDeleted}) exceeds grid size! Resetting.`);
    return { newGrid: grid, chainOccurred: false, deletedCount: 0 };
  }
  
  return { newGrid, chainOccurred, deletedCount: totalDeleted };
};

// Mark highlighted puyos for deletion (step 2)
export const markPuyosForDeletion = (grid: PuyoCell[][]): PuyoCell[][] => {
  return grid.map(row => row.map(cell => ({
    ...cell,
    isDeleting: cell.isConnected,
    willDelete: cell.isConnected
  })));
};

// Remove deleted puyos and adjacent ojama puyos (step 3)
export const removeDeletedPuyos = (grid: PuyoCell[][]): PuyoCell[][] => {
  // 消去されるぷよの位置を収集（色つきぷよのみ、おじゃまぷよは除外）
  const deletedPositions: Array<{ x: number; y: number }> = [];
  
  for (let row = 0; row < GAME_CONFIG.gridHeight; row++) {
    for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
      const cell = grid[row][col];
      // willDeleteフラグが立っていて、色つきぷよの場合のみ（おじゃまぷよは除外）
      if (cell.willDelete && cell.color && cell.color !== 'ojama') {
        deletedPositions.push({ x: col, y: row });
      }
    }
  }
  
  
  // 削除対象のおじゃまぷよもカウント
  let ojamaToDelete = 0;
  for (let row = 0; row < GAME_CONFIG.gridHeight; row++) {
    for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
      const cell = grid[row][col];
      if (cell.willDelete && cell.color === 'ojama') {
        ojamaToDelete++;
      }
    }
  }
  
  if (ojamaToDelete > 0) {
  }
  
  // 基本的な消去処理（色つきぷよとおじゃまぷよ両方）
  let newGrid = grid.map(row => row.map(cell => {
    if (cell.willDelete && cell.color) {
      // 色つきぷよとおじゃまぷよを削除
      return { color: null, id: Math.random().toString(36) };
    } else {
      // その他のセルはフラグをリセット
      return { 
        ...cell, 
        isConnected: false, 
        isDeleting: false,
        willDelete: false
      };
    }
  }));
  
  // おじゃまぷよの隣接消去処理
  if (deletedPositions.length > 0) {
    
    // 削除前のおじゃまぷよ数をカウント
    let ojamaCountBefore = 0;
    for (let row = 0; row < GAME_CONFIG.gridHeight; row++) {
      for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
        if (newGrid[row][col].color === 'ojama') {
          ojamaCountBefore++;
        }
      }
    }
    
    // おじゃまぷよにアニメーションフラグを設定（実際の削除はしない）
    const { newGrid: gridWithOjamaFlags, removedOjamaCount } = removeAdjacentOjama(newGrid, deletedPositions);
    newGrid = gridWithOjamaFlags;
    
    if (removedOjamaCount > 0) {
    } else {
    }
  } else {
  }
  
  return newGrid;
};

// Complete chain processing with ojama removal (replaces legacy processChains)
export const processChains = (grid: PuyoCell[][]): { 
  newGrid: PuyoCell[][]; 
  chainOccurred: boolean; 
  deletedCount: number 
} => {
  
  // 入力検証
  if (!grid || grid.length === 0) {
    console.error(`[CHAIN PROCESS] Invalid grid provided`);
    return { newGrid: createEmptyGrid(), chainOccurred: false, deletedCount: 0 };
  }
  
  // Step 1: Find chains to highlight
  const { newGrid: highlightGrid, chainOccurred, deletedCount } = findChainsToHighlight(grid);
  
  if (!chainOccurred) {
    return { newGrid: grid, chainOccurred: false, deletedCount: 0 };
  }
  
  // 異常な削除数チェック
  if (deletedCount <= 0 || deletedCount > 50) {
    console.warn(`[CHAIN PROCESS] Abnormal deleted count: ${deletedCount} - aborting chain processing`);
    return { newGrid: grid, chainOccurred: false, deletedCount: 0 };
  }
  
  
  // Step 2: Mark puyos for deletion
  const markedGrid = markPuyosForDeletion(highlightGrid);
  
  // Step 3: Remove deleted puyos and adjacent ojama puyos
  const finalGrid = removeDeletedPuyos(markedGrid);
  
  return { newGrid: finalGrid, chainOccurred, deletedCount };
};

export const applyGravity = (grid: PuyoCell[][]): PuyoCell[][] => {
  const newGrid = createEmptyGrid();
  

  for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
    const columnCells: PuyoCell[] = [];
    
    // Collect all existing cells (including ojama) from bottom to top
    for (let row = GAME_CONFIG.gridHeight - 1; row >= 0; row--) {
      const cell = grid[row][col];
      // 色がありwillDeleteフラグが立っていないセル（お邪魔ぷよも含む）
      if (cell.color && !cell.willDelete && !cell.isDeleting) {
        columnCells.push({
          color: cell.color,
          id: Math.random().toString(36),
          willDelete: false,
          isConnected: false,
          isDeleting: false,
          isFalling: false
        });
      } else if (cell.color) {
      }
    }

    // Place cells at bottom of column
    for (let i = 0; i < columnCells.length; i++) {
      const targetRow = GAME_CONFIG.gridHeight - 1 - i;
      newGrid[targetRow][col] = columnCells[i];
    }
    
    if (columnCells.length > 0) {
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
    // Same column - place them in proper order with gravity
    const lowerY = Math.max(positions.main.y, positions.sub.y);
    const higherY = Math.min(positions.main.y, positions.sub.y);
    
    // First, place the lower puyo (which will fall to the bottom)
    const lowerFinalY = findLowestPosition(newGrid, positions.main.x, 0);
    const lowerColor = lowerY === positions.main.y ? pair.main : pair.sub;
    newGrid[lowerFinalY][positions.main.x] = {
      color: lowerColor,
      id: Math.random().toString(36)
    };
    
    // Then place the higher puyo (which will fall to rest on top of the lower one)
    const higherFinalY = Math.max(0, lowerFinalY - 1);
    const higherColor = higherY === positions.main.y ? pair.main : pair.sub;
    if (higherFinalY >= 0) {
      newGrid[higherFinalY][positions.main.x] = {
        color: higherColor,
        id: Math.random().toString(36)
      };
    }
  } else {
    // Different columns - apply gravity independently
    const mainFinalY = findLowestPosition(newGrid, positions.main.x, 0);
    const subFinalY = findLowestPosition(newGrid, positions.sub.x, 0);

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
  // 異常値制限
  const limitedDeletedCount = Math.min(Math.max(deletedCount, 0), 50); // 0-50個に制限
  const limitedChainCount = Math.min(Math.max(chainCount, 1), 10); // 1-10連鎖に制限
  
  // 倍率も制限（最大1024倍まで）
  const chainMultiplier = Math.min(Math.pow(2, limitedChainCount - 1), 1024);
  const score = limitedDeletedCount * 10 * chainMultiplier;
  
  // 最終スコアも制限（最大10万点まで）
  const limitedScore = Math.min(score, 100000);
  
  if (score !== limitedScore || deletedCount !== limitedDeletedCount || chainCount !== limitedChainCount) {
  }
  
  return limitedScore;
};

// CPU AI ヘルパー関数群

// ぷよを指定位置に置いた後の新しいフィールドを返す
export const simulatePlacePuyo = (
  grid: PuyoCell[][],
  col: number,
  rotation: number,
  mainColor: ColoredPuyoColor,
  subColor: ColoredPuyoColor
): PuyoCell[][] | null => {
  // 回転に基づいて配置位置を計算
  const getPlacementPositions = (column: number, rot: number) => {
    const lowestY = findLowestPosition(grid, column, 0);
    
    switch (rot) {
      case 0: // sub on top
        return {
          main: { x: column, y: lowestY },
          sub: { x: column, y: lowestY - 1 }
        };
      case 1: // sub on right
        return {
          main: { x: column, y: lowestY },
          sub: { x: column + 1, y: findLowestPosition(grid, column + 1, 0) }
        };
      case 2: // sub on bottom (main on top)
        return {
          main: { x: column, y: lowestY - 1 },
          sub: { x: column, y: lowestY }
        };
      case 3: // sub on left
        return {
          main: { x: column, y: lowestY },
          sub: { x: column - 1, y: findLowestPosition(grid, column - 1, 0) }
        };
      default:
        return null;
    }
  };

  const positions = getPlacementPositions(col, rotation);
  if (!positions) return null;

  // 配置可能かチェック
  if (!isValidPosition(positions.main, grid) || !isValidPosition(positions.sub, grid)) {
    return null;
  }

  // 新しいグリッドに配置
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  newGrid[positions.main.y][positions.main.x] = {
    color: mainColor,
    id: Math.random().toString(36)
  };
  newGrid[positions.sub.y][positions.sub.x] = {
    color: subColor,
    id: Math.random().toString(36)
  };

  return newGrid;
};

// フィールドの連鎖数を計算する
export const calculateMaxChains = (grid: PuyoCell[][]): number => {
  let chainCount = 0;
  let currentGrid = grid.map(row => row.map(cell => ({ ...cell })));

  while (true) {
    // 重力を適用
    currentGrid = applyGravity(currentGrid);
    
    // 連鎖をチェック
    const { newGrid, chainOccurred } = processChains(currentGrid);
    
    if (!chainOccurred) {
      break;
    }
    
    chainCount++;
    currentGrid = newGrid;
    
    // 無限ループ防止
    if (chainCount > 10) {
      break;
    }
  }

  return chainCount;
};

// 合法手をすべてリストアップする
export const getAllLegalMoves = (
  grid: PuyoCell[][],
  mainColor: ColoredPuyoColor,
  subColor: ColoredPuyoColor
): Array<{ col: number; rotation: number }> => {
  const legalMoves: Array<{ col: number; rotation: number }> = [];

  for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
    for (let rotation = 0; rotation < 4; rotation++) {
      // 仮想的なぷよペアを作成
      const testPair: PuyoPair = {
        main: mainColor,
        sub: subColor,
        x: col,
        y: 1,
        rotation
      };

      // 配置可能かチェック
      if (canPlacePair(grid, testPair)) {
        // さらに詳細な配置可能性をチェック
        const simulatedGrid = simulatePlacePuyo(grid, col, rotation, mainColor, subColor);
        if (simulatedGrid) {
          legalMoves.push({ col, rotation });
        }
      }
    }
  }

  return legalMoves;
};