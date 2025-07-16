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
  applyGravity,
  lockPairToGrid,
  calculateChainScore
} from '../utils/puyoGameLogic';

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

      return canPlacePair(newPair, prev.grid) 
        ? { ...prev, currentPair: newPair }
        : prev;
    });
  }, []);

  const rotatePair = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPair || prev.isGameOver || prev.isPaused || prev.isChaining) {
        return prev;
      }

      const newPair = { 
        ...prev.currentPair, 
        rotation: (prev.currentPair.rotation + 1) % 4 
      };

      return canPlacePair(newPair, prev.grid)
        ? { ...prev, currentPair: newPair }
        : prev;
    });
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

  // Chain processing
  const processChainReaction = useCallback(async () => {
    setGameState(prev => ({ ...prev, isChaining: true }));

    let currentGrid = gameState.grid;
    let totalChainCount = 0;
    let totalScore = gameState.score;

    while (true) {
      const { newGrid, chainOccurred, deletedCount } = processChains(currentGrid);
      
      if (!chainOccurred) break;

      totalChainCount++;
      
      // Show connected puyos animation
      setGameState(prev => ({ ...prev, grid: newGrid }));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Apply gravity
      currentGrid = applyGravity(newGrid);
      
      // Calculate score
      totalScore += calculateChainScore(deletedCount, totalChainCount);
      
      // Update state
      setGameState(prev => ({ 
        ...prev, 
        grid: currentGrid, 
        score: totalScore,
        chainCount: totalChainCount 
      }));
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setGameState(prev => ({ ...prev, isChaining: false }));
  }, [gameState.grid, gameState.score]);

  // Game loop logic
  const handlePairFall = useCallback(() => {
    if (!gameState.currentPair) return;

    const newPair = { ...gameState.currentPair, y: gameState.currentPair.y + 1 };
    
    if (canPlacePair(newPair, gameState.grid)) {
      movePair('down');
    } else {
      // Check if either puyo can fall individually
      const positions = getPairPositions(gameState.currentPair);
      const mainCanFall = isValidPosition(
        { x: positions.main.x, y: positions.main.y + 1 }, 
        gameState.grid
      );
      const subCanFall = isValidPosition(
        { x: positions.sub.x, y: positions.sub.y + 1 }, 
        gameState.grid
      );
      
      // Always lock when pair can't fall as a unit
      lockPair();
    }
  }, [gameState.currentPair, gameState.grid, movePair, lockPair]);

  const spawnNewPair = useCallback(() => {
    const newPair = createRandomPair();
    
    if (canPlacePair(newPair, gameState.grid)) {
      setGameState(prev => ({ ...prev, currentPair: newPair }));
    } else {
      // Can't spawn new pair due to collision, game over
      setGameState(prev => ({ 
        ...prev, 
        isGameOver: true, 
        isPlaying: false 
      }));
    }
  }, [gameState.grid]);

  // Main game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) {
      return;
    }

    const deltaTime = currentTime - lastUpdateTime.current;
    
    if (deltaTime >= GAME_CONFIG.fallSpeed) {
      if (gameState.currentPair) {
        handlePairFall();
      } else if (!gameState.isChaining) {
        spawnNewPair();
      }
      
      lastUpdateTime.current = currentTime;
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, handlePairFall, spawnNewPair]);

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
        case 'ArrowUp':
          event.preventDefault();
          rotatePair();
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

  // Game loop management
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      lastUpdateTime.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameLoop]);

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
      currentPair: createRandomPair()
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const restartGame = useCallback(() => {
    setGameState(createInitialGameState());
  }, []);

  return {
    gameState,
    startGame,
    pauseGame,
    restartGame,
    movePair,
    rotatePair,
    getPairPositions,
    config: GAME_CONFIG
  };
};