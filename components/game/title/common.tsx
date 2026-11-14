import React from 'react';
import { Puyo } from '../Puyo';
import '../puyoAnimations.css';
import { SakuyaFlutter } from '../SakuyaFlutter';

// タイトル画面3案の共通部品。座標はすべてゲームの枠 864×480 の画素で書き、表示の大きさに合わせて
// %（位置）と cqw（大きさ）に直す。枠が小さくなっても絵の比率は崩れない。
// 動きはすべて CSS の往復（0% と 100% が同じ値）か、端で透明になる上昇なので、ループの継ぎ目は出ない。

export const SAKUYA_SRC = `${import.meta.env.BASE_URL}images/title/sakuya_title_float.webp`;
/** 咲耶の絵の 縦/横（640×964） */
export const SAKUYA_RATIO = 964 / 640;

export const L = (x: number) => `${(x / 864) * 100}%`;
export const T = (y: number) => `${(y / 480) * 100}%`;
/** 864 枠の画素 → cqw */
export const S = (px: number) => `${px / 8.64}cqw`;

/** 決まった並びの乱数（星・火の粉の配置を毎回同じにする） */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const TITLE_CSS = `
.tt-frame { position: relative; width: var(--tt-w, min(864px, calc(100vw - 32px))); aspect-ratio: 864 / 480; overflow: hidden;
  container-type: inline-size; isolation: isolate; border-radius: 18px; box-shadow: 0 18px 40px -18px rgba(30, 20, 40, .55); }
.tt-frame svg text { user-select: none; }
@keyframes tt-bob { 0%, 100% { translate: 0 0; } 50% { translate: 0 calc(var(--amp) * -1); } }
@keyframes tt-bobx { 0%, 100% { translate: 0 0; } 50% { translate: var(--amp) 0; } }
@keyframes tt-sway { 0%, 100% { rotate: calc(var(--rot) * -1); } 50% { rotate: var(--rot); } }
@keyframes tt-breathe { 0%, 100% { scale: 1; } 50% { scale: var(--sc, 1.02); } }
@keyframes tt-spin { to { rotate: 360deg; } }
@keyframes tt-twinkle { 0%, 100% { opacity: var(--lo, .2); } 50% { opacity: 1; } }
@keyframes tt-rise { 0% { translate: 0 0; opacity: 0; } 18% { opacity: var(--op, 1); } 80% { opacity: var(--op, 1); }
  100% { translate: var(--dx, 0) calc(var(--rise) * -1); opacity: 0; } }
@keyframes tt-shadow { 0%, 100% { scale: 1; opacity: var(--op, .3); } 50% { scale: .8; opacity: calc(var(--op, .3) * .55); } }
@keyframes tt-nudge { 0%, 100% { translate: 0 0; } 50% { translate: .5cqw 0; } }
.tt-bob { animation: tt-bob var(--dur) ease-in-out infinite; animation-delay: var(--delay, 0s); }
.tt-bobx { animation: tt-bobx var(--dur) ease-in-out infinite; animation-delay: var(--delay, 0s); }
.tt-sway { animation: tt-sway var(--dur) ease-in-out infinite; animation-delay: var(--delay, 0s); }
.tt-breathe { animation: tt-breathe var(--dur) ease-in-out infinite; animation-delay: var(--delay, 0s); }
.tt-twinkle { animation: tt-twinkle var(--dur) ease-in-out infinite; animation-delay: var(--delay, 0s); }
.tt-rise { animation: tt-rise var(--dur) linear infinite; animation-delay: var(--delay, 0s); }
.tt-shadow { animation: tt-shadow var(--dur) ease-in-out infinite; animation-delay: var(--delay, 0s); }
.tt-nudge { animation: tt-nudge 1.6s ease-in-out infinite; }
.tt-btn { display: flex; align-items: center; justify-content: center; cursor: pointer; user-select: none; white-space: nowrap;
  font-family: 'Mochiy Pop One', sans-serif; transition: transform 80ms ease-out, filter 120ms; }
.tt-btn:hover { filter: brightness(1.06); transform: translateY(-1px); }
.tt-btn:active { transform: translateY(2px); }
@media (prefers-reduced-motion: reduce) { .tt-frame * { animation: none !important; } }
`;

type Vars = Record<string, string | number>;
const vars = (v: Vars) => v as unknown as React.CSSProperties;

/** 置き場所（外）と上下の動き（中）を分ける。中の動きが外の位置を上書きしないように */
export const Float: React.FC<{
  x: number; y: number; w?: number; dur: number; amp: number; delay?: number; rot?: number; z?: number;
  style?: React.CSSProperties; children: React.ReactNode;
}> = ({ x, y, w, dur, amp, delay = 0, rot = 0, z, style, children }) => (
  <div style={{ position: 'absolute', left: L(x), top: T(y), width: w != null ? S(w) : undefined, zIndex: z, ...style }}>
    <div className="tt-bob" style={vars({ '--dur': `${dur}s`, '--amp': S(amp), '--delay': `${-delay}s` })}>
      {rot ? (
        <div className="tt-sway" style={vars({ '--rot': `${rot}deg`, '--dur': `${dur * 1.5}s`, '--delay': `${-delay}s` })}>{children}</div>
      ) : children}
    </div>
  </div>
);

