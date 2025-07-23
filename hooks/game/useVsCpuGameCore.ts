import { useState, useCallback } from 'react';
import type { VsGameState, GameState, GameDifficulty, GamePlayer } from '../../types/game';
import { createEmptyGrid, createRandomPair } from '../../utils/puyoGameLogic';

const createInitialSingleGameState = (): GameState => ({
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

const createInitialVsGameState = (): VsGameState => ({
  player: createInitialSingleGameState(),
  cpu: createInitialSingleGameState(),
  gameMode: 'vs-cpu',
  difficulty: 'easy',
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  winner: null,
  pendingOjamaPlayer: 0,
  pendingOjamaCpu: 0
});

export const useVsCpuGameCore = () => {
  const [gameState, setGameState] = useState<VsGameState>(createInitialVsGameState);

  const updateGameState = useCallback((updater: (prev: VsGameState) => VsGameState) => {
    setGameState(updater);
  }, []);

  const updatePlayerState = useCallback((updater: (prev: GameState) => GameState) => {
    setGameState(prev => ({
      ...prev,
      player: updater(prev.player)
    }));
  }, []);

  const updateCpuState = useCallback((updater: (prev: GameState) => GameState) => {
    setGameState(prev => ({
      ...prev,
      cpu: updater(prev.cpu)
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(createInitialVsGameState());
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => {
      const newPlayerState = {
        ...createInitialSingleGameState(),
        isPlaying: true,
        currentPair: createRandomPair(),
        nextPair: createRandomPair()
      };
      
      const newCpuState = {
        ...createInitialSingleGameState(),
        isPlaying: true,
        currentPair: createRandomPair(),
        nextPair: createRandomPair()
      };

      return {
        ...prev,
        player: newPlayerState,
        cpu: newCpuState,
        isPlaying: true,
        isPaused: false,
        isGameOver: false,
        winner: null,
        pendingOjamaPlayer: 0,
        pendingOjamaCpu: 0
      };
    });
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
      player: { ...prev.player, isPaused: !prev.isPaused },
      cpu: { ...prev.cpu, isPaused: !prev.isPaused }
    }));
  }, []);

  const setGameOver = useCallback((winner: GamePlayer) => {
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      isPlaying: false,
      winner,
      player: { ...prev.player, isGameOver: winner === 'cpu', isPlaying: false },
      cpu: { ...prev.cpu, isGameOver: winner === 'player', isPlaying: false }
    }));
  }, []);

  const setDifficulty = useCallback((difficulty: GameDifficulty) => {
    setGameState(prev => ({ ...prev, difficulty }));
  }, []);

  const updatePlayerScore = useCallback((points: number) => {
    updatePlayerState(prev => ({ ...prev, score: prev.score + points }));
  }, [updatePlayerState]);

  const updateCpuScore = useCallback((points: number) => {
    updateCpuState(prev => ({ ...prev, score: prev.score + points }));
  }, [updateCpuState]);

  const updatePlayerChainCount = useCallback((count: number) => {
    updatePlayerState(prev => ({ ...prev, chainCount: count }));
  }, [updatePlayerState]);

  const updateCpuChainCount = useCallback((count: number) => {
    updateCpuState(prev => ({ ...prev, chainCount: count }));
  }, [updateCpuState]);

  const spawnNewPlayerPair = useCallback(() => {
    updatePlayerState(prev => {
      const newPair = prev.nextPair || createRandomPair();
      
      if (newPair && prev.grid[newPair.y] && prev.grid[newPair.y][newPair.x] && prev.grid[newPair.y][newPair.x].color) {
        // Player loses
        setGameOver('cpu');
        return { ...prev, isGameOver: true, isPlaying: false, currentPair: null };
      }
      
      return {
        ...prev,
        currentPair: newPair,
        nextPair: createRandomPair()
      };
    });
  }, [updatePlayerState, setGameOver]);

  const spawnNewCpuPair = useCallback(() => {
    updateCpuState(prev => {
      const newPair = prev.nextPair || createRandomPair();
      
      if (newPair && prev.grid[newPair.y] && prev.grid[newPair.y][newPair.x] && prev.grid[newPair.y][newPair.x].color) {
        // CPU loses
        setGameOver('player');
        return { ...prev, isGameOver: true, isPlaying: false, currentPair: null };
      }
      
      return {
        ...prev,
        currentPair: newPair,
        nextPair: createRandomPair()
      };
    });
  }, [updateCpuState, setGameOver]);

  const sendOjamaToPlayer = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      pendingOjamaPlayer: prev.pendingOjamaPlayer + amount
    }));
  }, []);

  const sendOjamaToCpu = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      pendingOjamaCpu: prev.pendingOjamaCpu + amount
    }));
  }, []);

  const processOjamaForPlayer = useCallback(() => {
    setGameState(prev => {
      if (prev.pendingOjamaPlayer > 0) {
        // TODO: Implement ojama dropping logic for player
        return {
          ...prev,
          pendingOjamaPlayer: 0
        };
      }
      return prev;
    });
  }, []);

  const processOjamaForCpu = useCallback(() => {
    setGameState(prev => {
      if (prev.pendingOjamaCpu > 0) {
        // TODO: Implement ojama dropping logic for CPU
        return {
          ...prev,
          pendingOjamaCpu: 0
        };
      }
      return prev;
    });
  }, []);

  return {
    gameState,
    updateGameState,
    updatePlayerState,
    updateCpuState,
    resetGame,
    startGame,
    pauseGame,
    setGameOver,
    setDifficulty,
    updatePlayerScore,
    updateCpuScore,
    updatePlayerChainCount,
    updateCpuChainCount,
    spawnNewPlayerPair,
    spawnNewCpuPair,
    sendOjamaToPlayer,
    sendOjamaToCpu,
    processOjamaForPlayer,
    processOjamaForCpu
  };
};