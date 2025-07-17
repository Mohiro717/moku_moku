import { useState, useCallback } from 'react';
import type { GameState } from '../../types/game';
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
  lastFallTime: 0
});

export const useGameCore = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);

  const updateGameState = useCallback((updater: (prev: GameState) => GameState) => {
    setGameState(updater);
  }, []);

  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      currentPair: createRandomPair(),
      nextPair: createRandomPair()
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const setGameOver = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      isPlaying: false,
      currentPair: null
    }));
  }, []);

  const setChaining = useCallback((isChaining: boolean) => {
    setGameState(prev => ({ ...prev, isChaining }));
  }, []);

  const updateScore = useCallback((points: number) => {
    setGameState(prev => ({ ...prev, score: prev.score + points }));
  }, []);

  const updateChainCount = useCallback((count: number) => {
    setGameState(prev => ({ ...prev, chainCount: count }));
  }, []);

  const spawnNewPair = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentPair: prev.nextPair,
      nextPair: createRandomPair()
    }));
  }, []);

  return {
    gameState,
    updateGameState,
    resetGame,
    startGame,
    pauseGame,
    setGameOver,
    setChaining,
    updateScore,
    updateChainCount,
    spawnNewPair
  };
};