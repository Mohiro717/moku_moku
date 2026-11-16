import React from 'react';
import { bgmTrackOf } from '../../constants/bgmTracks';

// いま流れている BGM の曲名（オーナー 11-15「バトル中に流れている BGM のタイトルも表示したい」）。
// 見出しの小札・クレジット行・はじめに出て消える札の3案を並べ、オーナーが「はじめに出て消える札」を選んだ。
// 試合がはじまる（曲が鳴りだす）たびに墨の小札が横からすっと出て、5秒ほどで消える（hanafuda.css の .hf-np）。

interface Props {
  /** 流している BGM の URL */
  src: string;
  /** 曲が流れているあいだ（試合中。ひとやすみ中も含む）だけ true。試合ごとに出しなおすので、毎試合はじめに出る */
  show: boolean;
  className?: string;
}

export const BgmTitle: React.FC<Props> = ({ src, show, className = '' }) => {
  const track = bgmTrackOf(src);
  if (!track || !show) return null;
  return (
    <div key={src} className={`hf-np pointer-events-none ${className}`} role="status">
      <span className="hf-chip hf-chip-sumi">
        <span aria-hidden="true">♪</span>
        {track.title}
        <span className="text-[0.85em] opacity-75">{track.role}</span>
      </span>
    </div>
  );
};
