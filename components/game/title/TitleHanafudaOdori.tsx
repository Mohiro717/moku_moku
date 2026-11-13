import React from 'react';
import { S, vars, noop, SAKUYA_SRC } from './common';
import { SakuyaFlutter } from '../SakuyaFlutter';
import {
  AI, BENI, GOLD, KINARI, POP_CSS, SUMI, Fuda, Grain, Kasumi, PFloat, PNuba, POnibi, PopGlyphs, StickerFilter, Susuki, makeHill,
  useFrameK, type FudaKind, type PG
} from './hanafudaPop';

// 案3b「花札ポップ・踊る題字」：色は案3の5色（紅・生成り・墨・金・藍）のまま。ポップにしたのは動きと題字。
// 題字を横書き2段にして、1字ずつ時間差で跳ねさせる（着地でつぶれて伸び返る）。
// 背景に傾いた花札を何枚かばらまき、札と鬼火は「ぽよん」（下でつぶれて弾む）。咲耶とぬばたまは行き過ぎて戻る浮き方（形は変えない）。
// 月と咲耶を左に寄せ、右半分を題字とボタンにあてた。

const hill = makeHill([0, 404], [140, 360], [300, 366], [440, 408]);

const MOON = { cx: 262, cy: 226, r: 186 };

const Backdrop: React.FC = () => (
  <svg viewBox="0 0 864 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
    <defs>
      <radialGradient id="hfb-sky" cx=".32" cy=".46" r=".8">
        <stop offset="0" stopColor="#f0613f" /><stop offset=".6" stopColor={BENI} /><stop offset="1" stopColor="#bf3328" />
      </radialGradient>
      <radialGradient id="hfb-moon" cx=".45" cy=".4" r=".65">
        <stop offset="0" stopColor="#fffaf0" /><stop offset="1" stopColor={KINARI} />
      </radialGradient>
    </defs>
    <rect width="864" height="480" fill="url(#hfb-sky)" />
    {Array.from({ length: 24 }, (_, i) => (
      <path key={i} d={`M0 ${i * 20 + 6} H864`} stroke="#fff" strokeOpacity=".035" strokeWidth="6" />
    ))}
    <circle cx={MOON.cx} cy={MOON.cy} r={MOON.r + 15} fill="none" stroke={GOLD} strokeOpacity=".55" strokeWidth="2" strokeDasharray="1 10" strokeLinecap="round" />
  </svg>
);

/** 月は単独で ふわふわ（背景も浮く） */
const Moon: React.FC = () => (
  <PFloat x={MOON.cx - MOON.r} y={MOON.cy - MOON.r} w={MOON.r * 2} dur={6.4} amp={5} z={0}>
    <svg viewBox="0 0 100 100" style={{ display: 'block', width: '100%' }} aria-hidden="true">
      <circle cx="50" cy="50" r="50" fill="url(#hfb-moon)" />
    </svg>
  </PFloat>
);

const Hill: React.FC = () => (
  <svg viewBox="0 0 864 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }} aria-hidden="true">
    <path d="M0 404 C140 360 300 366 440 408 C520 430 570 456 590 480 H0 Z" fill={SUMI} />
    <Susuki hill={hill} from={10} to={430} skip={[170, 330]} />
  </svg>
);

/** 背景にばらまく傾いた花札。ぽよんと弾みながら少し揺れる */
const CARDS: { k: FudaKind; x: number; y: number; w: number; tilt: number; d: number }[] = [
  { k: 'ura', x: 18, y: 22, w: 54, tilt: -16, d: 0 },
  { k: 'tan', x: 446, y: 18, w: 58, tilt: 12, d: 0.7 },
  { k: 'sakura', x: 470, y: 300, w: 62, tilt: -11, d: 1.3 },
  { k: 'kiku', x: 790, y: 300, w: 56, tilt: 14, d: 0.4 },
  { k: 'moon', x: 812, y: 150, w: 44, tilt: -8, d: 1.9 }
];

/** 横書き2段の題字。1字ずつ時間差で跳ねる */
const HOP = 2.6;
const line = (chars: { ch: string; size: number; adv: number; fill?: string; rot?: number }[], cx: number, y: number, d0: number) => {
  const total = chars.reduce((a, c) => a + c.adv, 0);
  let x = cx - total / 2;
  return chars.map((c, i) => {
    const gx = x + c.adv / 2;
    x += c.adv;
    return { ch: c.ch, x: gx, y, size: c.size, fill: c.fill, rot: c.rot ?? (i % 2 ? 4 : -4),
      hop: { dur: HOP, amp: c.size * 0.22, delay: -(d0 + i) * 0.11 } } as PG;
  });
};
const TCX = 662;
const TITLE: PG[] = [
  ...line([...'ぬばたま'].map(ch => ({ ch, size: 66, adv: 70 })), TCX, 92, 0),
  ...line([
    { ch: '落', size: 124, adv: 124, fill: 'url(#hfb-gold)', rot: -5 },
    { ch: 'と', size: 98, adv: 94, rot: 4 },
    { ch: 'し', size: 98, adv: 86, rot: -3 }
  ], TCX, 202, 4)
];

