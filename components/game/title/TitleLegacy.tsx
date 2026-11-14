import React from 'react';
import { Puyo } from '../Puyo';
import '../puyoAnimations.css';
import { SakuyaFlutter } from '../SakuyaFlutter';

// 旧版（?design=0）。タイトル画面「ふわふわ」案の最初の見本（オーナー 11-13「キャラは咲耶のみ。鬼火とぬばたまは出したい。
// 背景があって、キャラ・鬼火・ぬばたま・ゲームタイトルがフワフワ上下運動をループ」）。
// 動画ではなく、層ごとにコードで上下させる。背景は3案を並べて選んでもらう（?bg=a|b|c で1つだけ）。
// 背景はコードで描いた仮のもの。ボタンは位置を見るための飾り（押しても何も起きない）。

const SAKUYA_CHIBI = 'https://vibe.co.jp/luna-occulta/media/img/canon/sakuya_chibi_front.webp';
// オーナー 11-13 作の咲耶（ちびは使わない）。白地の1枚絵
const SAKUYA_FULL = `${import.meta.env.BASE_URL}images/title/sakuya_title_float.webp`;
const Q = new URLSearchParams(location.search);
const CHIBI = Q.get('sakuya') === 'chibi';
const DEBUG = Q.get('debug') === '1';

type Bg = { id: string; name: string; sky: string; title: string; titleEdge: string; glow: string; hill: string; moon: string };
const BGS: Bg[] = [
  { id: 'a', name: 'A 夜（藍の空・満月・鳥居）', sky: 'linear-gradient(#141841 0%, #262a63 55%, #4a3a78 100%)',
    title: '#fff6e0', titleEdge: '#1b1f4a', glow: 'rgba(255,240,200,.55)', hill: '#10132f', moon: '#fff1b8' },
  { id: 'b', name: 'B 夕暮れ（藍から茜へ）', sky: 'linear-gradient(#232766 0%, #6b3f7e 45%, #d0607a 75%, #f4a76a 100%)',
    title: '#fff6e0', titleEdge: '#3a1f4a', glow: 'rgba(255,220,190,.5)', hill: '#2a1638', moon: '#fff4cf' },
  { id: 'c', name: 'C 和ポップ（今のクリーム地）', sky: 'radial-gradient(circle at 50% 30%, #fbf3df 0%, #efe3cf 70%)',
    title: '#1f2456', titleEdge: '#c8304a', glow: 'rgba(255,255,255,0)', hill: '#d9c6a3', moon: '#fde89a' }
];

const CSS = `
.tf-frame { position: relative; width: min(864px, calc(100vw - 32px)); aspect-ratio: 864 / 480; overflow: hidden;
  border: 3px solid #3b2f2f; border-radius: 24px; box-shadow: 0 6px 0 #3b2f2f; container-type: inline-size; }
@keyframes tf-float { 0%, 100% { translate: 0 0; } 50% { translate: 0 calc(var(--amp) * -1); } }
@keyframes tf-sway { 0%, 100% { rotate: calc(var(--rot) * -1); } 50% { rotate: var(--rot); } }
.tf-float { animation: tf-float var(--dur) ease-in-out infinite; animation-delay: var(--delay, 0s); }
.tf-sway { animation: tf-sway calc(var(--dur) * 1.5) ease-in-out infinite; animation-delay: var(--delay, 0s); }
@keyframes tf-twinkle { 0%, 100% { opacity: .25; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .tf-float, .tf-sway { animation: none; } }
`;

/** 上下にふわふわ。dur 秒で一往復、amp だけ浮く */
const Float: React.FC<{ dur: number; amp: string; delay?: number; rot?: number; style?: React.CSSProperties; children: React.ReactNode }> =
  ({ dur, amp, delay = 0, rot = 0, style, children }) => (
    // 置き場所（外の div）と上下の動き（中の div）を分ける。動きの translate が置き場所の translate を上書きしないように
    <div style={{ position: 'absolute', ...style }}>
      <div className="tf-float" style={{ ['--dur' as string]: `${dur}s`, ['--amp' as string]: amp, ['--delay' as string]: `${-delay}s` }}>
        <div className={rot ? 'tf-sway' : undefined} style={{ ['--rot' as string]: `${rot}deg`, ['--dur' as string]: `${dur}s`, ['--delay' as string]: `${-delay}s` }}>
          {children}
        </div>
      </div>
    </div>
  );

