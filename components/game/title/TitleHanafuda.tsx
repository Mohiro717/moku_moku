import React from 'react';
import { Glyphs, L, Nuba, Onibi, Sakuya, S, T, rand, vars, noop, type Glyph } from './common';

// 案3「花札ポップ」：花札「芒に月」（紅の空・大きな白い月・黒い丘のすすき）を下敷きにした、版画調の和ポップ。
// 色は 紅・生成り・墨・金・藍 の5色だけ。藍は「版ずれ」の影（咲耶・題字・ボタンが右下に藍の影を落とす）にだけ使う。
// 題字は右に縦書き2行。金の霞（すやり霞）が月の前後を横切り、遠近と和の空気をつくる。動きは3案でいちばんゆっくり。

const BENI = '#e04a36';
const KINARI = '#fff4dc';
const SUMI = '#221a1f';
const GOLD = '#f2c14e';
const AI = '#2b2f6b';

// 丘の稜線（3次ベジエ1本目）上の y を x から引く
const HILL = { p0: [0, 400], p1: [160, 354], p2: [330, 364], p3: [480, 404] };
const hillY = (x: number) => {
  let best = HILL.p0[1];
  let bd = 1e9;
  for (let i = 0; i <= 60; i++) {
    const t = i / 60, u = 1 - t;
    const bx = u ** 3 * HILL.p0[0] + 3 * u * u * t * HILL.p1[0] + 3 * u * t * t * HILL.p2[0] + t ** 3 * HILL.p3[0];
    const by = u ** 3 * HILL.p0[1] + 3 * u * u * t * HILL.p1[1] + 3 * u * t * t * HILL.p2[1] + t ** 3 * HILL.p3[1];
    if (Math.abs(bx - x) < bd) { bd = Math.abs(bx - x); best = by; }
  }
  return best;
};

/** すやり霞：角の丸い金の帯。縁は墨、中に小さな金の点 */
const Kasumi: React.FC<{ x: number; y: number; w: number; h?: number; dur: number; amp: number; delay?: number; z?: number }> =
  ({ x, y, w, h = 30, dur, amp, delay = 0, z }) => (
    <div style={{ position: 'absolute', left: L(x), top: T(y), width: S(w), height: S(h), zIndex: z }}>
      <div className="tt-bobx" style={vars({ width: '100%', height: '100%', '--dur': `${dur}s`, '--amp': S(amp), '--delay': `${-delay}s` })}>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }}>
          <path d={`M${h / 2} 0 H${w * 0.62} Q${w * 0.66} 0 ${w * 0.68} ${h * 0.3} H${w - h / 2} A${h / 2} ${h * 0.35} 0 0 1 ${w - h / 2} ${h} H${h / 2} A${h / 2} ${h / 2} 0 0 1 ${h / 2} 0 Z`}
            fill={GOLD} stroke={SUMI} strokeWidth="2.2" />
          <path d={`M${h * 0.8} ${h * 0.62} H${w * 0.55}`} stroke="#d4901c" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 7" />
        </svg>
      </div>
    </div>
  );

const Susuki: React.FC = () => {
  const blades = Array.from({ length: 28 }, (_, i) => {
    const bx = 14 + i * 17 + rand(i) * 10;
    const by = hillY(bx) + 8;
    const h = 46 + rand(i + 40) * 52;
    const lean = 8 + rand(i + 80) * 22;
    return { bx, by, h, lean, ear: i % 3 !== 1, i };
  }).filter(b => b.bx < 470 && (b.bx < 226 || b.bx > 372)); // 咲耶の脚の前は空ける
  return (
    <>
      {blades.map(b => {
        const tx = b.bx + b.lean, ty = b.by - b.h;
        return (
          <g key={b.i} className="tt-sway" style={vars({ transformBox: 'view-box', transformOrigin: `${b.bx}px ${b.by}px`,
            '--rot': `${2 + (b.i % 3)}deg`, '--dur': `${4.5 + (b.i % 4) * 0.6}s`, '--delay': `${-b.i * 0.45}s` })}>
            <path d={`M${b.bx} ${b.by} Q${b.bx + b.lean * 0.1} ${b.by - b.h * 0.6} ${tx} ${ty}`} stroke="#f1d58e" strokeWidth="2" fill="none" strokeLinecap="round" />
            {b.ear && [0, 1, 2, 3].map(k => (
              <path key={k} d={`M${tx} ${ty} q${4 + k * 3} ${2 + k * 4} ${8 + k * 2} ${12 + k * 5}`} stroke={KINARI} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".95" />
            ))}
          </g>
        );
      })}
    </>
  );
};

