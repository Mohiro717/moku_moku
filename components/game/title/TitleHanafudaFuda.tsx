import React from 'react';
import { L, S, T, vars, noop, SAKUYA_SRC } from './common';
import { SakuyaFlutter } from '../SakuyaFlutter';
import {
  BENI, GOLD, KINARI, ONI, POP_CSS, SUMI, Fuda, Kasumi, PFloat, PNuba, POnibi, StickerFilter, Susuki, makeHill, useFrameK
} from './hanafudaPop';

// 案3c「花札ポップ・ステッカー」：いちばんポップ。案3の「芒に月」を、そのまま1枚の大きな花札（札の形・月・黒い丘・すすき）として
// 中央左に置き、咲耶がその札から飛び出す。地は紅の放射線（ゆっくり回る）と、縁に向かって濃くなるドット。
// 咲耶・札・鬼火・ぬばたま・題字・ボタンを全部ステッカーにした（白い太フチ＋墨の細線＋落ち影）。
// 題字は「ぬばたま」を赤短（花札の赤い短冊）に書き、大きな「落とし」を下に。「落」だけ金は案3のまま。

const STICKER_SHADOW = 'rgba(34,26,31,.38)';

const Backdrop: React.FC = () => (
  <>
    <div style={{ position: 'absolute', inset: 0, background: '#e8473a' }} />
    {/* 紅の放射線：ゆっくり回る（100秒で1周） */}
    <div style={{ position: 'absolute', left: L(300), top: T(240), width: S(1500), height: S(1500), translate: '-50% -50%' }}>
      <div style={vars({ width: '100%', height: '100%', animation: 'tt-spin 100s linear infinite',
        background: 'repeating-conic-gradient(from 0deg, #ff6d49 0deg 7.5deg, #e8473a 7.5deg 15deg)' })} />
    </div>
    {/* 中心の明るみ */}
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 45% 60% at 35% 50%, rgba(255,200,140,.45), transparent 70%)' }} />
    {/* ドット：縁ほど濃く */}
    <div style={{ position: 'absolute', inset: 0,
      backgroundImage: 'radial-gradient(circle, rgba(120,16,24,.42) 0 32%, transparent 36%)', backgroundSize: `${S(14)} ${S(14)}`,
      WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 40% 50%, transparent 45%, #000 95%)',
      maskImage: 'radial-gradient(ellipse 70% 80% at 40% 50%, transparent 45%, #000 95%)' }} />
  </>
);

// ---------- 大きな花札「芒に月」 ----------
const CW = 268, CH = 432;
const cardHill = makeHill([12, 334], [80, 298], [180, 302], [256, 344]);

