import React from 'react';
import { Float, Glyphs, L, Nuba, Onibi, Sakuya, S, T, vars, noop, type Glyph } from './common';

// 案2「おもちゃ箱ポップ」：昼の明るさで、ゲームの中身そのものを題字にする。
// 「ぬばたま」の4字は鬼火の4色、「落とし」はぬばたまの宵闇藍。題字の端には本物のぬばたまが落ちてきて乗っている。
// 咲耶は空色の丸の前にシールのように立ち（白と墨の二重の縁）、題字は彼女の脚の前にアーチで架かる（正面の看板構図）。
// 線は本体の和ポップ（墨 #3b2f2f の太い線・ずらした影・桜／山吹／若竹／空）をそのまま使い、ゲームの画面とつなげる。

const SUMI = '#3b2f2f';
const KINARI = '#fff3dc';

// ---------- 題字：アーチ ----------
const R = 1300;
const CX = 432;
const BASE = 338;
const arc = (x: number) => ({ drop: R - Math.sqrt(R * R - (x - CX) ** 2), rot: (Math.asin((x - CX) / R) * 180) / Math.PI });
const GLYPH_COLORS: [string, string][] = [['#ffb0b4', '#ee3d4f'], ['#a8d4ff', '#2b78e4'], ['#a6f5c2', '#16b061'], ['#fff3a0', '#f2ad00']];
const INK_FILL = 'url(#om-ink)';
const BOB = 2.8;

const placed = (() => {
  const spec = [
    ...[...'ぬばたま'].map((ch, i) => ({ ch, size: 76, adv: 70, fill: `url(#om-g${i})` })),
    { ch: '落', size: 116, adv: 106, fill: INK_FILL },
    { ch: 'と', size: 86, adv: 78, fill: INK_FILL },
    { ch: 'し', size: 86, adv: 76, fill: INK_FILL }
  ];
  const total = spec.reduce((a, g) => a + g.adv, 0);
  let x = CX - total / 2;
  return spec.map((g, i) => {
    const cx = x + g.adv / 2;
    x += g.adv;
    const { drop, rot } = arc(cx);
    return { ch: g.ch, x: cx, y: BASE + drop - g.size * 0.5, size: g.size, rot, fill: g.fill, bob: { dur: BOB, amp: 5, delay: i * 0.14 } } as Glyph;
  });
})();
const LAST = placed[placed.length - 1];

