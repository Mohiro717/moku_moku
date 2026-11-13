import React from 'react';
import { createRoot } from 'react-dom/client';
import { PieceSkin, type SkinId } from './components/game/PieceSkins';
import { Puyo } from './components/game/Puyo';
import { petalFx } from './components/game/ChainFxPetals';
import { sparks, heatFlares } from './components/game/ChainFx';
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
  ],
  // オーナー 11-12「鬼火か手鞠の方向で進めたい。リッチに表現できる方でいきたい」
  rich: [
    { skin: 'f', name: '鬼火（作り込み）' },
    { skin: 'g', name: '手鞠（作り込み）' }
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

const BIG = 110;
const App: React.FC = () => (
  <div style={{ display: 'flex', gap: 28, padding: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
    {SKINS.map(s => (
      <div key={s.name}>
        <div style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>{s.name}</div>
        <Board look={s} />
      </div>
    ))}
    {SET === 'rich' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SKINS.map(s => (
          <div key={s.name} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            {['red', 'blue', 'green', 'yellow'].map(c => (
              <svg key={c} viewBox="0 0 40 40" width={BIG} height={BIG} style={{ overflow: 'visible' }}>
                <PieceSkin skin={s.skin as SkinId} color={c} />
              </svg>
            ))}
            <div style={{ width: BIG, height: BIG, ['--puyo-size' as string]: `${BIG}px` }}><Puyo color="ojama" /></div>
          </div>
        ))}
      </div>
    )}
  </div>
);

/** ?set=burst: 鬼火が消える瞬間を決まった時刻（1.5 秒）に起こす。ヘッドレスの仮想時間で撮るため */
const BurstDemo: React.FC = () => {
  const [del, setDel] = React.useState(false);
  const row = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const t = setTimeout(() => {
      setDel(true);
      const cells = [...(row.current?.querySelectorAll('[data-c]') ?? [])] as HTMLElement[];
      const pts = cells.map(el => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, color: el.dataset.c! };
      }) as never;
      sparks(pts, 3);
      heatFlares(pts, 3);
      petalFx(pts, 3);
      // ?freeze=ms: 消えはじめから ms の時点で全部の動きを止める（撮るため）
      const freeze = new URLSearchParams(location.search).get('freeze');
      if (freeze) setTimeout(() => document.getAnimations().forEach(a => { a.pause(); a.currentTime = Number(freeze); }), 80);
    }, 1500);
    return () => clearTimeout(t);
  }, []);
  const colors = ['#fb7a7a', '#6aa9fb', '#55dc86', '#fbd23a'];
  return (
    <div style={{ height: 460, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 60 }}>
      <div ref={row} style={{ display: 'flex', gap: 30, ['--puyo-size' as string]: '90px' }}>
        {['red', 'blue', 'green', 'yellow'].map((c, i) => (
          <div key={c} data-c={colors[i]}><Puyo color={c as never} idle={!del} isDeleting={del} /></div>
        ))}
        <div><Puyo color="ojama" /></div>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(SET === 'burst' ? <BurstDemo /> : <App />);
