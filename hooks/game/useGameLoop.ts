import { useRef, useEffect, useCallback } from 'react';
import type { GameState } from '../../types/game';
import { 
  GAME_CONFIG, 
  canPlacePair, 
  lockPairToGrid, 
  applyGravity, 
  processChains, 
  calculateChainScore 
} from '../../utils/puyoGameLogic';

export const useGameLoop = (
  gameState: GameState,
  updateGameState: (updater: (prev: GameState) => GameState) => void,
  setGameOver: () => void,
  setChaining: (isChaining: boolean) => void,
  spawnNextPair: () => void
) => {
  const gameLoopRef = useRef<number>();
  const lastUpdateTime = useRef<number>(0);

  const processChainReaction = useCallback(async (grid: any[][]) => {
    setChaining(true);
    let currentGrid = grid;
    let totalChains = 0;
    let totalScore = 0;
    
    while (true) {
      const chainResult = processChains(currentGrid);
      
      if (chainResult.clearedCells.length === 0) {
        break;
      }
      
      totalChains++;
      
      // Calculate score for this chain
      const chainScore = calculateChainScore(chainResult.clearedCells.length, totalChains);
      totalScore += chainScore;
      
      // Apply gravity after clearing
      currentGrid = applyGravity(chainResult.newGrid);
      
      // Update game state with animation
      updateGameState(prev => ({
        ...prev,
        grid: currentGrid,
        chainCount: totalChains,
        score: prev.score + chainScore
      }));
      
      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    setChaining(false);
    spawnNextPair();
  }, [updateGameState, setChaining, spawnNextPair]);

  const gameLoop = useCallback((timestamp: number) => {
    if (gameState.isGameOver || gameState.isPaused || !gameState.isPlaying) {
      return;
    }

    const deltaTime = timestamp - lastUpdateTime.current;
    lastUpdateTime.current = timestamp;

    if (gameState.isChaining) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // Handle natural falling
    if (gameState.currentPair && timestamp - gameState.lastFallTime > GAME_CONFIG.fallSpeed) {
      updateGameState(prev => {
        if (!prev.currentPair) return prev;

        const newPair = { ...prev.currentPair, y: prev.currentPair.y + 1 };
        
        if (!canPlacePair(prev.grid, newPair)) {
          // Can't move down, lock the pair
          const newGrid = lockPairToGrid(prev.grid, prev.currentPair);
          
          // Check for game over
          if (prev.currentPair.y <= 1) {
            setGameOver();
            return prev;
          }
          
          // Process chains
          processChainReaction(newGrid);
          
          return {
            ...prev,
            grid: newGrid,
            currentPair: null
          };
        }

        return {
          ...prev,
          currentPair: newPair,
          lastFallTime: timestamp
        };
      });
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, updateGameState, setGameOver, processChainReaction]);

  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameLoop]);

  return {
    processChainReaction
  };
};