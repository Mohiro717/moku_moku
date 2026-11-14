import React, { useEffect, useRef, useState } from 'react';
import { Puyo } from '../Puyo';
import { L, S, T, rand, vars, type Layer } from './common';

// 案3「花札ポップ」を土台にしたポップ版（3a・3b・3c）の共通部品。案3（TitleHanafuda.tsx）には手を入れず、ここに写して使う。
// 座標は 864×480 の枠の画素。ぬばたまは丸いまま（つぶし・伸ばしは鬼火・札・文字だけにかけ、ぬばたまは上下の移動だけ）。

export const BENI = '#e04a36';
export const KINARI = '#fff4dc';
export const SUMI = '#221a1f';
export const GOLD = '#f2c14e';
export const AI = '#2b2f6b';
/** 鬼火4色（塗り・濃い影） */
export const ONI = {
  red: ['#ff5f6e', '#c9283c'], blue: ['#4d9bff', '#1f5fc4'], green: ['#2fcf78', '#138a49'], yellow: ['#ffc93c', '#d48f00']
} as const;

/** ぽよん系の動き。0% と 100% は同じ値なのでループの継ぎ目は出ない */
export const POP_CSS = `
@keyframes tp-poyon {
  0% { translate: 0 0; scale: 1.07 .92; animation-timing-function: cubic-bezier(.3,0,.3,1); }
  9% { translate: 0 0; scale: .96 1.05; animation-timing-function: cubic-bezier(.2,.6,.35,1); }
  46% { translate: 0 calc(var(--amp) * -1); scale: 1 1; animation-timing-function: cubic-bezier(.6,0,.8,.45); }
  88% { translate: 0 0; scale: 1 1; animation-timing-function: ease-out; }
  94%, 100% { translate: 0 0; scale: 1.07 .92; } }
@keyframes tp-soft {
  0%, 100% { translate: 0 0; animation-timing-function: cubic-bezier(.25,.6,.4,1); }
  44% { translate: 0 calc(var(--amp) * -1); animation-timing-function: cubic-bezier(.55,0,.75,.5); }
  80% { translate: 0 calc(var(--amp) * .14); animation-timing-function: ease-in-out; }
  90% { translate: 0 calc(var(--amp) * -.05); } }
@keyframes tp-hop {
  0%, 56%, 100% { translate: 0 0; scale: 1 1; }
  6% { translate: 0 0; scale: 1.1 .88; animation-timing-function: cubic-bezier(.2,.7,.4,1); }
  22% { translate: 0 calc(var(--amp) * -1); scale: .94 1.07; animation-timing-function: cubic-bezier(.6,0,.85,.4); }
  36% { translate: 0 0; scale: 1.12 .86; animation-timing-function: ease-out; }
  44% { translate: 0 0; scale: .97 1.03; } }
.tp-poyon { animation: tp-poyon var(--dur) infinite; animation-delay: var(--delay, 0s); transform-origin: 50% 100%; }
.tp-soft { animation: tp-soft var(--dur) infinite; animation-delay: var(--delay, 0s); }
.tp-hop { animation: tp-hop var(--dur) infinite; animation-delay: var(--delay, 0s); transform-box: fill-box; transform-origin: 50% 100%; }
.tp-spin { animation: tt-spin var(--dur) linear infinite; }
`;

/** 枠の幅 / 864。SVG フィルタの縁の太さを画面の大きさにそろえる（スマホで縁だけ太くならないように） */
export const useFrameK = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setK(el.clientWidth / 864));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, k] as const;
};

/**
 * ステッカーの縁：内側に色の縁（rim）→ 外に墨の線（edge）→ ずらした影（shadow）。太さは 864 枠の画素で、k を掛けて画面に合わせる
 */
