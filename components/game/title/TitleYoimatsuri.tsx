import React from 'react';
import { Float, Glyphs, L, Nuba, Onibi, Sakuya, S, T, rand, vars, noop, type Glyph } from './common';

// 案1「宵祭りステージ」：月を背にした咲耶が、上げた手のひらで左の題字を差し出す映画ポスター型。
// 光は2つだけ ─ 後ろの月（咲耶の縁を白く起こす逆光）と、手のひらの鬼火（暖色の照り返し）。
// 奥行きは3層：遠景（月・提灯・町の灯）はほぼ動かず、中景（咲耶・鬼火）、近景（大きなぬばたま・玉ボケ）ほど大きくゆっくり浮く。

const INDIGO = '#160f3a';
const INK = '#120b30';
const PINK = '#ff4f8b';
const CREAM = '#fff7e2';

/** 提灯の綱（2次ベジエ）上の点 */
const rope = (t: number) => {
  const p0 = [-10, 12], p1 = [432, 64], p2 = [874, 12];
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
};
const LANTERN_COLORS = ['#ff5a5f', '#ffe7b8', '#ff8fb4'];

const Lantern: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const [x, y] = rope(t);
  const c = LANTERN_COLORS[i % 3];
  return (
    <g className="tt-sway" style={vars({ transformBox: 'view-box', transformOrigin: `${x}px ${y}px`,
      '--rot': `${2 + (i % 3)}deg`, '--dur': `${4.2 + (i % 4) * 0.5}s`, '--delay': `${-i * 0.7}s` })}>
      <line x1={x} y1={y} x2={x} y2={y + 6} stroke={INK} strokeWidth="1.2" />
      <circle cx={x} cy={y + 20} r="24" fill={c} opacity=".22" filter="url(#ym-blur6)" />
      <rect x={x - 6} y={y + 5} width="12" height="4" rx="1" fill={INK} />
      <ellipse cx={x} cy={y + 20} rx="11" ry="12.5" fill={`url(#ym-lan-${i % 3})`} />
      {[-6, 0, 6].map(d => (
        <path key={d} d={`M${x - Math.sqrt(1 - (d / 12.5) ** 2) * 11} ${y + 20 + d} h${Math.sqrt(1 - (d / 12.5) ** 2) * 22}`}
          stroke={INK} strokeOpacity=".28" strokeWidth=".8" />
      ))}
      <rect x={x - 5} y={y + 31} width="10" height="3.5" rx="1" fill={INK} />
    </g>
  );
};

