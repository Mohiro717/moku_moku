import type { PuyoCell, PuyoPair, Position, GameDifficulty, ColoredPuyoColor } from '../types/game';
import { 
  GAME_CONFIG, 
  canPlacePair, 
  getPairPositions, 
  findConnectedPuyos,
  findLowestPosition,
  simulatePlacePuyo,
  getAllLegalMoves,
  processChains,
  applyGravity,
  calculateMaxChains
} from './puyoGameLogic';

// ========================================
// 定数定義
// ========================================

const CPU_AI_CONSTANTS = {
  // 安全性閾値
  SAFE_HEIGHT_LIMIT: 9,
  DANGEROUS_HEIGHT_LIMIT: 10,
  CRITICAL_HEIGHT_LIMIT: 12,
  MAX_DANGEROUS_COLUMNS: 2,
  
  // 緊急度判定
  EMERGENCY_URGENCY_THRESHOLD: 20,
  CRITICAL_OJAMA_COUNT: 6,
  DANGEROUS_OJAMA_COUNT: 10,
  
  // スコア倍率
  CHAIN_SCORE_MULTIPLIER: 1000,
  OJAMA_REMOVAL_BONUS: 200,
  EMERGENCY_CHAIN_MULTIPLIER: 10000,
  POTENTIAL_SCORE_MULTIPLIER: 800,
  FIELD_VALUE_MULTIPLIER: 2,
  OJAMA_PENALTY_MULTIPLIER: -8,
  
  // パフォーマンス制限
  EASY_THINK_TIME: 500,
  NORMAL_THINK_TIME: 800,
  HARD_THINK_TIME: 0,
  HARD_MAX_THINK_TIME: 150,
  
  // 探索制限
  NORMAL_NEXT_MOVES_LIMIT: 16,
  EMERGENCY_NEXT_MOVES_LIMIT: 6,
  HARD_NORMAL_NEXT_MOVES: 12,
  
  // 無限ループ防止
  MAX_CHAIN_COUNT: 12,
  MAX_CHAIN_POTENTIAL: 15
} as const;

// ========================================
// 型定義
// ========================================

export interface CpuMove {
  x: number;
  rotation: number;
  score: number;
}

export interface CpuAiConfig {
  thinkTime: number;
  randomness: number;
  heightPenalty: number;
  colorMatchBonus: number;
  chainBonus: number;
  maxChainLength: number;
  flatStackPreference: number;
  chainFormPreference: number;
  panicThreshold: number;
  immediateDropChance: number;
}

interface EmergencySituation {
  isEmergency: boolean;
  isCritical: boolean;
  urgencyLevel: number;
  recommendedAction: 'immediate_clear' | 'ojama_clear' | 'build_chain' | 'survive';
  dangerousColumns: number[];
}

interface MoveSafety {
  isSafe: boolean;
  safetyScore: number;
  resultingHeight: number;
  wouldCauseGameOver: boolean;
}

interface ChainPotentialAnalysis {
  maxChainPotential: number;
  triggerPositions: Array<{x: number, y: number, chainCount: number}>;
  fieldValue: number;
  ojamaImpact: number;
}

// ========================================
// AI設定
// ========================================

const AI_CONFIGS: Record<GameDifficulty, CpuAiConfig> = {
  easy: {
    thinkTime: CPU_AI_CONSTANTS.EASY_THINK_TIME,
    randomness: 0.8,
    heightPenalty: 10.0,
    colorMatchBonus: 1,
    chainBonus: 0.5,
    maxChainLength: 2,
    flatStackPreference: 8,
    chainFormPreference: 0,
    panicThreshold: 2,
    immediateDropChance: 0
  },
  normal: {
    thinkTime: CPU_AI_CONSTANTS.NORMAL_THINK_TIME,
    randomness: 0.3,
    heightPenalty: 2.0,
    colorMatchBonus: 4,
    chainBonus: 6,
    maxChainLength: 4,
    flatStackPreference: 2,
    chainFormPreference: 5,
    panicThreshold: 6,
    immediateDropChance: 0.5
  },
  hard: {
    thinkTime: CPU_AI_CONSTANTS.HARD_THINK_TIME,
    randomness: 0.05,
    heightPenalty: 1.0,
    colorMatchBonus: 8,
    chainBonus: 15,
    maxChainLength: 12,
    flatStackPreference: 0,
    chainFormPreference: 10,
    panicThreshold: 15,
    immediateDropChance: 1.0
  }
};