const Backdrop: React.FC = () => (
  <svg viewBox="0 0 864 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
    <defs>
      <radialGradient id="hf-sky" cx=".38" cy=".46" r=".75">
        <stop offset="0" stopColor="#f0613f" /><stop offset=".6" stopColor={BENI} /><stop offset="1" stopColor="#bf3328" />
      </radialGradient>
      <radialGradient id="hf-moon" cx=".45" cy=".4" r=".65">
        <stop offset="0" stopColor="#fffaf0" /><stop offset="1" stopColor={KINARI} />
      </radialGradient>
    </defs>
    <rect width="864" height="480" fill="url(#hf-sky)" />
    {/* 花札の地の細かな刷毛目 */}
    {Array.from({ length: 24 }, (_, i) => (
      <path key={i} d={`M0 ${i * 20 + 6} H864`} stroke="#fff" strokeOpacity=".035" strokeWidth="6" />
    ))}
    <circle cx="330" cy="224" r="214" fill="none" stroke={GOLD} strokeOpacity=".55" strokeWidth="2" strokeDasharray="1 10" strokeLinecap="round" />
    <circle cx="330" cy="224" r="198" fill="url(#hf-moon)" />
    <circle cx="330" cy="224" r="198" fill="none" stroke={SUMI} strokeOpacity=".12" strokeWidth="3" />
  </svg>
);

const Hill: React.FC = () => (
  <svg viewBox="0 0 864 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }} aria-hidden="true">
    <path d={`M0 400 C160 354 330 364 480 404 C560 424 630 452 660 480 H0 Z`} fill={SUMI} />
    <Susuki />
  </svg>
);

/** 縦書きの題字。右の行「ぬばたま」→ 左の行「落とし」 */
const TITLE: Glyph[] = [
  ...[...'ぬばたま'].map((ch, i) => ({ ch, x: 790, y: 64 + i * 62, size: 62 })),
  { ch: '落', x: 686, y: 104, size: 110, fill: 'url(#hf-gold)', rot: -4 },
  { ch: 'と', x: 688, y: 198, size: 84 },
  { ch: 'し', x: 688, y: 280, size: 84 }
];

const Title: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none' }}>
    <div className="tt-bob" style={vars({ position: 'absolute', inset: 0, '--dur': '5.6s', '--amp': S(4), '--delay': '-1s' })}>
      <svg viewBox="0 0 864 480" style={{ width: '100%', height: '100%', overflow: 'visible' }} role="img" aria-label="ぬばたま落とし">
        <defs>
          <linearGradient id="hf-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset=".1" stopColor="#ffe9a6" /><stop offset=".9" stopColor="#f0a51a" />
          </linearGradient>
        </defs>
        <Glyphs glyphs={TITLE} font="'Potta One', sans-serif" fill={KINARI}
          layers={[{ color: SUMI, width: 14 }]} shadow={{ dx: 6, dy: 6, color: AI }} />
        {/* 行のあいだの細い金の罫 */}
        <path d="M738 40 V320" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 7" />
        <text x="738" y="350" textAnchor="middle" dominantBaseline="central" fontFamily="'Potta One', sans-serif" fontSize="13"
          letterSpacing="3.5" fill={KINARI} stroke={SUMI} strokeWidth="3.5" style={{ paintOrder: 'stroke fill' }}>NUBATAMA OTOSHI</text>
      </svg>
    </div>
  </div>
);