export const StickerFilter: React.FC<{
  id: string; k: number; rim: number; rimColor?: string; edge?: number; edgeColor?: string;
  shadow?: { dx: number; dy: number; color: string; opacity?: number };
}> = ({ id, k, rim, rimColor = '#ffffff', edge = 0, edgeColor = SUMI, shadow }) => (
  <filter id={id} x="-15%" y="-12%" width="135%" height="130%" colorInterpolationFilters="sRGB">
    {/* うすい光やにじみ（不透明度 4割未満）は形に数えない。数えると縁が四角い箱になる */}
    <feComponentTransfer in="SourceAlpha" result="a"><feFuncA type="discrete" tableValues="0 0 1 1 1" /></feComponentTransfer>
    {/* 2値の形を太らせたままだと縁が階段になる（オーナー 11-13「咲耶の輪郭がジャギってる」）。
        少しぼかしてから急な傾きで戻し、1〜2画素ぶんの中間の濃さを縁に残す */}
    <feMorphology in="a" operator="dilate" radius={rim * k} result="r1raw" />
    <feGaussianBlur in="r1raw" stdDeviation={0.9} result="r1blur" />
    <feComponentTransfer in="r1blur" result="r1"><feFuncA type="linear" slope={2.4} intercept={-0.7} /></feComponentTransfer>
    <feFlood floodColor={rimColor} /><feComposite in2="r1" operator="in" result="rim" />
    <feMorphology in="a" operator="dilate" radius={(rim + edge) * k} result="r2raw" />
    <feGaussianBlur in="r2raw" stdDeviation={0.9} result="r2blur" />
    <feComponentTransfer in="r2blur" result="r2"><feFuncA type="linear" slope={2.4} intercept={-0.7} /></feComponentTransfer>
    <feFlood floodColor={edgeColor} /><feComposite in2="r2" operator="in" result="edge" />
    {shadow && <>
      <feFlood floodColor={shadow.color} floodOpacity={shadow.opacity ?? 1} /><feComposite in2="r2" operator="in" result="sh0" />
      <feOffset in="sh0" dx={shadow.dx * k} dy={shadow.dy * k} result="sh" />
    </>}
    <feMerge>
      {shadow && <feMergeNode in="sh" />}
      {edge > 0 && <feMergeNode in="edge" />}
      <feMergeNode in="rim" /><feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
);

type Anim = 'bob' | 'poyon' | 'soft';
const ANIM_CLASS: Record<Anim, string> = { bob: 'tt-bob', poyon: 'tp-poyon', soft: 'tp-soft' };

/** 置き場所（外）と動き（中）を分けた浮遊。anim で ふわふわ / ぽよん（つぶれて弾む）/ やわらか（行き過ぎて戻る）を選ぶ */
export const PFloat: React.FC<{
  x: number; y: number; w?: number; dur: number; amp: number; delay?: number; rot?: number; tilt?: number; z?: number;
  anim?: Anim; style?: React.CSSProperties; children: React.ReactNode;
}> = ({ x, y, w, dur, amp, delay = 0, rot = 0, tilt = 0, z, anim = 'bob', style, children }) => (
  <div style={{ position: 'absolute', left: L(x), top: T(y), width: w != null ? S(w) : undefined, zIndex: z, rotate: tilt ? `${tilt}deg` : undefined, ...style }}>
    <div className={ANIM_CLASS[anim]} style={vars({ '--dur': `${dur}s`, '--amp': S(amp), '--delay': `${-delay}s` })}>
      {rot ? (
        <div className="tt-sway" style={vars({ '--rot': `${rot}deg`, '--dur': `${dur * 1.5}s`, '--delay': `${-delay}s` })}>{children}</div>
      ) : children}
    </div>
  </div>
);

/** 鬼火。filter を渡せばステッカーの縁などに差し替えられる（渡さなければ色の光） */
export const POnibi: React.FC<{
  c: 'red' | 'blue' | 'green' | 'yellow'; x: number; y: number; size: number; dur: number; amp: number; delay?: number;
  z?: number; anim?: Anim; filter?: string; glow?: number;
}> = ({ c, x, y, size, dur, amp, delay = 0, z, anim = 'bob', filter, glow = 0.8 }) => {
  const col = { red: '255,96,110', blue: '90,160,255', green: '70,220,130', yellow: '255,205,60' }[c];
  const f = filter ?? `drop-shadow(0 0 ${S(size * 0.18 * glow)} rgba(${col},.85)) drop-shadow(0 0 ${S(size * 0.5 * glow)} rgba(${col},.45))`;
  return (
    <PFloat x={x} y={y} dur={dur} amp={amp} delay={delay} rot={3} z={z} anim={anim} style={vars({ '--puyo-size': S(size), filter: f })}>
      <Puyo color={c} idle />
    </PFloat>
  );
};

