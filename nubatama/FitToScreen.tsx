import React, { useLayoutEffect, useRef } from 'react';
import { HfFrame } from '../components/game/HanafudaUi';
import './stage.css';

// 中身（タイトル・キャラえらび・対戦・ひとりであそぶ）を、窓の縦と横の両方に収まる最大の倍率まで拡大する
// （オーナー 11-15「ゲーム画面小さいですね。スクリーンいっぱいに広げたい」→「広げて（OPも）」）。
// CSS の zoom で拡大するので、文字・図形（ぬばたま・鬼火・題字は SVG）は拡大後の解像度で描き直され、ぼやけない。
// 拡大だけで縮小はしない（スマホは今の見た目のまま。縦に長い画面はこれまでどおりスクロール）。
//
// 倍率は画面ごとに測らず、決まった箱から出す（オーナー 11-16「画面が切り替わるとサイズが不自然に変わる」「ちらつく」）。
// 前は画面ごとに外枠を測っていて、1600×900 で タイトル 1.75 → じぶんえらび 1.61 → あいてえらび 1.44 倍と替わり、
// 測るのが切り替えの1コマあと（入れ替わり中の外枠は一瞬 2〜5 倍の高さになる）で、対戦中も ふきだしの行数が替わるたびに跳ねていた。
// - メニュー（.wp-zone に data-fit="menu"。じぶんえらび・あいてえらび・ひとりで）は MENU_BOX
// - タイトル・OP（data-fit="title"）は窓を覆う倍率（titleFit）
// - それ以外（対戦・ひとりであそぶ の盤面）は PLAY_BOX
// 倍率が替わるのは メニュー ⇄ 盤面 の行き来と、窓の大きさが替わったときだけ。
//
// 宵闇の枠（HfFrame）は窓いっぱいに敷く（オーナー 11-17「ゲーム画面の大きさまだ小さい。ブラウザ画面の大きさと＝にしたい」）。
// 前は枠が画面ごとの中身の幅で止まり、1600×900 の対戦で枠は幅の 58% だけ、左右に地の余白が出ていた。
// 中身は縦横比が決まっている（盤面・タイトルの絵）ので伸ばさない。枠を窓の大きさにして、中身はその上に収まる最大の倍率で置く。
// 画面ごとの枠（キャラえらび・対戦の HfFrame）は地・縁・札を消して、この窓いっぱいの枠に溶かす（stage.css）。

const PAD = 12; // 窓の端との すき間（px）

/** 画面の素の大きさ（1600×900 で実測、zoom をかける前）。画面の中身を増やしてこれより大きくなったら、ここを測り直す */
// 幅＝タイトル案3b の枠 896、高さ＝あいてえらび 607 に少し足す
const MENU_BOX = { w: 896, h: 612 };
// 幅＝CPU と たいせん の枠 806（ひとりで は 768）、高さ＝CPU と たいせん 753（ひとりで は 712）に少し足す
const PLAY_BOX = { w: 806, h: 760 };
// タイトル・OP の素の幅（NubatamaTitleScreen の max-w-4xl）
const TITLE_W = 896;
// タイトルの絵の 縦÷横（864:480）
const TITLE_RATIO = 480 / 864;

/** 箱が窓に収まる倍率（1 未満にはしない。0.01 刻みで切り捨て） */
const zoomFor = ({ w, h }: { w: number; h: number }): number =>
  Math.max(1, Math.floor(Math.min((window.innerWidth - PAD * 2) / w, (window.innerHeight - PAD * 2) / h) * 100) / 100);