/** 鬼火（ゲームの色の駒）。x, y は左上、size は一辺。glow は色の光のにじみ */
export const Onibi: React.FC<{
  c: 'red' | 'blue' | 'green' | 'yellow'; x: number; y: number; size: number; dur: number; amp: number; delay?: number;
  z?: number; glow?: number; blur?: number;
}> = ({ c, x, y, size, dur, amp, delay = 0, z, glow = 1, blur = 0 }) => {
  const col = { red: '255,96,110', blue: '90,160,255', green: '70,220,130', yellow: '255,205,60' }[c];
  return (
    <Float x={x} y={y} dur={dur} amp={amp} delay={delay} rot={3} z={z}
      style={vars({ '--puyo-size': S(size),
        filter: `${blur ? `blur(${blur}px) ` : ''}drop-shadow(0 0 ${S(size * 0.18 * glow)} rgba(${col},.85)) drop-shadow(0 0 ${S(size * 0.5 * glow)} rgba(${col},.45))` })}>
      <Puyo color={c} idle />
    </Float>
  );
};

/** ぬばたま（おじゃま）。filter で縁の光を足せる（暗い背景で輪郭を読ませる） */
export const Nuba: React.FC<{
  x: number; y: number; size: number; dur: number; amp: number; delay?: number; rot?: number; z?: number; filter?: string;
}> = ({ x, y, size, dur, amp, delay = 0, rot = 4, z, filter }) => (
  <Float x={x} y={y} dur={dur} amp={amp} delay={delay} rot={rot} z={z} style={vars({ '--puyo-size': S(size), filter: filter ?? '' })}>
    {/* にじみ（ぼかした墨）の外側が明るい地で四角く見えるので、だ円で切る */}
    <div style={{ clipPath: 'ellipse(54% 58% at 50% 50%)' }}><Puyo color="ojama" /></div>
  </Float>
);

/** 咲耶。w は表示の幅（864 枠の画素）。filter で縁の光・影をつける。children は咲耶と一緒に浮くもの */
export const Sakuya: React.FC<{
  x: number; y: number; w: number; dur: number; amp: number; delay?: number; z?: number; filter?: string; children?: React.ReactNode;
  /** 絵の下側を消す範囲（絵の高さに対する割合 [消え始め, 消えきり]）。足先を題字やボタンの陰に溶かす */
  fadeBottom?: [number, number];
}> = ({ x, y, w, dur, amp, delay = 0, z, filter, children, fadeBottom }) => {
  const mask = fadeBottom ? `linear-gradient(to bottom, #000 ${fadeBottom[0] * 100}%, transparent ${fadeBottom[1] * 100}%)` : undefined;
  return (
  <Float x={x} y={y} w={w} dur={dur} amp={amp} delay={delay} z={z}>
    <div style={{ position: 'relative', WebkitMaskImage: mask, maskImage: mask }}>
      <SakuyaFlutter src={SAKUYA_SRC} style={{ filter }} />
      {children}
    </div>
  </Float>
  );
};

// ---------- 題字（SVG の文字を1字ずつ置く） ----------

export type Glyph = { ch: string; x: number; y: number; size: number; rot?: number; fill?: string; layers?: Layer[];
  bob?: { dur: number; amp: number; delay: number } };
export type Layer = { color: string; width: number };

/**
 * 1字ずつ、外側の太い縁 → 内側の縁 → 塗り の順に重ねる（縁どりの段を何重にもできる）。
 * shadow はずらした影（和ポップの「ぺたっとした影」）。x, y は字の中心
 */
export const Glyphs: React.FC<{
  glyphs: Glyph[]; font: string; fill: string; layers: Layer[]; shadow?: { dx: number; dy: number; color: string };
  weight?: number;
}> = ({ glyphs, font, fill, layers, shadow, weight = 400 }) => (
  <>
    {glyphs.map((g, i) => {
      const ls = g.layers ?? layers;
      const common = { fontFamily: font, fontSize: g.size, fontWeight: weight, textAnchor: 'middle' as const,
        dominantBaseline: 'central' as const, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
      const outer = ls[0];
      return (
        <g key={i} transform={`translate(${g.x} ${g.y}) rotate(${g.rot ?? 0})`}>
          <g className={g.bob ? 'tt-bob' : undefined}
            style={g.bob ? vars({ '--dur': `${g.bob.dur}s`, '--amp': `${g.bob.amp}px`, '--delay': `${-g.bob.delay}s` }) : undefined}>
            {shadow && outer && (
              <text {...common} x={shadow.dx} y={shadow.dy} fill={shadow.color} stroke={shadow.color} strokeWidth={outer.width}>{g.ch}</text>
            )}
            {ls.map((l, k) => (
              <text key={k} {...common} fill={l.color} stroke={l.color} strokeWidth={l.width}>{g.ch}</text>
            ))}
            <text {...common} fill={g.fill ?? fill}>{g.ch}</text>
          </g>
        </g>
      );
    })}
  </>
);

/** ダミーのボタン（押しても何も起きない） */
export const noop = () => {};

export { vars };
