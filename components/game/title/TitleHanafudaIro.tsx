import React from 'react';
import { L, S, T, vars, noop } from './common';
import { SAKUYA_SRC } from './common';
import { SakuyaFlutter } from '../SakuyaFlutter';
import {
  AI, ONI, POP_CSS, SUMI, Grain, Kasumi, PFloat, PNuba, POnibi, PopGlyphs, StickerFilter, Susuki, makeHill, useFrameK, type PG
} from './hanafudaPop';

// 案3a「花札ポップ・色」：案3の構図（芒に月・右の縦書き・金の霞・すすき）はそのまま。
// ポップにしたのは色。紅の空を明るい朱に上げ、月のまわりに鬼火4色の輪、霞を鬼火4色に塗り分けた。
// 題字は墨の字に白い太フチ＋墨の細い外線、字ごとに鬼火の色でずらした影（版ずれを4色にした）。「落」だけ金は案3のまま。
// 動きは案3と同じ、ゆっくりのふわふわ。

const hill = makeHill([0, 400], [160, 354], [330, 364], [480, 404]);

const Backdrop: React.FC = () => (
  <svg viewBox="0 0 864 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
    <defs>
      <radialGradient id="hfa-sky" cx=".38" cy=".46" r=".8">
        <stop offset="0" stopColor="#ffa36a" /><stop offset=".55" stopColor="#ff7350" /><stop offset="1" stopColor="#f2553f" />
      </radialGradient>
      <radialGradient id="hfa-moon" cx=".45" cy=".4" r=".65">
        <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#fff2d2" />
      </radialGradient>
    </defs>
    <rect width="864" height="480" fill="url(#hfa-sky)" />
    {Array.from({ length: 24 }, (_, i) => (
      <path key={i} d={`M0 ${i * 20 + 6} H864`} stroke="#fff" strokeOpacity=".06" strokeWidth="6" />
    ))}
    {/* 月のまわりの鬼火4色の輪（ゆっくり回る） */}
    <g className="tp-spin" style={vars({ '--dur': '90s', transformBox: 'view-box', transformOrigin: '330px 224px' })}>
      <circle cx="330" cy="224" r="213" fill="none" stroke={SUMI} strokeWidth="15" />
      {(['red', 'blue', 'green', 'yellow'] as const).map((c, i) => (
        <circle key={c} cx="330" cy="224" r="213" fill="none" stroke={ONI[c][0]} strokeWidth="9"
          strokeDasharray={`${(2 * Math.PI * 213) / 4 - 14} ${(2 * Math.PI * 213) * 0.75 + 14}`}
          strokeDashoffset={-i * (2 * Math.PI * 213) / 4} />
      ))}
    </g>
    <circle cx="330" cy="224" r="198" fill="url(#hfa-moon)" />
  </svg>
);

const Hill: React.FC = () => (
  <svg viewBox="0 0 864 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }} aria-hidden="true">
    <path d="M0 400 C160 354 330 364 480 404 C560 424 630 452 660 480 H0 Z" fill={SUMI} />
    <Susuki hill={hill} from={14} to={470} skip={[226, 372]} />
  </svg>
);

/** 縦書きの題字（座標は案3と同じ）。影の色は字ごとに鬼火の色 */
const TITLE: PG[] = [
  ...[...'ぬばたま'].map((ch, i) => ({ ch, x: 790, y: 64 + i * 62, size: 62, shadow: [ONI.blue[0], ONI.yellow[0], ONI.green[0], ONI.blue[0]][i] })),
  { ch: '落', x: 686, y: 104, size: 110, fill: 'url(#hfa-gold)', rot: -4, shadow: AI },
  { ch: 'と', x: 688, y: 198, size: 84, shadow: ONI.green[0] },
  { ch: 'し', x: 688, y: 280, size: 84, shadow: ONI.yellow[0] }
];

