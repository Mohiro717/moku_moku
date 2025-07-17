import { useEffect } from 'react';
import { GAME_CONFIG } from '../../utils/puyoGameLogic';
import type { GameState } from '../../types/game';

export const useGameTimer = (
  gameState: GameState,
  handleAutoFall: () => void,
  processChainReaction: () => Promise<void>
) => {
  // Auto-fall timer
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver || !gameState.currentPair) {
      return;
    }

    const fallTimer = setInterval(() => {
      handleAutoFall();
    }, GAME_CONFIG.fallSpeed);

    return () => clearInterval(fallTimer);
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameState.currentPair, handleAutoFall]);

  // Chain processing trigger
  useEffect(() => {
    if (!gameState.currentPair && !gameState.isChaining && gameState.isPlaying && !gameState.isGameOver) {
      const timer = setTimeout(() => {
        processChainReaction();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [gameState.currentPair, gameState.isChaining, gameState.isPlaying, gameState.isGameOver, processChainReaction]);
};