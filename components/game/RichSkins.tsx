import React from 'react';

// 鬼火・手鞠を作り込んだ版（オーナー 11-12「鬼火か手鞠の方向で進めたい。リッチに表現できる方でいきたい」）。
// 色の駒の見た目の試作。グラデーション・光・模様・ゆらめきを足して、どちらがリッチに見えるかを見比べる。
// 使う部品（グラデーション・ぼかし・アニメーション）は document に1回だけ置く。

type Pal = { core: string; light: string; mid: string; dark: string; deep: string; thread: string; accent: string };

const PAL: Record<string, Pal> = {
  red: { core: '#fff4ec', light: '#ffc2b8', mid: '#f7626a', dark: '#c8304a', deep: '#7d1530', thread: '#fff1d6', accent: '#f2c14e' },
  blue: { core: '#f2fbff', light: '#b8e2ff', mid: '#4c9bf5', dark: '#2459c9', deep: '#132f7a', thread: '#fff6e0', accent: '#f08a9a' },
  green: { core: '#f4fff2', light: '#c4f5c8', mid: '#3fcf7a', dark: '#1a8f55', deep: '#0b4d34', thread: '#fff6e0', accent: '#f6a04d' },
  yellow: { core: '#fffef0', light: '#fff0a6', mid: '#f7c62a', dark: '#d48b0b', deep: '#8a4a05', thread: '#fffaf0', accent: '#e04a5a' }
};
const COLORS = Object.keys(PAL);

const DEFS_ID = 'rich-skin-defs';

const defs = () => `
  <filter id="rk-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.1"/></filter>
  ${COLORS.map(c => {
    const p = PAL[c];
    return `
    <radialGradient id="rk-hl-${c}">
      <stop offset="0" stop-color="${p.mid}" stop-opacity=".75"/><stop offset=".45" stop-color="${p.mid}" stop-opacity=".5"/>
      <stop offset="1" stop-color="${p.mid}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="rk-fl-${c}" cx="50%" cy="78%" r="80%" fx="50%" fy="85%">
      <stop offset="0" stop-color="${p.core}"/><stop offset=".28" stop-color="${p.light}"/>
      <stop offset=".62" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.dark}"/>
    </radialGradient>
    <radialGradient id="rk-fc-${c}" cx="50%" cy="70%" r="65%">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="${p.core}"/><stop offset="1" stop-color="${p.light}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="rk-tm-${c}" cx="36%" cy="30%" r="78%">
      <stop offset="0" stop-color="${p.light}"/><stop offset=".45" stop-color="${p.mid}"/>
      <stop offset=".85" stop-color="${p.dark}"/><stop offset="1" stop-color="${p.deep}"/>
    </radialGradient>`;
  }).join('')}
  <radialGradient id="rk-tm-shade" cx="70%" cy="78%" r="70%">
    <stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
  </radialGradient>
  <clipPath id="rk-ball"><circle cx="20" cy="21" r="17"/></clipPath>`;

export const ensureRichDefs = () => {
  if (typeof document === 'undefined' || !document.body || document.getElementById(DEFS_ID)) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = DEFS_ID;
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML = `<defs>${defs()}</defs>`;
  document.body.appendChild(svg);
};

// ---------- 鬼火 ----------
// 下が白く熱い芯、上へ色が濃くなる。外に色の光のにじみ、横に小さな炎の舌。
// ここは止まった絵だけ。ゆらめきと火の粉は Puyo.tsx が SVG の外（HTML の層）で動かす。
// SVG の中を動かすと駒ごとに毎フレーム描き直しになり、盤面いっぱいで端末が熱くなる（オーナー 11-13）。
// 光のにじみもぼかしフィルタをやめ、ふちが透ける放射グラデーションにした（同じ理由）
const FLAME = 'M20 2 C21.5 8 27 11 30.5 17 C34 23 33 31 27.5 35 C25 36.8 22.6 37.4 20 37.4 C17.4 37.4 15 36.8 12.5 35 C7 31 6 23 9.5 17.5 C11 15 13.5 14 14.5 10.5 C16 13 16.6 15 17.6 13 C19 10 18.6 6 20 2 Z';
const TONGUE = 'M28.5 12 C30.5 14 32 15 32.4 18 C31 17 29.6 16.4 28.8 15 Z';
const CORE = 'M20 15 C22 19.5 26.5 22.5 26 28 C25.6 32 22.8 34 20 34 C17.2 34 14.4 32 14 28 C13.6 23.5 18.5 20.5 20 15 Z';

