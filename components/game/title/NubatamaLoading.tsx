import React, { useEffect, useState } from 'react';
import { TITLE_CSS, vars } from './common';
import { BENI, GEPPAKU, GOLD, POP_CSS, SUMI, YOI, YOI_DEEP, YOI_LIGHT, PNuba, POnibi, PopGlyphLayers, type PG } from './hanafudaPop';

// ぬばたま落とし単独サイトの読み込み画面（オーナー 11-15「読み込み画面等全てを、月蝕奇譚のオマージュ作品
// ぬばたま落としのイメージに統一」）。色はタイトル案3bと同じ色調 B「夜の花札」（地は宵闇・月は金・題字は月白に紅の影）、題字も案3bと同じ書体と縁どり。
// 月にかかった墨の影が、読み込みが進むほど右へ抜けていく（月蝕が明ける）。月のまわりの金の環が満ちる。
// 月蝕綺譚のトンマナ「読み込み中: 細い蝕環がゆっくり満ちる」に倣う。
// 進み方はもくもくハウスの LoadingScreen と同じ（40ms ごとに 2%、100% で 0.3 秒おいて閉じる）。

const MOON = { cx: 432, cy: 176, r: 118 };
const RING = MOON.r + 18;

const TITLE: PG[] = (() => {
  const chars = [
    { ch: 'ぬ', size: 58, adv: 60 }, { ch: 'ば', size: 58, adv: 60 }, { ch: 'た', size: 58, adv: 60 }, { ch: 'ま', size: 58, adv: 62 },
    { ch: '落', size: 84, adv: 86, fill: GOLD }, { ch: 'と', size: 68, adv: 66 }, { ch: 'し', size: 68, adv: 60 }
  ];
  const total = chars.reduce((a, c) => a + c.adv, 0);
  let x = MOON.cx - total / 2;
  return chars.map((c, i) => {
    const gx = x + c.adv / 2;
    x += c.adv;
    return { ch: c.ch, x: gx, y: 392, size: c.size, fill: c.fill, rot: i % 2 ? 4 : -4,
      hop: { dur: 2.6, amp: c.size * 0.2, delay: -i * 0.11 } } as PG;
  });
})();

/** 月と、影と、金の環。p は 0〜100 */
const EclipseMoon: React.FC<{ p: number }> = ({ p }) => {
  // 影は p=0 で月をほぼ覆い（左に細い三日月だけ残す）、p=100 で月の外へ抜けきる
  const shadowX = MOON.cx + 22 + (p / 100) * (MOON.r * 2 + 4);
  return (
    <svg viewBox="0 0 864 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }} aria-hidden="true">
      <defs>
        <radialGradient id="nbl-moon" cx=".45" cy=".4" r=".65">
          <stop offset="0" stopColor="#f8e4b0" /><stop offset="1" stopColor={GOLD} />
        </radialGradient>
        <clipPath id="nbl-moon-clip"><circle cx={MOON.cx} cy={MOON.cy} r={MOON.r} /></clipPath>
      </defs>
      <circle cx={MOON.cx} cy={MOON.cy} r={RING} fill="none" stroke={GOLD} strokeOpacity=".4" strokeWidth="2" strokeDasharray="1 10" strokeLinecap="round" />
      <circle cx={MOON.cx} cy={MOON.cy} r={RING} fill="none" stroke={GOLD} strokeWidth="3.5" strokeLinecap="round"
        pathLength={100} strokeDasharray={`${p} 100`} transform={`rotate(-90 ${MOON.cx} ${MOON.cy})`}
        style={{ transition: 'stroke-dasharray 120ms linear' }} />
      <circle cx={MOON.cx} cy={MOON.cy} r={MOON.r} fill="url(#nbl-moon)" />
      <g clipPath="url(#nbl-moon-clip)">
        {/* 影は地の宵闇で、ふちに紅（見本 B の月蝕） */}
        <circle cx={shadowX} cy={MOON.cy - 6} r={MOON.r + 4} fill={YOI} fillOpacity=".96" stroke={BENI} strokeWidth="3" style={{ transition: 'cx 120ms linear' }} />
      </g>
      <circle cx={MOON.cx} cy={MOON.cy} r={MOON.r} fill="none" stroke={SUMI} strokeWidth="3" />
    </svg>
  );
};

type Props = { onComplete: () => void };

export const NubatamaLoading: React.FC<Props> = ({ onComplete }) => {
  const [p, setP] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setP(prev => Math.min(100, prev + 2)), 40);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (p < 100) return;
    const t1 = window.setTimeout(() => setLeaving(true), 300);
    const t2 = window.setTimeout(onComplete, 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [p, onComplete]);

  return (
    <div role="status" aria-label={`ぬばたま落とし よみこみちゅう ${p}%`} style={{
      position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: `repeating-linear-gradient(to bottom, rgba(255,255,255,.035) 0 6px, transparent 6px 20px), radial-gradient(ellipse at 50% 40%, ${YOI_LIGHT} 0%, ${YOI} 55%, ${YOI_DEEP} 100%)`,
      opacity: leaving ? 0 : 1, transition: 'opacity 400ms ease-out'
    }}>
      <style>{TITLE_CSS}{POP_CSS}</style>

      <div className="tt-frame" style={vars({ '--tt-w': 'min(720px, 96vw)', borderRadius: 0, boxShadow: 'none', overflow: 'visible' })}>
        <EclipseMoon p={p} />
        <POnibi c="red" x={236} y={58} size={46} dur={1.9} amp={9} z={2} anim="poyon" />
        <POnibi c="blue" x={590} y={44} size={44} dur={2.2} amp={10} delay={0.5} z={2} anim="poyon" />
        <POnibi c="yellow" x={612} y={214} size={42} dur={2} amp={9} delay={1.2} z={2} anim="poyon" />
        <POnibi c="green" x={210} y={222} size={44} dur={2.3} amp={10} delay={1.4} z={2} anim="poyon" />
        <PNuba x={150} y={126} size={42} dur={3.2} amp={8} delay={2.2} z={2} anim="soft" />
        <PNuba x={668} y={128} size={48} dur={3} amp={9} delay={1.1} rot={-4} z={2} anim="soft" />
        <div role="img" aria-label="ぬばたま落とし" style={{ position: 'absolute', inset: 0, zIndex: 3 }}>
          <PopGlyphLayers glyphs={TITLE} font="'Potta One', sans-serif" fill={GEPPAKU}
            layers={[{ color: SUMI, width: 14 }]} shadow={{ dx: 5, dy: 6, color: BENI }} />
        </div>
      </div>

      <div style={{
        marginTop: 'clamp(4px, 2vw, 18px)', display: 'flex', alignItems: 'center', gap: '.6em',
        padding: '.45em 1.3em', borderRadius: 999, background: SUMI, color: GEPPAKU,
        border: `2px solid ${SUMI}`, boxShadow: `inset 0 0 0 2px ${GOLD}, 4px 4px 0 ${BENI}`,
        fontFamily: "'Potta One', sans-serif", fontSize: 'clamp(13px, 2.4vw, 17px)', letterSpacing: '.08em'
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD }} />
        よみこみちゅう
        <span style={{ fontVariantNumeric: 'tabular-nums', minWidth: '3.2em', textAlign: 'right' }}>{p}%</span>
      </div>
    </div>
  );
};
