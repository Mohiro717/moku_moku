import React, { memo } from 'react';

interface GameStatsProps {
  score: number;
  chainCount: number;
  isChaining?: boolean;
  chainAnimationStep?: 'idle' | 'highlighting' | 'deleting' | 'falling' | 'complete';
  currentChainStep?: number;
}

export const GameStats: React.FC<GameStatsProps> = memo(({ 
  score, 
  chainCount, 
  isChaining = false,
  chainAnimationStep = 'idle',
  currentChainStep = 0
}) => {
  const getChainStatusText = () => {
    if (!isChaining) return '';
    
    switch (chainAnimationStep) {
      case 'highlighting':
        return currentChainStep > 0 ? '連鎖発見!' : 'ぷよ発見!';
      case 'deleting':
        return 'ぷよ消去中...';
      case 'falling':
        return '落下中...';
      case 'complete':
        return currentChainStep > 0 ? `${currentChainStep}連鎖!` : 'ぷよ消去完了!';
      default:
        return '';
    }
  };

  const getChainStatusColor = () => {
    if (!isChaining) return '';
    
    switch (chainAnimationStep) {
      case 'highlighting':
        return 'text-yellow-600 animate-pulse';
      case 'deleting':
        return 'text-red-600 animate-bounce';
      case 'falling':
        return 'text-blue-600';
      case 'complete':
        return 'text-green-600 animate-pulse';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-coffee-light/20 rounded-lg p-3">
          <div className="text-coffee-dark/60 text-xs">SCORE</div>
          <div className="text-xl font-bold text-coffee-dark">
            {score.toLocaleString()}
          </div>
        </div>
        <div className="bg-coffee-light/20 rounded-lg p-3">
          <div className="text-coffee-dark/60 text-xs">CHAIN</div>
          <div className="text-xl font-bold text-coffee-dark">
            {chainCount}
          </div>
        </div>
      </div>
      
      {/* Chain Animation Status */}
      {isChaining && (
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 text-center">
          <div className={`text-sm font-bold ${getChainStatusColor()}`}>
            {getChainStatusText()}
          </div>
          {currentChainStep > 0 && chainAnimationStep !== 'complete' && (
            <div className="text-xs text-coffee-dark/60 mt-1">
              現在 {currentChainStep} 段目
            </div>
          )}
        </div>
      )}
    </div>
  );
});