// ========================================
// ユーティリティ関数
// ========================================

export const getColumnHeight = (grid: PuyoCell[][], col: number): number => {
  for (let row = 0; row < GAME_CONFIG.gridHeight; row++) {
    if (grid[row][col].color) {
      return GAME_CONFIG.gridHeight - row;
    }
  }
  return 0;
};

const countAdjacentSameColor = (
  grid: PuyoCell[][], 
  x: number, 
  y: number, 
  color: ColoredPuyoColor
): number => {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let count = 0;
  
  directions.forEach(([dy, dx]) => {
    const newRow = y + dy;
    const newCol = x + dx;
    
    if (newRow >= 0 && newRow < GAME_CONFIG.gridHeight && 
        newCol >= 0 && newCol < GAME_CONFIG.gridWidth) {
      if (grid[newRow][newCol].color === color) {
        count++;
      }
    }
  });
  
  return count;
};

const simulateChainCount = (
  grid: PuyoCell[][],
  col: number,
  rotation: number,
  mainColor: ColoredPuyoColor,
  subColor: ColoredPuyoColor
): number => {
  const simulatedGrid = simulatePlacePuyo(grid, col, rotation, mainColor, subColor);
  if (!simulatedGrid) return 0;

  let currentGrid = applyGravity(simulatedGrid);
  let chainCount = 0;

  while (true) {
    const { newGrid, chainOccurred } = processChains(currentGrid);
    
    if (!chainOccurred) break;
    
    chainCount++;
    currentGrid = applyGravity(newGrid);
    
    if (chainCount > CPU_AI_CONSTANTS.MAX_CHAIN_COUNT) break;
  }

  return chainCount;
};

// ========================================
// 安全性評価関数
// ========================================

export const evaluateMoveSafety = (
  grid: PuyoCell[][],
  col: number,
  rotation: number,
  mainColor: ColoredPuyoColor,
  subColor: ColoredPuyoColor
): MoveSafety => {
  const simulatedGrid = simulatePlacePuyo(grid, col, rotation, mainColor, subColor);
  if (!simulatedGrid) {
    return { 
      isSafe: false, 
      safetyScore: -1000, 
      resultingHeight: 999,
      wouldCauseGameOver: true
    };
  }
  
  const gravityGrid = applyGravity(simulatedGrid);
  
  let maxResultHeight = 0;
  let dangerousColumns = 0;
  
  for (let c = 0; c < GAME_CONFIG.gridWidth; c++) {
    const height = getColumnHeight(gravityGrid, c);
    maxResultHeight = Math.max(maxResultHeight, height);
    if (height >= CPU_AI_CONSTANTS.DANGEROUS_HEIGHT_LIMIT) dangerousColumns++;
  }
  
  const wouldCauseGameOver = maxResultHeight >= CPU_AI_CONSTANTS.CRITICAL_HEIGHT_LIMIT || 
                           gravityGrid[1].some(cell => cell.color !== null);
  
  let safetyScore = 1000;
  safetyScore -= Math.pow(maxResultHeight, 2) * 5;
  safetyScore -= dangerousColumns * 200;
  
  const isSafe = !wouldCauseGameOver && 
                 maxResultHeight < CPU_AI_CONSTANTS.DANGEROUS_HEIGHT_LIMIT && 
                 dangerousColumns === 0;
  
  return {
    isSafe,
    safetyScore,
    resultingHeight: maxResultHeight,
    wouldCauseGameOver
  };
};

