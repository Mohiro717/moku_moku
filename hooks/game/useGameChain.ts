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
    
    updateGameState(prev => {
      let currentGrid = prev.grid;
      let totalChains = 0;
      let totalScore = prev.score;

      // Process all chains synchronously
      while (true) {
        const { newGrid, chainOccurred, deletedCount } = processChains(currentGrid);
        
        if (!chainOccurred) break;

        totalChains++;
        const chainScore = calculateChainScore(deletedCount, totalChains);
        totalScore += chainScore;
        
        // Apply gravity after clearing
        currentGrid = applyGravity(newGrid);
      }

      return {
        ...prev,
        grid: currentGrid,
        chainCount: totalChains,
        score: totalScore
      };
    });
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setChaining(false);
    spawnNewPair();
  }, [updateGameState, setChaining, spawnNewPair]);

  return {
    processChainReaction
  };
};