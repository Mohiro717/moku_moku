import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, PuyoPair } from '../types/game';
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

  // Animated chain processing with step-by-step visualization
  const processChainReaction = useCallback(async () => {
    setGameState(prev => ({ 
      ...prev, 
      isChaining: true,
      chainAnimationStep: 'highlighting',
      currentChainStep: 0
    }));

    let currentGrid = gameState.grid;
    let deletionCount = 0; // Count how many deletion rounds occur
    let totalScore = gameState.score;

    while (true) {
      // Step 1: Find and highlight chains
      const { newGrid: highlightedGrid, chainOccurred, deletedCount } = findChainsToHighlight(currentGrid);
      
      if (!chainOccurred) break;

      deletionCount++;
      const isActualChain = deletionCount > 1; // Only count as chain from 2nd deletion onwards
      const displayChainStep = isActualChain ? deletionCount - 1 : 0;
      
      // Show highlighted puyos (connected state)
      setGameState(prev => ({ 
        ...prev, 
        grid: highlightedGrid,
        chainAnimationStep: 'highlighting',
        currentChainStep: displayChainStep
      }));
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Step 2: Mark for deletion with animation
      const deletingGrid = markPuyosForDeletion(highlightedGrid);
      setGameState(prev => ({ 
        ...prev, 
        grid: deletingGrid,
        chainAnimationStep: 'deleting'
      }));
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Step 3: Remove deleted puyos
      const cleanedGrid = removeDeletedPuyos(deletingGrid);
      setGameState(prev => ({ 
        ...prev, 
        grid: cleanedGrid,
        chainAnimationStep: 'falling'
      }));
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Step 4: Apply gravity with falling animation
      currentGrid = applyGravity(cleanedGrid);
      
      // Calculate score (use actual deletion count for scoring)
      totalScore += calculateChainScore(deletedCount, deletionCount);
      
      // Update state with final positions
      const finalChainCount = Math.max(displayChainStep, gameState.chainCount);
      setGameState(prev => ({ 
        ...prev, 
        grid: currentGrid, 
        score: totalScore,
        chainCount: finalChainCount,
        chainAnimationStep: 'complete'
      }));
      
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    setGameState(prev => ({ 
      ...prev, 
      isChaining: false,
      chainAnimationStep: 'idle',
      currentChainStep: 0
    }));
  }, [gameState.grid, gameState.score, gameState.chainCount]);

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

  // Spawn new pair when needed
  useEffect(() => {
    if (!gameState.currentPair && !gameState.isChaining && gameState.isPlaying && !gameState.isGameOver) {
      const timer = setTimeout(() => {
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
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [gameState.currentPair, gameState.isChaining, gameState.isPlaying, gameState.isGameOver]);

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

  // Remove the old game loop management since we're using timers now

  // Chain processing trigger
  useEffect(() => {
    if (!gameState.currentPair && !gameState.isChaining && gameState.isPlaying) {
      const timer = setTimeout(processChainReaction, 200);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPair, gameState.isChaining, gameState.isPlaying, processChainReaction]);

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