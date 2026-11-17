import React, { useLayoutEffect, useRef } from 'react';
import { HfFrame } from '../components/game/HanafudaUi';
import { VS_UX_SAMPLE } from '../hooks/useWideStage';
import './stage.css';

// 中身（タイトル・キャラえらび・対戦・ひとりであそぶ）を、窓の縦と横の両方に収まる最大の倍率まで拡大する
// （オーナー 11-15「ゲーム画面小さいですね。スクリーンいっぱいに広げたい」→「広げて（OPも）」）。
// CSS の zoom で拡大するので、文字・図形（ぬばたま・鬼火・題字は SVG）は拡大後の解像度で描き直され、ぼやけない。
// 拡大だけで縮小はしない（スマホは今の見た目のまま。縦に長い画面はこれまでどおりスクロール）。
//
// 倍率は画面ごとに測らず、決まった箱から出す（オーナー 11-16「画面が切り替わるとサイズが不自然に変わる」「ちらつく」）。
// 前は画面ごとに外枠を測っていて、1600×900 で タイトル 1.75 → じぶんえらび 1.61 → あいてえらび 1.44 倍と替わり、
// 測るのが切り替えの1コマあと（入れ替わり中の外枠は一瞬 2〜5 倍の高さになる）で、対戦中も ふきだしの行数が替わるたびに跳ねていた。
// - タイトル・OP（data-fit="title"）は絵の本体が窓に収まる倍率。まわりは絵が描き足す（fillFit）
// - メニュー（.wp-zone に data-fit="menu"。じぶんえらび・あいてえらび・ひとりで）は、幅 640 以上ならタイトルと同じ倍率で窓いっぱいに組む（fillFit）。
//   スマホは MENU_BOX
// - 対戦（data-fit="vs"。幅 640 以上の単独サイトだけ付く）は、5列が窓いっぱいに収まる倍率（fillFit(VS_MIN)）
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
 * タイトル・OP は窓いっぱい、余白なし（オーナー 11-17「これをブラウザ幅いっぱいに」→「アスペクト比の調整も」
 * →「余白が無いように素材やUI配置設計を見直して」）。
 * 絵は 864:480 の格子で組んであり（位置は %、大きさは cqw、題字・丘は viewBox）、枠の縦横比を変えると部品どうしがずれる。
 * そこで絵の本体（咲耶・題字・ボタン・札）は窓に丸ごと収まる倍率（contain）で置き、端は切らない。
 * 窓の縦横比が絵と違うぶんは、絵のほうが夜空・丘・霞を窓の端まで描き足す（TitleHanafudaOdori の bleed）。
 * 前は覆う倍率（cover）で端を切っていて、題字が欠けないよう切る量に上限を置いたぶん、宵闇の地の帯が出ていた。
 * スマホ（幅 640 未満）は下の帯つきの組み方なので、これまでどおり幅ぴったり。
 * 窓の大きさ（絵を置く枠の幅・高さ。zoom 前の値）は --nb-tw / --nb-th で stage.css に渡す
 */
const titleFit = (): { zoom: number; w: number; h: number } | { zoom: number } =>
  window.innerWidth < 640 ? { zoom: Math.max(1, document.documentElement.clientWidth / TITLE_W) } : fillFit();

/**
 * 窓いっぱいに組む画面の倍率と、zoom 前の窓の大きさ。タイトルの絵の本体（896×498）が窓に丸ごと収まる倍率で、
 * キャラえらびも同じ倍率にする（オーナー 11-17。前はタイトル 1.79 → キャラえらび 1.44 倍と、進むと大きさが変わった）。
 * キャラえらびは、どの窓でも 896×498 の中に収まるように組んである（NubatamaGame.tsx の wide、stage.css の .nb-sel）
 */
const fillFit = (minW = TITLE_W, minH = TITLE_W * TITLE_RATIO): { zoom: number; w: number; h: number } => {
  const w = window.innerWidth, h = window.innerHeight;
  const zoom = Math.min(w / minW, h / minH);
  return { zoom, w: w / zoom, h: h / zoom };
};

/**
 * 対戦の5列（PuyoVsCpuGame.tsx の wide、stage.css の .nb-vs）が窓いっぱいに収まる倍率。
 * 高さは盤の列（おじゃま予告＋盤）で決まる。幅は 盤2つ・まんなか・左右のキャラの列の いちばん狭い幅の合計。
 * 窓が これより横長なら左右のキャラの列が伸び、縦長なら上下に地が出る
 */
// 見本 c（上の帯）は帯のぶん高い（hooks/useWideStage.ts の VS_UX_SAMPLE）
const VS_MIN = { w: 1060, h: VS_UX_SAMPLE === 'c' ? 648 : 600 };

export const FitToScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current, outer = outerRef.current, el = innerRef.current;
    if (!stage || !outer || !el) return;
    const fit = () => {
      const mark = el.querySelector(':scope > .wp-zone')?.getAttribute('data-fit');
      const mode = mark === 'title' || mark === 'menu' || mark === 'vs' ? mark : 'play';
      const wide = window.innerWidth >= 640;
      const fill = mode === 'title' ? titleFit()
        : mode === 'menu' && wide ? fillFit()
        : mode === 'vs' && wide ? fillFit(VS_MIN.w, VS_MIN.h)
        : null;
      const next = String(fill ? fill.zoom : zoomFor(mode === 'menu' ? MENU_BOX : PLAY_BOX));
      if (fill && 'w' in fill) {
        stage.style.setProperty('--nb-tw', `${fill.w}px`);
        stage.style.setProperty('--nb-th', `${fill.h}px`);
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