export const evaluateEmergencySituation = (grid: PuyoCell[][]): EmergencySituation => {
  let maxHeight = 0;
  let ojamaCount = 0;
  let criticalOjamaCount = 0;
  let dangerousColumns: number[] = [];
  
  for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
    const height = getColumnHeight(grid, col);
    maxHeight = Math.max(maxHeight, height);
    
    if (height >= CPU_AI_CONSTANTS.SAFE_HEIGHT_LIMIT) {
      dangerousColumns.push(col);
    }
  }
  
  for (let row = 0; row < GAME_CONFIG.gridHeight; row++) {
    for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
      if (grid[row][col].color === 'ojama') {
        ojamaCount++;
        if (row < GAME_CONFIG.gridHeight / 2) {
          criticalOjamaCount++;
        }
      }
    }
  }
  
  const urgencyLevel = maxHeight + (ojamaCount * 1.5) + (criticalOjamaCount * 2.5);
  const isEmergency = urgencyLevel > CPU_AI_CONSTANTS.EMERGENCY_URGENCY_THRESHOLD || 
                     maxHeight > 8;
  const isCritical = maxHeight > CPU_AI_CONSTANTS.DANGEROUS_HEIGHT_LIMIT || 
                    dangerousColumns.length > CPU_AI_CONSTANTS.MAX_DANGEROUS_COLUMNS;
  
  let recommendedAction: EmergencySituation['recommendedAction'];
  
  if (isCritical) {
    recommendedAction = 'survive';
  } else if (maxHeight > CPU_AI_CONSTANTS.SAFE_HEIGHT_LIMIT) {
    recommendedAction = 'immediate_clear';
  } else if (criticalOjamaCount > CPU_AI_CONSTANTS.CRITICAL_OJAMA_COUNT) {
    recommendedAction = 'immediate_clear';
  } else if (ojamaCount > CPU_AI_CONSTANTS.DANGEROUS_OJAMA_COUNT) {
    recommendedAction = 'ojama_clear';
  } else {
    recommendedAction = 'build_chain';
  }
  
  return { 
    isEmergency, 
    isCritical,
    urgencyLevel, 
    recommendedAction, 
    dangerousColumns 
  };
};

// ========================================
// Easy難易度関数
// ========================================

export const evaluateEasyMove = (
  grid: PuyoCell[][],
  col: number,
  rotation: number,
  mainColor: ColoredPuyoColor,
  subColor: ColoredPuyoColor
): number => {
  const simulatedGrid = simulatePlacePuyo(grid, col, rotation, mainColor, subColor);
  if (!simulatedGrid) return -1000;

  // (A) その手を置いた直後に消えるぷよの数 × 100
  const gravityGrid = applyGravity(simulatedGrid);
  const { chainOccurred, deletedCount } = processChains(gravityGrid);
  const scoreA = chainOccurred ? deletedCount * 100 : 0;

  // (B) 新たに隣接する同色ぷよのペアの数 × 10
  const testPair: PuyoPair = { main: mainColor, sub: subColor, x: col, y: 1, rotation };
  const positions = getPairPositions(testPair);
  
  const mainFinalY = findLowestPosition(simulatedGrid, positions.main.x, 0);
  const adjacentToMain = countAdjacentSameColor(simulatedGrid, positions.main.x, mainFinalY, mainColor);
  
  let adjacentToSub = 0;
  if (positions.main.x === positions.sub.x) {
    const subFinalY = Math.max(0, mainFinalY - 1);
    adjacentToSub = countAdjacentSameColor(simulatedGrid, positions.sub.x, subFinalY, subColor);
  } else {
    const subFinalY = findLowestPosition(simulatedGrid, positions.sub.x, 0);
    adjacentToSub = countAdjacentSameColor(simulatedGrid, positions.sub.x, subFinalY, subColor);
  }
  
  const scoreB = (adjacentToMain + adjacentToSub) * 10;

  // (C) ぷよを置いた後のフィールドで、最も高い位置にあるぷよの高さ × -5
  let maxHeight = 0;
  for (let c = 0; c < GAME_CONFIG.gridWidth; c++) {
    const height = getColumnHeight(gravityGrid, c);
    maxHeight = Math.max(maxHeight, height);
  }
  const scoreC = maxHeight * -5;

  return scoreA + scoreB + scoreC;
};

export const findBestMoveEasy = (
  grid: PuyoCell[][], 
  pair: PuyoPair
): CpuMove | null => {
  const legalMoves = getAllLegalMoves(grid, pair.main, pair.sub);
  
  if (legalMoves.length === 0) {
    return { x: Math.floor(GAME_CONFIG.gridWidth / 2), rotation: 0, score: 0 };
  }

  let bestMove: CpuMove | null = null;
  let bestScore = -Infinity;

  legalMoves.forEach(move => {
    const score = evaluateEasyMove(grid, move.col, move.rotation, pair.main, pair.sub);
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = { x: move.col, rotation: move.rotation, score };
    }
  });

  return bestMove;
};

// ========================================
// Normal難易度関数
// ========================================

