import React from 'react';
import { KIFUDA_LOOKS, NextTag } from './NextPiecePreview';
import type { PuyoPair } from '../../types/game';

/** 【見比べ用・開発のみ】?nextsheet で開く。「つぎ」の木札の案を、PC の大きさとスマホの大きさ（w-5rem）で並べる。案を決めたら消す */
const NEXT = { main: 'red', sub: 'blue' } as unknown as PuyoPair;
const NEXT_NEXT = { main: 'yellow', sub: 'green' } as unknown as PuyoPair;

export const NextTagSheet: React.FC = () => (
  <div className="wp-zone min-h-screen bg-[#fff8ec] p-6 text-coffee-dark">
    <h1 className="mb-6 text-xl font-bold">「つぎ」の木札の見比べ</h1>
    <div className="flex flex-wrap items-end gap-10">
      {KIFUDA_LOOKS.map(look => (
        <div key={look.id} className="flex flex-col items-center gap-3">
          <div className="font-bold">{look.name}</div>
          <div className="flex items-end gap-4">
            <NextTag nextPair={NEXT} nextNextPair={NEXT_NEXT} look={look.id} />
            <NextTag nextPair={NEXT} nextNextPair={NEXT_NEXT} look={look.id} className="w-[5rem]" />
          </div>
        </div>
      ))}
    </div>
    <p className="mt-6 text-sm">ゲームの中で見るとき: アドレスの最後に ?next=a（a〜c）を付けて開く</p>
  </div>
);
