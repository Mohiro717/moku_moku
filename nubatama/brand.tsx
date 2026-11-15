import React from 'react';
import { createRoot } from 'react-dom/client';
import { Puyo } from '../components/game/Puyo';
import { TitleHanafudaOdori } from '../components/game/title/TitleHanafudaOdori';
import { TITLE_CSS } from '../components/game/title/common';
import { BENI, GEPPAKU, GOLD, SUMI, YOI, YOI_DEEP, YOI_LIGHT, StickerFilter } from '../components/game/title/hanafudaPop';
import '../components/game/wapop.css';
import '../components/game/hanafuda.css';

// ぬばたま落とし単独サイトのタブのアイコンと OGP 画像の原画（開発用。/brand.html?m=…&s=…）。
// 絵はゲームの部品そのもの（Puyo の ぬばたま・鬼火、タイトル案3b）。月蝕綺譚の正典画像は使わない（公式と誤認されないように）。
// 撮るときは動きを止める（ぬばたまの目は開いたまま・鬼火は休みの形）。
// 色は色調 B「夜の花札」（hanafudaPop.tsx の定数。11-15）：地は宵闇の放射、月は金、影は紅。

/** タイルの地（タイトルの空と同じ宵闇の放射） */
const YOI_SKY = `radial-gradient(ellipse 90% 80% at 30% 35%, ${YOI_LIGHT} 0%, ${YOI} 55%, ${YOI_DEEP} 100%)`;

const q = new URLSearchParams(location.search);
const mode = q.get('m') ?? 'a';
const s = Number(q.get('s') ?? 512);
/** sq=1 で角を丸めない（iPhone のホーム画面用。角は iOS が丸める） */
const square = q.get('sq') === '1';
const u = (v: number) => (v / 512) * s; // 512 枠の画素 → 実寸

const FREEZE = `*, *::before, *::after { animation-play-state: paused !important; animation-delay: 0s !important; transition: none !important; }
.onibi-spark { display: none !important; }`;

/** 駒ひとつ。cx, cy は中心、size は駒の大きさ（512 枠） */
const Piece: React.FC<{ color: 'ojama' | 'red' | 'blue' | 'green' | 'yellow'; cx: number; cy: number; size: number; rot?: number; filter?: string }> =
  ({ color, cx, cy, size, rot = 0, filter }) => (
    <div style={{ position: 'absolute', left: u(cx - size / 2), top: u(cy - size / 2), width: u(size), height: u(size),
      rotate: rot ? `${rot}deg` : undefined, filter, ['--puyo-size' as string]: `${u(size)}px` } as React.CSSProperties}>
      {color === 'ojama'
        ? <div style={{ clipPath: 'ellipse(54% 58% at 50% 50%)' }}><Puyo color="ojama" /></div>
        : <Puyo color={color} idle />}
    </div>
  );

const Tile: React.FC<{ bg: string; children: React.ReactNode }> = ({ bg, children }) => (
  <div style={{ position: 'relative', width: s, height: s, borderRadius: square ? 0 : u(112), background: bg, overflow: 'hidden' }}>
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <StickerFilter id="ic-st" k={s / 512} rim={9} rimColor={GEPPAKU} edge={7} edgeColor={SUMI} />
      <StickerFilter id="ic-st-sh" k={s / 512} rim={9} rimColor={GEPPAKU} edge={7} edgeColor={SUMI} shadow={{ dx: 10, dy: 10, color: BENI, opacity: 0.9 }} />
    </svg>
    {children}
  </div>
);

/** A：月を背にした ぬばたま。宵闇の地・金の月・金の環 */
const IconA: React.FC = () => (
  <Tile bg={YOI_SKY}>
    {s >= 96 && <div style={{ position: 'absolute', left: u(48), top: u(40), width: u(416), height: u(416), borderRadius: '50%',
      border: `${u(9)}px dotted ${GOLD}`, boxSizing: 'border-box', opacity: 0.9 }} />}
    <div style={{ position: 'absolute', left: u(86), top: u(76), width: u(340), height: u(340), borderRadius: '50%', background: GOLD }} />
    <Piece color="ojama" cx={256} cy={290} size={300} />
  </Tile>
);

/** B：ぬばたまと鬼火（黄）が並ぶ。宵闇の地 */
const IconB: React.FC = () => (
  <Tile bg={YOI_SKY}>
    <Piece color="yellow" cx={360} cy={168} size={230} rot={8} filter="url(#ic-st)" />
    <Piece color="ojama" cx={206} cy={316} size={300} rot={-4} />
  </Tile>
);

/** C：鬼火3色と ぬばたまの4つ組（盤面の一角）。宵闇の深い地 */
const IconC: React.FC = () => (
  <Tile bg={YOI_DEEP}>
    <Piece color="red" cx={158} cy={160} size={222} filter="url(#ic-st)" />
    <Piece color="yellow" cx={356} cy={160} size={222} filter="url(#ic-st)" />
    <Piece color="blue" cx={158} cy={356} size={222} filter="url(#ic-st)" />
    <Piece color="ojama" cx={356} cy={358} size={214} />
  </Tile>
);

/** OGP（1200×630）：タイトル案3bの画面そのまま。864:480 を幅 1200 に広げ、上下を 18px ずつ切る */
const Ogp: React.FC = () => (
  <div style={{ position: 'relative', width: 1200, height: 630, overflow: 'hidden', background: YOI }}>
    <style>{TITLE_CSS}</style>
    <div style={{ position: 'absolute', left: 0, top: -18 }}>
      <TitleHanafudaOdori showButtons={false} paused style={{ width: 1200, borderRadius: 0, boxShadow: 'none' }} />
    </div>
  </div>
);

const View = { a: IconA, b: IconB, c: IconC, og: Ogp }[mode] ?? IconA;

const root = document.getElementById('root');
if (root) createRoot(root).render(<><style>{FREEZE}</style><View /></>);