/** ぬばたま。動きは上下の移動だけ（形は変えない＝丸いまま）。にじみの外は だ円で切る */
export const PNuba: React.FC<{
  x: number; y: number; size: number; dur: number; amp: number; delay?: number; rot?: number; z?: number;
  anim?: 'bob' | 'soft'; filter?: string;
}> = ({ x, y, size, dur, amp, delay = 0, rot = 4, z, anim = 'bob', filter }) => (
  <PFloat x={x} y={y} dur={dur} amp={amp} delay={delay} rot={rot} z={z} anim={anim} style={vars({ '--puyo-size': S(size), filter: filter ?? '' })}>
    <div style={{ clipPath: 'ellipse(54% 58% at 50% 50%)' }}><Puyo color="ojama" /></div>
  </PFloat>
);

// ---------- 花札の部品 ----------

/** 3次ベジエの丘の稜線。x から y を引く */
export const makeHill = (p0: number[], p1: number[], p2: number[], p3: number[]) => (x: number) => {
  let best = p0[1];
  let bd = 1e9;
  for (let i = 0; i <= 60; i++) {
    const t = i / 60, u = 1 - t;
    const bx = u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0];
    const by = u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1];
    if (Math.abs(bx - x) < bd) { bd = Math.abs(bx - x); best = by; }
  }
  return best;
};

/** すすき（SVG の中に置く）。skip の x 範囲は空ける */
export const Susuki: React.FC<{
  hill: (x: number) => number; from: number; to: number; step?: number; sc?: number; skip?: [number, number];
  stem?: string; ear?: string; seed?: number;
}> = ({ hill, from, to, step = 17, sc = 1, skip, stem = '#f1d58e', ear = KINARI, seed = 0 }) => {
  const n = Math.floor((to - from) / step);
  const blades = Array.from({ length: n }, (_, i) => {
    const bx = from + i * step + rand(i + seed) * step * 0.6;
    const by = hill(bx) + 8 * sc;
    const h = (46 + rand(i + 40 + seed) * 52) * sc;
    const lean = (8 + rand(i + 80 + seed) * 22) * sc;
    return { bx, by, h, lean, ear: i % 3 !== 1, i };
  }).filter(b => b.bx < to && !(skip && b.bx > skip[0] && b.bx < skip[1]));
  return (
    <>
      {blades.map(b => {
        const tx = b.bx + b.lean, ty = b.by - b.h;
        return (
          <g key={b.i} className="tt-sway" style={vars({ transformBox: 'view-box', transformOrigin: `${b.bx}px ${b.by}px`,
            '--rot': `${2 + (b.i % 3)}deg`, '--dur': `${4.5 + (b.i % 4) * 0.6}s`, '--delay': `${-b.i * 0.45}s` })}>
            <path d={`M${b.bx} ${b.by} Q${b.bx + b.lean * 0.1} ${b.by - b.h * 0.6} ${tx} ${ty}`} stroke={stem} strokeWidth={2 * sc} fill="none" strokeLinecap="round" />
            {b.ear && [0, 1, 2, 3].map(k => (
              <path key={k} d={`M${tx} ${ty} q${(4 + k * 3) * sc} ${(2 + k * 4) * sc} ${(8 + k * 2) * sc} ${(12 + k * 5) * sc}`} stroke={ear}
                strokeWidth={2.2 * sc} fill="none" strokeLinecap="round" opacity=".95" />
            ))}
          </g>
        );
      })}
    </>
  );
};

/** すやり霞：角の丸い帯。色・点の色・縁の色を選べる。横にゆっくり往復 */
export const Kasumi: React.FC<{
  x: number; y: number; w: number; h?: number; dur: number; amp: number; delay?: number; z?: number;
  fill?: string; dot?: string; edge?: string; edgeW?: number; style?: React.CSSProperties;
}> = ({ x, y, w, h = 30, dur, amp, delay = 0, z, fill = GOLD, dot = '#d4901c', edge = SUMI, edgeW = 2.2, style }) => (
  <div style={{ position: 'absolute', left: L(x), top: T(y), width: S(w), height: S(h), zIndex: z, ...style }}>
    <div className="tt-bobx" style={vars({ width: '100%', height: '100%', '--dur': `${dur}s`, '--amp': S(amp), '--delay': `${-delay}s` })}>
      <KasumiShape w={w} h={h} fill={fill} dot={dot} edge={edge} edgeW={edgeW} />
    </div>
  </div>
);