const Title: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none' }}>
    <div className="tt-bob" style={vars({ position: 'absolute', inset: 0, '--dur': '4.6s', '--amp': S(5), '--delay': '-1s' })}>
      <svg viewBox="0 0 864 480" style={{ width: '100%', height: '100%', overflow: 'visible' }} role="img" aria-label="ぬばたま落とし">
        <defs>
          <linearGradient id="hfb-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset=".1" stopColor="#ffe9a6" /><stop offset=".9" stopColor="#f0a51a" />
          </linearGradient>
        </defs>
        <PopGlyphs glyphs={TITLE} font="'Potta One', sans-serif" fill={KINARI}
          layers={[{ color: SUMI, width: 16 }]} shadow={{ dx: 6, dy: 7, color: AI }} />
        <text x={TCX} y="290" textAnchor="middle" dominantBaseline="central" fontFamily="'Potta One', sans-serif" fontSize="14"
          letterSpacing="4" fill={KINARI} stroke={SUMI} strokeWidth="3.5" style={{ paintOrder: 'stroke fill' }}>NUBATAMA OTOSHI</text>
        <path d={`M${TCX - 150} 290 h40 M${TCX + 110} 290 h40`} stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 7" />
      </svg>
    </div>
  </div>
);

const Button: React.FC<{ label: string; y: number; primary?: boolean; delay: number }> = ({ label, y, primary, delay }) => (
  <PFloat x={TCX - 108} y={y} w={216} dur={2.8} amp={3} delay={delay} anim="soft" z={8}>
    <button type="button" onClick={noop} className="tt-btn" style={{
      width: '100%', height: S(42), borderRadius: S(21), fontSize: S(17), letterSpacing: '.08em',
      ...(primary
        ? { background: SUMI, color: KINARI, border: `${S(2)} solid ${SUMI}`, boxShadow: `inset 0 0 0 ${S(2)} ${GOLD}, ${S(5)} ${S(5)} 0 ${AI}` }
        : { background: KINARI, color: SUMI, border: `${S(2.5)} solid ${SUMI}`, boxShadow: `${S(5)} ${S(5)} 0 ${AI}` })
    }}>
      <span style={{ width: S(8), height: S(8), borderRadius: '50%', marginRight: S(10), background: primary ? GOLD : BENI }} />
      {label}
    </button>
  </PFloat>
);

export const TitleHanafudaOdori: React.FC = () => {
  const [ref, k] = useFrameK();
  return (
    <div ref={ref} className="tt-frame" style={{ background: BENI }}>
      <style>{POP_CSS}</style>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <StickerFilter id="hfb-print" k={k} rim={3} rimColor={KINARI} shadow={{ dx: 8, dy: 7, color: AI, opacity: 0.9 }} />
      </svg>
      <Backdrop />
      {CARDS.map((c, i) => (
        <PFloat key={i} x={c.x} y={c.y} w={c.w} tilt={c.tilt} dur={2.4 + (i % 3) * 0.3} amp={7} delay={c.d} rot={5} anim="poyon" z={1}>
          <Fuda kind={c.k} />
        </PFloat>
      ))}
      <Moon />
      <Kasumi x={-60} y={112} w={250} dur={9} amp={16} z={1} />
      <POnibi c="blue" x={92} y={150} size={50} dur={2.2} amp={12} delay={0.5} z={2} anim="poyon" />
      <POnibi c="yellow" x={410} y={150} size={46} dur={2} amp={11} delay={1.2} z={2} anim="poyon" />
      <PNuba x={26} y={250} size={46} dur={3.2} amp={9} delay={2.2} z={2} anim="soft" />
      <PFloat x={122} y={8} w={280} dur={3.4} amp={12} z={3} anim="soft">
        <div style={{ position: 'relative' }}>
          <SakuyaFlutter src={SAKUYA_SRC} style={{ filter: 'url(#hfb-print)' }} />
          <div style={{ position: 'absolute', left: '3%', top: '10%' }}>
            <POnibi c="red" x={0} y={0} size={56} dur={1.9} amp={8} anim="poyon" />
          </div>
        </div>
      </PFloat>
      <PNuba x={392} y={322} size={62} dur={3} amp={10} delay={1.1} rot={-4} z={4} anim="soft" />
      <Hill />
      <POnibi c="green" x={40} y={330} size={50} dur={2.3} amp={12} delay={1.4} z={6} anim="poyon" />
      <Kasumi x={-40} y={438} w={380} h={30} dur={8} amp={20} delay={2} z={7} />
      <Title />
      <Button label="CPUと たいせん" y={338} primary delay={0} />
      <Button label="ひとりで あそぶ" y={392} delay={0.4} />
      <Grain id="hfb-grain" />
    </div>
  );
};
