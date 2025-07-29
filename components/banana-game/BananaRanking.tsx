import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface BananaRankingProps {
  gameType: string;
  limit?: number;
}

export const BananaRanking: React.FC<BananaRankingProps> = ({ 
  gameType, 
  limit = 10 
}) => {
  const rankings = useQuery(api.bananaScores.getTopScores, { 
    gameType, 
    limit 
  });

  if (!rankings) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  if (rankings.length === 0) {
    return <div className="text-center py-4">まだスコアがありません</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-center mb-4 text-gray-800">
        🍌 スコアランキング 🍌
      </h3>
      
      <div className="space-y-2">
        {rankings.map((score, index) => (
          <div 
            key={score._id}
            className={`flex items-center justify-between p-3 rounded ${
              index === 0 ? 'bg-yellow-100 border-2 border-yellow-300' :
              index === 1 ? 'bg-gray-100 border-2 border-gray-300' :
              index === 2 ? 'bg-orange-100 border-2 border-orange-300' :
              'bg-gray-50'
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
                  {score.playerName || 'Anonymous'}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(score.timestamp).toLocaleDateString('ja-JP')}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-xl font-bold text-orange-600">
                {score.score}
              </span>
              <div className="text-sm text-gray-500">points</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};