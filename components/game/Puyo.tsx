import React, { memo, useMemo } from 'react';
import type { PuyoColor } from '../../types/game';
import { GAME_TIMINGS } from '../../constants/gameTimings';
import './puyoAnimations.css';

interface PuyoProps {
  color: PuyoColor;
  isConnected?: boolean;
  isDeleting?: boolean;
  /** true のとき、fallRows マス上から落ちてきて着地でつぶれる（マウント時に1回） */
  landed?: boolean;
  fallRows?: number;
  /** 盤面に積もって止まっているぷよ。ゆっくり息をする */
  idle?: boolean;
}

/** つながりの橋の色（玉の中間色に合わせる） */
export const BRIDGE_COLORS: Record<string, string> = {
  red: 'bg-[#fb7a7a]',
  blue: 'bg-[#6aa9fb]',
  green: 'bg-[#55dc86]',
  yellow: 'bg-[#fbd23a]'
};

/** はじけたときの輪・しずくの色 */
const BURST_COLORS: Record<string, string> = {
  red: '#fb7a7a',
  blue: '#6aa9fb',
  green: '#55dc86',
  yellow: '#fbd23a',
  // ぬばたまは祓うと暗紫の花弁になる
  ojama: '#6b4a9a'
};

// ========================================
// SVG の部品（グラデーションと体の形）は document に1回だけ置き、各ぷよは <use> で参照する
// ========================================

const GRADIENTS: Record<string, [string, string, string]> = {
  red: ['#ffd0d0', '#fb7a7a', '#d93838'],
  blue: ['#d6e9ff', '#6aa9fb', '#2f6fd6'],
  green: ['#d4fbe0', '#55dc86', '#1f9d50'],
  yellow: ['#fff6c8', '#fbd23a', '#d49b06'],
  // おじゃま＝ぬばたま（月蝕綺譚の澱）。宵闇藍の墨のしずく。ツヤは出さない
  ojama: ['#3d3862', '#1f1d34', '#0d0c19']
};

const DEFS_ID = 'puyo-svg-defs';
const BODY_D = 'M20 3 C31 3 37 11 37 21 C37 31 30 37 20 37 C10 37 3 31 3 21 C3 11 9 3 20 3 Z';

const LOOK_DEFS = `
  <clipPath id="puyo-clip"><path d="${BODY_D}"/></clipPath>
  <filter id="puyo-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter>
  ${['red', 'blue', 'green', 'yellow'].map(name => {
    const [light, mid, dark] = GRADIENTS[name];
    return `
    <radialGradient id="puyo-gc-${name}" cx="50%" cy="66%" r="62%">
      <stop offset="0" stop-color="${light}"/><stop offset=".5" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/>
    </radialGradient>`;
  }).join('')}`;

/**
 * ぷよの体（顔の下）。飴玉：中から光る透けた飴（オーナー 11-12 の選択。見比べた案 a ゼリー・b 練り切り・c セル塗りから）。
 * 光の中心を下寄りに置いて中から光らせ、内側のふちの光・下のにじんだ照り返し・窓の形の白い照り・細い色の輪郭
 */
const PuyoSkin: React.FC<{ color: string }> = ({ color }) => {
  const [light, , dark] = GRADIENTS[color];
  return (
    <>
      <use href="#puyo-body" fill={`url(#puyo-gc-${color})`} />
      <g clipPath="url(#puyo-clip)">
        <use href="#puyo-body" fill="none" stroke={light} strokeOpacity=".75" strokeWidth="2.2" />
        <ellipse cx="22" cy="31" rx="9" ry="4" fill="#fff" opacity=".4" filter="url(#puyo-soft)" />
      </g>
      <path d="M8 15 C8 9 12.5 5.5 18 5.2 L17.6 8.2 C13.8 8.6 11.2 11 10.8 15 Z" fill="#fff" opacity=".9" />
      <circle cx="13.6" cy="17" r="1.1" fill="#fff" opacity=".8" />
      <use href="#puyo-body" fill="none" stroke={dark} strokeOpacity=".6" strokeWidth=".8" />
    </>
  );
};