const Backdrop: React.FC = () => {
  const stars = Array.from({ length: 34 }, (_, i) => ({ x: rand(i) * 864, y: rand(i + 50) * 250, r: 0.6 + rand(i + 99) * 1.1 }));
  // 遠くの丘にのびる参道の灯（奥ほど小さく、間がつまる）
  const path = Array.from({ length: 16 }, (_, i) => {
    const t = i / 15;
    return { x: 860 - t * t * 330 - t * 60, y: 392 - t * 34, r: 2.6 - t * 1.6 };
  });
  return (
    <svg viewBox="0 0 864 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
      <defs>
        <linearGradient id="ym-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0e0a2c" /><stop offset=".45" stopColor="#21185a" />
          <stop offset=".78" stopColor="#4a2a72" /><stop offset="1" stopColor="#7a3470" />
        </linearGradient>
        <radialGradient id="ym-moonglow" cx="0.5" cy="0.5" r="0.5">
          <stop offset=".55" stopColor="#ffe9b0" stopOpacity=".5" /><stop offset=".75" stopColor="#ff9ec0" stopOpacity=".14" />
          <stop offset="1" stopColor="#ff9ec0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ym-moon" cx=".42" cy=".38" r=".7">
          <stop offset="0" stopColor="#fffdf2" /><stop offset=".7" stopColor="#fff1c6" /><stop offset="1" stopColor="#ffe08e" />
        </radialGradient>
        {/* 月の網点（ポップアートの影）。右下ほど濃い */}
        <pattern id="ym-dots" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <circle cx="4.5" cy="4.5" r="2.1" fill="#f2b85c" />
        </pattern>
        <radialGradient id="ym-dotmask-g" cx=".78" cy=".8" r=".75">
          <stop offset="0" stopColor="#fff" stopOpacity=".85" /><stop offset=".6" stopColor="#fff" stopOpacity=".25" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="ym-dotmask"><circle cx="610" cy="200" r="182" fill="url(#ym-dotmask-g)" /></mask>
        {LANTERN_COLORS.map((c, i) => (
          <radialGradient key={i} id={`ym-lan-${i}`} cx=".45" cy=".4" r=".7">
            <stop offset="0" stopColor="#fffbea" /><stop offset=".45" stopColor={c} /><stop offset="1" stopColor={i === 1 ? '#e2a64e' : '#b0203f'} />
          </radialGradient>
        ))}
        <filter id="ym-blur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="ym-blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" /></filter>
        <linearGradient id="ym-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff6fa0" stopOpacity="0" /><stop offset="1" stopColor="#ff6fa0" stopOpacity=".35" />
        </linearGradient>
      </defs>
      <rect width="864" height="480" fill="url(#ym-sky)" />
      {stars.map((s, i) => (
        <circle key={i} className="tt-twinkle" cx={s.x} cy={s.y} r={s.r} fill="#fff"
          style={vars({ '--dur': `${2.4 + (i % 5) * 0.6}s`, '--delay': `${-i * 0.37}s`, '--lo': '.25' })} />
      ))}
      {/* 月：同心の輪でスポットライトのように咲耶を囲う */}
      <circle cx="610" cy="200" r="290" fill="url(#ym-moonglow)" />
      <circle cx="610" cy="200" r="232" fill="none" stroke="#ffe9b0" strokeOpacity=".16" strokeWidth="2" />
      <circle cx="610" cy="200" r="258" fill="none" stroke="#ffe9b0" strokeOpacity=".09" strokeWidth="1.5" strokeDasharray="2 9" />
      <circle cx="610" cy="200" r="182" fill="url(#ym-moon)" />
      <rect x="420" y="10" width="380" height="380" fill="url(#ym-dots)" mask="url(#ym-dotmask)" opacity=".55" />
      {/* 地平のもや（祭りの灯が空を染める） */}
      <rect y="300" width="864" height="180" fill="url(#ym-haze)" />
      {/* 遠くの丘と参道の灯 */}
      <path d="M0 410 C120 386 250 380 380 388 C520 396 600 360 720 356 C790 354 840 362 864 366 V480 H0 Z" fill="#2a1a52" />
      {path.map((p, i) => (
        <g key={i} className="tt-twinkle" style={vars({ '--dur': `${1.8 + (i % 3) * 0.5}s`, '--delay': `${-i * 0.29}s`, '--lo': '.55' })}>
          <circle cx={p.x} cy={p.y} r={p.r * 3.2} fill="#ffb36b" opacity=".3" filter="url(#ym-blur2)" />
          <circle cx={p.x} cy={p.y} r={p.r} fill="#ffe2a8" />
        </g>
      ))}
      {/* 提灯の綱 */}
      <path d="M-10 12 Q432 64 874 12" fill="none" stroke={INK} strokeWidth="1.6" />
      {Array.from({ length: 15 }, (_, i) => <Lantern key={i} i={i} t={0.03 + i * 0.067} />)}
    </svg>
  );
};

/** 近景：屋台の屋根の影と軒の灯。咲耶の足元をかくす */
const Foreground: React.FC = () => {
  const roofs = [
    { x: -20, w: 150, h: 44 }, { x: 120, w: 120, h: 32 }, { x: 230, w: 170, h: 48 }, { x: 390, w: 130, h: 30 },
    { x: 510, w: 180, h: 46 }, { x: 680, w: 120, h: 34 }, { x: 790, w: 110, h: 42 }
  ];
  return (
    <svg viewBox="0 0 864 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 4, pointerEvents: 'none' }} aria-hidden="true">
      <defs>
        <linearGradient id="ym-fg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d1240" /><stop offset="1" stopColor="#0b0720" />
        </linearGradient>
      </defs>
      {roofs.map((r, i) => {
        const top = 446 - r.h * 0.5;
        return (
          <g key={i}>
            <path d={`M${r.x} 480 V${top + 14} L${r.x + 10} ${top} H${r.x + r.w - 10} L${r.x + r.w} ${top + 14} V480 Z`} fill="url(#ym-fg)" />
            <circle cx={r.x + r.w / 2} cy={top + 28} r="9" fill="#ff9b62" opacity=".35" filter="url(#ym-blur6)" />
            <circle cx={r.x + r.w / 2} cy={top + 28} r="2.4" fill="#ffd9a0" />
          </g>
        );
      })}
    </svg>
  );
};

