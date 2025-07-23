import type { PuyoCell, PuyoColor, ColoredPuyoColor } from '../types/game';
import { GAME_CONFIG, createEmptyGrid } from './puyoGameLogic';

export interface OjamaCalcResult {
  ojamaCount: number;
  remainingScore: number;
}

export const calculateOjamaFromChain = (chainCount: number, deletedPuyos: number): OjamaCalcResult => {
  // 異常な連鎖数を制限（20連鎖以上は無効とみなす）
  if (chainCount > 20) {
    console.warn(`[OJAMA CALCULATION] Abnormal chain count ${chainCount} detected - limiting to 20`);
    chainCount = 20;
  }
  
  // 異常な削除数を制限
  if (deletedPuyos > 100) {
    console.warn(`[OJAMA CALCULATION] Abnormal deleted count ${deletedPuyos} detected - limiting to 100`);
    deletedPuyos = 100;
  }

  let baseOjama = 0;

  // 連鎖によるボーナス（制限付き - 最大1個）
  if (chainCount >= 2) {
    const chainTable = [
      0,    // 0連鎖
      0,    // 1連鎖 - 基本消去では発生しない
      1,    // 2連鎖 - 1個
      1,    // 3連鎖 - 1個
      1,    // 4連鎖 - 1個
      1,    // 5連鎖 - 1個
      1,    // 6連鎖 - 1個
      1,    // 7連鎖 - 1個
      1,    // 8連鎖以上 - 1個
    ];

    const chainIndex = Math.min(chainCount, chainTable.length - 1);
    baseOjama = chainTable[chainIndex];
  }

  // 一度に大量消去によるボーナス（制限付き - 最大1個）
  let massDeleteBonus = 0;
  if (deletedPuyos >= 4) {
    // 4個以上消去でおじゃまぷよ発生（1個固定）
    massDeleteBonus = 1;
  }
  
  // 総おじゃまぷよ数（最大2個に制限）
  const totalOjama = Math.min(Math.floor(baseOjama + massDeleteBonus), 2);
  
  console.log(`[OJAMA CALCULATION] chainCount: ${chainCount}, deletedPuyos: ${deletedPuyos} -> baseOjama: ${baseOjama}, massDeleteBonus: ${massDeleteBonus}, total: ${totalOjama}`);
  
  return {
    ojamaCount: totalOjama,
    remainingScore: 0
  };
};

export const dropOjamaPuyos = (grid: PuyoCell[][], ojamaCount: number): PuyoCell[][] => {
  if (ojamaCount <= 0) return grid;

  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  
  // おじゃまぷよを下から上に向かって積み上げる（重力に従う）
  let remainingOjama = ojamaCount;
  
  // 各列の一番下から配置していく
  for (let attempts = 0; attempts < ojamaCount * 2 && remainingOjama > 0; attempts++) {
    const col = Math.floor(Math.random() * GAME_CONFIG.gridWidth);
    
    // 下から上に向かって空いている場所を探す（重力シミュレーション）
    for (let row = GAME_CONFIG.gridHeight - 1; row >= 2 && remainingOjama > 0; row--) { // row >= 2 でゲームオーバーライン回避
      if (!newGrid[row][col].color) {
        newGrid[row][col] = {
          color: 'ojama',
          id: Math.random().toString(36)
        };
        remainingOjama--;
        console.log(`[OJAMA DROP] Placed ojama at row ${row}, col ${col}`);
        break;
      }
    }
  }
  
  if (remainingOjama > 0) {
    console.log(`[OJAMA DROP] Warning: Could not place ${remainingOjama} ojama puyos (field too full)`);
  }
  
  return newGrid;
};

export const removeAdjacentOjama = (
  grid: PuyoCell[][], 
  deletedPositions: Array<{ x: number; y: number }>
): { newGrid: PuyoCell[][]; removedOjamaCount: number } => {
  if (!deletedPositions || deletedPositions.length === 0) {
    console.log(`[OJAMA ADJACENT] No deleted positions provided`);
    return { newGrid: grid, removedOjamaCount: 0 };
  }

  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  let removedOjamaCount = 0;
  // 上下左右の方向ベクトル [row変化, col変化]
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
  // 重複チェック用のSet（同じおじゃまぷよを複数回削除しないため）
  const removedOjamaPositions = new Set<string>();

  console.log(`[OJAMA ADJACENT] Processing ${deletedPositions.length} deleted positions for adjacent ojama removal`);
  
  // 削除されたぷよの隣接するおじゃまぷよを消去
  deletedPositions.forEach(pos => {
    console.log(`[OJAMA ADJACENT] Checking adjacent cells for deleted puyo at (${pos.x}, ${pos.y})`);
    
    directions.forEach(([dRow, dCol]) => {
      const adjacentRow = pos.y + dRow;
      const adjacentCol = pos.x + dCol;
      const positionKey = `${adjacentRow}-${adjacentCol}`;
      
      // 範囲チェック
      if (adjacentRow >= 0 && adjacentRow < GAME_CONFIG.gridHeight && 
          adjacentCol >= 0 && adjacentCol < GAME_CONFIG.gridWidth) {
        
        const adjacentCell = newGrid[adjacentRow][adjacentCol];
        const adjacentColor = adjacentCell.color;
        console.log(`  Adjacent cell (${adjacentCol}, ${adjacentRow}): color = ${adjacentColor}`);
        
        // おじゃまぷよで、まだ削除されていない場合
        if (isOjamaPuyo(adjacentColor) && !removedOjamaPositions.has(positionKey)) {
          console.log(`  🎯 Found ojama at (${adjacentCol}, ${adjacentRow}) - marking for removal!`);
          // アニメーション用にwillDeleteフラグを設定
          newGrid[adjacentRow][adjacentCol] = {
            ...adjacentCell,
            willDelete: true,
            isConnected: true  // アニメーション表示用
          };
          removedOjamaPositions.add(positionKey);
          removedOjamaCount++;
        } else if (adjacentColor === 'ojama' && removedOjamaPositions.has(positionKey)) {
          console.log(`  ⚠️ Ojama at (${adjacentCol}, ${adjacentRow}) already marked for removal`);
        }
      } else {
        console.log(`  Adjacent cell (${adjacentCol}, ${adjacentRow}): out of bounds`);
      }
    });
  });

  console.log(`[OJAMA ADJACENT] Completed - removed ${removedOjamaCount} ojama puyos`);
  return { newGrid, removedOjamaCount };
};

export const calculateOjamaOffset = (
  incomingOjama: number, 
  outgoingOjama: number
): { playerReceives: number; cpuReceives: number } => {
  // 相殺計算
  if (incomingOjama > outgoingOjama) {
    return {
      playerReceives: incomingOjama - outgoingOjama,
      cpuReceives: 0
    };
  } else if (outgoingOjama > incomingOjama) {
    return {
      playerReceives: 0,
      cpuReceives: outgoingOjama - incomingOjama
    };
  } else {
    return {
      playerReceives: 0,
      cpuReceives: 0
    };
  }
};

export const countOjamaPuyos = (grid: PuyoCell[][]): number => {
  let count = 0;
  for (let row = 0; row < GAME_CONFIG.gridHeight; row++) {
    for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
      if (grid[row][col].color === 'ojama') {
        count++;
      }
    }
  }
  return count;
};

export const isOjamaPuyo = (color: PuyoColor): boolean => {
  return color === 'ojama';
};

export const isColoredPuyo = (color: PuyoColor): color is ColoredPuyoColor => {
  return color !== null && color !== 'ojama';
};

export const canFormChain = (color: PuyoColor): boolean => {
  return isColoredPuyo(color);
};