const ensureDefs = () => {
  if (typeof document === 'undefined' || !document.body || document.getElementById(DEFS_ID)) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = DEFS_ID;
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML = `<defs>
    ${Object.entries(GRADIENTS).map(([name, [light, mid, dark]]) => `
      <radialGradient id="puyo-g-${name}" cx="38%" cy="32%" r="75%">
        <stop offset="0" stop-color="${light}"/><stop offset="${name === 'ojama' ? '.4' : '.35'}" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/>
      </radialGradient>`).join('')}
    <path id="puyo-body" d="${BODY_D}"/>
    <filter id="nb-haze" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.8"/></filter>
    ${LOOK_DEFS}
    <path id="puyo-star"d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z"/>
  </defs>`;
  document.body.appendChild(svg);
};

/** 落ちる距離に応じた落下時間（ms）。遠いほど少し長いが、連鎖のテンポを崩さないよう上限あり */
export const dropDuration = (rows: number): number => (rows > 0 ? Math.min(GAME_TIMINGS.drop, 100 + rows * 20) : 0);

const SIZE = 'puyo-cell';

/** 胸の紅いひび。正典「個体ごとに位置が違う」に合わせ、3本から選んで左右も振る */
const NUBATAMA_CRACKS = [
  'M25 9 L23.6 13.5 L25.6 16.4 L23.4 21.5',
  'M28.5 13 L25.8 16.2 L27 19 L24.2 24',
  'M22 8.5 L23.5 12.8 L21.4 15.6 L22.8 19.5'
];
const CRACK_RED = '#d6303e';

/**
 * おじゃま＝ぬばたま（月蝕綺譚の澱）。宵闇藍の丸い墨のしずく、紅い点の眼ふたつ、胸に紅いひび一本。
 * ふちは夜気へにじむ（点々の墨と頭の墨の巻き）。ツヤの白・口・虹彩のある目は描かない（正典の禁止）。
 * variant は 0〜1 の乱数。ひびの形と左右をこれで決める。
 */
export const Nubatama: React.FC<{ variant?: number; blinkDelay?: string }> = ({ variant = 0, blinkDelay }) => {
  const crack = NUBATAMA_CRACKS[Math.floor(variant * NUBATAMA_CRACKS.length) % NUBATAMA_CRACKS.length];
  const flip = variant * 10 % 1 >= 0.5;
  return (
    <g transform={flip ? 'translate(40 0) scale(-1 1)' : undefined}>
      {/* にじみ：体のまわりのぼかした墨と、頭の墨の巻き */}
      <use href="#puyo-body" fill="#1b1b2e" opacity=".5" filter="url(#nb-haze)" transform="translate(20 22) scale(1.1) translate(-20 -22)" />
      <path d="M16.6 5.2 C15.9 2.6 18.4 0.8 20 2.7 C20.7 0.6 23.7 0.8 23.3 3.2 C24.8 3 25.2 4.7 23.9 5.5 Z" fill="#141326" />
      <circle cx="26.6" cy="1.9" r=".9" fill="#141326" />
      <circle cx="12.8" cy="3.6" r=".7" fill="#141326" opacity=".8" />
      <use href="#puyo-body" fill="url(#puyo-g-ojama)" />
      <path d={crack} stroke={CRACK_RED} strokeWidth=".9" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
      <g className="nubatama-eye" style={blinkDelay ? { animationDelay: blinkDelay } : undefined}>
        <circle cx="14.6" cy="23" r="2.1" fill={CRACK_RED} />
        <circle cx="25.4" cy="23" r="2.1" fill={CRACK_RED} />
      </g>
    </g>
  );
};

/**
 * 月見積み：ぬばたまが月見団子のように3段に積み重なったもの（正典の変種「積むほど強い」）。
 * おじゃま予告の 30個 の印に使う。下から描いて、上の段が下の段に少し乗る。
 */
const STACK_LAYERS = [
  { cy: 31, rx: 15, ry: 8.5 },
  { cy: 20.5, rx: 13.5, ry: 7.6 },
  { cy: 10.6, rx: 12, ry: 7 }
];
export const NubatamaStack: React.FC = () => (
  <g>
    <ellipse cx="20" cy="21" rx="16" ry="19" fill="#1b1b2e" opacity=".45" filter="url(#nb-haze)" />
    <path d="M16.8 4.6 C16.2 2.2 18.6 0.5 20 2.3 C20.8 0.3 23.6 0.6 23.2 2.9 C24.6 2.8 25 4.3 23.8 5 Z" fill="#141326" />
    <circle cx="26.2" cy="1.6" r=".8" fill="#141326" />
    {STACK_LAYERS.map((l, i) => (
      <g key={i}>
        <ellipse cx="20" cy={l.cy} rx={l.rx} ry={l.ry} fill="url(#puyo-g-ojama)" stroke="#0d0c19" strokeWidth=".7" />
        <g className="nubatama-eye" style={{ animationDelay: `${-i * 1.7}s` }}>
          <circle cx="15.4" cy={l.cy + 1} r="1.7" fill={CRACK_RED} />
          <circle cx="24.6" cy={l.cy + 1} r="1.7" fill={CRACK_RED} />
        </g>
      </g>
    ))}
  </g>
);