/**
 * タイトル・OP は窓いっぱい（オーナー 11-17「これをブラウザ幅いっぱいに」→「アスペクト比の調整もしてください」）。
 * 絵は 864:480 の格子で組んであり（位置は %、大きさは cqw、題字・丘は viewBox）、枠の縦横比を変えると部品どうしがずれる。
 * そこで絵の比は保ったまま、窓を覆う倍率（cover）で置き、窓からはみ出した端だけを切る。
 * 切りすぎると欠けるので、収まる倍率（contain）からの上げ幅に上限を置く。上限は向きで違う:
 * 横長の窓（上下を切る）は 1.11 倍まで（1920×960 がちょうどこれ。右上の おと・あそびかた… は窓の隅に付いているので、
 *   上を切るほど題字が上がって重なる。2560×1080 で 1.15 倍にしたら「ぬばたま」に重なった。11-17 実測）。
 * 縦長の窓（左右を切る）は 1.06 倍まで（題字「し」の右端が 94% にあり、5:4 で 1.12 倍にしたら切れた。11-17 実測）。
 * それより縦横比が離れた窓は、足りない向きに宵闇の地が少し出る。スマホ（幅 640 未満）は下の帯つきの組み方なので、これまでどおり幅ぴったり。
 * 窓の大きさ（絵を置く枠の幅・高さ。zoom 前の値）は --nb-tw / --nb-th で stage.css に渡す
 */
const TITLE_MAX_CROP_TOPBOTTOM = 1.11;
const TITLE_MAX_CROP_SIDES = 1.06;
const titleFit = (): { zoom: number; w: number; h: number } | { zoom: number } => {
  const w = window.innerWidth, h = window.innerHeight;
  if (w < 640) return { zoom: Math.max(1, document.documentElement.clientWidth / TITLE_W) };
  const byW = w / TITLE_W, byH = h / (TITLE_W * TITLE_RATIO);
  // byW > byH なら窓が絵より横長（幅で合わせると上下がはみ出す）
  const zoom = byW > byH ? Math.min(byW, byH * TITLE_MAX_CROP_TOPBOTTOM) : Math.min(byH, byW * TITLE_MAX_CROP_SIDES);
  return { zoom, w: w / zoom, h: h / zoom };
};

export const FitToScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current, outer = outerRef.current, el = innerRef.current;
    if (!stage || !outer || !el) return;
    const fit = () => {
      const mark = el.querySelector(':scope > .wp-zone')?.getAttribute('data-fit');
      const mode = mark === 'title' || mark === 'menu' ? mark : 'play';
      const title = mode === 'title' ? titleFit() : null;
      const next = String(title ? title.zoom : zoomFor(mode === 'menu' ? MENU_BOX : PLAY_BOX));
      if (title && 'w' in title) {
        stage.style.setProperty('--nb-tw', `${title.w}px`);
        stage.style.setProperty('--nb-th', `${title.h}px`);
      }
      // state を通さず style に直接書く。MutationObserver の知らせは描く前に届くので、新しい画面は最初から新しい倍率で出る
      if (outer.style.zoom !== next) outer.style.zoom = next;
      // 窓いっぱいの枠の四隅の札も、中身と同じ倍率にする（札だけ小さく見えないように）。盤面のあいだは札を弾ませない（端末の熱）
      stage.style.setProperty('--nb-zoom', next);
      stage.dataset.mode = mode;
    };
    fit();
    // メニュー ⇄ 盤面 の行き来を見る。React は画面が替わっても .wp-zone の div を使い回すことがあるので、
    // すぐ下の入れ替わりと、印（data-fit）の付け外しの両方を見る
    const swap = new MutationObserver(fit);
    swap.observe(el, { childList: true });
    const marks = new MutationObserver(fit);
    marks.observe(el, { subtree: true, attributes: true, attributeFilter: ['data-fit'] });
    window.addEventListener('resize', fit);
    return () => { swap.disconnect(); marks.disconnect(); window.removeEventListener('resize', fit); };
  }, []);

  return (
    <HfFrame ref={stageRef} decor="lively" className="nb-stage">
      <div ref={outerRef} className="nb-stage-body">
        <div ref={innerRef}>{children}</div>
      </div>
    </HfFrame>
  );
};