export const RichOnibi: React.FC<{ color: string }> = ({ color }) => {
  ensureRichDefs();
  const p = PAL[color];
  if (!p) return null;
  return (
    <g>
      <ellipse cx="20" cy="25" rx="20" ry="19" fill={`url(#rk-hl-${color})`} />
      <g>
        <path d={FLAME} fill={`url(#rk-fl-${color})`} />
        <path d={TONGUE} fill={p.mid} opacity=".85" />
        <path d={FLAME} fill="none" stroke={p.deep} strokeOpacity=".35" strokeWidth=".7" />
        <path d={CORE} fill={`url(#rk-fc-${color})`} />
        <path d="M14.5 21 C13 24 13.4 28 15.4 30.4" stroke="#fff" strokeOpacity=".55" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

// ---------- 手鞠 ----------
// 立体の陰影のついた玉に、地割りの金糸と、色ごとに違う「かがり」の模様。糸は破線の重ねで糸目を出す。
const Stitch: React.FC<{ d: string; color: string; w?: number }> = ({ d, color, w = 1.6 }) => (
  <>
    <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    <path d={d} stroke="#000" strokeOpacity=".16" strokeWidth={w * 0.55} strokeDasharray=".7 .9" fill="none" />
  </>
);

const star = (n: number, ro: number, ri: number, rot = -90) =>
  Array.from({ length: n * 2 }, (_, k) => {
    const r = k % 2 ? ri : ro;
    const a = ((rot + (180 / n) * k) * Math.PI) / 180;
    return `${(20 + Math.cos(a) * r).toFixed(2)} ${(21 + Math.sin(a) * r).toFixed(2)}`;
  }).join(' L');

const TemariPattern: React.FC<{ color: string }> = ({ color }) => {
  const p = PAL[color];
  if (color === 'red') {
    // 菊かがり：白と金の二重の花弁
    return (
      <>
        {Array.from({ length: 8 }, (_, k) => (
          <g key={k} transform={`rotate(${k * 45} 20 21)`}>
            <Stitch d="M20 21 C17 16 17.5 9 20 5.5 C22.5 9 23 16 20 21 Z" color={p.thread} w={1.3} />
            <Stitch d="M20 18 C18.6 15 18.9 11 20 9 C21.1 11 21.4 15 20 18 Z" color={p.accent} w={1} />
          </g>
        ))}
        <circle cx="20" cy="21" r="2.6" fill={p.accent} stroke={p.deep} strokeWidth=".5" />
      </>
    );
  }
  if (color === 'blue') {
    // 麻の葉の星：六芒星を二重に
    return (
      <>
        <Stitch d={`M${star(6, 15, 7)} Z`} color={p.thread} w={1.4} />
        <Stitch d={`M${star(6, 9, 4.2, -60)} Z`} color={p.accent} w={1.2} />
        {Array.from({ length: 6 }, (_, k) => (
          <g key={k} transform={`rotate(${k * 60} 20 21)`}><Stitch d="M20 21 L20 6" color={p.thread} w={.8} /></g>
        ))}
        <circle cx="20" cy="21" r="2" fill={p.thread} />
      </>
    );
  }
  if (color === 'green') {
    // 矢羽根の帯：斜めの帯を三色で
    return (
      <>
        {[-8, 0, 8].map((d, i) => (
          <g key={d} transform="rotate(-30 20 21)">
            <Stitch d={`M0 ${21 + d} H40`} color={i === 1 ? p.accent : p.thread} w={3.2} />
            <Stitch d={`M0 ${21 + d - 2.4} H40`} color={p.deep} w={.6} />
          </g>
        ))}
        {[8, 20, 32].map(x => <Stitch key={x} d={`M${x - 3} 18 L${x} 21 L${x - 3} 24`} color={p.deep} w={.8} />)}
      </>
    );
  }
  // 黄: 蛇の目（同心の輪）と十字の地割り
  return (
    <>
      <Stitch d="M20 4 V38 M3 21 H37" color={p.thread} w={1} />
      <circle cx="20" cy="21" r="12" fill="none" stroke={p.accent} strokeWidth="2.6" />
      <circle cx="20" cy="21" r="12" fill="none" stroke="#000" strokeOpacity=".15" strokeWidth="1.2" strokeDasharray=".7 .9" />
      <circle cx="20" cy="21" r="8" fill="none" stroke={p.thread} strokeWidth="2" />
      <circle cx="20" cy="21" r="4.4" fill={p.accent} stroke={p.thread} strokeWidth="1.2" />
    </>
  );
};

export const RichTemari: React.FC<{ color: string }> = ({ color }) => {
  ensureRichDefs();
  const p = PAL[color];
  if (!p) return null;
  return (
    <g>
      <ellipse cx="20" cy="37.6" rx="12" ry="2" fill="#000" opacity=".14" filter="url(#rk-soft)" />
      <circle cx="20" cy="21" r="17" fill={`url(#rk-tm-${color})`} />
      <g clipPath="url(#rk-ball)">
        {/* 地割り：金の糸の子午線と赤道 */}
        <ellipse cx="20" cy="21" rx="8.5" ry="17" fill="none" stroke="#e6b84a" strokeOpacity=".6" strokeWidth=".6" />
        <ellipse cx="20" cy="21" rx="17" ry="8.5" fill="none" stroke="#e6b84a" strokeOpacity=".6" strokeWidth=".6" />
        <TemariPattern color={color} />
        <circle cx="20" cy="21" r="17" fill="url(#rk-tm-shade)" />
      </g>
      <circle cx="20" cy="21" r="16.6" fill="none" stroke={p.deep} strokeOpacity=".55" strokeWidth=".8" />
      <ellipse cx="13.5" cy="12.5" rx="5" ry="3" fill="#fff" opacity=".35" filter="url(#rk-soft)" transform="rotate(-30 13.5 12.5)" />
    </g>
  );
};
