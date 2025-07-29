import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { isConvexConfigured } from '../../lib/convex';
import { getRankings, type RankingEntry } from '../../utils/rankingUtils';

interface HybridBananaRankingProps {
  gameType: string;
  refreshTrigger?: number;
}

interface ConvexRankingEntry {
  _id: string;
  score: number;
  playerName?: string;
  timestamp: number;
  gameType: string;
}

export const HybridBananaRanking: React.FC<HybridBananaRankingProps> = ({ 
  gameType,
  refreshTrigger = 0
}) => {
  const [localRankings, setLocalRankings] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Try to get rankings from Convex (will be undefined if not configured)
  const convexRankings = useQuery(
    isConvexConfigured ? api.bananaScores.getTopScores : undefined, 
    isConvexConfigured ? { gameType, limit: 10 } : undefined
  );

  // Load local rankings
  useEffect(() => {
    const loadLocalRankings = () => {
      const rankings = getRankings(gameType);
      setLocalRankings(rankings);
      setIsLoading(false);
    };

    loadLocalRankings();
  }, [gameType, refreshTrigger]);

  // Determine which rankings to display
  const usingConvex = isConvexConfigured && convexRankings !== undefined;
  const rankings = usingConvex 
    ? convexRankings.map((entry: ConvexRankingEntry) => ({
        id: entry._id,
        score: entry.score,
        playerName: entry.playerName || 'Anonymous',
        timestamp: entry.timestamp,
        gameType: entry.gameType,
      }))
    : localRankings;

  if (isLoading && !usingConvex) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          🍌 スコアランキング 🍌
        </h3>
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          🍌 スコアランキング 🍌
        </h3>
        <div className="mb-2">
          {usingConvex ? (
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              🌐 グローバルランキング
            </span>
          ) : (
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              💾 ローカルランキング
            </span>
          )}
        </div>
        <p className="text-gray-500">まだスコアがありません</p>
        <p className="text-sm text-gray-400 mt-2">
          ゲームをプレイしてハイスコアを目指そう！
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-center mb-2 text-gray-800">
        🍌 スコアランキング 🍌
      </h3>
      
      <div className="text-center mb-4">
        {usingConvex ? (
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            🌐 グローバルランキング
          </span>
        ) : (
          <div className="space-y-1">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              💾 ローカルランキング
            </span>
            {!isConvexConfigured && (
              <p className="text-xs text-gray-500">
                グローバルランキングを有効にするには<br/>
                Convex設定が必要です
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {rankings.map((entry, index) => (
          <div 
            key={entry.id}
            className={`flex items-center justify-between p-3 rounded transition-all duration-200 ${
              index === 0 ? 'bg-yellow-100 border-2 border-yellow-300 shadow-md' :
              index === 1 ? 'bg-gray-100 border-2 border-gray-300' :
              index === 2 ? 'bg-orange-100 border-2 border-orange-300' :
              'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="font-bold text-lg min-w-8">
                {index === 0 ? '🥇' : 
                 index === 1 ? '🥈' : 
                 index === 2 ? '🥉' : 
                 `${index + 1}.`}
              </span>
              <div>
                <div className="font-semibold text-gray-800">
                  {entry.playerName}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(entry.timestamp).toLocaleDateString('ja-JP', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-xl font-bold text-orange-600">
                {entry.score}
              </span>
              <div className="text-sm text-gray-500">points</div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          {usingConvex 
            ? 'データはConvexクラウドに保存されています' 
            : 'データは端末内に保存されています'
          }
        </p>
      </div>
    </div>
  );
};