import React from 'react';
import { createRoot } from 'react-dom/client';
import { TITLE_CSS } from './components/game/title/common';
import { TitleYoimatsuri } from './components/game/title/TitleYoimatsuri';
import { TitleOmochabako } from './components/game/title/TitleOmochabako';
import { TitleHanafuda } from './components/game/title/TitleHanafuda';
import { TitleHanafudaIro } from './components/game/title/TitleHanafudaIro';
import { TitleHanafudaOdori } from './components/game/title/TitleHanafudaOdori';
import { TitleHanafudaFuda } from './components/game/title/TitleHanafudaFuda';
import { LegacyApp } from './components/game/title/TitleLegacy';

// タイトル画面のデザイン3案（オーナー 11-13「基本POPなデザインで。もっとプロのデザイナーになって考えて」）。
// 固定：咲耶（オーナーの1枚絵）・鬼火・ぬばたま・題字・背景が出て、全部ふわふわ上下にループ。ボタン2つ。枠 864:480。
// ?design=1|2|3 で1案を大きく、指定なしで3案を縦に並べる。?design=0 は最初の見本（旧版）。
// ボタンは飾り（押しても何も起きない）。

const DESIGNS = [
  { id: '1', name: '案1 宵祭りステージ', line: '月を背にした咲耶が、手のひらの鬼火で題字を差し出す。夜祭の映画ポスター型', C: TitleYoimatsuri },
  { id: '2', name: '案2 おもちゃ箱ポップ', line: '題字そのものを鬼火4色とぬばたまで塗り、落ちてきたぬばたまが題字に乗る。明るい正面構図', C: TitleOmochabako },
  { id: '3', name: '案3 花札ポップ', line: '「芒に月」の花札を下敷きに、縦書きの題字と金の霞。版画のように色数をしぼった和ポップ', C: TitleHanafuda }
];

// 案3のポップ版（オーナー 11-13「案3ベースにポップにできますか？」）。ポップさの段階を変えた3つ。
// ?design=3a|3b|3c で1案ずつ、?design=3pop で案3と3つを縦に並べる。指定なしの一覧には入れない（3案の比較はそのまま）。
const POP = [
  { id: '3a', name: '案3a 花札ポップ・色', line: '構図と縦書きはそのまま。鬼火4色を月の輪と霞に入れ、地を明るく。題字に白い太フチと4色のずらし影', C: TitleHanafudaIro },
  { id: '3b', name: '案3b 花札ポップ・踊る題字', line: '5色はそのまま。題字を横書きにして1字ずつ跳ねさせ、傾いた花札をばらまき、全体に「ぽよん」の弾み', C: TitleHanafudaOdori },
  { id: '3c', name: '案3c 花札ポップ・ステッカー', line: '紅の放射線とドットの地に「芒に月」の大きな札。咲耶が札から飛び出し、全部が白フチのステッカー', C: TitleHanafudaFuda }
];

const Q = new URLSearchParams(location.search);

const App: React.FC = () => {
  const d = Q.get('design');
  if (d === '0') return <LegacyApp />;
  const one = DESIGNS.find(x => x.id === d) ?? POP.find(x => x.id === d);
  const list = one ? [one] : d === '3pop' ? [DESIGNS[2], ...POP] : DESIGNS;
  return (
    <div style={{ padding: '20px 16px 40px', display: 'grid', gap: 34, justifyItems: 'center' }}>
      <style>{TITLE_CSS}</style>
      {list.map(({ id, name, line, C }) => (
        <section key={id} style={one ? ({ '--tt-w': 'min(1296px, calc(100vw - 32px))' } as React.CSSProperties) : undefined}>
          <div style={{ margin: '0 0 8px 4px', display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
            <a href={`?design=${id}`} style={{ fontSize: 15, fontWeight: 700, color: '#3b2f2f', textDecoration: 'none' }}>{name}</a>
            <span style={{ fontSize: 13, color: '#6b5a50' }}>{line}</span>
          </div>
          <C />
        </section>
      ))}
      {!one && d !== '3pop' && <a href="?design=3pop" style={{ fontSize: 12, color: '#8a7a70' }}>案3のポップ版（3a・3b・3c）</a>}
      {!one && <a href="?design=0" style={{ fontSize: 12, color: '#8a7a70' }}>最初の見本（旧版）</a>}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
