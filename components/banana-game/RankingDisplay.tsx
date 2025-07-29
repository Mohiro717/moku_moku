import React from 'react';
import type { UnifiedRankingEntry } from '../../services/rankingService';

interface RankingDisplayProps {
  rankings: UnifiedRankingEntry[];
  isLoading: boolean;
  isGlobal: boolean;
  title?: string;
}

interface RankingEntryProps {
  entry: UnifiedRankingEntry;
  rank: number;
}

// 順位に応じたスタイリングを取得
const getRankStyle = (rank: number): string => {
  switch (rank) {
    case 1:
      return 'bg-yellow-100 border-2 border-yellow-300 shadow-md';
    case 2:
      return 'bg-gray-100 border-2 border-gray-300';
    case 3:
      return 'bg-orange-100 border-2 border-orange-300';
    default:
      return 'bg-gray-50 hover:bg-gray-100';
  }
};

// 順位に応じたアイコンを取得
const getRankIcon = (rank: number): string => {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return `${rank}.`;
  }
};

// 日付をフォーマット
const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 個別のランキングエントリコンポーネント
const RankingEntry: React.FC<RankingEntryProps> = ({ entry, rank }) => (
  <div className={`flex items-center justify-between p-3 rounded transition-all duration-200 ${getRankStyle(rank)}`}>
    <div className="flex items-center space-x-3">
      <span className="font-bold text-lg min-w-8">
        {getRankIcon(rank)}
      </span>
      <div>
        <div className="font-semibold text-gray-800">
          {entry.playerName}
        </div>
        <div className="text-sm text-gray-500">
          {formatDate(entry.timestamp)}
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
);

// ランキングタイプのバッジコンポーネント（非表示）
const RankingTypeBadge: React.FC<{ isGlobal: boolean }> = ({ isGlobal }) => null;

// 空の状態を表示するコンポーネント
const EmptyRankingState: React.FC<{ isGlobal: boolean }> = ({ isGlobal }) => (
  <div className="text-center">
    <p className="text-gray-500">まだスコアがありません</p>
    <p className="text-sm text-gray-400 mt-2">
      ゲームをプレイしてハイスコアを目指そう！
    </p>
  </div>
);

// ローディング状態を表示するコンポーネント
const LoadingState: React.FC = () => (
  <div className="text-center">
    <p className="text-gray-500">読み込み中...</p>
  </div>
);

// メインのランキング表示コンポーネント
export const RankingDisplay: React.FC<RankingDisplayProps> = ({
  rankings,
  isLoading,
  isGlobal,
  title = '🍌 スコアランキング 🍌'
}) => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-center mb-2 text-gray-800">
        {title}
      </h3>
      
      {isLoading ? (
        <LoadingState />
      ) : rankings.length === 0 ? (
        <EmptyRankingState isGlobal={isGlobal} />
      ) : (
        <div className="space-y-2">
          {rankings.map((entry, index) => (
            <RankingEntry
              key={entry.id}
              entry={entry}
              rank={index + 1}
            />
          ))}
        </div>
      )}

    </div>
  );
};