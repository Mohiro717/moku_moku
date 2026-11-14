import React, { useEffect, useRef, useState } from 'react';

// タイトル画面の咲耶（オーナー 11-13 作の1枚絵）。リボン・髪・袖だけをなびかせる（オーナー 11-13「リボンや髪の毛、服の袖はなびかせたいね」）。
// 1枚の絵のまま、場所ごとに画素をずらす（だ円の範囲・付け根は動かず先ほど大きく揺れる・周期で必ず元に戻るのでループの継ぎ目は出ない）。
// 絵は白地なので、読み込んだときに外周とつながった白だけを透明にする（目や歯の白は残る）。

export type FlutterRegion = {
  name: string;
  /** 範囲のだ円（絵の幅・高さに対する割合） */
  cx: number; cy: number; rx: number; ry: number;
  /** 付け根 a → 先 b。付け根は動かず、先ほど大きく揺れる */
  ax: number; ay: number; bx: number; by: number;
  /** 揺れの大きさ（絵の幅に対する割合）と向き */
  amp: number; axis: 'x' | 'y';
  /** 波長（付け根→先の長さに対する割合）と周期（秒） */
  wave: number; period: number;
};

export const SAKUYA_REGIONS: FlutterRegion[] = [
  // リボンの先（結び目から右上へ流れる2本）。上下に波打つ
  { name: 'ribbon', cx: 0.74, cy: 0.085, rx: 0.2, ry: 0.07, ax: 0.53, ay: 0.05, bx: 0.9, by: 0.13, amp: 0.016, axis: 'y', wave: 0.75, period: 1.6 },
  // ポニーテールの毛先（右へ流れる）。左右に波打つ
  { name: 'hair', cx: 0.77, cy: 0.25, rx: 0.16, ry: 0.13, ax: 0.6, ay: 0.13, bx: 0.8, by: 0.36, amp: 0.014, axis: 'x', wave: 0.9, period: 2.2 },
  // 右袖（上げた腕の側・画の左）
  { name: 'sleeveL', cx: 0.335, cy: 0.315, rx: 0.07, ry: 0.06, ax: 0.38, ay: 0.29, bx: 0.3, by: 0.34, amp: 0.006, axis: 'y', wave: 1, period: 1.9 },
  // 左袖（画の右）
  { name: 'sleeveR', cx: 0.63, cy: 0.37, rx: 0.07, ry: 0.065, ax: 0.59, ay: 0.32, bx: 0.68, by: 0.42, amp: 0.006, axis: 'y', wave: 1, period: 2.1 }
];

const WORK_W = 640; // 作業する大きさ（横）。表示はこれを CSS で縮める

/** 外周とつながった白だけを透明にする。縁のうすい灰は白の混ざり具合で半透明にする */
const knockOutWhite = (img: ImageData) => {
  const { width: w, height: h, data } = img;
  const isBg = (i: number) => data[i] > 232 && data[i + 1] > 232 && data[i + 2] > 232;
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop()!;
    if (seen[p]) continue;
    seen[p] = 1;
    if (!isBg(p * 4)) continue;
    seen[p] = 2;
    data[p * 4 + 3] = 0;
    const x = p % w, y = (p - x) / w;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  // 透明にした所のとなりの明るい画素は、白が混ざった縁なので明るさに応じて透かす
  for (let p = 0; p < w * h; p++) {
    if (seen[p] === 2) continue;
    const x = p % w, y = (p - x) / w;
    const nearBg = (x > 0 && seen[p - 1] === 2) || (x < w - 1 && seen[p + 1] === 2) || (y > 0 && seen[p - w] === 2) || (y < h - 1 && seen[p + w] === 2);
    if (!nearBg) continue;
    const i = p * 4;
    const lum = Math.min(data[i], data[i + 1], data[i + 2]);
    if (lum > 150) data[i + 3] = Math.round(255 * Math.min(1, (255 - lum) / 105));
  }
};

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