const BigCard: React.FC = () => (
  <PFloat x={96} y={24} w={CW} tilt={-5} dur={5.2} amp={6} z={1}>
    <svg viewBox={`-16 -16 ${CW + 40} ${CH + 44}`} style={{ display: 'block', width: `${((CW + 40) / CW) * 100}%`, margin: `${S(-16)} 0 0 ${S(-16)}`, overflow: 'visible' }} aria-hidden="true">
      <defs>
        <radialGradient id="hfc-sky" cx=".5" cy=".38" r=".8">
          <stop offset="0" stopColor="#f0613f" /><stop offset=".6" stopColor={BENI} /><stop offset="1" stopColor="#bf3328" />
        </radialGradient>
        <clipPath id="hfc-inner"><rect x="12" y="12" width={CW - 24} height={CH - 24} rx="6" /></clipPath>
      </defs>
      {/* ステッカーの落ち影 → 白い縁 → 墨の線 */}
      <rect x="-1" y="3" width={CW + 20} height={CH + 20} rx="24" fill={STICKER_SHADOW} />
      <rect x="-9" y="-9" width={CW + 18} height={CH + 18} rx="24" fill="#fff" stroke={SUMI} strokeWidth="3" />
      <rect width={CW} height={CH} rx="16" fill={KINARI} stroke={SUMI} strokeWidth="3" />
      <svg x="0" y="0" width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} style={{ overflow: 'visible' }}>
        <g clipPath="url(#hfc-inner)">
          <rect x="12" y="12" width={CW - 24} height={CH - 24} fill="url(#hfc-sky)" />
          {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M12 ${i * 20 + 18} H${CW - 12}`} stroke="#fff" strokeOpacity=".04" strokeWidth="6" />)}
          <circle cx="118" cy="150" r="104" fill="none" stroke={GOLD} strokeOpacity=".6" strokeWidth="2" strokeDasharray="1 9" strokeLinecap="round" />
          <circle cx="118" cy="150" r="94" fill="#fffaf0" />
          <path d={`M12 334 C80 298 180 302 256 344 V${CH} H12 Z`} fill={SUMI} />
          <Susuki hill={cardHill} from={18} to={250} step={13} sc={0.75} seed={5} />
        </g>
        <rect x="12" y="12" width={CW - 24} height={CH - 24} rx="6" fill="none" stroke={SUMI} strokeWidth="2" />
      </svg>
    </svg>
  </PFloat>
);

// ---------- 題字：赤短の「ぬばたま」＋大きな「落とし」を1枚のステッカーに ----------
const TCX = 672;
const Title: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none' }}>
    <div className="tp-soft" style={vars({ position: 'absolute', inset: 0, '--dur': '3.8s', '--amp': S(6), '--delay': '-1s' })}>
      <svg viewBox="0 0 864 480" style={{ width: '100%', height: '100%', overflow: 'visible' }} role="img" aria-label="ぬばたま落とし">
        <defs>
          <linearGradient id="hfc-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset=".1" stopColor="#ffe9a6" /><stop offset=".9" stopColor="#f0a51a" />
          </linearGradient>
          {/* SVG の中のフィルタは viewBox の単位なので、画面の大きさにそろって縮む */}
          <StickerFilter id="hfc-title-stk" k={1} rim={7} rimColor="#ffffff" edge={3} shadow={{ dx: 4, dy: 8, color: STICKER_SHADOW }} />
        </defs>
        <g filter="url(#hfc-title-stk)">
          <g transform={`rotate(-4 ${TCX} 84)`}>
            <rect x={TCX - 156} y="50" width="312" height="68" rx="6" fill={BENI} stroke={SUMI} strokeWidth="3" />
            <rect x={TCX - 148} y="57" width="296" height="54" rx="3" fill="none" stroke={GOLD} strokeWidth="2" strokeDasharray="1 6" strokeLinecap="round" />
            {[...'ぬばたま'].map((ch, i) => (
              <text key={i} x={TCX + (i - 1.5) * 70} y="85" textAnchor="middle" dominantBaseline="central" fontFamily="'Potta One', sans-serif" fontSize="52"
                fill={KINARI} stroke={SUMI} strokeWidth="8" strokeLinejoin="round" style={{ paintOrder: 'stroke fill' }}>{ch}</text>
            ))}
          </g>
          {[
            { ch: '落', x: 570, y: 210, size: 136, rot: -6, fill: 'url(#hfc-gold)' },
            { ch: 'と', x: 688, y: 216, size: 108, rot: 4, fill: KINARI },
            { ch: 'し', x: 780, y: 212, size: 108, rot: -3, fill: KINARI }
          ].map((g, i) => (
            <text key={i} transform={`translate(${g.x} ${g.y}) rotate(${g.rot})`} textAnchor="middle" dominantBaseline="central"
              fontFamily="'Potta One', sans-serif" fontSize={g.size} fill={g.fill} stroke={SUMI} strokeWidth="16" strokeLinejoin="round"
              style={{ paintOrder: 'stroke fill' }}>{g.ch}</text>
          ))}
        </g>
      </svg>
    </div>
  </div>
);

const Subtitle: React.FC = () => (
  <div style={{ position: 'absolute', left: L(TCX), top: T(296), translate: '-50% 0', zIndex: 7, padding: `${S(3)} ${S(16)}`,
    borderRadius: 999, background: SUMI, color: KINARI, fontFamily: "'Potta One', sans-serif", fontSize: S(13), letterSpacing: '.3em',
    whiteSpace: 'nowrap', boxShadow: `0 0 0 ${S(3)} #fff, 0 0 0 ${S(4.5)} ${SUMI}` }}>NUBATAMA OTOSHI</div>
);