const Backdrop: React.FC<{ bg: Bg }> = ({ bg }) => (
  <>
    <div style={{ position: 'absolute', inset: 0, background: bg.sky }} />
    {bg.id === 'c' && (
      <div style={{ position: 'absolute', inset: 0, opacity: .18,
        backgroundImage: 'radial-gradient(circle at 50% 100%, transparent 38%, #c9a978 39%, #c9a978 43%, transparent 44%, transparent 58%, #c9a978 59%, #c9a978 63%, transparent 64%)',
        backgroundSize: '6cqw 3cqw' }} />
    )}
    {bg.id !== 'c' && Array.from({ length: 26 }, (_, i) => (
      <span key={i} style={{ position: 'absolute', left: `${(i * 37) % 100}%`, top: `${(i * 23) % 55}%`, width: '.35cqw', height: '.35cqw',
        borderRadius: '50%', background: '#fff', animation: `tf-twinkle ${2 + (i % 4) * .7}s ease-in-out infinite`, animationDelay: `${-i * .3}s` }} />
    ))}
    {/* 月：題字の後ろ */}
    <div style={{ position: 'absolute', left: '50%', top: '-6%', width: '34cqw', height: '34cqw', translate: '-50% 0', borderRadius: '50%',
      background: bg.moon, boxShadow: `0 0 6cqw ${bg.glow}`, opacity: bg.id === 'c' ? .9 : .95 }} />
    {/* 遠くの丘と鳥居 */}
    <svg viewBox="0 0 864 480" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <path d="M0 360 C120 320 220 340 330 352 C460 366 560 318 700 330 C780 337 830 350 864 344 V480 H0 Z" fill={bg.hill} opacity={bg.id === 'c' ? .55 : 1} />
      {bg.id !== 'c' && (
        <g fill={bg.hill} transform="translate(690 262)">
          <rect x="6" y="18" width="7" height="64" /><rect x="51" y="18" width="7" height="64" />
          <path d="M-8 6 Q32 -4 72 6 L70 14 Q32 6 -6 14 Z" /><rect x="0" y="22" width="64" height="5" />
        </g>
      )}
    </svg>
  </>
);

const Title: React.FC<{ bg: Bg }> = ({ bg }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: '5%', display: 'flex', justifyContent: 'center', gap: '.4cqw' }} aria-label="ぬばたま落とし">
    {[...'ぬばたま落とし'].map((ch, i) => (
      <span key={i} className="tf-float" aria-hidden="true"
        style={{ ['--dur' as string]: '2.6s', ['--amp' as string]: '1.1cqw', ['--delay' as string]: `${-i * 0.18}s`, display: 'inline-block',
          fontFamily: '"Zen Maru Gothic", "Hiragino Maru Gothic ProN", "M PLUS Rounded 1c", "Yu Gothic UI", sans-serif',
          fontWeight: 900, fontSize: '8.6cqw', lineHeight: 1, color: bg.title,
          WebkitTextStroke: `.55cqw ${bg.titleEdge}`, paintOrder: 'stroke fill',
          textShadow: `0 .6cqw 0 ${bg.titleEdge}, 0 0 2.4cqw ${bg.glow}` }}>
        {ch}
      </span>
    ))}
  </div>
);

/** 鬼火：咲耶のまわりに4つ。大きさ・周期・浮く幅をずらす */
const ONIBI = [
  { c: 'blue', x: '22%', y: '50%', s: 6.5, dur: 3.6, amp: '1.6cqw', d: 1.1 },
  { c: 'green', x: '68%', y: '56%', s: 7, dur: 3.3, amp: '1.9cqw', d: 0.6 },
  { c: 'yellow', x: '75%', y: '30%', s: 8, dur: 2.8, amp: '2.4cqw', d: 1.7 }
];
const NUBATAMA = [
  { x: '13%', y: '64%', s: 8, dur: 4.2, amp: '.9cqw', d: 0.4, rot: 4 },
  { x: '81%', y: '63%', s: 8.5, dur: 4.6, amp: '1cqw', d: 2.0, rot: -4 }
];