export const SakuyaFlutter: React.FC<{ src: string; regions?: FlutterRegion[]; debug?: boolean; style?: React.CSSProperties; className?: string }> =
  ({ src, regions = SAKUYA_REGIONS, debug = false, style, className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // 表示の大きさが変わったら描き直す（48px 刻み。細かい揺れでは描き直さない）
    const [sizeKey, setSizeKey] = useState(0);
    useEffect(() => {
      const c = canvasRef.current;
      if (!c || typeof ResizeObserver === 'undefined') return;
      const ro = new ResizeObserver(() => setSizeKey(Math.round(c.clientWidth / 48)));
      ro.observe(c);
      return () => ro.disconnect();
    }, []);

    useEffect(() => {
      let raf = 0;
      let alive = true;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        if (!alive || !canvasRef.current) return;
        const canvas = canvasRef.current;
        // 表示される大きさ（画面の画素）で描く。640 で描いてから CSS で 1/3 に縮めると、
        // ブラウザの縮小は粗いので線がガタつく（オーナー 11-13「咲耶の輪郭がジャギってる」）
        const shown = canvas.clientWidth * (window.devicePixelRatio || 1);
        const w = Math.round(Math.max(160, Math.min(WORK_W * 2, shown || WORK_W, img.naturalWidth)));
        const h = Math.round((img.naturalHeight / img.naturalWidth) * w);
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        // 半分ずつ段階的に縮めてから最後に合わせる（一度に大きく縮めると細い線が欠ける）
        let step: CanvasImageSource = img;
        let sw = img.naturalWidth, sh = img.naturalHeight;
        while (sw / 2 >= w) {
          const tmp = document.createElement('canvas');
          tmp.width = Math.round(sw / 2); tmp.height = Math.round(sh / 2);
          const tc = tmp.getContext('2d')!;
          tc.imageSmoothingQuality = 'high';
          tc.drawImage(step, 0, 0, tmp.width, tmp.height);
          step = tmp; sw = tmp.width; sh = tmp.height;
        }
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(step, 0, 0, w, h);
        const base = ctx.getImageData(0, 0, w, h);
        knockOutWhite(base);
        const src8 = base.data;

        // 揺れる画素を前もって選び、場所ごとの重み・付け根からの距離を覚えておく
        const idx: number[] = [];
        const per: { r: number; wgt: number; s: number }[][] = [];
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const list: { r: number; wgt: number; s: number }[] = [];
            regions.forEach((g, r) => {
              const ex = (x / w - g.cx) / g.rx, ey = (y / h - g.cy) / g.ry;
              const e = ex * ex + ey * ey;
              if (e >= 1) return;
              const vx = g.bx - g.ax, vy = g.by - g.ay;
              const len2 = vx * vx + vy * vy;
              const t = ((x / w - g.ax) * vx + (y / h - g.ay) * vy) / len2; // 付け根0 → 先1
              const lever = Math.pow(Math.max(0, Math.min(1, t)), 1.4);
              const wgt = smooth(1 - e) * lever;
              if (wgt > 0.002) list.push({ r, wgt, s: t });
            });
            if (list.length) {
              idx.push(y * w + x);
              per.push(list);
            }
          }
        }

        const out = ctx.createImageData(w, h);
        const o8 = out.data;
        o8.set(src8);
        if (debug) {
          // 揺れる範囲を色で見せる（位置合わせ用）
          idx.forEach((p, k) => { const a = Math.min(1, per[k].reduce((m, q) => m + q.wgt, 0)); o8[p * 4] = 255 * a + o8[p * 4] * (1 - a); o8[p * 4 + 3] = Math.max(o8[p * 4 + 3], 120 * a); });
          ctx.putImageData(out, 0, 0);
          return;
        }

        const sample = (fx: number, fy: number, j: number) => {
          // 双線形で読む（外は透明）
          const x0 = Math.floor(fx), y0 = Math.floor(fy);
          const tx = fx - x0, ty = fy - y0;
          let acc = 0;
          for (let c = 0; c < 4; c++) {
            const pick = (xx: number, yy: number) => (xx < 0 || yy < 0 || xx >= w || yy >= h ? 0 : src8[(yy * w + xx) * 4 + c]);
            const top = pick(x0, y0) * (1 - tx) + pick(x0 + 1, y0) * tx;
            const bot = pick(x0, y0 + 1) * (1 - tx) + pick(x0 + 1, y0 + 1) * tx;
            acc = top * (1 - ty) + bot * ty;
            o8[j + c] = acc;
          }
        };

        const t0 = performance.now();
        const frame = (now: number) => {
          if (!alive) return;
          const t = (now - t0) / 1000;
          for (let k = 0; k < idx.length; k++) {
            const p = idx[k];
            let dx = 0, dy = 0;
            for (const q of per[k]) {
              const g = regions[q.r];
              const d = g.amp * w * q.wgt * Math.sin(2 * Math.PI * (q.s / g.wave - t / g.period));
              if (g.axis === 'x') dx += d; else dy += d;
            }
            const x = p % w, y = (p - x) / w;
            sample(x - dx, y - dy, p * 4);
          }
          ctx.putImageData(out, 0, 0);
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      };
      return () => { alive = false; cancelAnimationFrame(raf); };
    }, [src, regions, debug, sizeKey]);

    return <canvas ref={canvasRef} className={className} style={{ display: 'block', width: '100%', ...style }} aria-label="咲耶" />;
  };
