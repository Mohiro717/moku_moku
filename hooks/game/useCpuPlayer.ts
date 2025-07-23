import { useCallback, useRef, useEffect } from 'react';
import type { GameState, GameDifficulty, PuyoPair } from '../../types/game';
import { findBestMove, getCpuAiConfig, type CpuMove } from '../../utils/cpuAI';
import { lockPairToGrid } from '../../utils/puyoGameLogic';

export interface CpuPlayerResult {
  newGrid: any[][];
  isGameOver: boolean;
  move: CpuMove;
}

export const useCpuPlayer = () => {
  const cpuThinkingRef = useRef<NodeJS.Timeout | null>(null);
  const isThinkingRef = useRef(false);

  const clearCpuTimer = useCallback(() => {
    if (cpuThinkingRef.current) {
      clearTimeout(cpuThinkingRef.current);
      cpuThinkingRef.current = null;
    }
    isThinkingRef.current = false;
  }, []);

  const executeCpuMove = useCallback((
    cpuState: GameState, 
    difficulty: GameDifficulty,
    onMoveComplete: (result: CpuPlayerResult) => void
  ) => {
    if (!cpuState.currentPair || isThinkingRef.current || cpuState.isPaused || cpuState.isGameOver) {
      return;
    }

    const config = getCpuAiConfig(difficulty);
    isThinkingRef.current = true;

    cpuThinkingRef.current = setTimeout(() => {
      const bestMove = findBestMove(cpuState.grid, cpuState.currentPair!, difficulty);
      
      if (bestMove) {
        // CPUの最適な手を実行
        const cpuPair: PuyoPair = {
          ...cpuState.currentPair!,
          x: bestMove.x,
          rotation: bestMove.rotation,
          y: 1 // 最上部から開始
        };

        const { newGrid, isGameOver } = lockPairToGrid(cpuPair, cpuState.grid);
        
        onMoveComplete({
          newGrid,
          isGameOver,
          move: bestMove
        });
      }

      isThinkingRef.current = false;
    }, config.thinkTime);
  }, []);

  const stopCpuThinking = useCallback(() => {
    clearCpuTimer();
  }, [clearCpuTimer]);

  const isCpuThinking = useCallback(() => {
    return isThinkingRef.current;
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      clearCpuTimer();
    };
  }, [clearCpuTimer]);

  return {
    executeCpuMove,
    stopCpuThinking,
    isCpuThinking
  };
};