const evaluateFieldStrategy = (grid: PuyoCell[][]): {
  ojamaCount: number;
  ojamaUrgency: number;
  chainPotential: number;
  fieldStability: number;
} => {
  let ojamaCount = 0;
  let highOjamaCount = 0;
  let chainPotential = 0;
  const colorGroups: Record<string, number> = {};
  
  for (let row = 0; row < GAME_CONFIG.gridHeight; row++) {
    for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
      const cell = grid[row][col];
      
      if (cell.color === 'ojama') {
        ojamaCount++;
        if (row < GAME_CONFIG.gridHeight / 2) {
          highOjamaCount++;
        }
      } else if (cell.color && cell.color !== 'ojama') {
        colorGroups[cell.color] = (colorGroups[cell.color] || 0) + 1;
      }
    }
  }
  
  Object.values(colorGroups).forEach(count => {
    if (count >= 3) chainPotential += count - 2;
  });
  
  const heights = [];
  for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
    heights.push(getColumnHeight(grid, col));
  }
  const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;
  const heightVariance = heights.reduce((sum, h) => sum + Math.pow(h - avgHeight, 2), 0) / heights.length;
  const fieldStability = 100 - heightVariance;
  
  return {
    ojamaCount,
    ojamaUrgency: highOjamaCount * 2 + ojamaCount,
    chainPotential,
    fieldStability
  };
};

const calculateOjamaRemovalEfficiency = (
  grid: PuyoCell[][],
  col: number,
  rotation: number,
  mainColor: ColoredPuyoColor,
  subColor: ColoredPuyoColor
): number => {
  const simulatedGrid = simulatePlacePuyo(grid, col, rotation, mainColor, subColor);
  if (!simulatedGrid) return 0;
  
  const gravityGrid = applyGravity(simulatedGrid);
  let removedOjama = 0;
  
  let currentGrid = gravityGrid;
  while (true) {
    const beforeOjama = currentGrid.flat().filter(cell => cell.color === 'ojama').length;
    const { newGrid, chainOccurred } = processChains(currentGrid);
    
    if (!chainOccurred) break;
    
    const afterOjama = newGrid.flat().filter(cell => cell.color === 'ojama').length;
    removedOjama += beforeOjama - afterOjama;
    currentGrid = applyGravity(newGrid);
  }
  
  return removedOjama;
};

export const evaluateNormalMove = (
  grid: PuyoCell[][],
  col: number,
  rotation: number,
  mainColor: ColoredPuyoColor,
  subColor: ColoredPuyoColor
): { scoreA: number; scoreB: number; totalScore: number } => {
  const simulatedGrid = simulatePlacePuyo(grid, col, rotation, mainColor, subColor);
  if (!simulatedGrid) {
    return { scoreA: -1000, scoreB: 0, totalScore: -1000 };
  }

  const fieldAnalysis = evaluateFieldStrategy(grid);
  
  const chainCount = simulateChainCount(grid, col, rotation, mainColor, subColor);
  const ojamaRemovalBonus = calculateOjamaRemovalEfficiency(grid, col, rotation, mainColor, subColor) * CPU_AI_CONSTANTS.OJAMA_REMOVAL_BONUS;
  const scoreA = chainCount * CPU_AI_CONSTANTS.CHAIN_SCORE_MULTIPLIER + ojamaRemovalBonus;

  if (chainCount > 0 || ojamaRemovalBonus > 0) {
    console.log(`[NORMAL CPU] 手の評価: ${chainCount}連鎖, おじゃま除去${ojamaRemovalBonus/CPU_AI_CONSTANTS.OJAMA_REMOVAL_BONUS}個 at (${col}, ${rotation})`);
  }

  let scoreB = 0;
  
  if (fieldAnalysis.ojamaUrgency > 5) {
    const immediateDelete = simulateChainCount(grid, col, rotation, mainColor, subColor);
    if (immediateDelete > 0) {
      scoreB += 500;
    } else {
      const testPair: PuyoPair = { main: mainColor, sub: subColor, x: col, y: 1, rotation };
      const positions = getPairPositions(testPair);
      
      let ojamaAdjacentCount = 0;
      [positions.main, positions.sub].forEach(pos => {
        const finalY = findLowestPosition(simulatedGrid, pos.x, 0);
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        directions.forEach(([dy, dx]) => {
          const checkY = finalY + dy;
          const checkX = pos.x + dx;
          if (checkY >= 0 && checkY < GAME_CONFIG.gridHeight && 
              checkX >= 0 && checkX < GAME_CONFIG.gridWidth) {
            if (grid[checkY][checkX].color === 'ojama') {
              ojamaAdjacentCount++;
            }
          }
        });
      });
      
      scoreB += ojamaAdjacentCount * 100;
    }
  } else {
    if (chainCount === 0) {
      const gravityGrid = applyGravity(simulatedGrid);
      let chainPotentialBonus = 0;
      const visited = new Set<string>();
      
      for (let row = 0; row < GAME_CONFIG.gridHeight; row++) {
        for (let c = 0; c < GAME_CONFIG.gridWidth; c++) {
          const cell = gravityGrid[row][c];
          if (cell.color && cell.color !== 'ojama' && !visited.has(`${row}-${c}`)) {
            const connected = findConnectedPuyos(gravityGrid, row, c, cell.color, new Set());
            if (connected.length === 3) {
              chainPotentialBonus += 80;
              connected.forEach(pos => visited.add(`${pos.y}-${pos.x}`));
            } else if (connected.length === 2) {
              chainPotentialBonus += 20;
              connected.forEach(pos => visited.add(`${pos.y}-${pos.x}`));
            }
          }
        }
      }
      
      const colorCounts: Record<string, number> = {};
      gravityGrid.flat().forEach(cell => {
        if (cell.color && cell.color !== 'ojama') {
          colorCounts[cell.color] = (colorCounts[cell.color] || 0) + 1;
        }
      });
      
      const colorBalance = Object.values(colorCounts).reduce((balance, count) => {
        return balance + Math.min(count, 6);
      }, 0) * 5;
      
      scoreB = chainPotentialBonus + colorBalance;
    }
  }
  
  const gravityGrid = applyGravity(simulatedGrid);
  let maxHeight = 0;
  for (let c = 0; c < GAME_CONFIG.gridWidth; c++) {
    const height = getColumnHeight(gravityGrid, c);
    maxHeight = Math.max(maxHeight, height);
  }
  const heightPenalty = Math.pow(maxHeight, 1.5) * -5;
  
  const totalScore = scoreA + scoreB + heightPenalty;
  return { scoreA, scoreB: scoreB + heightPenalty, totalScore };
};