const Title: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none' }}>
    <div className="tt-bob" style={vars({ position: 'absolute', inset: 0, '--dur': '5.6s', '--amp': S(4), '--delay': '-1s' })}>
      <svg viewBox="0 0 864 480" style={{ width: '100%', height: '100%', overflow: 'visible' }} role="img" aria-label="ぬばたま落とし">
        <defs>
          <linearGradient id="hfa-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset=".1" stopColor="#ffe9a6" /><stop offset=".9" stopColor="#f0a51a" />
          </linearGradient>
        </defs>
        <PopGlyphs glyphs={TITLE} font="'Potta One', sans-serif" fill={SUMI}
          layers={[{ color: SUMI, width: 24 }, { color: '#ffffff', width: 17 }, { color: SUMI, width: 3 }]} shadow={{ dx: 7, dy: 7, color: AI }} />
        <text x="738" y="352" textAnchor="middle" dominantBaseline="central" fontFamily="'Potta One', sans-serif" fontSize="13"
          letterSpacing="3.5" fill={SUMI} stroke="#fff" strokeWidth="4.5" style={{ paintOrder: 'stroke fill' }}>NUBATAMA OTOSHI</text>
      </svg>
    </div>
  </div>
);

const Button: React.FC<{ label: string; y: number; primary?: boolean }> = ({ label, y, primary }) => (
  <button type="button" onClick={noop} className="tt-btn" style={{
    position: 'absolute', left: L(634), top: T(y), width: S(208), height: S(40), zIndex: 8, borderRadius: S(8),
    fontSize: S(17), letterSpacing: '.08em', border: `${S(2.5)} solid ${SUMI}`,
    ...(primary
      ? { background: ONI.yellow[0], color: SUMI, boxShadow: `inset 0 ${S(-4)} 0 ${ONI.yellow[1]}, ${S(5)} ${S(5)} 0 ${ONI.blue[1]}` }
      : { background: '#fff', color: SUMI, boxShadow: `inset 0 ${S(-4)} 0 #f0e2c4, ${S(5)} ${S(5)} 0 ${ONI.green[1]}` })
  }}>
    <span style={{ width: S(9), height: S(9), borderRadius: '50%', marginRight: S(10), background: primary ? ONI.red[0] : ONI.blue[0],
      boxShadow: `0 0 0 ${S(1.5)} ${SUMI}` }} />
    {label}
  </button>
);

export const TitleHanafudaIro: React.FC = () => {
  const [ref, k] = useFrameK();
  return (
    <div ref={ref} className="tt-frame" style={{ background: '#ff7350' }}>
      <style>{POP_CSS}</style>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <StickerFilter id="hfa-print" k={k} rim={3} rimColor="#ffffff" edge={0} shadow={{ dx: 8, dy: 7, color: AI, opacity: 0.85 }} />
      </svg>
      <Backdrop />
      <Kasumi x={-60} y={118} w={300} dur={11} amp={16} z={1} fill={ONI.blue[0]} dot={ONI.blue[1]} />
      <Kasumi x={548} y={10} w={340} h={26} dur={13} amp={14} delay={4} z={1} fill={ONI.yellow[0]} dot={ONI.yellow[1]} />
      <POnibi c="blue" x={58} y={52} size={56} dur={3.9} amp={10} delay={0.5} z={2} />
      <POnibi c="yellow" x={540} y={70} size={46} dur={3.4} amp={9} delay={2} z={2} />
      <PNuba x={150} y={196} size={46} dur={5.4} amp={7} delay={2.6} z={2} />
      <Kasumi x={404} y={292} w={186} h={24} dur={12} amp={14} delay={7} z={2} fill={ONI.green[0]} dot={ONI.green[1]} />
      <PFloat x={192} y={6} w={280} dur={4.4} amp={10} z={3}>
        <div style={{ position: 'relative' }}>
          <SakuyaFlutter src={SAKUYA_SRC} style={{ filter: 'url(#hfa-print)' }} />
          <div style={{ position: 'absolute', left: '3%', top: '10%' }}>
            <POnibi c="red" x={0} y={0} size={56} dur={2.6} amp={6} />
          </div>
        </div>
      </PFloat>
      <PNuba x={548} y={318} size={64} dur={5} amp={8} delay={1.1} rot={-4} z={4} />
      <Hill />
      <POnibi c="green" x={52} y={318} size={50} dur={3.6} amp={10} delay={1.4} z={6} />
      <Kasumi x={-40} y={436} w={400} h={30} dur={10} amp={20} delay={2} z={7} fill={ONI.red[0]} dot={ONI.red[1]} />
      <Title />
      <Button label="CPUと たいせん" y={372} primary />
      <Button label="ひとりで あそぶ" y={424} />
      <Grain id="hfa-grain" opacity={0.1} />
    </div>
  );
};
