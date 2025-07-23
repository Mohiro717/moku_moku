import type { GameState, VsGameState, GameDifficulty } from '../types/game';
import { createEmptyGrid, createRandomPair } from './puyoGameLogic';

export interface GameConditions {
  hasCurrentPair: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isChaining: boolean;
  isGameOver: boolean;
}

export const getGameConditions = (gameState: GameState): GameConditions => ({
  hasCurrentPair: !!gameState.currentPair,
  isPlaying: gameState.isPlaying,
  isPaused: gameState.isPaused,
  isChaining: gameState.isChaining,
  isGameOver: gameState.isGameOver
});

export const canOperateCpu = (
  cpuConditions: GameConditions,
  vsConditions: { isGameOver: boolean; isPlaying: boolean }
): boolean => {
  return cpuConditions.hasCurrentPair &&
         cpuConditions.isPlaying &&
         !cpuConditions.isPaused &&
         !cpuConditions.isChaining &&
         !vsConditions.isGameOver &&
         vsConditions.isPlaying;
};

export const createInitialPlayerState = () => ({
  grid: createEmptyGrid(),
  currentPair: null,
  nextPair: createRandomPair(),
  score: 0,
  chainCount: 0,
  isGameOver: false,
  isPaused: false,
  isPlaying: false,
  isChaining: false,
  lastFallTime: 0,
  chainAnimationStep: 'idle' as const,
  currentChainStep: 0
});

export const createInitialVsGameState = (difficulty: GameDifficulty = 'normal'): VsGameState => ({
  player: createInitialPlayerState(),
  cpu: createInitialPlayerState(),
  gameMode: 'vs-cpu',
  difficulty,
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  winner: null,
  pendingOjamaPlayer: 0,
  pendingOjamaCpu: 0
});

export const resetVsGameState = (currentDifficulty: GameDifficulty): VsGameState => ({
  ...createInitialVsGameState(currentDifficulty),
  difficulty: currentDifficulty
});