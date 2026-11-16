import React from 'react';
import { Fuda, KasumiShape, type FudaKind } from './title/hanafudaPop';
import './hanafuda.css';

// タイトル以外の画面を案3b「花札ポップ・踊る題字」にそろえる部品（オーナー 11-14「他の画面全てを統一したい」）。
// 見た目のクラスは hanafuda.css。飾り（傾いた花札・すやり霞）はタイトルの部品をそのまま使う。

type Spot = { k: FudaKind; w: number; tilt: number; left?: string; right?: string; top?: string; bottom?: string; d: number };

/** 枠の四隅に置く札。端から少しはみ出させて、中身の邪魔をしない */
const CORNERS: Spot[] = [
  { k: 'ura', w: 44, tilt: -16, left: '-12px', top: '34%', d: 0 },
  { k: 'tan', w: 46, tilt: 12, right: '-8px', top: '-12px', d: 0.7 },
  { k: 'sakura', w: 50, tilt: -11, left: '-8px', bottom: '-34px', d: 1.3 },
  { k: 'kiku', w: 46, tilt: 14, right: '-10px', bottom: '36px', d: 0.4 }
];

/**
 * 宵闇の地の外枠（色調 B）。decor が 'lively' なら札がぽよんと弾み、'still' なら止めておく（盤面の画面は端末の熱を避けて止める）
 */
export const HfFrame = React.forwardRef<HTMLDivElement, {
  className?: string; decor?: 'lively' | 'still'; children: React.ReactNode;
}>(({ className = '', decor = 'still', children }, ref) => (
  <div ref={ref} className={`hf-frame ${className}`}>
    <div className="hf-decos" aria-hidden="true">
      {CORNERS.map((c, i) => (
        <div key={i} className="hf-deco" style={{ width: c.w, left: c.left, right: c.right, top: c.top, bottom: c.bottom, rotate: `${c.tilt}deg` }}>
          <div className={decor === 'lively' ? 'hf-poyon' : undefined}
            style={{ '--dur': `${2.4 + (i % 3) * 0.3}s`, '--delay': `${-c.d}s` } as React.CSSProperties}>
            <Fuda kind={c.k} />
          </div>
        </div>
      ))}
      <div className="hf-deco" style={{ left: '-40px', bottom: '-6px', width: 220, height: 22 }}>
        <KasumiShape w={220} h={22} />
      </div>
    </div>
    {children}
  </div>
));
HfFrame.displayName = 'HfFrame';

/** 見出し。1字ずつ少し傾ける。hop で1字ずつ時間差で跳ねる（盤面の画面では使わない） */
export const HfTitle: React.FC<{ text: string; as?: 'h2' | 'h3'; className?: string; hop?: boolean; gold?: number[] }> = ({
  text, as: Tag = 'h3', className = '', hop = false, gold = []
}) => (
  <Tag className={`hf-title ${hop ? 'hf-hop' : ''} ${className}`} aria-label={text}>
    {[...text].map((ch, i) => (ch === ' ' ? <span key={i} className="inline-block w-[0.35em]" /> : (
      <span key={i} aria-hidden="true" className={`hf-title-ch ${gold.includes(i) ? 'hf-title-gold' : ''}`}
        style={{ rotate: `${i % 2 ? 4 : -4}deg`, animationDelay: `${i * 0.11}s` }}>
        {ch}
      </span>
    )))}
  </Tag>
);
