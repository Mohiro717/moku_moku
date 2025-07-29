import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { isConvexConfigured } from '../lib/convex';
import { getRankings, saveScore as saveToLocalStorage, isHighScore as checkLocalHighScore, type RankingEntry } from '../utils/rankingUtils';

// 統一されたランキングエントリー型
export interface UnifiedRankingEntry {
  id: string;
  score: number;
  playerName: string;
  timestamp: number;
  gameType: string;
}

// Convexからのレスポンス型
interface ConvexRankingEntry {
  _id: string;
  score: number;
  playerName?: string;
  timestamp: number;
  gameType: string;
}

// ランキングサービスのインターface
export interface RankingService {
  saveScore: (score: number, playerName: string, gameType: string) => Promise<void>;
  getRankings: () => UnifiedRankingEntry[];
  isHighScore: (score: number, gameType: string) => boolean;
  isLoading: boolean;
  isGlobal: boolean;
}

// Convexを使用するランキングサービス
export const useConvexRankingService = (gameType: string): RankingService => {
  const saveScoreToConvex = useMutation(api.bananaScores.saveScore);
  const convexRankings = useQuery(api.bananaScores.getTopScores, { gameType, limit: 10 });

  const saveScore = async (score: number, playerName: string, gameType: string): Promise<void> => {
    try {
      await saveScoreToConvex({
        score,
        playerName: playerName.trim() || undefined,
        gameType,
      });
    } catch (error) {
      console.error('Failed to save score to Convex:', error);
      throw error;
    }
  };

  const getRankings = (): UnifiedRankingEntry[] => {
    if (!convexRankings) return [];
    
    return convexRankings.map((entry: ConvexRankingEntry) => ({
      id: entry._id,
      score: entry.score,
      playerName: entry.playerName || 'Anonymous',
      timestamp: entry.timestamp,
      gameType: entry.gameType,
    }));
  };

  const isHighScore = (score: number, gameType: string): boolean => {
    const rankings = getRankings();
    
    if (rankings.length < 10) {
      return score > 0;
    }
    
    const lowestScore = rankings[rankings.length - 1]?.score || 0;
    return score > lowestScore;
  };

  return {
    saveScore,
    getRankings,
    isHighScore,
    isLoading: convexRankings === undefined,
    isGlobal: true,
  };
};

// localStorageを使用するランキングサービス
export const useLocalRankingService = (gameType: string): RankingService => {
  const saveScore = async (score: number, playerName: string, gameType: string): Promise<void> => {
    try {
      saveToLocalStorage(score, playerName, gameType);
    } catch (error) {
      console.error('Failed to save score to localStorage:', error);
      throw error;
    }
  };

  const getRankingsData = (): UnifiedRankingEntry[] => {
    return getRankings(gameType);
  };

  const isHighScore = (score: number, gameType: string): boolean => {
    return checkLocalHighScore(score, gameType);
  };

  return {
    saveScore,
    getRankings: getRankingsData,
    isHighScore,
    isLoading: false,
    isGlobal: false,
  };
};

// ハイブリッドランキングサービス（フォールバック付き）
export const useRankingService = (gameType: string): RankingService => {
  const convexService = useConvexRankingService(gameType);
  const localService = useLocalRankingService(gameType);

  if (isConvexConfigured) {
    return {
      ...convexService,
      saveScore: async (score: number, playerName: string, gameType: string) => {
        try {
          await convexService.saveScore(score, playerName, gameType);
        } catch (error) {
          console.warn('⚠️ Failed to save to Convex, using localStorage:', error);
          await localService.saveScore(score, playerName, gameType);
        }
      },
    };
  }
  
  return {
    ...localService,
    saveScore: async (score: number, playerName: string, gameType: string) => {
      await localService.saveScore(score, playerName, gameType);
    },
  };
};