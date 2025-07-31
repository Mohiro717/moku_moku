import { useEffect, useCallback } from 'react';

interface KeyboardDirection {
  x: number;
  y: number;
}

interface UseKeyboardInputProps {
  onMove: (direction: KeyboardDirection) => void;
  disabled?: boolean;
}

export const useKeyboardInput = ({ onMove, disabled = false }: UseKeyboardInputProps) => {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    const directions: { [key: string]: KeyboardDirection } = {
      'ArrowUp': { x: 0, y: -1 },
      'ArrowDown': { x: 0, y: 1 },
      'ArrowLeft': { x: -1, y: 0 },
      'ArrowRight': { x: 1, y: 0 },
      'w': { x: 0, y: -1 },
      's': { x: 0, y: 1 },
      'a': { x: -1, y: 0 },
      'd': { x: 1, y: 0 }
    };

    const direction = directions[event.key];
    if (direction) {
      event.preventDefault();
      onMove(direction);
    }
  }, [onMove, disabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
};