/** すやり霞の形だけ（動かない）。ほかの画面の飾りにも使う */
export const KasumiShape: React.FC<{ w: number; h?: number; fill?: string; dot?: string; edge?: string; edgeW?: number }> =
  ({ w, h = 30, fill = GOLD, dot = '#d4901c', edge = SUMI, edgeW = 2.2 }) => (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }} aria-hidden="true">
      <path d={`M${h / 2} 0 H${w * 0.62} Q${w * 0.66} 0 ${w * 0.68} ${h * 0.3} H${w - h / 2} A${h / 2} ${h * 0.35} 0 0 1 ${w - h / 2} ${h} H${h / 2} A${h / 2} ${h / 2} 0 0 1 ${h / 2} 0 Z`}
        fill={fill} stroke={edge} strokeWidth={edgeW} />
      <path d={`M${h * 0.8} ${h * 0.62} H${w * 0.55}`} stroke={dot} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 7" />
    </svg>
  );

/** 桜の花（5弁）。cx, cy 中心、r 大きさ */
export const Sakura: React.FC<{ cx: number; cy: number; r: number; fill?: string; stroke?: string; sw?: number }> =
  ({ cx, cy, r, fill = '#ffc2d4', stroke = SUMI, sw = 1.2 }) => (
    <g transform={`translate(${cx} ${cy})`}>
      {[0, 72, 144, 216, 288].map(a => (
        <path key={a} transform={`rotate(${a})`} d={`M0 0 C${-r * 0.55} ${-r * 0.35} ${-r * 0.45} ${-r} ${-r * 0.12} ${-r} L0 ${-r * 0.82} L${r * 0.12} ${-r} C${r * 0.45} ${-r} ${r * 0.55} ${-r * 0.35} 0 0 Z`}
          fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      ))}
      <circle r={r * 0.2} fill={GOLD} />
    </g>
  );

export type FudaKind = 'moon' | 'tan' | 'sakura' | 'ura' | 'kiku';

/** 小さな花札（60×92）。縁は墨、内側に生成りの縁 */
export const Fuda: React.FC<{ kind: FudaKind; shadow?: string; accent?: string }> = ({ kind, shadow = AI, accent = BENI }) => (
  <svg viewBox="-4 -4 72 102" style={{ display: 'block', width: '100%', overflow: 'visible' }} aria-hidden="true">
    <rect x="4" y="5" width="60" height="92" rx="6" fill={shadow} />
    <rect width="60" height="92" rx="6" fill={kind === 'ura' ? accent : KINARI} stroke={SUMI} strokeWidth="2.4" />
    {kind === 'ura' && <>
      <rect x="6" y="6" width="48" height="80" rx="3" fill="none" stroke={SUMI} strokeWidth="1.6" />
      <rect x="10" y="10" width="40" height="72" rx="2" fill="none" stroke={GOLD} strokeWidth="1.4" strokeDasharray="1 4" strokeLinecap="round" />
    </>}
    {kind !== 'ura' && <rect x="5" y="5" width="50" height="82" rx="3" fill={kind === 'moon' ? accent : kind === 'kiku' ? '#ffe9b0' : '#fff9ee'} />}
    {kind === 'moon' && <>
      <circle cx="30" cy="34" r="18" fill={KINARI} />
      <path d="M5 66 C20 56 40 58 55 68 V87 H5 Z" fill={SUMI} />
      {[12, 22, 34, 46].map((x, i) => <path key={i} d={`M${x} 64 q3 -10 ${7 - i} -18`} stroke={KINARI} strokeWidth="1.4" fill="none" strokeLinecap="round" />)}
    </>}
    {kind === 'tan' && <>
      <path d="M9 14 Q20 8 30 18" stroke={SUMI} strokeWidth="2" fill="none" />
      {[[14, 20], [26, 13], [10, 34]].map(([x, y], i) => <Sakura key={i} cx={x} cy={y} r={6} fill="#ff9fb8" sw={1} />)}
      <g transform="rotate(-18 34 52)">
        <rect x="27" y="22" width="13" height="56" fill={accent} stroke={SUMI} strokeWidth="1.6" />
        {[30, 38, 46, 54].map(y => <path key={y} d={`M33.5 ${y} h1`} stroke={SUMI} strokeWidth="3" strokeLinecap="round" />)}
      </g>
    </>}
    {kind === 'sakura' && <>
      {[[16, 18, 8], [36, 12, 7], [44, 30, 9], [22, 38, 7], [12, 54, 6]].map(([x, y, r], i) => <Sakura key={i} cx={x} cy={y} r={r} fill="#ffb3c7" sw={1} />)}
      <path d="M5 64 H55 V87 H5 Z" fill={accent} />
      {[14, 26, 38, 50].map(x => <path key={x} d={`M${x} 64 V87`} stroke={SUMI} strokeWidth="1" opacity=".5" />)}
      <path d="M5 64 Q30 72 55 64" stroke={GOLD} strokeWidth="2.2" fill="none" />
    </>}
    {kind === 'kiku' && <>
      <g transform="translate(30 42)">
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={i} rx="4.2" ry="14" transform={`rotate(${i * 30}) translate(0 -10)`} fill={GOLD} stroke={SUMI} strokeWidth="1" />
        ))}
        <circle r="6" fill={accent} stroke={SUMI} strokeWidth="1" />
      </g>
    </>}
  </svg>
);

