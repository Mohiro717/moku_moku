import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { isConvexConfigured } from '../lib/convex';
import type { GameState, GameDimensions } from '../types/bananaGame';
import { BANANA_GAME_CONFIG } from '../constants/bananaGameConfig';
import { generateRandomBananaPosition, getInitialBananaPosition } from '../utils/bananaGameUtils';
import { isHighScore, saveScore } from '../utils/rankingUtils';

interface UseBananaGameProps {
  dimensions: GameDimensions;
}

export const useBananaGame = ({ dimensions }: UseBananaGameProps) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const saveScoreToConvex = useMutation(api.bananaScores.saveScore);

  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isGameOver: false,
    score: 0,
    timeLeft: BANANA_GAME_CONFIG.GAME_DURATION,
    banana: getInitialBananaPosition(dimensions),
    showNameInput: false,
    isHighScore: false,
  });

  const handleBananaClick = useCallback(() => {
    if (!gameState.isPlaying) return;

    setGameState(prevState => ({
      ...prevState,
      score: prevState.score + 1,
      banana: generateRandomBananaPosition(dimensions),
    }));
  }, [gameState.isPlaying, dimensions]);

  const startGame = useCallback(() => {
    setGameState({
      isPlaying: true,
      isGameOver: false,
      score: 0,
      timeLeft: BANANA_GAME_CONFIG.GAME_DURATION,
      banana: generateRandomBananaPosition(dimensions),
      showNameInput: false,
      isHighScore: false,
    });
  }, [dimensions]);

  const endGame = useCallback(async () => {
    setGameState(prevState => {
      const finalScore = prevState.score;
      const gameType = 'catch-the-banana';
      const achievedHighScore = isHighScore(finalScore, gameType);

      return {
        ...prevState,
        isPlaying: false,
        isGameOver: true,
        timeLeft: 0,
        showNameInput: achievedHighScore,
        isHighScore: achievedHighScore,
      };
    });

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      isPlaying: false,
      isGameOver: false,
      score: 0,
      timeLeft: BANANA_GAME_CONFIG.GAME_DURATION,
      banana: getInitialBananaPosition(dimensions),
      showNameInput: false,
      isHighScore: false,
    });

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [dimensions]);

  const submitScore = useCallback(async (playerName: string) => {
    const gameType = 'catch-the-banana';
    const score = gameState.score;
    
    // Try Convex first, fallback to localStorage
    if (isConvexConfigured && saveScoreToConvex) {
      try {
        await saveScoreToConvex({
          score,
          playerName: playerName.trim() || undefined,
          gameType,
        });
        console.log('✅ Score saved to Convex (global ranking)');
      } catch (error) {
        console.warn('⚠️ Failed to save to Convex, using localStorage:', error);
        saveScore(score, playerName, gameType);
      }
    } else {
      // Fallback to localStorage
      saveScore(score, playerName, gameType);
      console.log('💾 Score saved to localStorage (local ranking)');
    }
    
    setGameState(prevState => ({
      ...prevState,
      showNameInput: false,
    }));
  }, [gameState.score, saveScoreToConvex]);

  const skipNameInput = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      showNameInput: false,
    }));
  }, []);

  useEffect(() => {
    if (gameState.isPlaying && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setGameState(prevState => {
          const newTimeLeft = prevState.timeLeft - 1;
          
          if (newTimeLeft <= 0) {
            // タイマーを停止するだけで、endGame()に処理を委譲
            return {
              ...prevState,
              timeLeft: 0,
            };
          }
          
          return {
            ...prevState,
            timeLeft: newTimeLeft,
          };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState.isPlaying]);

  useEffect(() => {
    if (gameState.timeLeft <= 0 && gameState.isPlaying) {
      endGame();
    }
  }, [gameState.timeLeft, gameState.isPlaying, endGame]);

  return {
    gameState,
    handleBananaClick,
    startGame,
    resetGame,
    submitScore,
    skipNameInput,
  };
};