export const findBestMoveNormal = (
  grid: PuyoCell[][], 
  pair: PuyoPair
): CpuMove | null => {
  const legalMoves = getAllLegalMoves(grid, pair.main, pair.sub);
  
  if (legalMoves.length === 0) {
    return { x: Math.floor(GAME_CONFIG.gridWidth / 2), rotation: 0, score: 0 };
  }

  let bestMoves: Array<{move: CpuMove; scoreA: number; scoreB: number}> = [];
  let maxScoreA = -Infinity;

  legalMoves.forEach(move => {
    const { scoreA, scoreB, totalScore } = evaluateNormalMove(grid, move.col, move.rotation, pair.main, pair.sub);
    
    const cpuMove: CpuMove = { x: move.col, rotation: move.rotation, score: totalScore };
    
    if (scoreA > maxScoreA) {
      maxScoreA = scoreA;
      bestMoves = [{ move: cpuMove, scoreA, scoreB }];
    } else if (scoreA === maxScoreA) {
      bestMoves.push({ move: cpuMove, scoreA, scoreB });
    }
  });

  if (bestMoves.length === 0) {
    return { x: Math.floor(GAME_CONFIG.gridWidth / 2), rotation: 0, score: 0 };
  }

  let finalBestMove = bestMoves[0];
  for (let i = 1; i < bestMoves.length; i++) {
    if (bestMoves[i].scoreB > finalBestMove.scoreB) {
      finalBestMove = bestMoves[i];
    }
  }

  return finalBestMove.move;
};

// ========================================
// Hard難易度関数
// ========================================

