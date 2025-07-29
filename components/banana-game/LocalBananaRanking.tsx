import React, { useState, useEffect } from 'react';
import { getRankings, type RankingEntry } from '../../utils/rankingUtils';

interface LocalBananaRankingProps {
  gameType: string;
  refreshTrigger?: number;
}

export const LocalBananaRanking: React.FC<LocalBananaRankingProps> = ({ 
  gameType,
  refreshTrigger = 0
}) => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);

  useEffect(() => {
    const loadRankings = () => {
      const currentRankings = getRankings(gameType);
      setRankings(currentRankings);
    };

    loadRankings();
  }, [gameType, refreshTrigger]);

  if (rankings.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          🍌 スコアランキング 🍌
        </h3>
        <p className="text-gray-500">まだスコアがありません</p>
        <p className="text-sm text-gray-400 mt-2">
          ゲームをプレイしてハイスコアを目指そう！
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-center mb-4 text-gray-800">
        🍌 スコアランキング 🍌
      </h3>
      
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

      {rankings.length > 0 && (
        <div className="text-center mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            データは端末内に保存されています
          </p>
        </div>
      )}
    </div>
  );
};