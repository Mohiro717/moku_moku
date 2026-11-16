import React, { useLayoutEffect, useRef, useState } from 'react';

// 中身（タイトル・キャラえらび・対戦・ひとりであそぶ）を、窓の縦と横の両方に収まる最大の倍率まで拡大する
// （オーナー 11-15「ゲーム画面小さいですね。スクリーンいっぱいに広げたい」→「広げて（OPも）」）。
// CSS の zoom で拡大するので、文字・図形（ぬばたま・鬼火・題字は SVG）は拡大後の解像度で描き直され、ぼやけない。
// 拡大だけで縮小はしない（スマホは今の見た目のまま。縦に長い画面はこれまでどおりスクロール）。
// 中身の大きさは画面ごとに替わるので、替わるたびに測り直す。

const PAD = 12; // 窓の端との すき間（px）

/**
 * 中身の素の幅＝いまの画面の外枠の幅。NubatamaGame の各画面は .wp-zone の直下に外枠を1つ置く
 * （タイトルは案3b の枠、ほかは HfFrame）。外枠がスマホの w-full のように横いっぱいなら、横いっぱいの幅になる
 */
const frameWidth = (el: HTMLElement): number => {
  const frame = el.querySelector<HTMLElement>(':scope > .wp-zone > :not(style)');
  return frame?.offsetWidth || el.offsetWidth;
};

export const FitToScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const innerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    let frame = 0;
    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // offsetWidth / offsetHeight は zoom をかける前の大きさ
        const w = frameWidth(el), h = el.offsetHeight;
        if (!w || !h) return;
        const z = Math.min((window.innerWidth - PAD * 2) / w, (window.innerHeight - PAD * 2) / h);
        // 0.01 刻みで切り捨て（測った幅ちょうどにしない＝次に測るときも枠が横いっぱいにならない）
        setZoom(Math.max(1, Math.floor(z * 100) / 100));
      });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    // 画面が替わっても外の箱の大きさが変わらないことがある（横いっぱいの箱）ので、すぐ下の入れ替わりも見る。
    // subtree は見ない（対戦中は盤面の DOM が毎コマ変わり、そのたびに測ると重い）
    const mo = new MutationObserver(fit);
    mo.observe(el, { childList: true });
    window.addEventListener('resize', fit);
    return () => { cancelAnimationFrame(frame); ro.disconnect(); mo.disconnect(); window.removeEventListener('resize', fit); };
  }, []);

  return (
    // zoom は外の箱にかけ、中の箱を測る（中の箱の offsetWidth は zoom をかける前の値）
    <div style={{ zoom }}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
};
