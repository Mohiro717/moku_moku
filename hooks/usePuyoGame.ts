import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, PuyoPair, PuyoCell, ChainResult, ChainProcessingState } from '../types/game';
import {
  GAME_CONFIG,
  createEmptyGrid,
  createRandomPair,
  getPairPositions,
  isValidPosition,
  canPlacePair,
  processChains,
  findChainsToHighlight,
  markPuyosForDeletion,
  removeDeletedPuyos,
  applyGravity,
  lockPairToGrid,
  calculateChainScore
} from '../utils/puyoGameLogic';
import { attemptRotationWithKick } from '../utils/puyoKickSystem';
import { GAME_TIMINGS } from '../constants/gameTimings';

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

export const usePuyoGame = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const gameLoopRef = useRef<number>();
  const lastUpdateTime = useRef<number>(0);

  // Pair movement handlers
  const movePair = useCallback((direction: 'left' | 'right' | 'down') => {
    setGameState(prev => {
      if (!prev.currentPair || prev.isGameOver || prev.isPaused || prev.isChaining) {
        return prev;
      }

      let newPair = { ...prev.currentPair };
      
      switch (direction) {
        case 'left':
          newPair.x = Math.max(0, newPair.x - 1);
          break;
        case 'right':
          newPair.x = Math.min(GAME_CONFIG.gridWidth - 1, newPair.x + 1);
          break;
        case 'down':
          newPair.y = newPair.y + 1;
          break;
      }

      return canPlacePair(prev.grid, newPair) 
        ? { ...prev, currentPair: newPair }
        : prev;
    });
  }, []);

  const rotatePair = useCallback((clockwise: boolean = true) => {
    setGameState(prev => {
      if (!prev.currentPair || prev.isGameOver || prev.isPaused || prev.isChaining) {
        return prev;
      }

      // Use kick system for rotation
      const kickResult = attemptRotationWithKick(prev.currentPair, prev.grid, clockwise);
      
      if (kickResult.success && kickResult.kickedPair) {
        return {
          ...prev,
          currentPair: kickResult.kickedPair
        };
      }

      // If kick system fails, no rotation occurs
      return prev;
    });
  }, []);

  // Hard drop - instantly drop pair to bottom
  const hardDropPair = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPair || prev.isGameOver || prev.isPaused || prev.isChaining) {
        return prev;
      }

      let newPair = { ...prev.currentPair };
      
      // Keep moving down until we can't place the pair
      while (canPlacePair(prev.grid, { ...newPair, y: newPair.y + 1 })) {
        newPair.y++;
      }

      return { ...prev, currentPair: newPair };
    });
    
    // Lock the pair immediately after hard drop
    setTimeout(() => lockPair(), 50);
  }, []);

  // Pair locking
  const lockPair = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPair) return prev;

      const { newGrid, isGameOver } = lockPairToGrid(prev.currentPair, prev.grid);

      return {
        ...prev,
        grid: newGrid,
        currentPair: null,
        nextPair: createRandomPair(),
        isGameOver,
        isPlaying: !isGameOver
      };
    });
  }, []);

  // Helper functions for chain processing
  const showHighlightedPuyos = useCallback(async (grid: PuyoCell[][], actualChains: number): Promise<void> => {
    setGameState(prev => ({ 
      ...prev, 
      grid,
      chainAnimationStep: 'highlighting',
      currentChainStep: actualChains
    }));
    await new Promise<void>(resolve => setTimeout(resolve, GAME_TIMINGS.highlight));
  }, []);

  const showDeletingPuyos = useCallback(async (grid: PuyoCell[][]): Promise<PuyoCell[][]> => {
    const deletingGrid = markPuyosForDeletion(grid);
    setGameState(prev => ({ 
      ...prev, 
      grid: deletingGrid,
      chainAnimationStep: 'deleting'
    }));
    await new Promise<void>(resolve => setTimeout(resolve, GAME_TIMINGS.deletion));
    return deletingGrid;
  }, []);

  const removePuyosFromGrid = useCallback((sourceGrid: PuyoCell[][], targetGrid: PuyoCell[][]): void => {
    for (let row = 0; row < sourceGrid.length; row++) {
      for (let col = 0; col < sourceGrid[row].length; col++) {
        if (sourceGrid[row][col].isConnected) {
          targetGrid[row][col] = {
            color: null,
            id: Math.random().toString(36)
          };
        }
      }
    }
  }, []);

  const showFallingAnimation = useCallback(async (grid: PuyoCell[][]): Promise<void> => {
    setGameState(prev => ({ 
      ...prev, 
      grid,
      chainAnimationStep: 'falling'
    }));
    await new Promise<void>(resolve => setTimeout(resolve, GAME_TIMINGS.falling));
  }, []);


  const updateFinalState = useCallback(async (
    grid: PuyoCell[][], 
    score: number, 
    actualChains: number
  ): Promise<void> => {
    setGameState(prev => ({ 
      ...prev, 
      grid,
      score,
      chainCount: Math.max(actualChains, prev.chainCount),
      chainAnimationStep: 'complete'
    }));
    await new Promise<void>(resolve => setTimeout(resolve, GAME_TIMINGS.complete));
  }, []);

  // Main chain processing function
  const processChainReaction = useCallback(async () => {
    setGameState(prev => ({ 
      ...prev, 
      isChaining: true,
      chainAnimationStep: 'highlighting',
      currentChainStep: 0
    }));

    let currentGrid = [...gameState.grid.map(row => [...row])];
    let deletionRounds = 0;
    let totalScore = gameState.score;

    while (true) {
      const { newGrid, chainOccurred, deletedCount } = processChains(currentGrid);
      
      if (!chainOccurred || deletedCount === 0) break;

      deletionRounds++;
      const actualChains = Math.max(0, deletionRounds - 1);
      
      await showHighlightedPuyos(newGrid, actualChains);
      await showDeletingPuyos(newGrid);
      
      removePuyosFromGrid(newGrid, currentGrid);
      await showFallingAnimation(currentGrid);
      
      currentGrid = applyGravity(currentGrid);
      totalScore += calculateChainScore(deletedCount, Math.max(1, actualChains + 1));
      
      await updateFinalState(currentGrid, totalScore, actualChains);
    }

    setGameState(prev => ({ 
      ...prev, 
      isChaining: false,
      chainAnimationStep: 'idle',
      currentChainStep: 0
    }));
  }, [
    gameState.grid, 
    gameState.score, 
    showHighlightedPuyos, 
    showDeletingPuyos, 
    removePuyosFromGrid, 
    showFallingAnimation, 
    updateFinalState
  ]);

  // Simple auto-fall mechanism
  const handleAutoFall = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPair || prev.isGameOver || prev.isPaused || prev.isChaining) {
        return prev;
      }

      const newPair = { ...prev.currentPair, y: prev.currentPair.y + 1 };
      
      if (canPlacePair(prev.grid, newPair)) {
        return { 
          ...prev, 
          currentPair: newPair
        };
      } else {
        // Can't fall further, lock the pair
        const lockResult = lockPairToGrid(prev.currentPair, prev.grid);
        
        return {
          ...prev,
          grid: lockResult.newGrid,
          currentPair: null,
          isGameOver: lockResult.isGameOver,
          isPlaying: !lockResult.isGameOver
        };
      }
    });
  }, []);

  // Auto-fall timer
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver || !gameState.currentPair) {
      return;
    }

    const fallTimer = setInterval(() => {
      handleAutoFall();
    }, GAME_CONFIG.fallSpeed);

    return () => clearInterval(fallTimer);
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameState.currentPair, handleAutoFall]);

  // Chain processing trigger - should happen BEFORE spawning new pair
  useEffect(() => {
    if (!gameState.currentPair && !gameState.isChaining && gameState.isPlaying && !gameState.isGameOver) {
      // First check for chains, then spawn new pair
      const timer = setTimeout(async () => {
        // Check if there are any chains to process
        const { chainOccurred } = findChainsToHighlight(gameState.grid);
        
        if (chainOccurred) {
          // Process chains
          await processChainReaction();
        } else {
          // No chains, spawn new pair
          setGameState(prev => {
            const newPair = prev.nextPair || createRandomPair();
            
            if (canPlacePair(prev.grid, newPair)) {
              return { 
                ...prev, 
                currentPair: newPair,
                nextPair: createRandomPair()
              };
            } else {
              return { 
                ...prev, 
                isGameOver: true, 
                isPlaying: false 
              };
            }
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [gameState.currentPair, gameState.isChaining, gameState.isPlaying, gameState.isGameOver, gameState.grid, processChainReaction]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          movePair('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          movePair('right');
          break;
        case 'z':
        case 'Z':
          event.preventDefault();
          rotatePair(false);
          break;
        case 'x':
        case 'X':
          event.preventDefault();
          rotatePair(true);
          break;
        case 'ArrowDown':
          event.preventDefault();
          movePair('down');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, movePair, rotatePair]);

  // Game control functions
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      currentPair: createRandomPair(),
      nextPair: createRandomPair(),
      chainAnimationStep: 'idle',
      currentChainStep: 0
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const restartGame = useCallback(() => {
    setGameState(createInitialGameState());
  }, []);

  const rotateClockwise = useCallback(() => rotatePair(true), [rotatePair]);
  const rotateCounterClockwise = useCallback(() => rotatePair(false), [rotatePair]);

  return {
    gameState,
    startGame,
    pauseGame,
    restartGame,
    movePair,
    rotatePair,
    rotateClockwise,
    rotateCounterClockwise,
    hardDropPair,
    getPairPositions,
    config: GAME_CONFIG
  };
};