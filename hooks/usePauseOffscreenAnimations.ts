import { useEffect } from 'react';

const STYLE_ID = 'pause-offscreen-style';
const PAUSED = 'anim-offscreen';

/**
 * 画面の外にある <section> の CSS アニメーションを止める。
 * 作品紹介のカードのはねる・点滅する飾り（100本以上）が、ゲーム中も見えないところで毎フレーム動き続け、
 * 端末が熱くなる原因の一つになっていた（オーナー 11-13「ぬばたまおとしで端末がめちゃくちゃ熱くなる」）。
 * 見えている間の動きは変えない。入る少し手前（200px）で動き出す
 */
export const usePauseOffscreenAnimations = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return;
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `.${PAUSED}, .${PAUSED} *, .${PAUSED} *::before, .${PAUSED} *::after { animation-play-state: paused !important; }`;
      document.head.appendChild(style);
    }
    const sections = Array.from(document.querySelectorAll('section'));
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle(PAUSED, !e.isIntersecting)),
      { rootMargin: '200px 0px' }
    );
    sections.forEach(s => observer.observe(s));
    return () => {
      observer.disconnect();
      sections.forEach(s => s.classList.remove(PAUSED));
    };
  }, [enabled]);
};
