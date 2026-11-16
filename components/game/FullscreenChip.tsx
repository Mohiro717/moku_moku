import React, { useEffect, useState } from 'react';

// 全画面の切り替え（単独サイトだけ。オーナー 11-15「全画面モードも追加」）。
// タイトルの「おと・あそびかた・クレジット」と同じ札に並べる（ボタンは枠の外に出さない、オーナー 11-13）。
// 全画面にできないブラウザ（iPhone の Safari など）では出さない。やめるのは この札か Esc。

const canFullscreen = () => typeof document !== 'undefined' && !!document.fullscreenEnabled;

export const FullscreenChip: React.FC<{ className?: string }> = ({ className = 'hf-chip' }) => {
  const [on, setOn] = useState(() => typeof document !== 'undefined' && !!document.fullscreenElement);

  useEffect(() => {
    const sync = () => setOn(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  if (!canFullscreen()) return null;

  const toggle = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void document.documentElement.requestFullscreen().catch(() => {});
  };

  return (
    <button type="button" onClick={toggle} aria-pressed={on} className={className}>
      {on ? '⛶ もとの大きさ' : '⛶ ぜんがめん'}
    </button>
  );
};
