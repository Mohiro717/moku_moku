import React from 'react';
import { createRoot } from 'react-dom/client';
import { PieceSkin, type SkinId } from './components/game/PieceSkins';
import { Puyo } from './components/game/Puyo';
import './components/game/puyoAnimations.css';

// 駒の見た目 A〜D を同じ盤面で並べる確認用ページ（オーナー 11-12「A〜D全てを見てみたい」）。
// 並びは見本れんさ（TitleChainDemo）の自分の盤面と同じ。上にぬばたま（今のまま）を少し乗せる。

const R = 'red', B = 'blue', G = 'green', Y = 'yellow', O = 'ojama';
const COLUMNS: string[][] = [
  [G, B, R, R, B, G, O],
  [G, B, R, R],
  [G, Y, Y, O],
  [Y, R, B, B],
  [B, Y, O],
  [R, B, Y]
];
const ROWS = 8;
const CELL = 46;
type Look = { skin: SkinId | 'now'; name: string; face?: boolean; join?: boolean };
const ALL: Record<string, Look[]> = {
  abcd: [
    { skin: 'a', name: 'A 花の駒（椿・桔梗・四つ葉・山吹）' },
    { skin: 'b', name: 'B 手まり' },
    { skin: 'c', name: 'C 勾玉' },
    { skin: 'd', name: 'D 狐火' }
  ],
  // オーナー 11-12「飴玉から目を無くすのが違和感なくいけそう。それか鬼火が好きかな」
  ed: [
    { skin: 'now', name: '今（目あり・くびれてつながる）', face: true, join: true },
    { skin: 'e', name: 'E 目なし・くびれてつながる', face: false, join: true },
    { skin: 'e', name: 'E2 目なし・つながらない', face: false, join: false },
    { skin: 'd', name: 'D 鬼火' }
  ]
};
const SET = new URLSearchParams(location.search).get('set') ?? 'abcd';
const SKINS = ALL[SET] ?? ALL.abcd;

/** 同じ色のとなりの向き（Puyo.tsx の LINK_*: 右1・下2・左4・上8）。row は下から数える */
const linksAt = (x: number, row: number) => {
  const c = COLUMNS[x][row];
  if (!c || c === O) return 0;
  const same = (xx: number, rr: number) => COLUMNS[xx]?.[rr] === c;
  return (same(x + 1, row) ? 1 : 0) | (same(x, row - 1) ? 2 : 0) | (same(x - 1, row) ? 4 : 0) | (same(x, row + 1) ? 8 : 0);
};

const Board: React.FC<{ look: Look }> = ({ look }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(6, ${CELL}px)`, gridAutoRows: `${CELL}px`, background: '#fffaf0', border: '4px solid #6b2f3a', borderRadius: 14, padding: 6 }}>
    {Array.from({ length: ROWS }, (_, r) => ROWS - 1 - r).map(row =>
      COLUMNS.map((col, x) => {
        const c = col[row];
        return (
          <div key={`${x}-${row}`} style={{ width: CELL, height: CELL }}>
            {c === O ? (
              <div style={{ width: CELL, height: CELL, ['--puyo-size' as string]: `${CELL}px` }}><Puyo color="ojama" /></div>
            ) : c && (look.skin === 'now' || look.skin === 'e') ? (
              <div style={{ width: CELL, height: CELL, ['--puyo-size' as string]: `${CELL}px` }}>
                <Puyo color={c as never} idle links={look.join ? linksAt(x, row) : 0} linkKey="p" hideFace={!look.face} />
              </div>
            ) : c ? (
              <svg viewBox="0 0 40 40" width={CELL} height={CELL} style={{ overflow: 'visible' }}><PieceSkin skin={look.skin as SkinId} color={c} /></svg>
            ) : null}
          </div>
        );
      })
    )}
  </div>
);

const App: React.FC = () => (
  <div style={{ display: 'flex', gap: 28, padding: 24, flexWrap: 'wrap' }}>
    {SKINS.map(s => (
      <div key={s.name}>
        <div style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>{s.name}</div>
        <Board look={s} />
      </div>
    ))}
  </div>
);

createRoot(document.getElementById('root')!).render(<App />);
