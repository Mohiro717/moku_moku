import React, { memo, useEffect, useRef } from 'react';
import { PuyoFace } from './Puyo';
import './puyoAnimations.css';

// 降る予定のおじゃまの予告。大きい単位から順に並べ、最大 MAX_ICONS 個まで出す。
//   岩 = 30個（5段） / 大 = 6個（1段） / 小 = 1個
type Kind = 'rock' | 'big' | 'small';
const UNITS: Array<{ size: number; kind: Kind }> = [
  { size: 30, kind: 'rock' },
  { size: 6, kind: 'big' },
  { size: 1, kind: 'small' }
];
const MAX_ICONS = 6;
const PX: Record<Kind, number> = { rock: 30, big: 23, small: 15 };

const toIcons = (count: number): Kind[] => {
  const icons: Kind[] = [];
  let rest = count;
  for (const unit of UNITS) {
    while (rest >= unit.size && icons.length < MAX_ICONS) {
      icons.push(unit.kind);
      rest -= unit.size;
    }
  }
  return icons;
};

const OjamaIcon: React.FC<{ kind: Kind }> = ({ kind }) => (
  <svg className="ojama-in overflow-visible" width={PX[kind]} height={PX[kind]} viewBox="0 0 40 40">
    {kind === 'rock' ? (
      <>
        <path d="M4 30 L8 12 L18 5 L31 8 L37 22 L33 35 L12 37 Z" fill="#6b5b4f" stroke="#3b2f2f" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 14 L15 19 L12 26 M26 9 L23 17 L30 22" stroke="#3b2f2f" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <ellipse cx="14" cy="11" rx="5" ry="2.4" fill="#fff" opacity=".3" transform="rotate(-25 14 11)" />
      </>
    ) : (
      <>
        <use href="#puyo-body" fill="url(#puyo-g-ojama)" />
        <ellipse cx="13" cy="10" rx="5" ry="2.6" fill="#fff" opacity=".45" transform="rotate(-25 13 10)" />
        <PuyoFace ojama />
      </>
    )}
  </svg>
);

interface OjamaNoticeProps {
  count: number;
  /** 相手の連鎖が終わっていて、次の着地で降る状態 */
  ready?: boolean;
  /** 攻撃の光が当たるたびに増える。変わったら弾む */
  hit?: number;
}

export const OjamaNotice: React.FC<OjamaNoticeProps> = memo(({ count, ready = false, hit = 0 }) => {
  const row = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (hit === 0 || !row.current?.animate) return;
    row.current.animate(
      [
        { transform: 'none' },
        { transform: 'translateY(-4px) scale(1.15)' },
        { transform: 'translateX(-3px)' },
        { transform: 'none' }
      ],
      { duration: 320, easing: 'ease-out' }
    );
  }, [hit]);

  return (
    <div className="h-9 mb-2 flex items-end justify-center" aria-label={`おじゃま予告 ${count}個`}>
      <div ref={row} className="flex items-end gap-1 min-h-[1px]">
        {count > 0 && (
          <>
            {toIcons(count).map((kind, i) => (
              <span
                key={`${kind}-${i}`}
                className={`inline-block ${ready ? 'ojama-ready' : ''}`}
                style={ready ? { animationDelay: `${i * 60}ms` } : undefined}
              >
                <OjamaIcon kind={kind} />
              </span>
            ))}
            <span className="ml-1 text-xs font-serif text-coffee-dark">×{count}</span>
          </>
        )}
      </div>
    </div>
  );
});
