import React from 'react';

// 色の駒の見た目の試作（オーナー 11-12「A〜D全てを見てみたい」）。URL に ?skin=a|b|c|d を付けたときだけ使う。
// A 花の駒・B 手まり・C 勾玉・D 狐火・E 今の飴玉から目を除いたもの（Puyo.tsx 側で描く）。どれも顔なし。つながりの形はまだ作っていない（1マスずつ描く）。

export type SkinId = 'a' | 'b' | 'c' | 'd' | 'e';

export const PREVIEW_SKIN: SkinId | null = (() => {
  if (typeof location === 'undefined') return null;
  const s = new URLSearchParams(location.search).get('skin');
  return s === 'a' || s === 'b' || s === 'c' || s === 'd' || s === 'e' ? s : null;
})();

const PAL: Record<string, { light: string; mid: string; dark: string }> = {
  red: { light: '#ffd0d0', mid: '#fb7a7a', dark: '#c94a4a' },
  blue: { light: '#d6e9ff', mid: '#6aa9fb', dark: '#2f6fd6' },
  green: { light: '#d4fbe0', mid: '#55dc86', dark: '#1f9d50' },
  yellow: { light: '#fff6c8', mid: '#fbd23a', dark: '#c98f06' }
};

const CX = 20;
const CY = 21;
const around = (n: number) => Array.from({ length: n }, (_, k) => (360 / n) * k);

// ---------- A 花の駒 ----------
const Camellia: React.FC = () => {
  const p = PAL.red;
  return (
    <g>
      {around(5).map(a => {
        const r = ((a - 90) * Math.PI) / 180;
        return <circle key={a} cx={CX + Math.cos(r) * 9} cy={CY + Math.sin(r) * 9} r="8.6" fill={p.mid} stroke={p.dark} strokeWidth="1" />;
      })}
      <circle cx={CX} cy={CY} r="7.5" fill={p.light} opacity=".55" />
      <circle cx={CX} cy={CY} r="4.6" fill="#fbd23a" stroke="#d49b06" strokeWidth=".7" />
      {around(6).map(a => {
        const r = (a * Math.PI) / 180;
        return <circle key={a} cx={CX + Math.cos(r) * 2.4} cy={CY + Math.sin(r) * 2.4} r=".8" fill="#e8892a" />;
      })}
    </g>
  );
};

const Bellflower: React.FC = () => {
  const p = PAL.blue;
  return (
    <g>
      {around(5).map(a => (
        <g key={a} transform={`rotate(${a} ${CX} ${CY})`}>
          <path d={`M${CX} ${CY} C${CX - 8} ${CY - 6} ${CX - 7} ${CY - 15} ${CX} ${CY - 19} C${CX + 7} ${CY - 15} ${CX + 8} ${CY - 6} ${CX} ${CY} Z`} fill={p.mid} stroke={p.dark} strokeWidth="1" strokeLinejoin="round" />
          <path d={`M${CX} ${CY - 3} L${CX} ${CY - 14}`} stroke={p.dark} strokeWidth=".7" opacity=".6" />
        </g>
      ))}
      <circle cx={CX} cy={CY} r="3.6" fill={p.light} />
      <circle cx={CX} cy={CY} r="1.4" fill="#fff" />
    </g>
  );
};

const Clover: React.FC = () => {
  const p = PAL.green;
  return (
    <g>
      {around(4).map(a => (
        <g key={a} transform={`rotate(${a + 45} ${CX} ${CY})`}>
          <path d={`M${CX} ${CY} C${CX - 4} ${CY - 3} ${CX - 10} ${CY - 6} ${CX - 9} ${CY - 12} C${CX - 8} ${CY - 17} ${CX - 2} ${CY - 17} ${CX} ${CY - 12} C${CX + 2} ${CY - 17} ${CX + 8} ${CY - 17} ${CX + 9} ${CY - 12} C${CX + 10} ${CY - 6} ${CX + 4} ${CY - 3} ${CX} ${CY} Z`} fill={p.mid} stroke={p.dark} strokeWidth="1" strokeLinejoin="round" />
          <path d={`M${CX} ${CY - 2} L${CX} ${CY - 11}`} stroke={p.dark} strokeWidth=".7" opacity=".55" />
        </g>
      ))}
      <circle cx={CX} cy={CY} r="2" fill={p.dark} />
    </g>
  );
};