const LOGO_LAYERS = [{ color: INK, width: 24 }, { color: PINK, width: 12 }];
const LOGO: Glyph[] = [
  ...[...'ぬばたま'].map((ch, i) => ({ ch, x: 102 + i * 66, y: 104, size: 64, fill: 'url(#ym-fill-a)',
    bob: { dur: 3.2, amp: 2.5, delay: i * 0.22 } })),
  { ch: '落', x: 104, y: 236, size: 146, rot: -8, fill: 'url(#ym-fill-pink)',
    layers: [{ color: INK, width: 26 }, { color: CREAM, width: 12 }], bob: { dur: 3.2, amp: 3, delay: 1.1 } },
  { ch: 'と', x: 218, y: 246, size: 104, fill: 'url(#ym-fill-b)', bob: { dur: 3.2, amp: 2.5, delay: 1.35 } },
  { ch: 'し', x: 314, y: 240, size: 104, rot: 5, fill: 'url(#ym-fill-b)', bob: { dur: 3.2, amp: 2.5, delay: 1.55 } }
];

const Logo: React.FC = () => (
  <svg viewBox="0 0 864 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 6, pointerEvents: 'none', overflow: 'visible' }}
    role="img" aria-label="ぬばたま落とし">
    <defs>
      <linearGradient id="ym-fill-a" x1="0" y1="-.5" x2="0" y2=".5" gradientUnits="objectBoundingBox">
        <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#ffd6e5" />
      </linearGradient>
      <linearGradient id="ym-fill-b" x1="0" y1="0" x2="0" y2="1">
        <stop offset=".1" stopColor="#fffbea" /><stop offset=".95" stopColor="#ffc93e" />
      </linearGradient>
      <linearGradient id="ym-fill-pink" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff8db5" /><stop offset=".6" stopColor="#ff3f7f" /><stop offset="1" stopColor="#d81f63" />
      </linearGradient>
      <filter id="ym-logoglow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="18" /></filter>
    </defs>
    {/* 題字の後ろの淡い桜の光（夜空から字を浮かせる） */}
    <ellipse cx="210" cy="190" rx="200" ry="120" fill="#ff5c96" opacity=".28" filter="url(#ym-logoglow)" />
    <Glyphs glyphs={LOGO} font="'Dela Gothic One', sans-serif" fill="url(#ym-fill-b)" layers={LOGO_LAYERS}
      shadow={{ dx: 0, dy: 8, color: '#0a0620' }} />
  </svg>
);

/** 英字の副題：題字の下に桜の札（字の影より上の層に置く） */
const Subtitle: React.FC = () => (
  <svg viewBox="0 0 864 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 7, pointerEvents: 'none' }} aria-hidden="true">
    <g transform="translate(206 330)">
      <rect x="-142" y="-15" width="284" height="30" rx="15" fill={INK} />
      <rect x="-138" y="-11" width="276" height="22" rx="11" fill={PINK} />
      <text textAnchor="middle" dominantBaseline="central" y="1" fontFamily="'Dela Gothic One', sans-serif" fontSize="14"
        letterSpacing="4" fill={CREAM}>NUBATAMA OTOSHI</text>
    </g>
  </svg>
);

/** 立ちのぼる火の粉。下で生まれ、上で消える（端が透明なのでループの継ぎ目が出ない） */
const Embers: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }} aria-hidden="true">
    {Array.from({ length: 16 }, (_, i) => {
      const s = 2 + rand(i + 7) * 3;
      return (
        <span key={i} className="tt-rise" style={vars({
          position: 'absolute', left: L(40 + rand(i + 3) * 800), top: T(470 - rand(i + 21) * 60), width: S(s), height: S(s), borderRadius: '50%',
          background: i % 3 ? '#ffc76b' : '#ff8fb4', boxShadow: `0 0 ${S(6)} ${i % 3 ? '#ff9b3d' : '#ff4f8b'}`,
          '--dur': `${7 + rand(i + 5) * 5}s`, '--delay': `${-rand(i + 11) * 12}s`, '--rise': S(260 + rand(i + 13) * 140),
          '--dx': S((rand(i + 17) - 0.5) * 60), '--op': `${0.55 + rand(i) * 0.4}` })} />
      );
    })}
  </div>
);

