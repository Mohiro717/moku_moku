import { useGameState } from './game/useGameState';
import { usePairMovement } from './game/usePairMovement';
import { useGameLoop } from './game/useGameLoop';
import { useGameInput } from './game/useGameInput';

export const usePuyoGameRefactored = () => {
  const {
    gameState,
    resetGame,
    updateGameState,
    startGame,
    pauseGame,
    setGameOver,
    updateScore,
    updateChainCount,
    setChaining,
    spawnNextPair
  } = useGameState();

  const {
    movePair,
    rotatePair,
    hardDropPair,
    getPairPositions
  } = usePairMovement(gameState, updateGameState);

  const {
    processChainReaction
  } = useGameLoop(
    gameState,
    updateGameState,
    setGameOver,
    setChaining,
    spawnNextPair
  );

  useGameInput(
    gameState,
    movePair,
    rotatePair,
    hardDropPair,
    pauseGame
  );

  return {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    movePair,
    rotatePair,
    hardDropPair,
    getPairPositions
  };
};