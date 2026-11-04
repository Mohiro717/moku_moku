import type { PuyoCell, PuyoColor, ColoredPuyoColor } from '../types/game';
import { GAME_CONFIG } from './puyoGameLogic';

// ========================================
// おじゃまの量
//
// 連鎖の k 段目で n 個消すと n × 倍率(k) ÷ 8 個ぶん送る。倍率は1段目だけ 1、
// 2段目からは 2^k（4, 8, 16, …）で、段が進むごとに倍になる。
// 端数は捨てずに持ち越す（4個消しを2回で1個）。
//   毎段4個なら 1連鎖 0.5 / 2連鎖 2.5 / 3連鎖 6.5 / 4連鎖 14.5 / 5連鎖 30.5
// ========================================

const OJAMA_DIVISOR = 8;
const MAX_STEP_POWER = 256;

/** 連鎖の step 段目（1始まり）で deleted 個消したときに送る量（端数あり） */
export const ojamaForStep = (step: number, deleted: number): number => {
  const power = step <= 1 ? 1 : Math.min(2 ** step, MAX_STEP_POWER);
  return (deleted * power) / OJAMA_DIVISOR;
};

/** 毎段4個ずつ消す chains 連鎖で送る量の目安（CPU の見積もり用） */
export const chainAttack = (chains: number): number => {
  let total = 0;
  for (let step = 1; step <= chains; step++) total += ojamaForStep(step, GAME_CONFIG.minChainLength);
  return total;
};

/** 1回に降るおじゃまの上限（6列×5段） */
export const MAX_OJAMA_PER_DROP = 30;

/**
 * おじゃまを降らせた盤面を返す。
 * 横一列ぶんは全列に1個ずつ、余りは重ならない列をランダムに選ぶので、列が偏らない。
 * 積もる場所が無い列に行く分は消える。
 */
export const dropOjamaPuyos = (grid: PuyoCell[][], ojamaCount: number): PuyoCell[][] => {
  if (ojamaCount <= 0) return grid;

  const width = GAME_CONFIG.gridWidth;
  const perColumn = Array(width).fill(Math.floor(ojamaCount / width));
  const columns = Array.from({ length: width }, (_, x) => x);
  for (let i = columns.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [columns[i], columns[j]] = [columns[j], columns[i]];
  }
  columns.slice(0, ojamaCount % width).forEach(x => perColumn[x]++);

  // 死亡ラインとスポーン行には積もらせない
  const topRow = GAME_CONFIG.gameOverLine + 1;
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  perColumn.forEach((count, x) => {
    for (let y = GAME_CONFIG.gridHeight - 1; y >= topRow && count > 0; y--) {
      if (newGrid[y][x].color) continue;
      newGrid[y][x] = { color: 'ojama', id: Math.random().toString(36) };
      count--;
    }
  });
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

export const isOjamaPuyo = (color: PuyoColor): boolean => {
  return color === 'ojama';
};

export const isColoredPuyo = (color: PuyoColor): color is ColoredPuyoColor => {
  return color !== null && color !== 'ojama';
};

export const canFormChain = (color: PuyoColor): boolean => {
  return isColoredPuyo(color);
};