const Scene: React.FC<{ bg: Bg }> = ({ bg }) => (
  <div className="tf-frame">
    <Backdrop bg={bg} />
    <Title bg={bg} />
    {NUBATAMA.map((n, i) => (
      <Float key={i} dur={n.dur} amp={n.amp} delay={n.d} rot={n.rot} style={{ left: n.x, top: n.y, ['--puyo-size' as string]: `${n.s}cqw` }}>
        <Puyo color="ojama" />
      </Float>
    ))}
    {CHIBI ? (
      <Float dur={3.4} amp="1.4cqw" style={{ left: '50%', bottom: '17%', translate: '-50% 0', width: '25cqw' }}>
        <img src={SAKUYA_CHIBI} alt="咲耶" style={{ display: 'block', width: '100%', filter: 'drop-shadow(0 .5cqw .6cqw rgba(0,0,0,.25))' }} />
      </Float>
    ) : (
      // 咲耶：真ん中。高さは画の約8割で、ひざ下はボタンの台の後ろに隠れる。赤い鬼火は上げた手のひらの上に乗せ、咲耶と一緒に浮く
      <Float dur={3.4} amp="1.2cqw" style={{ left: '50%', top: '19%', translate: '-50% 0', width: '29.6cqw' }}>
        <div style={{ position: 'relative' }}>
          <SakuyaFlutter src={SAKUYA_FULL} debug={DEBUG} style={{ filter: 'drop-shadow(0 .4cqw .6cqw rgba(0,0,0,.3))' }} />
          {!DEBUG && (
            <Float dur={2.2} amp=".9cqw" rot={3} style={{ left: '7%', top: '12%', ['--puyo-size' as string]: '7cqw' }}>
              <Puyo color="red" idle />
            </Float>
          )}
        </div>
      </Float>
    )}
    {ONIBI.map(o => (
      <Float key={o.c} dur={o.dur} amp={o.amp} delay={o.d} rot={3} style={{ left: o.x, top: o.y, ['--puyo-size' as string]: `${o.s}cqw` }}>
        <Puyo color={o.c as never} idle />
      </Float>
    ))}
    {/* ボタンの台（位置を見るための飾り） */}
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '18%', background: '#141634',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4%' }}>
      {['CPUと たいせん', 'ひとりで あそぶ'].map((t, i) => (
        <span key={t} style={{ width: '28%', padding: '1.1cqw 0', textAlign: 'center', borderRadius: 999, fontSize: '2cqw', fontWeight: 700,
          border: '3px solid #3b2f2f', boxShadow: '0 3px 0 #3b2f2f', background: i ? '#fff9ee' : '#f79ab7', color: i ? '#3b2f2f' : '#fff' }}>{t}</span>
      ))}
    </div>
  </div>
);

export const LegacyApp: React.FC = () => {
  const only = Q.get('bg');
  // ?solo=1: 咲耶だけを大きく（揺れる範囲の位置合わせ用。debug=1 と一緒に使う）
  if (Q.get('solo') === '1') return <div style={{ width: 520, margin: 16, background: '#5a6' }}><SakuyaFlutter src={SAKUYA_FULL} debug={DEBUG} /></div>;
  const list = only ? BGS.filter(b => b.id === only) : BGS;
  return (
    <div style={{ padding: 16, display: 'grid', gap: 22, justifyItems: 'center' }}>
      <style>{CSS}</style>
      {list.map(bg => (
        <section key={bg.id}>
          <div style={{ fontSize: 13, fontWeight: 700, margin: '0 0 6px 4px' }}>{bg.name}</div>
          <Scene bg={bg} />
        </section>
      ))}
    </div>
  );
};

