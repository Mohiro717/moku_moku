import { useGameCore } from './game/useGameCore';
import { useGameMovement } from './game/useGameMovement';
import { useGameChain } from './game/useGameChain';
import { useGameTimer } from './game/useGameTimer';
import { useGameKeyboard } from './game/useGameKeyboard';
import { getPairPositions } from '../utils/puyoGameLogic';

export const usePuyoGameNew = () => {
  const {
    gameState,
    updateGameState,
    resetGame,
    startGame,
    pauseGame,
    setGameOver,
    setChaining,
    updateScore,
    updateChainCount,
    spawnNewPair
  } = useGameCore();

  const {
    movePair,
    rotatePair,
    rotateClockwise,
    rotateCounterClockwise,
    hardDropPair,
    handleAutoFall
  } = useGameMovement(gameState, updateGameState, setGameOver);

  const {
    processChainReaction
  } = useGameChain(gameState, updateGameState, setChaining, spawnNewPair);

  // Set up timers
  useGameTimer(gameState, handleAutoFall, processChainReaction);

  // Set up keyboard controls
  useGameKeyboard(
    gameState,
    movePair,
    rotateClockwise,
    rotateCounterClockwise,
    hardDropPair,
    pauseGame
  );

  return {
    gameState,
    startGame,
    pauseGame,
    restartGame: resetGame,
    movePair,
    rotatePair,
    rotateClockwise,
    rotateCounterClockwise,
    hardDropPair,
    getPairPositions
  };
};