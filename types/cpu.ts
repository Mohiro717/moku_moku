import type { GameDifficulty, GameState, PuyoPair } from './game';

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

export interface CpuOperationSettings {
  rotationDelay: number;
  moveDelay: number;
  finalDelay: number;
  errorChance: number;
  rotationErrorChance: number;
  immediateDropChance: number;
}

export interface CpuOperationResult {
  success: boolean;
  move?: CpuMove;
  error?: string;
}

export interface GameConditions {
  hasCurrentPair: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isChaining: boolean;
  isGameOver: boolean;
}

export type CpuOperationPhase = 'thinking' | 'rotating' | 'moving' | 'dropping' | 'complete';

export interface CpuOperationContext {
  phase: CpuOperationPhase;
  difficulty: GameDifficulty;
  pairId: string;
  startTime: number;
  expectedEndTime: number;
}

export interface CpuMessageConfig {
  processing: (difficulty: string, pairId: string, thinkTime: number) => string;
  thinking: (difficulty: string) => string;
  foundMove: (difficulty: string, x: number, rotation: number) => string;
  hardDrop: (difficulty: string) => string;
  naturalDrop: (difficulty: string) => string;
  noValidMove: (difficulty: string) => string;
  operationCancelled: (difficulty: string) => string;
  readyForNext: () => string;
}