/** ぷよの顔 SVG */
export const PuyoFace: React.FC<{ squint?: boolean; blinkDelay?: string }> = ({ squint = false, blinkDelay }) => {
  return (
    <g className={squint ? 'puyo-eye-squint' : undefined}>
      <g className="puyo-eye" style={blinkDelay ? { animationDelay: blinkDelay } : undefined}>
        <ellipse cx="14" cy="19" rx="3.6" ry="5" fill="#fff" />
        <ellipse cx="26" cy="19" rx="3.6" ry="5" fill="#fff" />
        <ellipse cx="14.8" cy="20" rx="2" ry="3" fill="#2b2b2b" />
        <ellipse cx="26.8" cy="20" rx="2" ry="3" fill="#2b2b2b" />
      </g>
    </g>
  );
};

/** 消えるときの輪・しずく・星。マスからはみ出して飛ぶ */
const Burst: React.FC<{ color: string }> = ({ color }) => {
  const drops = useMemo(() => Array.from({ length: 7 }, (_, k) => {
    const angle = (-90 + (k - 3) * 34 + (Math.random() * 16 - 8)) * Math.PI / 180;
    const dist = 30 + Math.random() * 22;
    return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist + 6 };
  }), []);
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-[2]" viewBox="0 0 40 40">
      <circle className="puyo-core" cx="20" cy="20" r="14" fill="#fff" />
      <circle className="puyo-ring" cx="20" cy="20" r="16" stroke={color} />
      <circle className="puyo-ring puyo-ring-2" cx="20" cy="20" r="16" stroke="#fff" />
      {drops.map((d, i) => (
        <ellipse
          key={i}
          className="puyo-droplet"
          cx="20" cy="20" rx="3.4" ry="4.2"
          fill={color}
          style={{ '--dx': `${d.dx.toFixed(1)}px`, '--dy': `${d.dy.toFixed(1)}px` } as React.CSSProperties}
        />
      ))}
      <use className="puyo-star" href="#puyo-star" x="31" y="6" fill="#ffe27a" />
    </svg>
  );
};

export const Puyo: React.FC<PuyoProps> = memo(({
  color,
  isConnected = false,
  isDeleting = false,
  landed = false,
  fallRows = 0,
  idle = false
}) => {
  ensureDefs();
  // まばたき・呼吸がそろわないよう、ぷよごとにずらす
  const phase = useMemo(() => Math.random(), []);

  if (!color) {
    return <div className={SIZE} />;
  }

  const stateClass = isDeleting ? 'puyo-pop' : isConnected ? 'puyo-blink' : idle ? 'puyo-idle' : '';
  const dropStyle = landed
    ? ({ '--fall-rows': fallRows, '--drop-ms': `${dropDuration(fallRows)}ms` } as React.CSSProperties)
    : undefined;
  const bodyStyle = stateClass === 'puyo-idle' ? { animationDelay: `${(-phase * 2.4).toFixed(2)}s` } : undefined;

  return (
    <div className={`${SIZE} relative z-[1]`}>
      <div className={`w-full h-full ${landed ? 'puyo-drop' : ''}`} style={dropStyle}>
        <div className={`w-full h-full ${landed ? 'puyo-squash' : ''}`} style={dropStyle}>
          <svg className={`puyo-svg w-full h-full overflow-visible ${stateClass}`} style={bodyStyle} viewBox="0 0 40 40">
            {color === 'ojama' ? (
              <Nubatama variant={phase} blinkDelay={`${(-phase * 6).toFixed(2)}s`} />
            ) : (
              <>
                <PuyoSkin color={color} />
                <PuyoFace squint={landed} blinkDelay={`${(-phase * 3.6).toFixed(2)}s`} />
              </>
            )}
          </svg>
        </div>
      </div>
      {isDeleting && <Burst color={BURST_COLORS[color] ?? '#fff'} />}
    </div>
  );
});
