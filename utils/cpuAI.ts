import type { PuyoCell, PuyoPair, Position, GameDifficulty } from '../types/game';
import { 
  GAME_CONFIG, 
  canPlacePair, 
  getPairPositions, 
  findConnectedPuyos,
  findLowestPosition 
} from './puyoGameLogic';

export interface CpuMove {
  x: number;
  rotation: number;
  score: number;
}

export interface CpuAiConfig {
  thinkTime: number; // CPU思考時間（ミリ秒）
  randomness: number; // ランダム性（0-1）
  heightPenalty: number; // 高さに対するペナルティ
  colorMatchBonus: number; // 同色隣接ボーナス
  chainBonus: number; // 連鎖ボーナス
  maxChainLength: number; // 最大連鎖長制限
  flatStackPreference: number; // 平積み優先度（EASY用）
  chainFormPreference: number; // 連鎖形作成優先度
  panicThreshold: number; // パニック閾値（おじゃま対応）
  immediateDropChance: number; // 即落とし確率
}

const AI_CONFIGS: Record<GameDifficulty, CpuAiConfig> = {
  easy: {
    thinkTime: 2500,        // 非常に長い思考時間（甘口）
    randomness: 0.8,        // 高いランダム性で初心者らしく
    heightPenalty: 10.0,    // 窒息を異常に恐れる
    colorMatchBonus: 1,     // 同色隣接をあまり考えない
    chainBonus: 0.5,        // 連鎖をほとんど考えない
    maxChainLength: 2,      // 最大2連鎖まで
    flatStackPreference: 8, // 平積み強く優先
    chainFormPreference: 0, // 連鎖形を作らない
    panicThreshold: 2,      // 少しのおじゃまでパニック
    immediateDropChance: 0  // 0%の確率で即落とし（自然落下のみ）
  },
  normal: {
    thinkTime: 1200,        // 普通の思考時間（中辛）
    randomness: 0.3,        // 適度なランダム性
    heightPenalty: 2.0,     // バランスの取れた高さ管理
    colorMatchBonus: 4,     // 同色配置を意識
    chainBonus: 6,          // 連鎖を積極的に狙う
    maxChainLength: 5,      // 最大5連鎖まで
    flatStackPreference: 2, // 平積みも考慮
    chainFormPreference: 5, // 基本的な連鎖形を作る
    panicThreshold: 6,      // 中程度のおじゃままで対応
    immediateDropChance: 0.5 // 50%の確率で即落とし
  },
  hard: {
    thinkTime: 200,         // 非常に短い思考時間（辛口・激辛）
    randomness: 0.05,       // ほぼランダム性なし
    heightPenalty: 1.0,     // 高度な高さ管理
    colorMatchBonus: 8,     // 完璧な同色配置
    chainBonus: 15,         // 連鎖を最優先
    maxChainLength: 12,     // 大連鎖狙い
    flatStackPreference: 0, // 平積みしない
    chainFormPreference: 10,// 高度な連鎖形を作る
    panicThreshold: 15,     // 大量のおじゃまも対応
    immediateDropChance: 1.0 // 100%の確率で即落とし
  }
};

export const getColumnHeight = (grid: PuyoCell[][], col: number): number => {
  for (let row = 0; row < GAME_CONFIG.gridHeight; row++) {
    if (grid[row][col].color) {
      return GAME_CONFIG.gridHeight - row;
    }
  }
  return 0;
};

export const evaluateColorMatches = (
  grid: PuyoCell[][], 
  positions: Position[], 
  colors: string[]
): number => {
  let score = 0;
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  positions.forEach((pos, index) => {
    directions.forEach(([dy, dx]) => {
      const newRow = pos.y + dy;
      const newCol = pos.x + dx;
      
      if (newRow >= 0 && newRow < GAME_CONFIG.gridHeight && 
          newCol >= 0 && newCol < GAME_CONFIG.gridWidth) {
        const adjacentColor = grid[newRow][newCol].color;
        if (adjacentColor === colors[index]) {
          score += 1;
        }
      }
    });
  });

  return score;
};

export const simulatePlacement = (
  grid: PuyoCell[][], 
  pair: PuyoPair
): { newGrid: PuyoCell[][]; placedPositions: Position[] } => {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  const positions = getPairPositions(pair);
  const placedPositions: Position[] = [];

  // シミュレーション用の簡単な落下処理
  if (positions.main.x === positions.sub.x) {
    // 同じ列の場合
    const lowerFinalY = findLowestPosition(newGrid, positions.main.x, 0);
    const higherFinalY = Math.max(0, lowerFinalY - 1);
    
    const lowerPos = positions.main.y > positions.sub.y ? positions.main : positions.sub;
    const higherPos = positions.main.y > positions.sub.y ? positions.sub : positions.main;
    
    newGrid[lowerFinalY][positions.main.x] = {
      color: lowerPos === positions.main ? pair.main : pair.sub,
      id: Math.random().toString(36)
    };
    newGrid[higherFinalY][positions.main.x] = {
      color: higherPos === positions.main ? pair.main : pair.sub,
      id: Math.random().toString(36)
    };
    
    placedPositions.push(
      { x: positions.main.x, y: lowerFinalY },
      { x: positions.main.x, y: higherFinalY }
    );
  } else {
    // 異なる列の場合
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
    
    placedPositions.push(
      { x: positions.main.x, y: mainFinalY },
      { x: positions.sub.x, y: subFinalY }
    );
  }

  return { newGrid, placedPositions };
};

