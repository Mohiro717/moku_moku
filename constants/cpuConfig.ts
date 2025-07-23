import type { GameDifficulty } from '../types/game';

export interface CpuOperationSettings {
  rotationDelay: number;
  moveDelay: number;
  finalDelay: number;
  errorChance: number;
  rotationErrorChance: number;
  immediateDropChance: number;
}

export const CPU_OPERATION_CONFIGS: Record<GameDifficulty, CpuOperationSettings> = {
  easy: {
    rotationDelay: 300,
    moveDelay: 200,
    finalDelay: 400,
    errorChance: 0.15,
    rotationErrorChance: 0.1,
    immediateDropChance: 0
  },
  normal: {
    rotationDelay: 150,
    moveDelay: 100,
    finalDelay: 100,
    errorChance: 0,
    rotationErrorChance: 0,
    immediateDropChance: 0.5
  },
  hard: {
    rotationDelay: 0,
    moveDelay: 0,
    finalDelay: 50,
    errorChance: 0,
    rotationErrorChance: 0,
    immediateDropChance: 1.0
  }
};

export const CPU_MESSAGES = {
  processing: (difficulty: string, pairId: string, thinkTime: number) => 
    `🤖 CPU ${difficulty.toUpperCase()} processing: ${pairId} (think time: ${thinkTime}ms)`,
  thinking: (difficulty: string) => 
    `🧠 CPU ${difficulty.toUpperCase()}: Finding best move...`,
  foundMove: (difficulty: string, x: number, rotation: number) => 
    `✅ CPU ${difficulty.toUpperCase()}: Found move (x:${x}, rot:${rotation})`,
  hardDrop: (difficulty: string) => 
    `⬇️ CPU ${difficulty.toUpperCase()}: HARD DROP`,
  naturalDrop: (difficulty: string) => 
    `🍃 CPU ${difficulty.toUpperCase()}: NATURAL DROP`,
  noValidMove: (difficulty: string) => 
    `❌ CPU ${difficulty.toUpperCase()}: No valid move`,
  operationCancelled: (difficulty: string) => 
    `❌ CPU ${difficulty.toUpperCase()}: Operation cancelled - state changed`,
  readyForNext: () => 
    `🔄 CPU: Ready for next pair`
};