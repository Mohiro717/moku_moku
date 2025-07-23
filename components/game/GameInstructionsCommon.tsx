import React, { memo } from 'react';

interface GameInstructionsCommonProps {
  showOjamaExplanation?: boolean;
}

export const GameInstructionsCommon: React.FC<GameInstructionsCommonProps> = memo(({ 
  showOjamaExplanation = false 
}) => {
  return (
    <div className="bg-white/20 rounded-xl p-3">
      <div className="text-xs text-coffee-dark space-y-1">
        <div className="font-bold mb-2">操作方法：</div>
        <div>←→: 移動</div>
        <div>Z/X: 回転</div>
        <div>↓: 高速落下</div>
        <div>スペース: ハードドロップ</div>
        
        <div className="mt-2 pt-2 border-t border-coffee-light/30">
          <div className="font-bold">基本ルール：</div>
          <div>同色4個以上つなげて消去</div>
          <div>連鎖でボーナス得点！</div>
          <div className="text-red-600">上端ラインに達するとゲームオーバー</div>
        </div>
        
        {showOjamaExplanation && (
          <div className="mt-2 pt-2 border-t border-coffee-light/30">
            <div className="font-bold">対戦ルール：</div>
            <div>・2連鎖以上でおじゃまぷよを送信</div>
            <div>・4個以上同時消去でも送信</div>
            <div className="text-purple-600">・グレーのおじゃまぷよは隣接消去</div>
            <div className="text-orange-600">・相手をゲームオーバーにさせると勝利！</div>
          </div>
        )}
      </div>
    </div>
  );
});