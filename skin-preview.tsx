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
const SKINS: { id: SkinId; name: string }[] = [
  { id: 'a', name: 'A 花の駒（椿・桔梗・四つ葉・山吹）' },
  { id: 'b', name: 'B 手まり' },
  { id: 'c', name: 'C 勾玉' },
  { id: 'd', name: 'D 狐火' }
];

const Board: React.FC<{ skin: SkinId }> = ({ skin }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(6, ${CELL}px)`, gridAutoRows: `${CELL}px`, background: '#fffaf0', border: '4px solid #6b2f3a', borderRadius: 14, padding: 6 }}>
    {Array.from({ length: ROWS }, (_, r) => ROWS - 1 - r).map(row =>
      COLUMNS.map((col, x) => {
        const c = col[row];
        return (
          <div key={`${x}-${row}`} style={{ width: CELL, height: CELL }}>
            {c === O ? (
              <div style={{ width: CELL, height: CELL, ['--puyo-size' as string]: `${CELL}px` }}><Puyo color="ojama" /></div>
            ) : c ? (
              <svg viewBox="0 0 40 40" width={CELL} height={CELL} style={{ overflow: 'visible' }}><PieceSkin skin={skin} color={c} /></svg>
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
      <div key={s.id}>
        <div style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>{s.name}</div>
        <Board skin={s.id} />
      </div>
    ))}
  </div>
);

createRoot(document.getElementById('root')!).render(<App />);