// ---------- 題字 ----------

export type PG = { ch: string; x: number; y: number; size: number; rot?: number; fill?: string; shadow?: string;
  hop?: { dur: number; amp: number; delay: number } };

/**
 * 1字ずつ置く題字。重ねる順は「全字の影 → 全字の外の縁 → … → 全字の塗り」なので、
 * 隣の字の縁が前の字の塗りにかぶらない（縁が1枚のシールのようにつながる）。
 * hop があれば、その字は同じ時間差で全部の層がそろって跳ねる
 */
export const PopGlyphs: React.FC<{
  glyphs: PG[]; font: string; fill: string; layers: Layer[]; shadow?: { dx: number; dy: number; color: string };
}> = ({ glyphs, font, fill, layers, shadow }) => {
  const common = { fontFamily: font, fontSize: 0, textAnchor: 'middle' as const, dominantBaseline: 'central' as const,
    strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  const wrap = (g: PG, key: string, node: React.ReactNode) => (
    <g key={key} transform={`translate(${g.x} ${g.y}) rotate(${g.rot ?? 0})`}>
      <g className={g.hop ? 'tp-hop' : undefined}
        style={g.hop ? vars({ '--dur': `${g.hop.dur}s`, '--amp': `${g.hop.amp}px`, '--delay': `${-g.hop.delay}s` }) : undefined}>{node}</g>
    </g>
  );
  const outer = layers[0];
  return (
    <>
      {shadow && outer && glyphs.map((g, i) => wrap(g, `s${i}`,
        <text {...common} fontSize={g.size} x={shadow.dx} y={shadow.dy} fill={g.shadow ?? shadow.color} stroke={g.shadow ?? shadow.color} strokeWidth={outer.width}>{g.ch}</text>))}
      {layers.map((l, k) => glyphs.map((g, i) => wrap(g, `l${k}-${i}`,
        <text {...common} fontSize={g.size} fill={l.color} stroke={l.color} strokeWidth={l.width}>{g.ch}</text>)))}
      {glyphs.map((g, i) => wrap(g, `f${i}`, <text {...common} fontSize={g.size} fill={g.fill ?? fill}>{g.ch}</text>))}
    </>
  );
};

/** 紙の粒（版画のざらつき）。動かない層 */
export const Grain: React.FC<{ id: string; opacity?: number }> = ({ id, opacity = 0.14 }) => (
  <svg viewBox="0 0 864 480" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 9,
    pointerEvents: 'none', mixBlendMode: 'multiply', opacity }} aria-hidden="true">
    <filter id={id}><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" />
      <feColorMatrix values="0 0 0 0 .45  0 0 0 0 .35  0 0 0 0 .3  0 0 0 -1.6 1.25" /></filter>
    <rect width="864" height="480" filter={`url(#${id})`} />
  </svg>
);
