export type ColoredPuyoColor = 'red' | 'blue' | 'green' | 'yellow';
export type PuyoColor = ColoredPuyoColor | 'ojama' | null;

export interface PuyoCell {
  color: PuyoColor;
  id: string;
  isConnected?: boolean;
  willDelete?: boolean;
  isDeleting?: boolean;
  isFalling?: boolean;
}

export interface PuyoPair {
  main: ColoredPuyoColor; // 下側のぷよ（お邪魔ぷよは生成時に出現しない）
  sub: ColoredPuyoColor;  // 上側のぷよ（お邪魔ぷよは生成時に出現しない）
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
  chainAnimationStep: ChainAnimationStep;
  currentChainStep: number;
}

export interface GameConfig {
  gridWidth: number;
  gridHeight: number;
  colors: ColoredPuyoColor[]; // お邪魔ぷよは含まない（生成時のみ）
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
  newGrid: PuyoCell[][];
  chainOccurred: boolean;
  deletedCount: number;
}

export interface ChainProcessingState {
  currentGrid: PuyoCell[][];
  deletionRounds: number;
  totalScore: number;
  actualChains: number;
}

export type ChainAnimationStep = 'idle' | 'highlighting' | 'deleting' | 'falling' | 'complete';

export interface GameTimings {
  highlight: number;
  deletion: number;
  falling: number;
  complete: number;
  puyoFallInterval: number;
}

export type GameDifficulty = 'easy' | 'normal' | 'hard';

export type GamePlayer = 'player' | 'cpu';

export interface VsGameState {
  player: GameState;
  cpu: GameState;
  gameMode: 'single' | 'vs-cpu';
  difficulty: GameDifficulty;
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  winner: GamePlayer | null;
  pendingOjamaPlayer: number;
  pendingOjamaCpu: number;
}