export const calculateAdvancedChainPotential = (grid: PuyoCell[][]): ChainPotentialAnalysis => {
  let maxPotential = 0;
  const triggerPositions: Array<{x: number, y: number, chainCount: number}> = [];
  let fieldValue = 0;
  let ojamaImpact = 0;
  
  for (let row = 0; row < GAME_CONFIG.gridHeight; row++) {
    for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
      const cell = grid[row][col];
      
      if (cell.color && cell.color !== 'ojama') {
        const testGrid = grid.map(r => r.map(c => ({ ...c })));
        testGrid[row][col] = { color: null, id: Math.random().toString(36) };
        
        let currentGrid = applyGravity(testGrid);
        let chainCount = 0;
        let totalDeleted = 0;
        
        while (true) {
          const { newGrid, chainOccurred, deletedCount } = processChains(currentGrid);
          if (!chainOccurred) break;
          
          chainCount++;
          totalDeleted += deletedCount;
          currentGrid = applyGravity(newGrid);
          
          if (chainCount > CPU_AI_CONSTANTS.MAX_CHAIN_POTENTIAL) break;
        }
        
        if (chainCount > 0) {
          triggerPositions.push({ x: col, y: row, chainCount });
          maxPotential = Math.max(maxPotential, chainCount);
          fieldValue += chainCount * totalDeleted;
        }
      }
    }
  }
  
  let ojamaCount = 0;
  let criticalOjamaCount = 0;
  
  for (let row = 0; row < GAME_CONFIG.gridHeight; row++) {
    for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
      if (grid[row][col].color === 'ojama') {
        ojamaCount++;
        if (row < GAME_CONFIG.gridHeight / 2) {
          criticalOjamaCount++;
        }
      }
    }
  }
  
  ojamaImpact = ojamaCount * 10 + criticalOjamaCount * 20;
  
  const colorCounts: Record<string, number> = {};
  grid.flat().forEach(cell => {
    if (cell.color && cell.color !== 'ojama') {
      colorCounts[cell.color] = (colorCounts[cell.color] || 0) + 1;
    }
  });
  
  const colorBalance = Object.values(colorCounts).reduce((balance, count) => {
    return balance + Math.min(count, 8) * (count >= 4 ? 2 : 1);
  }, 0);
  
  fieldValue += colorBalance;
  
  return {
    maxChainPotential: maxPotential,
    triggerPositions,
    fieldValue,
    ojamaImpact
  };
};

export const evaluateChainBuildingStrategy = (
  grid: PuyoCell[][],
  currentPair: PuyoPair,
  nextPair: PuyoPair
): number => {
  const currentAnalysis = calculateAdvancedChainPotential(grid);
  
  const pairColors = [currentPair.main, currentPair.sub, nextPair.main, nextPair.sub];
  const colorCounts: Record<string, number> = {};
  
  grid.flat().forEach(cell => {
    if (cell.color && cell.color !== 'ojama') {
      colorCounts[cell.color] = (colorCounts[cell.color] || 0) + 1;
    }
  });
  
  let colorSynergy = 0;
  pairColors.forEach(color => {
    const existingCount = colorCounts[color] || 0;
    if (existingCount >= 2) {
      colorSynergy += existingCount * 15;
    }
  });
  
  let triggerProximity = 0;
  currentAnalysis.triggerPositions.forEach(trigger => {
    const distanceFromCenter = Math.abs(trigger.x - (GAME_CONFIG.gridWidth / 2 - 0.5));
    triggerProximity += (trigger.chainCount * 10) / (1 + distanceFromCenter);
  });
  
  return colorSynergy + triggerProximity + currentAnalysis.fieldValue;
};

export const evaluateTwoMoveCombo = (
  grid: PuyoCell[][],
  currentPair: PuyoPair,
  nextPair: PuyoPair,
  firstMove: { col: number; rotation: number },
  secondMove: { col: number; rotation: number }
): number => {
  const firstGrid = simulatePlacePuyo(grid, firstMove.col, firstMove.rotation, currentPair.main, currentPair.sub);
  if (!firstGrid) return -10000;
  
  let currentGrid = applyGravity(firstGrid);
  let firstMoveChains = 0;
  let firstMoveScore = 0;
  
  while (true) {
    const { newGrid, chainOccurred, deletedCount } = processChains(currentGrid);
    if (!chainOccurred) break;
    
    firstMoveChains++;
    firstMoveScore += deletedCount * Math.pow(2, firstMoveChains - 1);
    currentGrid = applyGravity(newGrid);
    
    if (firstMoveChains > CPU_AI_CONSTANTS.MAX_CHAIN_COUNT) break;
  }
  
  const secondGrid = simulatePlacePuyo(currentGrid, secondMove.col, secondMove.rotation, nextPair.main, nextPair.sub);
  if (!secondGrid) {
    const firstAnalysis = calculateAdvancedChainPotential(currentGrid);
    return (firstMoveScore * 100) + firstAnalysis.fieldValue - (firstAnalysis.ojamaImpact * 5);
  }
  
  let finalGrid = applyGravity(secondGrid);
  let secondMoveChains = 0;
  let secondMoveScore = 0;
  
  while (true) {
    const { newGrid, chainOccurred, deletedCount } = processChains(finalGrid);
    if (!chainOccurred) break;
    
    secondMoveChains++;
    secondMoveScore += deletedCount * Math.pow(2, secondMoveChains - 1);
    finalGrid = applyGravity(newGrid);
    
    if (secondMoveChains > CPU_AI_CONSTANTS.MAX_CHAIN_COUNT) break;
  }
  
  const finalAnalysis = calculateAdvancedChainPotential(finalGrid);
  
  const immediateChainScore = (firstMoveScore + secondMoveScore) * 150;
  const potentialScore = finalAnalysis.maxChainPotential * CPU_AI_CONSTANTS.POTENTIAL_SCORE_MULTIPLIER;
  const fieldValueScore = finalAnalysis.fieldValue * CPU_AI_CONSTANTS.FIELD_VALUE_MULTIPLIER;
  const ojamaPenalty = finalAnalysis.ojamaImpact * CPU_AI_CONSTANTS.OJAMA_PENALTY_MULTIPLIER;
  const strategyBonus = evaluateChainBuildingStrategy(finalGrid, currentPair, nextPair);
  
  let maxHeight = 0;
  for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
    maxHeight = Math.max(maxHeight, getColumnHeight(finalGrid, col));
  }
  const heightPenalty = Math.pow(maxHeight, 2) * -10;
  
  const totalScore = immediateChainScore + potentialScore + fieldValueScore + 
                     ojamaPenalty + strategyBonus + heightPenalty;
  
  if (totalScore > 5000 || immediateChainScore > 1000) {
    console.log(`[HARD CPU] 高評価手発見: 総合${Math.round(totalScore)}, 即座連鎖${Math.round(immediateChainScore)}, ポテンシャル${finalAnalysis.maxChainPotential} at (${firstMove.col},${firstMove.rotation})→(${secondMove.col},${secondMove.rotation})`);
  }
  
  return totalScore;
};

