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
      const MAX_CHAINS = 20; // 無限ループ防止の上限
      let consecutiveNoChains = 0; // 連続で連鎖が発生しない回数


      // Process all chains with safety limits
      while (totalChains < MAX_CHAINS) {
        const { newGrid, chainOccurred, deletedCount } = processChains(currentGrid);
        
        if (!chainOccurred) {
          consecutiveNoChains++;
          // 連続で2回連鎖が発生しなければ終了
          if (consecutiveNoChains >= 2) {
            break;
          }
          // 重力だけ適用して再チェック
          currentGrid = applyGravity(currentGrid);
          continue;
        }

        // 連鎖が発生した
        consecutiveNoChains = 0;
        totalChains++;
        const chainScore = calculateChainScore(deletedCount, totalChains);
        totalScore += chainScore;
        
        
        // Apply gravity after clearing
        currentGrid = applyGravity(newGrid);
      }

      if (totalChains >= MAX_CHAINS) {
        console.warn(`[CHAIN REACTION] Hit maximum chain limit of ${MAX_CHAINS}! Stopping to prevent infinite loop.`);
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