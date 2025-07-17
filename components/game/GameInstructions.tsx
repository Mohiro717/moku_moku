import React, { memo } from 'react';

export const GameInstructions: React.FC = memo(() => {
  return (
    <div className="text-xs text-coffee-dark/60 text-center">
      <p className="font-medium">操作方法:</p>
      <div className="hidden md:block space-y-1 mb-4">
        <p>← → 左右移動</p>
        <p>X 右回転</p>
        <p>Z 左回転</p>
        <p>↓ 高速落下</p>
      </div>
      <div className="md:hidden space-y-1 mb-4">
        <p>📱 タップ: 右回転</p>
        <p>👆 スライド: 移動・落下</p>
        <p>⚡ フリック↓: 瞬間落下</p>
      </div>
      
      <p className="font-medium">ルール:</p>
      <p>同色4個以上つなげて消去</p>
      <p>連鎖でボーナス得点!</p>
      <p className="text-red-400">上端ラインに達するとゲームオーバー</p>
    </div>
  );
});