const Logo: React.FC = () => (
  <svg viewBox="0 0 864 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 6, pointerEvents: 'none', overflow: 'visible' }}
    role="img" aria-label="ぬばたま落とし">
    <defs>
      {GLYPH_COLORS.map(([a, b], i) => (
        <linearGradient key={i} id={`om-g${i}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset=".15" stopColor={a} /><stop offset=".85" stopColor={b} />
        </linearGradient>
      ))}
      <linearGradient id="om-ink" x1="0" y1="0" x2="0" y2="1">
        <stop offset=".1" stopColor="#5a5296" /><stop offset=".9" stopColor="#1c1a38" />
      </linearGradient>
    </defs>
    <Glyphs glyphs={placed} font="'Mochiy Pop One', sans-serif" fill={INK_FILL}
      layers={[{ color: SUMI, width: 22 }, { color: '#ffffff', width: 12 }]} shadow={{ dx: 0, dy: 8, color: SUMI }} />
    {/* 白い照り（字の左上に小さく。おもちゃのつや） */}
    {placed.slice(0, 4).map((g, i) => (
      <g key={i} transform={`translate(${g.x} ${g.y}) rotate(${g.rot})`}>
        <g className="tt-bob" style={vars({ '--dur': `${BOB}s`, '--amp': '5px', '--delay': `${-i * 0.14}s` })}>
          <ellipse cx={-g.size * 0.26} cy={-g.size * 0.3} rx="6" ry="3.4" fill="#fff" opacity=".85" transform="rotate(-35)" />
        </g>
      </g>
    ))}
  </svg>
);

const Subtitle: React.FC = () => (
  <div style={{ position: 'absolute', left: '50%', top: T(366), translate: '-50% 0', zIndex: 7, padding: `${S(3)} ${S(16)}`,
    borderRadius: 999, background: SUMI, color: KINARI, fontFamily: "'Mochiy Pop One', sans-serif", fontSize: S(13),
    letterSpacing: '.32em', whiteSpace: 'nowrap', boxShadow: `0 ${S(3)} 0 rgba(59,47,47,.25)` }}>NUBATAMA OTOSHI</div>
);

// ---------- 背景 ----------
const SEIGAIHA = (stroke: string, op: number) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='24' viewBox='0 0 48 24'%3E%3Cg fill='none' stroke='${encodeURIComponent(stroke)}' stroke-width='1.6' opacity='${op}'%3E%3Cpath d='M0 24a24 24 0 0 1 48 0M6 24a18 18 0 0 1 36 0M12 24a12 12 0 0 1 24 0M18 24a6 6 0 0 1 12 0'/%3E%3Cpath d='M-24 12a24 24 0 0 1 48 0M-18 12a18 18 0 0 1 36 0M-12 12a12 12 0 0 1 24 0M24 12a24 24 0 0 1 48 0M30 12a18 18 0 0 1 36 0M36 12a12 12 0 0 1 24 0'/%3E%3C/g%3E%3C/svg%3E")`;

/** 紙ふぶき：和の形（菱・桜の花びら・丸）を鬼火の色で。中央を避けて置く */
const CONFETTI = [
  { k: 'hishi', x: 40, y: 40, c: '#f2ad00', s: 16 }, { k: 'petal', x: 196, y: 30, c: '#f79ab7', s: 18 }, { k: 'dot', x: 250, y: 120, c: '#2b78e4', s: 10 },
  { k: 'hishi', x: 160, y: 236, c: '#16b061', s: 13 }, { k: 'petal', x: 40, y: 250, c: '#ee3d4f', s: 15 }, { k: 'dot', x: 600, y: 36, c: '#f2ad00', s: 9 },
  { k: 'petal', x: 816, y: 40, c: '#2b78e4', s: 16 }, { k: 'hishi', x: 650, y: 200, c: '#ee3d4f', s: 12 }, { k: 'dot', x: 836, y: 180, c: '#16b061', s: 11 },
  { k: 'petal', x: 700, y: 330, c: '#f79ab7', s: 15 }, { k: 'hishi', x: 812, y: 360, c: '#2b78e4', s: 14 }, { k: 'dot', x: 120, y: 360, c: '#f79ab7', s: 10 }
];
const Confetto: React.FC<{ k: string; c: string }> = ({ k, c }) => (
  <svg viewBox="-10 -10 20 20" style={{ display: 'block', width: '100%', overflow: 'visible' }}>
    {k === 'hishi' && <path d="M0 -9 L7 0 L0 9 L-7 0 Z" fill={c} stroke={SUMI} strokeWidth="1.6" strokeLinejoin="round" />}
    {k === 'petal' && <path d="M0 9 C-8 3 -7 -6 -2 -9 L0 -6 L2 -9 C7 -6 8 3 0 9 Z" fill={c} stroke={SUMI} strokeWidth="1.6" strokeLinejoin="round" />}
    {k === 'dot' && <circle r="7" fill={c} stroke={SUMI} strokeWidth="1.8" />}
  </svg>
);

const Backdrop: React.FC = () => (
  <>
    <div style={{ position: 'absolute', inset: 0, background: KINARI }} />
    {/* 放射の光：ゆっくり回る（2分で1周） */}
    <div style={{ position: 'absolute', left: L(CX), top: T(196), width: S(1500), height: S(1500), translate: '-50% -50%',
      WebkitMaskImage: 'radial-gradient(circle, #000 18%, rgba(0,0,0,.55) 32%, transparent 52%)',
      maskImage: 'radial-gradient(circle, #000 18%, rgba(0,0,0,.55) 32%, transparent 52%)' }}>
      <div style={vars({ width: '100%', height: '100%', animation: 'tt-spin 120s linear infinite',
        background: `repeating-conic-gradient(from 0deg, #ffe39a 0deg 7.5deg, ${KINARI} 7.5deg 15deg)` })} />
    </div>
    {/* 地の水玉（ごく薄く） */}
    <div style={{ position: 'absolute', inset: 0, opacity: .35,
      backgroundImage: 'radial-gradient(circle, #f7b9cb 0 18%, transparent 20%)', backgroundSize: `${S(28)} ${S(28)}`,
      WebkitMaskImage: 'radial-gradient(ellipse 60% 70% at 50% 40%, transparent 55%, #000 90%)',
      maskImage: 'radial-gradient(ellipse 60% 70% at 50% 40%, transparent 55%, #000 90%)' }} />
    {/* 咲耶の後ろの空色の丸（白と墨の二重の縁＝シール）。中に青海波 */}
    <div style={{ position: 'absolute', left: L(CX), top: T(198), width: S(330), height: S(330), translate: '-50% -50%', borderRadius: '50%',
      background: `${SEIGAIHA('#ffffff', 0.45)} 0 0 / ${S(40)} ${S(20)}, radial-gradient(circle at 40% 35%, #b6e6f7, #6cc0e4 70%, #4aa8d4)`,
      boxShadow: `0 0 0 ${S(7)} #fff, 0 0 0 ${S(10)} ${SUMI}, 0 ${S(8)} 0 ${S(10)} ${SUMI}` }} />
    {CONFETTI.map((c, i) => (
      <Float key={i} x={c.x} y={c.y} w={c.s} dur={3 + (i % 4) * 0.6} amp={6} delay={i * 0.5} rot={14}>
        <Confetto k={c.k} c={c.c} />
      </Float>
    ))}
  </>
);

/** 足元の波：桜の地に白い青海波、上に墨の線 */
const Waves: React.FC = () => (
  <svg viewBox="0 0 864 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }} aria-hidden="true">
    <defs>
      <pattern id="om-sei" width="36" height="18" patternUnits="userSpaceOnUse">
        <g fill="none" stroke="#fff" strokeWidth="1.5" opacity=".6">
          <path d="M0 18a18 18 0 0 1 36 0M5 18a13 13 0 0 1 26 0M10 18a8 8 0 0 1 16 0" />
          <path d="M-18 9a18 18 0 0 1 36 0M-13 9a13 13 0 0 1 26 0M18 9a18 18 0 0 1 36 0M23 9a13 13 0 0 1 26 0" />
        </g>
      </pattern>
    </defs>
    <path d="M0 412 Q54 392 108 412 T216 412 T324 412 T432 412 T540 412 T648 412 T756 412 T864 412 V480 H0 Z" fill="#f79ab7" stroke={SUMI} strokeWidth="3" />
    <path d="M0 412 Q54 392 108 412 T216 412 T324 412 T432 412 T540 412 T648 412 T756 412 T864 412 V480 H0 Z" fill="url(#om-sei)" />
  </svg>
);

const Button: React.FC<{ label: string; x: number; primary?: boolean }> = ({ label, x, primary }) => (
  <button type="button" onClick={noop} className="tt-btn" style={{
    position: 'absolute', left: L(x), top: T(404), width: S(222), height: S(48), zIndex: 8, borderRadius: 999,
    fontSize: S(19), letterSpacing: '.04em', color: SUMI, border: `${S(3)} solid ${SUMI}`,
    background: primary ? 'linear-gradient(#ffb3c9, #f79ab7 55%, #f084a8)' : '#fffdf7',
    boxShadow: `inset 0 ${S(2)} 0 rgba(255,255,255,.7), 0 ${S(5)} 0 ${SUMI}`
  }}>{label}</button>
);

export const TitleOmochabako: React.FC = () => (
  <div className="tt-frame" style={{ background: KINARI }}>
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      {/* シールの縁：白 → 墨の二重。下に墨のずらした影 */}
      <filter id="om-sticker" x="-15%" y="-10%" width="130%" height="125%">
        <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="w" />
        <feFlood floodColor="#ffffff" /><feComposite in2="w" operator="in" result="white" />
        <feMorphology in="SourceAlpha" operator="dilate" radius="6.5" result="k" />
        <feFlood floodColor={SUMI} /><feComposite in2="k" operator="in" result="ink" />
        <feOffset in="ink" dy="6" result="drop" />
        <feMerge><feMergeNode in="drop" /><feMergeNode in="ink" /><feMergeNode in="white" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </svg>
    <Backdrop />
    <Onibi c="blue" x={92} y={104} size={58} dur={3.4} amp={10} delay={0.4} z={3} glow={0.7} />
    <Onibi c="green" x={714} y={88} size={54} dur={3.0} amp={9} delay={1.6} z={3} glow={0.7} />
    <Onibi c="yellow" x={766} y={232} size={48} dur={3.7} amp={11} delay={2.5} z={3} glow={0.7} />
    <Sakuya x={CX - 135} y={4} w={270} dur={3.6} amp={9} z={4} filter="url(#om-sticker)" fadeBottom={[0.8, 0.88]}>
      <div style={{ position: 'absolute', left: '2%', top: '9%' }}>
        <Onibi c="red" x={0} y={0} size={54} dur={2.4} amp={6} glow={0.7} />
      </div>
    </Sakuya>
    <Waves />
    <Logo />
    {/* 題字の端に落ちてきて乗ったぬばたま（「し」と同じ周期で一緒に浮く） */}
    <Nuba x={LAST.x - 52} y={LAST.y - LAST.size * 0.5 - 32} size={56} dur={BOB} amp={5} delay={6 * 0.14} rot={0} z={7} filter="drop-shadow(0 0.4cqw 0 rgba(59,47,47,.3))" />
    {/* 近景の大きなぬばたま（左下） */}
    <Nuba x={22} y={322} size={98} dur={4.8} amp={8} delay={1.2} rot={-4} z={6} filter="drop-shadow(0 0.6cqw 0 rgba(59,47,47,.3))" />
    <Subtitle />
    <Button label="CPUと たいせん" x={CX - 232} primary />
    <Button label="ひとりで あそぶ" x={CX + 10} />
  </div>
);
