export type PuyoColor = 'red' | 'blue' | 'green' | 'yellow' | null;

export interface PuyoCell {
  color: PuyoColor;
  id: string;
  isConnected?: boolean;
  willDelete?: boolean;
}

export interface PuyoPair {
  main: PuyoColor; // 下側のぷよ
  sub: PuyoColor;  // 上側のぷよ
  x: number;       // 横位置（列）
  y: number;       // 縦位置（行、下側ぷよの位置）
  rotation: number; // 0:上下, 1:右左, 2:下上, 3:左右
}

export interface GameState {
  grid: PuyoCell[][];
  currentPair: PuyoPair | null;
  nextPair: PuyoPair | null;
  score: number;
  chainCount: number;
  isGameOver: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  isChaining: boolean;
  lastFallTime: number;
}

export interface GameConfig {
  gridWidth: number;
  gridHeight: number;
  colors: PuyoColor[];
  minChainLength: number;
  fallSpeed: number; // milliseconds
  fastFallSpeed: number;
  gameOverLine: number; // 左から3列目の行番号
}

export interface Position {
  x: number;
  y: number;
}

export interface ChainResult {
  deletedCount: number;
  chainLength: number;
  score: number;
}

export type GameAction = 
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'ROTATE' }
  | { type: 'SOFT_DROP' }
  | { type: 'HARD_DROP' }
  | { type: 'TICK' } // 自動落下
  | { type: 'LOCK_PAIR' } // ペア着地
  | { type: 'CLEAR_CHAINS' }
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'GAME_OVER' }
  | { type: 'RESTART' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' };