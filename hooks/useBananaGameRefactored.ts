import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, GameDimensions } from '../types/bananaGame';
import { BANANA_GAME_CONFIG } from '../constants/bananaGameConfig';
import { generateRandomBananaPosition, getInitialBananaPosition } from '../utils/bananaGameUtils';
import { useRankingService } from '../services/rankingService';

interface UseBananaGameProps {
  dimensions: GameDimensions;
}

interface BananaGameActions {
  startGame: () => void;
  resetGame: () => void;
  handleBananaClick: () => void;
  submitScore: (playerName: string) => Promise<void>;
  skipNameInput: () => void;
}

interface BananaGameState {
  gameState: GameState;
  rankingService: ReturnType<typeof useRankingService>;
}

type UseBananaGameReturn = BananaGameState & BananaGameActions;

// ゲーム状態の初期値を生成する関数
const createInitialGameState = (dimensions: GameDimensions): GameState => ({
  isPlaying: false,
  isGameOver: false,
  score: 0,
  timeLeft: BANANA_GAME_CONFIG.GAME_DURATION,
  banana: getInitialBananaPosition(dimensions),
  showNameInput: false,
  isHighScore: false,
});

// ゲームタイマーを管理するカスタムフック
const useGameTimer = (
  isPlaying: boolean,
  onTimeUp: () => void
): [(timeLeft: number) => void, () => void] => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback((timeLeft: number) => {
    if (!isPlaying || timerRef.current) return;

    timerRef.current = setInterval(() => {
      if (timeLeft <= 1) {
        onTimeUp();
      }
    }, 1000);
  }, [isPlaying, onTimeUp]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return stopTimer;
  }, [stopTimer]);

  return [startTimer, stopTimer];
};

// ハイスコア判定を行う関数
const checkHighScore = (
  score: number,
  rankingService: ReturnType<typeof useRankingService>
): boolean => {
  return rankingService.isHighScore(score, 'catch-the-banana');
};

export const useBananaGameRefactored = ({ dimensions }: UseBananaGameProps): UseBananaGameReturn => {
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialGameState(dimensions)
  );
  
  const rankingService = useRankingService('catch-the-banana');

  // ゲーム終了処理
  const endGame = useCallback(() => {
    setGameState(prevState => {
      const finalScore = prevState.score;
      const achievedHighScore = checkHighScore(finalScore, rankingService);

      return {
        ...prevState,
        isPlaying: false,
        isGameOver: true,
        timeLeft: 0,
        showNameInput: achievedHighScore,
        isHighScore: achievedHighScore,
      };
    });
  }, [rankingService]);

  // タイマー管理
  const [startTimer, stopTimer] = useGameTimer(gameState.isPlaying, endGame);

  // タイマーのuseEffect
  useEffect(() => {
    if (gameState.isPlaying && gameState.timeLeft > 0) {
      const timer = setInterval(() => {
        setGameState(prevState => {
          const newTimeLeft = prevState.timeLeft - 1;
          if (newTimeLeft <= 0) {
            return { ...prevState, timeLeft: 0 };
          }
          return { ...prevState, timeLeft: newTimeLeft };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState.isPlaying]);

  // タイムアップ検知
  useEffect(() => {
    if (gameState.timeLeft <= 0 && gameState.isPlaying) {
      endGame();
    }
  }, [gameState.timeLeft, gameState.isPlaying, endGame]);

  // ゲームアクション
  const startGame = useCallback(() => {
    setGameState(createInitialGameState(dimensions));
    setGameState(prevState => ({
      ...prevState,
      isPlaying: true,
      banana: generateRandomBananaPosition(dimensions),
    }));
  }, [dimensions]);

  const resetGame = useCallback(() => {
    stopTimer();
    setGameState(createInitialGameState(dimensions));
  }, [dimensions, stopTimer]);

  const handleBananaClick = useCallback(() => {
    if (!gameState.isPlaying) return;

    setGameState(prevState => ({
      ...prevState,
      score: prevState.score + 1,
      banana: generateRandomBananaPosition(dimensions),
    }));
  }, [gameState.isPlaying, dimensions]);

  const submitScore = useCallback(async (playerName: string): Promise<void> => {
    try {
      await rankingService.saveScore(gameState.score, playerName, 'catch-the-banana');
      setGameState(prevState => ({
        ...prevState,
        showNameInput: false,
      }));
    } catch (error) {
      console.error('Failed to submit score:', error);
      // エラー時もモーダルを閉じる（ユーザー体験優先）
      setGameState(prevState => ({
        ...prevState,
        showNameInput: false,
      }));
    }
  }, [gameState.score, rankingService]);

  const skipNameInput = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      showNameInput: false,
    }));
  }, []);

  return {
    gameState,
    rankingService,
    startGame,
    resetGame,
    handleBananaClick,
    submitScore,
    skipNameInput,
  };
};