const Button: React.FC<{ label: string; y: number; primary?: boolean; delay: number }> = ({ label, y, primary, delay }) => (
  <PFloat x={TCX - 112} y={y} w={224} dur={3.2} amp={3} delay={delay} z={8}>
    <button type="button" onClick={noop} className="tt-btn" style={{
      width: '100%', height: S(44), borderRadius: S(22), fontSize: S(18), letterSpacing: '.08em', color: SUMI,
      border: `${S(2.5)} solid ${SUMI}`, background: primary ? ONI.yellow[0] : '#fff',
      boxShadow: `inset 0 ${S(-4)} 0 ${primary ? ONI.yellow[1] : '#e9dcc4'}, 0 0 0 ${S(4)} #fff, 0 0 0 ${S(6)} ${SUMI}, ${S(4)} ${S(8)} 0 ${S(6)} ${STICKER_SHADOW}`
    }}>
      <span style={{ width: S(9), height: S(9), borderRadius: '50%', marginRight: S(10), background: primary ? ONI.red[0] : ONI.blue[0],
        boxShadow: `0 0 0 ${S(1.5)} ${SUMI}` }} />
      {label}
    </button>
  </PFloat>
);

export const TitleHanafudaFuda: React.FC = () => {
  const [ref, k] = useFrameK();
  const stk = 'url(#hfc-stk)';
  return (
    <div ref={ref} className="tt-frame" style={{ background: '#e8473a' }}>
      <style>{POP_CSS}</style>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <StickerFilter id="hfc-sakuya" k={k} rim={4.5} edge={2} shadow={{ dx: 5, dy: 9, color: STICKER_SHADOW }} />
        <StickerFilter id="hfc-stk" k={k} rim={3.5} edge={1.8} shadow={{ dx: 3, dy: 5, color: STICKER_SHADOW }} />
      </svg>
      <Backdrop />
      {/* 小さな札のステッカー */}
      <PFloat x={500} y={384} w={42} tilt={12} dur={3} amp={6} delay={0.6} rot={5} anim="poyon" z={1} style={{ filter: stk }}><Fuda kind="sakura" shadow="transparent" /></PFloat>
      <PFloat x={806} y={298} w={46} tilt={12} dur={2.7} amp={6} delay={1.5} rot={5} anim="poyon" z={1} style={{ filter: stk }}><Fuda kind="tan" shadow="transparent" /></PFloat>
      <Kasumi x={690} y={8} w={210} h={22} dur={11} amp={12} delay={3} z={1} />
      <BigCard />
      <Kasumi x={50} y={182} w={250} h={26} dur={9} amp={14} delay={1} z={2} />
      <POnibi c="blue" x={22} y={30} size={58} dur={2.6} amp={10} delay={0.5} z={2} anim="poyon" filter={stk} />
      <POnibi c="yellow" x={478} y={300} size={48} dur={2.3} amp={9} delay={1.8} z={2} anim="poyon" filter={stk} />
      <PNuba x={22} y={204} size={52} dur={3.6} amp={8} delay={2.4} z={2} anim="soft" filter={stk} />
      <PFloat x={214} y={14} w={284} dur={3.8} amp={10} z={3} anim="soft">
        <div style={{ position: 'relative' }}>
          <SakuyaFlutter src={SAKUYA_SRC} style={{ filter: 'url(#hfc-sakuya)' }} />
          <div style={{ position: 'absolute', left: '3%', top: '10%' }}>
            <POnibi c="red" x={0} y={0} size={58} dur={2.1} amp={7} anim="poyon" filter={stk} />
          </div>
        </div>
      </PFloat>
      <PNuba x={404} y={404} size={56} dur={3.2} amp={8} delay={1.1} rot={-4} z={4} anim="soft" filter={stk} />
      <POnibi c="green" x={24} y={352} size={54} dur={2.5} amp={10} delay={1.4} z={6} anim="poyon" filter={stk} />
      <Kasumi x={-40} y={440} w={330} h={28} dur={10} amp={18} delay={2} z={7} />
      <Title />
      <Subtitle />
      <Button label="CPUと たいせん" y={336} primary delay={0} />
      <Button label="ひとりで あそぶ" y={396} delay={0.5} />
    </div>
  );
};
