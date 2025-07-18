import { useCallback } from 'react';
import type { GameState, PuyoPair } from '../../types/game';
import { 
  GAME_CONFIG, 
  isValidPosition, 
  canPlacePair, 
  getPairPositions 
} from '../../utils/puyoGameLogic';
import { attemptRotationWithKick } from '../../utils/puyoKickSystem';

export const usePairMovement = (
  gameState: GameState,
  updateGameState: (updater: (prev: GameState) => GameState) => void
) => {
  const movePair = useCallback((direction: 'left' | 'right' | 'down') => {
    updateGameState(prev => {
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
          newPair.y = Math.min(GAME_CONFIG.gridHeight - 1, newPair.y + 1);
          break;
      }

      // Check if new position is valid
      if (!canPlacePair(prev.grid, newPair)) {
        return prev;
      }

      return {
        ...prev,
        currentPair: newPair
      };
    });
  }, [updateGameState]);

  const rotatePair = useCallback((clockwise: boolean = true) => {
    updateGameState(prev => {
      if (!prev.currentPair || prev.isGameOver || prev.isPaused || prev.isChaining) {
        return prev;
      }

      // Attempt rotation with kick system
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
  }, [updateGameState]);

  const hardDropPair = useCallback(() => {
    updateGameState(prev => {
      if (!prev.currentPair || prev.isGameOver || prev.isPaused || prev.isChaining) {
        return prev;
      }

      let newPair = { ...prev.currentPair };
      let dropDistance = 0;

      // Find the lowest valid position
      while (newPair.y < GAME_CONFIG.gridHeight - 1) {
        const testPair = { ...newPair, y: newPair.y + 1 };
        if (!canPlacePair(prev.grid, testPair)) {
          break;
        }
        newPair = testPair;
        dropDistance++;
      }

      const points = dropDistance * 2;

      return {
        ...prev,
        currentPair: newPair,
        score: prev.score + points
      };
    });
  }, [updateGameState]);

  const getPairPositions = useCallback((pair: PuyoPair) => {
    return getPairPositions(pair);
  }, []);

  const rotateClockwise = useCallback(() => rotatePair(true), [rotatePair]);
  const rotateCounterClockwise = useCallback(() => rotatePair(false), [rotatePair]);

  return {
    movePair,
    rotatePair,
    rotateClockwise,
    rotateCounterClockwise,
    hardDropPair,
    getPairPositions
  };
};