import { useCallback } from 'react';
import type { GameState } from '../../types/game';
import { 
  processChains, 
  applyGravity, 
  calculateChainScore 
} from '../../utils/puyoGameLogic';

export const useGameChain = (
  gameState: GameState,
  updateGameState: (updater: (prev: GameState) => GameState) => void,
  setChaining: (isChaining: boolean) => void,
  spawnNewPair: () => void
) => {
  const processChainReaction = useCallback(async () => {
    setChaining(true);
    let currentGrid = gameState.grid;
    let totalChains = 0;
    let totalScore = gameState.score;

    while (true) {
      const { newGrid, chainOccurred, deletedCount } = processChains(currentGrid);
      
      if (!chainOccurred) break;

      totalChains++;
      const chainScore = calculateChainScore(deletedCount, totalChains);
      totalScore += chainScore;
      
      // Apply gravity after clearing
      currentGrid = applyGravity(newGrid);
      
      // Update game state with animation
      updateGameState(prev => ({
        ...prev,
        grid: currentGrid,
        chainCount: totalChains,
        score: totalScore
      }));
      
      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    setChaining(false);
    spawnNewPair();
  }, [gameState.grid, gameState.score, updateGameState, setChaining, spawnNewPair]);

  return {
    processChainReaction
  };
};