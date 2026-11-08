import React, { useEffect, useRef, useState } from 'react';
import { KitanCredit } from './CpuCharacter';
import { FANWORKS_URL } from '../../constants/cpuCharacters';
import './wapop.css';

// H3 で作ったタイトルの動画（8秒・1回だけ流して最後の画で止める）。咲耶の声「ぬばたま おとし！」が 6.8 秒で終わる
const TITLE_VIDEO = `${import.meta.env.BASE_URL}video/nubatama_title.mp4`;
const BUTTONS_AT_SEC = 6.8;

interface Props {
  onVsCpu: () => void;
  onSingle: () => void;
  onBack: () => void;
}

/** ぬばたま落としのタイトル画面：動画が流れて止まったら、左右の空いた地面にボタンが出る */
export const NubatamaTitleScreen: React.FC<Props> = ({ onVsCpu, onSingle, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  // カードのボタンを押した直後に開くので、声つきで再生できる。断られたら音なしで流す
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => setReady(true));
    });
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.currentTime >= BUTTONS_AT_SEC) setReady(true);
  };

  // 流れている途中で押したら、最後の画まで飛ばす
  const skip = () => {
    const video = videoRef.current;
    if (ready || !video) return;
    if (Number.isFinite(video.duration)) video.currentTime = video.duration;
    setReady(true);
  };

  const vsCpuButton = (
    <button type="button" onClick={onVsCpu} className="wp-btn wp-btn-sakura w-full py-3 text-base">
      CPUと たいせん
    </button>
  );
  const singleButton = (
    <button type="button" onClick={onSingle} className="wp-btn wp-btn-kinari w-full py-3 text-base">
      ひとりで あそぶ
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="relative overflow-hidden rounded-3xl border-[3px] border-coffee-dark shadow-[0_6px_0_#3b2f2f] bg-[#efe3cf]">
        <video
          ref={videoRef}
          src={TITLE_VIDEO}
          width={864}
          height={480}
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setReady(true)}
          onClick={skip}
          className={`block w-full h-auto ${ready ? '' : 'cursor-pointer'}`}
          aria-label="ぬばたま落とし タイトル"
        />

        {!ready && (
          <button
            type="button"
            onClick={skip}
            className="absolute top-3 right-3 rounded-full bg-black/25 px-3 py-1 text-xs font-serif text-white"
          >
            とばす ▶▶
          </button>
        )}

        {/* PC：咲耶とぬばたまの左右にある、何も無い地面に置く */}
        {ready && (
          <>
            <div className="hidden sm:block absolute left-[3%] bottom-[7%] w-[26%] wp-pop-in">{vsCpuButton}</div>
            <div className="hidden sm:block absolute right-[3%] bottom-[7%] w-[26%] wp-pop-in">{singleButton}</div>
          </>
        )}
      </div>

      {/* スマホ：画が小さく左右の地面に入らないので、画の下に並べる */}
      <div className={`sm:hidden grid grid-cols-2 gap-3 mt-4 transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {vsCpuButton}
        {singleButton}
      </div>

      <div className="mt-5 flex flex-col items-center gap-1">
        <button type="button" onClick={onBack} className="wp-btn wp-btn-kinari px-6 py-2 text-sm">
          もどる
        </button>
        <KitanCredit url={FANWORKS_URL} />
      </div>
    </div>
  );
};
