import React, { memo } from 'react';

export const GameInstructions: React.FC = memo(() => {
  return (
    <div className="text-xs text-coffee-dark/60 text-center space-y-1">
      <p className="font-medium">操作方法:</p>
      <div className="hidden md:block space-y-1">
        <p>← → 左右移動</p>
        <p>↑ 回転</p>
        <p>↓ 高速落下</p>
      </div>
      <div className="md:hidden space-y-1">
        <p>📱 タップ: 回転</p>
        <p>👆 スライド: 移動・落下</p>
        <p>⚡ フリック↓: 瞬間落下</p>
      </div>
      <p className="mt-2 font-medium">ルール:</p>
      <p>同色4個以上つなげて消去</p>
      <p>連鎖でボーナス得点!</p>
      <p className="text-red-400">上端ラインに達するとゲームオーバー</p>
    </div>
  );
});