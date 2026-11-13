/**
 * 端末が熱くなる対策の見比べ用（オーナー 11-13「上の案を選んで試す」）。
 * URL に ?lite=spark1,still2 のように付けると、その案だけが効く。付けなければ今の見た目のまま。
 *   spark1  … 火の粉を駒1つにつき1粒に
 *   nospark … 火の粉なし
 *   still2  … スマホ・タブレット（相手の盤面が小さく出る幅）で、相手の盤面のゆらめき・呼吸・まばたき・火の粉を止める
 *   fps20   … ゆらめき・呼吸・まばたき・火の粉を毎秒20コマで動かす（少しカクつく）
 * 決まったら、選ばれた案だけを素の CSS に直してこのファイルは消す
 */
export const LITE_OPTIONS = ['spark1', 'nospark', 'still2', 'fps20'] as const;

const STYLE = `
html.lite-spark1 .onibi-spark + .onibi-spark { display: none; }
html.lite-nospark .onibi-spark { display: none; }
@media (max-width: 1023px) {
  html.lite-still2 .puyo-vs-cpu-field :is(.onibi-flicker, .puyo-idle, .nubatama-eye, .puyo-eye) { animation: none; }
  html.lite-still2 .puyo-vs-cpu-field .onibi-spark { display: none; }
}
html.lite-fps20 :is(.onibi-flicker, .puyo-idle, .onibi-spark, .nubatama-eye) { animation: none; }
`;

/** 鬼火のゆらめき（puyoAnimations.css の onibi-flicker と同じ形）：[scaleX, scaleY, skewX] を 0・25・50・75% に */
const FLICKER: [number, number, number][] = [[1, 1, 0], [0.97, 1.05, -3], [1.02, 0.97, 2], [0.98, 1.04, -1.5]];
const ease = (t: number) => t * t * (3 - 2 * t);
const flickerAt = (p: number) => {
  const f = p * 4;
  const i = Math.floor(f) % 4;
  const a = FLICKER[i];
  const b = FLICKER[(i + 1) % 4];
  const k = ease(f - Math.floor(f));
  const v = (j: number) => a[j] + (b[j] - a[j]) * k;
  return `scale(${v(0).toFixed(3)}, ${v(1).toFixed(3)}) skewX(${v(2).toFixed(2)}deg)`;
};
/** 呼吸（puyo-breathe）：0→50% で scale(1.03, .97)、戻る */
const breatheAt = (p: number) => {
  const k = ease(p < 0.5 ? p * 2 : 2 - p * 2);
  return `scale(${(1 + 0.03 * k).toFixed(4)}, ${(1 - 0.03 * k).toFixed(4)})`;
};
/** 火の粉（onibi-spark）：0〜20% で現れ、1.6 秒で昇りきって消える */
const sparkAt = (p: number, el: HTMLElement) => {
  const k = 1 - (1 - p) * (1 - p);
  const dx = Number(el.style.getPropertyValue('--spark-dx')) || 0;
  el.style.opacity = (p < 0.2 ? p * 5 : 1 - (p - 0.2) / 0.8).toFixed(2);
  return `translate(calc(var(--puyo-size) * ${(dx * k).toFixed(4)}), calc(var(--puyo-size) * ${(-0.3 * k).toFixed(4)}))`;
};
/** ぬばたまのまばたき（nubatama-eye-blink）：88〜92% で閉じ、94〜100% で開く */
const blinkAt = (p: number) => {
  const y = p < 0.88 ? 1 : p < 0.92 ? 1 - 0.88 * (p - 0.88) / 0.04 : p < 0.94 ? 0.12 : 0.12 + 0.88 * (p - 0.94) / 0.06;
  return `scaleY(${y.toFixed(3)})`;
};

const CLOCKED: [string, number, (p: number, el: HTMLElement) => string][] = [
  ['.onibi-flicker', 1.3, flickerAt],
  ['.puyo-idle', 2.4, breatheAt],
  ['.onibi-spark', 1.6, sparkAt],
  ['.nubatama-eye', 6, blinkAt]
];

/** CSS の animationDelay（負の秒）を位相として読む。駒ごとのずれを保つ */
const delayOf = (el: HTMLElement) => parseFloat(el.style.animationDelay) || 0;

/** still2 と重ねたとき、止めた相手の盤面は動かさない */
const stillCpu = () => document.documentElement.classList.contains('lite-still2') && window.innerWidth < 1024;

const startClock = (fps: number) => {
  let touched = new Set<HTMLElement>();
  window.setInterval(() => {
    if (document.hidden) return;
    const t = performance.now() / 1000;
    const skipCpu = stillCpu();
    const now = new Set<HTMLElement>();
    for (const [sel, dur, at] of CLOCKED) {
      document.querySelectorAll<HTMLElement>(sel).forEach(el => {
        if (skipCpu && el.closest('.puyo-vs-cpu-field')) return;
        const p = (((t - delayOf(el)) / dur) % 1 + 1) % 1;
        el.style.transform = at(p, el);
        now.add(el);
      });
    }
    // ゆらめきが終わった駒（つながった・消える）に、書いた transform を残さない
    touched.forEach(el => {
      if (!now.has(el)) { el.style.transform = ''; el.style.opacity = ''; }
    });
    touched = now;
  }, 1000 / fps);
};

export const applyPerfLite = () => {
  if (typeof window === 'undefined') return;
  const picked = (new URLSearchParams(location.search).get('lite') ?? '')
    .split(',')
    .filter((k): k is (typeof LITE_OPTIONS)[number] => (LITE_OPTIONS as readonly string[]).includes(k));
  if (!picked.length) return;
  const style = document.createElement('style');
  style.textContent = STYLE;
  document.head.appendChild(style);
  picked.forEach(k => document.documentElement.classList.add(`lite-${k}`));
  if (picked.includes('fps20')) startClock(20);
};