const Button: React.FC<{ label: string; y: number; primary?: boolean }> = ({ label, y, primary }) => (
  <button type="button" onClick={noop} className="tt-btn" style={{
    position: 'absolute', left: L(634), top: T(y), width: S(208), height: S(40), zIndex: 8, borderRadius: S(6),
    fontSize: S(16), letterSpacing: '.08em',
    ...(primary
      ? { background: SUMI, color: KINARI, border: `${S(2)} solid ${SUMI}`, boxShadow: `inset 0 0 0 ${S(2)} ${GOLD}, ${S(5)} ${S(5)} 0 ${AI}` }
      : { background: KINARI, color: SUMI, border: `${S(2.5)} solid ${SUMI}`, boxShadow: `${S(5)} ${S(5)} 0 ${AI}` })
  }}>
    <span style={{ width: S(8), height: S(8), borderRadius: '50%', marginRight: S(10), background: primary ? GOLD : BENI }} />
    {label}
  </button>
);

/** 紙の粒（版画のざらつき）。動かない層 */
const Grain: React.FC = () => (
  <svg viewBox="0 0 864 480" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 9,
    pointerEvents: 'none', mixBlendMode: 'multiply', opacity: .16 }} aria-hidden="true">
    <filter id="hf-grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" />
      <feColorMatrix values="0 0 0 0 .45  0 0 0 0 .35  0 0 0 0 .3  0 0 0 -1.6 1.25" /></filter>
    <rect width="864" height="480" filter="url(#hf-grain)" />
  </svg>
);

export const TitleHanafuda: React.FC = () => (
  <div className="tt-frame" style={{ background: BENI }}>
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      {/* 生成りの細い縁 → 藍の版ずれ影 */}
      <filter id="hf-print" x="-10%" y="-10%" width="130%" height="125%">
        <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="d" />
        <feFlood floodColor={KINARI} /><feComposite in2="d" operator="in" result="rim" />
        <feFlood floodColor={AI} floodOpacity=".9" /><feComposite in2="d" operator="in" result="ai" />
        <feOffset in="ai" dx="8" dy="7" result="shift" />
        <feMerge><feMergeNode in="shift" /><feMergeNode in="rim" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </svg>
    <Backdrop />
    <Kasumi x={-60} y={118} w={300} dur={11} amp={16} z={1} />
    <Kasumi x={548} y={10} w={340} h={26} dur={13} amp={14} delay={4} z={1} />
    <Onibi c="blue" x={58} y={52} size={56} dur={3.9} amp={10} delay={0.5} z={2} glow={0.8} />
    <Onibi c="yellow" x={540} y={70} size={46} dur={3.4} amp={9} delay={2} z={2} glow={0.8} />
    <Nuba x={150} y={196} size={46} dur={5.4} amp={7} delay={2.6} z={2} />
    <Kasumi x={404} y={292} w={186} h={24} dur={12} amp={14} delay={7} z={2} />
    <Sakuya x={192} y={6} w={280} dur={4.4} amp={10} z={3} filter="url(#hf-print)">
      <div style={{ position: 'absolute', left: '3%', top: '10%' }}>
        <Onibi c="red" x={0} y={0} size={56} dur={2.6} amp={6} glow={0.8} />
      </div>
    </Sakuya>
    <Nuba x={548} y={318} size={64} dur={5} amp={8} delay={1.1} rot={-4} z={4} />
    <Hill />
    <Onibi c="green" x={52} y={318} size={50} dur={3.6} amp={10} delay={1.4} z={6} glow={0.9} />
    {/* 近景の霞：丘の前を横切り、咲耶の足先をかくす */}
    <Kasumi x={-40} y={436} w={400} h={30} dur={10} amp={20} delay={2} z={7} />
    <Title />
    <Button label="CPUと たいせん" y={372} primary />
    <Button label="ひとりで あそぶ" y={424} />
    <Grain />
  </div>
);