export const findBestMoveHard = (
  grid: PuyoCell[][],
  currentPair: PuyoPair,
  nextPair: PuyoPair | null
): CpuMove | null => {
  if (!nextPair) {
    console.log('[HARD CPU] nextPairなし - 安全モード');
    return findBestMoveNormal(grid, currentPair);
  }
  
  const emergency = evaluateEmergencySituation(grid);
  const currentLegalMoves = getAllLegalMoves(grid, currentPair.main, currentPair.sub);
  
  if (currentLegalMoves.length === 0) {
    console.log('[HARD CPU] 合法手なし - 中央配置');
    return { x: Math.floor(GAME_CONFIG.gridWidth / 2), rotation: 0, score: 0 };
  }
  
  let bestMove: CpuMove | null = null;
  let bestScore = -Infinity;
  const safeMoves: Array<{move: {col: number, rotation: number}, score: number, safety: MoveSafety}> = [];
  let evaluatedMoves = 0;
  const startTime = Date.now();
  
  console.log(`[HARD CPU] 思考開始: ${emergency.recommendedAction}モード, 緊急度${emergency.urgencyLevel}, 危険列${emergency.dangerousColumns.length}`);
  
  // フェーズ1: 安全性評価
  currentLegalMoves.forEach(firstMove => {
    const safety = evaluateMoveSafety(grid, firstMove.col, firstMove.rotation, currentPair.main, currentPair.sub);
    
    if (safety.wouldCauseGameOver) {
      console.log(`[HARD CPU] 危険手除外: (${firstMove.col}, ${firstMove.rotation}) - ゲームオーバーリスク`);
      return;
    }
    
    if (emergency.isCritical && !safety.isSafe) return;
    
    safeMoves.push({
      move: firstMove,
      score: safety.safetyScore,
      safety
    });
  });
  
  if (safeMoves.length === 0) {
    console.log('[HARD CPU] 安全手なし - 最も安全な手を選択');
    let safestMove = null;
    let bestSafetyScore = -Infinity;
    
    currentLegalMoves.forEach(move => {
      const safety = evaluateMoveSafety(grid, move.col, move.rotation, currentPair.main, currentPair.sub);
      if (safety.safetyScore > bestSafetyScore) {
        bestSafetyScore = safety.safetyScore;
        safestMove = { x: move.col, rotation: move.rotation, score: safety.safetyScore };
      }
    });
    
    return safestMove || { x: Math.floor(GAME_CONFIG.gridWidth / 2), rotation: 0, score: 0 };
  }
  
  // フェーズ2: 最適解探索
  console.log(`[HARD CPU] 安全手${safeMoves.length}個から最適解を探索`);
  
  safeMoves.forEach(safeMove => {
    if (Date.now() - startTime > CPU_AI_CONSTANTS.HARD_MAX_THINK_TIME) return;
    
    const firstMove = safeMove.move;
    const firstGrid = simulatePlacePuyo(grid, firstMove.col, firstMove.rotation, currentPair.main, currentPair.sub);
    if (!firstGrid) return;
    
    let intermediateGrid = applyGravity(firstGrid);
    let firstMoveChains = 0;
    let firstMoveScore = 0;
    
    while (true) {
      const { newGrid, chainOccurred, deletedCount } = processChains(intermediateGrid);
      if (!chainOccurred) break;
      firstMoveChains++;
      firstMoveScore += deletedCount * Math.pow(2, firstMoveChains - 1);
      intermediateGrid = applyGravity(newGrid);
      if (firstMoveChains > CPU_AI_CONSTANTS.MAX_CHAIN_COUNT) break;
    }
    
    if ((emergency.isEmergency || emergency.isCritical) && firstMoveChains > 0) {
      const emergencyScore = firstMoveScore * 1000 + safeMove.safety.safetyScore;
      if (emergencyScore > bestScore) {
        bestScore = emergencyScore;
        bestMove = { x: firstMove.col, rotation: firstMove.rotation, score: emergencyScore };
        console.log(`[HARD CPU] 緊急安全連鎖: ${firstMoveChains}連鎖 at (${firstMove.col}, ${firstMove.rotation})`);
      }
      return;
    }
    
    if (!emergency.isCritical) {
      const nextLegalMoves = getAllLegalMoves(intermediateGrid, nextPair.main, nextPair.sub);
      const maxNextMoves = emergency.isEmergency ? 
        CPU_AI_CONSTANTS.EMERGENCY_NEXT_MOVES_LIMIT : 
        CPU_AI_CONSTANTS.HARD_NORMAL_NEXT_MOVES;
      const limitedNextMoves = nextLegalMoves.slice(0, maxNextMoves);
      
      let maxScoreForThisFirst = firstMoveScore * 200 + safeMove.safety.safetyScore;
      
      limitedNextMoves.forEach(secondMove => {
        const secondSafety = evaluateMoveSafety(intermediateGrid, secondMove.col, secondMove.rotation, nextPair.main, nextPair.sub);
        
        if (!secondSafety.isSafe && emergency.isEmergency) return;
        
        const comboScore = evaluateTwoMoveCombo(grid, currentPair, nextPair, firstMove, secondMove);
        const adjustedScore = comboScore + secondSafety.safetyScore;
        maxScoreForThisFirst = Math.max(maxScoreForThisFirst, adjustedScore);
      });
      
      if (limitedNextMoves.length === 0) {
        const analysis = calculateAdvancedChainPotential(intermediateGrid);
        maxScoreForThisFirst = Math.max(maxScoreForThisFirst, 
          analysis.fieldValue + (analysis.maxChainPotential * 300) + safeMove.safety.safetyScore);
      }
      
      if (maxScoreForThisFirst > bestScore) {
        bestScore = maxScoreForThisFirst;
        bestMove = { x: firstMove.col, rotation: firstMove.rotation, score: maxScoreForThisFirst };
      }
    } else {
      const criticalScore = safeMove.safety.safetyScore + (firstMoveScore * 100);
      if (criticalScore > bestScore) {
        bestScore = criticalScore;
        bestMove = { x: firstMove.col, rotation: firstMove.rotation, score: criticalScore };
      }
    }
    
    evaluatedMoves++;
  });
  
  const thinkTime = Date.now() - startTime;
  console.log(`[HARD CPU] 思考完了: ${evaluatedMoves}手評価, ${thinkTime}ms, 最高評価${Math.round(bestScore)}`);
  
  return bestMove || { x: Math.floor(GAME_CONFIG.gridWidth / 2), rotation: 0, score: 0 };
};

// ========================================
// メイン関数
// ========================================

export const findBestMove = (
  grid: PuyoCell[][], 
  pair: PuyoPair, 
  difficulty: GameDifficulty,
  nextPair?: PuyoPair | null
): CpuMove | null => {
  switch (difficulty) {
    case 'easy':
      return findBestMoveEasy(grid, pair);
    case 'normal':
      return findBestMoveNormal(grid, pair);
    case 'hard':
      return findBestMoveHard(grid, pair, nextPair || null);
    default:
      return findBestMoveEasy(grid, pair);
  }
};

export const getCpuAiConfig = (difficulty: GameDifficulty): CpuAiConfig => {
  return AI_CONFIGS[difficulty];
};