const MenuButton: React.FC<{ label: string; primary?: boolean; y: number }> = ({ label, primary, y }) => (
  <div style={{ position: 'absolute', left: L(54), top: T(y), width: S(270), height: S(46), zIndex: 8 }}>
    {primary && (
      // 選択中の印：鬼火色の小さな三角が左右にゆれる
      <span className="tt-nudge" style={{ position: 'absolute', left: S(-30), top: '50%', marginTop: S(-9), width: 0, height: 0,
        borderTop: `${S(9)} solid transparent`, borderBottom: `${S(9)} solid transparent`, borderLeft: `${S(14)} solid #ffc93e`,
        filter: 'drop-shadow(0 0 4px rgba(255,180,60,.9))' }} />
    )}
    <button type="button" onClick={noop} className="tt-btn" style={{
      width: '100%', height: '100%', borderRadius: S(23), fontSize: S(19), letterSpacing: '.06em',
      ...(primary
        ? { color: CREAM, background: 'linear-gradient(#ff7aa8, #ff3f7f 60%, #e52a6c)', border: `${S(3)} solid ${INK}`,
          boxShadow: `inset 0 ${S(2)} 0 rgba(255,255,255,.45), 0 ${S(5)} 0 ${INK}, 0 0 ${S(26)} rgba(255,79,139,.55)`,
          textShadow: `0 ${S(2)} 0 #b81d58` }
        : { color: CREAM, background: 'rgba(22,15,58,.62)', border: `${S(2)} solid rgba(255,240,220,.8)`,
          boxShadow: `0 ${S(4)} 0 rgba(8,5,26,.9)`, backdropFilter: 'blur(3px)' })
    }}>{label}</button>
  </div>
);

export const TitleYoimatsuri: React.FC = () => (
  <div className="tt-frame" style={{ background: INDIGO }}>
    <Backdrop />
    {/* 月の前を横切る遠いぬばたま（月を背にした影絵で読ませる） */}
    <Nuba x={716} y={96} size={40} dur={6.4} amp={6} delay={1.3} z={1} />
    {/* 手のひらの鬼火の照り返し（咲耶の顔と胸を暖かく） */}
    <Float x={420} y={20} dur={3.6} amp={10} z={2}>
      <div style={{ width: S(200), height: S(200), borderRadius: '50%', mixBlendMode: 'screen',
        background: 'radial-gradient(circle, rgba(255,120,130,.55), rgba(255,120,130,0) 65%)' }} />
    </Float>
    {/* 咲耶：月の逆光で縁が白く起き、下に影を落とす */}
    <Sakuya x={452} y={20} w={310} dur={3.6} amp={10} z={3}
      filter={`drop-shadow(0 0 ${S(2)} rgba(255,246,220,.95)) drop-shadow(0 0 ${S(10)} rgba(255,224,170,.55)) drop-shadow(0 ${S(14)} ${S(16)} rgba(8,4,30,.5))`}>
      {/* 赤い鬼火は手のひらの上（咲耶と一緒に浮いたうえで、自分でも小さくゆれる） */}
      <div style={{ position: 'absolute', left: '3%', top: '10%' }}>
        <Onibi c="red" x={0} y={0} size={58} dur={2.4} amp={6} />
      </div>
    </Sakuya>
    <Onibi c="yellow" x={806} y={178} size={42} dur={3.1} amp={9} delay={0.8} z={3} />
    <Onibi c="green" x={398} y={326} size={44} dur={3.4} amp={10} delay={2.1} z={5} />
    <Onibi c="blue" x={796} y={300} size={50} dur={3.8} amp={12} delay={0.3} z={5} />
    <Foreground />
    {/* 近景のぬばたま：右下から大きくのぞく。桜色の縁の光で夜に沈ませない */}
    <Nuba x={770} y={392} size={104} dur={5.2} amp={8} delay={2.4} rot={-3} z={7}
      filter={`drop-shadow(0 0 ${S(2)} rgba(255,140,180,.9)) drop-shadow(0 0 ${S(14)} rgba(255,79,139,.45))`} />
    <Embers />
    {/* 玉ボケ（近景の灯がピントの外に） */}
    {[{ x: -40, y: 300, r: 120, c: '255,120,170', d: 6 }, { x: 640, y: -60, r: 90, c: '255,200,120', d: 7.5 }, { x: 300, y: 400, r: 70, c: '255,180,90', d: 5.5 }].map((b, i) => (
      <Float key={i} x={b.x} y={b.y} dur={b.d} amp={14} delay={i * 1.7} z={7} style={{ pointerEvents: 'none' }}>
        <div style={{ width: S(b.r * 2), height: S(b.r * 2), borderRadius: '50%', filter: 'blur(6px)',
          background: `radial-gradient(circle, rgba(${b.c},.22) 0 55%, rgba(${b.c},.32) 62%, rgba(${b.c},0) 70%)` }} />
      </Float>
    ))}
    {/* 周辺減光：視線を題字と咲耶に集める */}
    <div style={{ position: 'absolute', inset: 0, zIndex: 7, pointerEvents: 'none',
      background: 'radial-gradient(ellipse 75% 80% at 52% 42%, rgba(0,0,0,0) 55%, rgba(6,3,24,.55) 100%)' }} />
    <Logo />
    <Subtitle />
    <MenuButton label="CPUと たいせん" primary y={360} />
    <MenuButton label="ひとりで あそぶ" y={416} />
  </div>
);
