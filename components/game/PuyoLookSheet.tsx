import React from 'react';
import { PUYO_LOOKS, PuyoSample } from './Puyo';

/**
 * 【見比べ用・開発のみ】?puyosheet で開く。ぷよの質感の案を、盤面の地の上に横に並べる。
 * 上の段は大きく（質感を見る）、下の段はゲームと同じ大きさ（実際の見え方）。案を決めたらこのファイルごと消す
 */
const COLORS = ['red', 'blue', 'green', 'yellow', 'ojama'];

export const PuyoLookSheet: React.FC = () => (
  <div className="min-h-screen bg-[#fff8ec] p-6 font-sans text-coffee-dark">
    <h1 className="mb-4 text-xl font-bold">ぷよの質感の見比べ（顔・ぬばたまは共通）</h1>
    <div className="flex flex-wrap gap-4">
      {PUYO_LOOKS.map(look => (
        <div key={look.id} className="wp-board p-4" data-look={look.id}>
          <div className="mb-3 text-center text-lg font-bold">{look.name}</div>
          <div className="grid grid-cols-2 gap-1" style={{ '--puyo-size': '64px' } as React.CSSProperties}>
            {COLORS.slice(0, 4).map(c => (
              <div key={c} className="puyo-cell"><PuyoSample color={c} look={look.id} /></div>
            ))}
          </div>
          <div className="mt-4 flex gap-1" style={{ '--puyo-size': '32px' } as React.CSSProperties}>
            {COLORS.map(c => (
              <div key={c} className="puyo-cell"><PuyoSample color={c} look={look.id} /></div>
            ))}
          </div>
        </div>
      ))}
    </div>
    <p className="mt-4 text-sm">ゲームの中で見るとき: アドレスの最後に ?puyo=a（a〜d）を付けて開く</p>
  </div>
);
