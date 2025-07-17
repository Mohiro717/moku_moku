import { useCallback } from 'react';
import type { GameState } from '../../types/game';
import { 
  GAME_CONFIG, 
  canPlacePair, 
  lockPairToGrid 
} from '../../utils/puyoGameLogic';
import { attemptRotationWithKick } from '../../utils/puyoKickSystem';

export const useGameMovement = (
  gameState: GameState,
  updateGameState: (updater: (prev: GameState) => GameState) => void,
  setGameOver: () => void
) => {
  const movePair = useCallback((direction: 'left' | 'right' | 'down') => {
    updateGameState(prev => {
      if (!prev.currentPair || prev.isGameOver || prev.isPaused || prev.isChaining) {
        return prev;
      }

      let newPair = { ...prev.currentPair };
      
      switch (direction) {
        case 'left':
          newPair.x = newPair.x - 1;
          break;
        case 'right':
          newPair.x = newPair.x + 1;
          break;
        case 'down':
          newPair.y = newPair.y + 1;
          break;
      }

      if (canPlacePair(prev.grid, newPair)) {
        return { ...prev, currentPair: newPair };
      }
      
      return prev;
    });
  }, [updateGameState]);

  const rotatePair = useCallback((clockwise: boolean = true) => {
    updateGameState(prev => {
      if (!prev.currentPair || prev.isGameOver || prev.isPaused || prev.isChaining) {
        return prev;
      }

      const kickResult = attemptRotationWithKick(prev.currentPair, prev.grid, clockwise);
      
      if (kickResult.success && kickResult.kickedPair) {
        return { ...prev, currentPair: kickResult.kickedPair };
      }

      return prev;
    });
  }, [updateGameState]);

  const hardDropPair = useCallback(() => {
    updateGameState(prev => {
      if (!prev.currentPair || prev.isGameOver || prev.isPaused || prev.isChaining) {
        return prev;
      }

      let newPair = { ...prev.currentPair };
      
      // Drop until we can't drop anymore
      while (canPlacePair(prev.grid, { ...newPair, y: newPair.y + 1 })) {
        newPair.y++;
      }

      // Immediately lock the pair after hard drop
      const lockResult = lockPairToGrid(newPair, prev.grid);
      
      if (lockResult.isGameOver) {
        setGameOver();
        return {
          ...prev,
          grid: lockResult.newGrid,
          currentPair: null,
          isGameOver: true,
          isPlaying: false
        };
      }
      
      return {
        ...prev,
        grid: lockResult.newGrid,
        currentPair: null
      };
    });
  }, [updateGameState, setGameOver]);

  const handleAutoFall = useCallback(() => {
    updateGameState(prev => {
      if (!prev.currentPair || prev.isGameOver || prev.isPaused || prev.isChaining) {
        return prev;
      }

      const newPair = { ...prev.currentPair, y: prev.currentPair.y + 1 };
      
      if (canPlacePair(prev.grid, newPair)) {
        return { ...prev, currentPair: newPair };
      } else {
        // Lock the pair
        const lockResult = lockPairToGrid(prev.currentPair, prev.grid);
        
        if (lockResult.isGameOver) {
          setGameOver();
          return {
            ...prev,
            grid: lockResult.newGrid,
            currentPair: null,
            isGameOver: true,
            isPlaying: false
          };
        }
        
        return {
          ...prev,
          grid: lockResult.newGrid,
          currentPair: null
        };
      }
    });
  }, [updateGameState, setGameOver]);

  const rotateClockwise = useCallback(() => rotatePair(true), [rotatePair]);
  const rotateCounterClockwise = useCallback(() => rotatePair(false), [rotatePair]);

  return {
    movePair,
    rotatePair,
    rotateClockwise,
    rotateCounterClockwise,
    hardDropPair,
    handleAutoFall
  };
};