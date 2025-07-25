import { useEffect, useCallback } from 'react';
import type { GameState } from '../../types/game';

export const useGameInput = (
  gameState: GameState,
  movePair: (direction: 'left' | 'right' | 'down') => void,
  rotateClockwise: () => void,
  rotateCounterClockwise: () => void,
  hardDropPair: () => void,
  pauseGame: () => void
) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        movePair('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        movePair('right');
        break;
      case 'ArrowDown':
        event.preventDefault();
        movePair('down');
        break;
      case 'z':
      case 'Z':
        event.preventDefault();
        rotateCounterClockwise();
        break;
      case 'x':
      case 'X':
        event.preventDefault();
        rotateClockwise();
        break;
      case ' ':
        event.preventDefault();
        hardDropPair();
        break;
      case 'Escape':
        event.preventDefault();
        pauseGame();
        break;
    }
  }, [gameState.isPlaying, gameState.isGameOver, movePair, rotateClockwise, rotateCounterClockwise, hardDropPair, pauseGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    handleKeyDown
  };
};