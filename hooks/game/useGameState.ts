import { useState, useCallback } from 'react';
import type { GameState, PuyoPair } from '../../types/game';
import { createEmptyGrid, createRandomPair } from '../../utils/puyoGameLogic';

const createInitialGameState = (): GameState => ({
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
  chainAnimationStep: 'idle',
  currentChainStep: 0
});

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);

  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
  }, []);

  const updateGameState = useCallback((updater: (prev: GameState) => GameState) => {
    setGameState(updater);
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      currentPair: prev.nextPair,
      nextPair: createRandomPair(),
      lastFallTime: Date.now()
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  const setGameOver = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      isPlaying: false,
      currentPair: null
    }));
  }, []);

  const updateScore = useCallback((points: number) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points
    }));
  }, []);

  const updateChainCount = useCallback((count: number) => {
    setGameState(prev => ({
      ...prev,
      chainCount: count
    }));
  }, []);

  const setChaining = useCallback((isChaining: boolean) => {
    setGameState(prev => ({
      ...prev,
      isChaining
    }));
  }, []);

  const spawnNextPair = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentPair: prev.nextPair,
      nextPair: createRandomPair(),
      lastFallTime: Date.now()
    }));
  }, []);

  return {
    gameState,
    resetGame,
    updateGameState,
    startGame,
    pauseGame,
    setGameOver,
    updateScore,
    updateChainCount,
    setChaining,
    spawnNextPair
  };
};