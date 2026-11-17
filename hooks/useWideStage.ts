import { useEffect, useState } from 'react';
import { IS_STANDALONE } from '../constants/layout';

/**
 * ぬばたま落とし単独サイトで、窓が幅 640 以上のとき true（nubatama/FitToScreen.tsx が窓いっぱいに組む）。
 * キャラえらびの2列・対戦の5列はこれで切り替える。もくもくハウスとスマホは false で、これまでの組み方のまま
 */
const WIDE_QUERY = '(min-width: 640px)';
export const useWideStage = () => {
  const [wide, setWide] = useState(() => IS_STANDALONE && window.matchMedia(WIDE_QUERY).matches);
  useEffect(() => {
    if (!IS_STANDALONE) return;
    const m = window.matchMedia(WIDE_QUERY);
    const on = () => setWide(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return wide;
};

/** 対戦のまんなかの列の見本（?ux=a|b|c）。オーナーが選んだら、この切り替えごと消して1つに絞る */
export const VS_UX_SAMPLE: 'a' | 'b' | 'c' = (() => {
  const v = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('ux');
  return v === 'b' || v === 'c' ? v : 'a';
})();