export const evaluateMove = (
  grid: PuyoCell[][], 
  pair: PuyoPair, 
  config: CpuAiConfig
): number => {
  if (!canPlacePair(grid, pair)) {
    return -1000; // 配置不可能な場合は大幅減点
  }

  const { newGrid, placedPositions } = simulatePlacement(grid, pair);
  let score = 0;

  // 高さペナルティ（難易度別で大きく調整）
  placedPositions.forEach(pos => {
    const height = getColumnHeight(newGrid, pos.x);
    score -= Math.pow(height, config.flatStackPreference > 5 ? 2.5 : 1.5) * config.heightPenalty;
  });

  // 平積み優先度（EASY用）
  if (config.flatStackPreference > 0) {
    let maxHeight = 0;
    let minHeight = GAME_CONFIG.gridHeight;
    for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
      const height = getColumnHeight(newGrid, col);
      maxHeight = Math.max(maxHeight, height);
      minHeight = Math.min(minHeight, height);
    }
    const heightDiff = maxHeight - minHeight;
    // 平積み優先度が高いほど、高さの差を嫌う
    score -= heightDiff * config.flatStackPreference * 2;
  }

  // 同色隣接ボーナス
  const colors = [pair.main, pair.sub];
  const adjacentScore = evaluateColorMatches(grid, placedPositions, colors);
  score += adjacentScore * config.colorMatchBonus;

  // 連鎖可能性の評価（難易度別制限付き）
  let chainPotential = 0;
  let totalChainLength = 0;
  placedPositions.forEach(pos => {
    const color = newGrid[pos.y][pos.x].color;
    if (color && color !== 'ojama') {
      const connected = findConnectedPuyos(newGrid, pos.y, pos.x, color, new Set());
      
      // 最大連鎖長制限を適用
      if (totalChainLength < config.maxChainLength) {
        if (connected.length === 3) {
          chainPotential += 2; // 連鎖準備ボーナス
        } else if (connected.length >= 4) {
          chainPotential += connected.length * 2; // 即連鎖ボーナス
          totalChainLength++;
        }
      } else {
        // 制限を超える連鎖は減点（EASY用）
        if (config.maxChainLength <= 2) {
          chainPotential -= connected.length;
        }
      }
    }
  });
  score += chainPotential * config.chainBonus;

  // 連鎖形作成ボーナス（NORMAL/HARD用）
  if (config.chainFormPreference > 0) {
    // 階段積みや基本連鎖形の検出（簡易版）
    let chainFormBonus = 0;
    for (let col = 0; col < GAME_CONFIG.gridWidth - 1; col++) {
      const height1 = getColumnHeight(newGrid, col);
      const height2 = getColumnHeight(newGrid, col + 1);
      // 階段状の高さ差を評価
      if (Math.abs(height1 - height2) === 1) {
        chainFormBonus += config.chainFormPreference;
      }
    }
    score += chainFormBonus;
  }

  // 中央付近配置ボーナス
  placedPositions.forEach(pos => {
    const centerDistance = Math.abs(pos.x - (GAME_CONFIG.gridWidth / 2 - 0.5));
    score += (3 - centerDistance) * 0.5;
  });

  // おじゃまぷよ対応（難易度別）
  let ojamaCount = 0;
  for (let row = 0; row < GAME_CONFIG.gridHeight; row++) {
    for (let col = 0; col < GAME_CONFIG.gridWidth; col++) {
      if (grid[row][col].color === 'ojama') {
        ojamaCount++;
      }
    }
  }
  
  // パニック閾値を超えるとランダム性が増加（EASY用）
  if (ojamaCount > config.panicThreshold && config.panicThreshold < 5) {
    score += (Math.random() - 0.5) * 20; // パニック状態
  }

  // おじゃまぷよ除去ボーナス
  let ojamaRemovalBonus = 0;
  placedPositions.forEach(pos => {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    directions.forEach(([dy, dx]) => {
      const newRow = pos.y + dy;
      const newCol = pos.x + dx;
      if (newRow >= 0 && newRow < GAME_CONFIG.gridHeight && 
          newCol >= 0 && newCol < GAME_CONFIG.gridWidth) {
        if (grid[newRow][newCol].color === 'ojama') {
          ojamaRemovalBonus += ojamaCount > config.panicThreshold ? 1 : 5;
        }
      }
    });
  });
  score += ojamaRemovalBonus;

  // ランダム性を追加（難易度別で大きく調整）
  score += (Math.random() - 0.5) * config.randomness * 20;

  return score;
};

export const findBestMove = (
  grid: PuyoCell[][], 
  pair: PuyoPair, 
  difficulty: GameDifficulty
): CpuMove | null => {
  
  const config = AI_CONFIGS[difficulty];
  let bestMove: CpuMove | null = null;
  let bestScore = -Infinity;
  let validMoves = 0;
  let allMoves: CpuMove[] = [];

  // 全ての可能な配置をテスト
  for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
    for (let rotation = 0; rotation < 4; rotation++) {
      const testPair: PuyoPair = { ...pair, x, rotation, y: 1 };
      const score = evaluateMove(grid, testPair, config);
      
      if (score > -999) { // 配置可能な手のみカウント
        validMoves++;
        allMoves.push({ x, rotation, score });
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = { x, rotation, score };
      }
    }
  }

  // 即落とし判定は実行段階で行うため、ここでは削除

  // EASY難易度では時々ランダムな手を選ぶ（自然落下のみ）
  if (difficulty === 'easy' && Math.random() < 0.4 && allMoves.length > 0) {
    const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    return randomMove;
  }
  
  // フォールバック：最適手が見つからない場合はデフォルトの動作
  if (!bestMove || bestScore === -Infinity) {
    return { x: Math.floor(GAME_CONFIG.gridWidth / 2), rotation: 0, score: 0 };
  }

  return bestMove;
}

export const getCpuAiConfig = (difficulty: GameDifficulty): CpuAiConfig => {
  return AI_CONFIGS[difficulty];
};