const Kerria: React.FC = () => {
  const p = PAL.yellow;
  return (
    <g>
      {around(5).map(a => (
        <g key={a} transform={`rotate(${a} ${CX} ${CY})`}>
          <path d={`M${CX} ${CY} C${CX - 8} ${CY - 5} ${CX - 9} ${CY - 15} ${CX - 4} ${CY - 18} Q${CX} ${CY - 15} ${CX + 4} ${CY - 18} C${CX + 9} ${CY - 15} ${CX + 8} ${CY - 5} ${CX} ${CY} Z`} fill={p.mid} stroke={p.dark} strokeWidth="1" strokeLinejoin="round" />
        </g>
      ))}
      <circle cx={CX} cy={CY} r="4.2" fill="#e8892a" stroke="#b35f12" strokeWidth=".7" />
    </g>
  );
};

const FLOWERS: Record<string, React.FC> = { red: Camellia, blue: Bellflower, green: Clover, yellow: Kerria };

// ---------- B 手まり ----------
const chord = (r: number, d: number) => Math.sqrt(Math.max(0, r * r - d * d));
const Temari: React.FC<{ color: string }> = ({ color }) => {
  const p = PAL[color];
  const R = 17;
  const W = '#fffaf0';
  let pattern: React.ReactNode = null;
  if (color === 'red') {
    pattern = [-7, 0, 7].map(d => <line key={d} x1={CX - chord(R, d)} y1={CY + d} x2={CX + chord(R, d)} y2={CY + d} stroke={W} strokeWidth="2.2" />);
  } else if (color === 'blue') {
    pattern = (
      <>
        <line x1={CX} y1={CY - R} x2={CX} y2={CY + R} stroke={W} strokeWidth="2.4" />
        <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke={W} strokeWidth="2.4" />
        <rect x={CX - 5} y={CY - 5} width="10" height="10" fill="none" stroke={W} strokeWidth="1.6" transform={`rotate(45 ${CX} ${CY})`} />
      </>
    );
  } else if (color === 'green') {
    const h = R * Math.SQRT1_2;
    pattern = (
      <>
        <line x1={CX - h} y1={CY - h} x2={CX + h} y2={CY + h} stroke={W} strokeWidth="2.4" />
        <line x1={CX + h} y1={CY - h} x2={CX - h} y2={CY + h} stroke={W} strokeWidth="2.4" />
        <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke={p.dark} strokeWidth="1.4" />
      </>
    );
  } else {
    pattern = (
      <>
        <circle cx={CX} cy={CY} r="10.5" fill="none" stroke={W} strokeWidth="2.4" />
        <circle cx={CX} cy={CY} r="5" fill="none" stroke="#e8892a" strokeWidth="1.8" />
        <circle cx={CX} cy={CY} r="1.8" fill={W} />
      </>
    );
  }
  return (
    <g>
      <circle cx={CX} cy={CY} r={R} fill={p.mid} stroke={p.dark} strokeWidth="1.1" />
      {pattern}
      <circle cx={CX} cy={CY} r={R - 1.4} fill="none" stroke={p.dark} strokeWidth=".6" strokeDasharray="1.6 1.4" opacity=".7" />
    </g>
  );
};

// ---------- C 勾玉 ----------
const Magatama: React.FC<{ color: string }> = ({ color }) => {
  const p = PAL[color];
  return (
    <g transform="translate(22 18)">
      <path d="M-14 -4 A11 11 0 1 1 8 -4 C8 9 2 18 -12 20 C-5 11 -14 6 -14 -4 Z" fill={p.mid} stroke={p.dark} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M-9 -9 A7 7 0 0 1 1 -12" stroke={p.light} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="-3" cy="-4" r="3.2" fill="#fffaf0" stroke={p.dark} strokeWidth=".8" />
    </g>
  );
};

// ---------- D 狐火 ----------
const Kitsunebi: React.FC<{ color: string }> = ({ color }) => {
  const p = PAL[color];
  return (
    <g transform={`translate(${CX} ${CY})`}>
      <path d="M0 -20 C2 -12 10 -8 13 -1 C16 6 13 15 6 17.5 C3 18.5 -3 18.5 -6 17.5 C-13 15 -16 6 -13 -1 C-11 -6 -6 -5 -5 -10 C-3 -7 -2 -5 -1 -8 C0 -12 -1 -16 0 -20 Z" fill={p.mid} stroke={p.dark} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M0 -4 C3 1 8 4 7 9 C6 13 3 15 0 15 C-3 15 -6 13 -7 9 C-8 4 -2 2 0 -4 Z" fill={p.light} />
      <circle cx="0" cy="10" r="2.2" fill="#fff" />
    </g>
  );
};

export const PieceSkin: React.FC<{ skin: SkinId; color: string }> = ({ skin, color }) => {
  if (!PAL[color]) return null;
  if (skin === 'a') {
    const F = FLOWERS[color];
    return <F />;
  }
  if (skin === 'b') return <Temari color={color} />;
  if (skin === 'c') return <Magatama color={color} />;
  return <Kitsunebi color={color} />;
};
