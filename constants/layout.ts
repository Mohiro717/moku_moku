/** ぬばたま落とし単独サイト（vite --mode nubatama）のビルドか。もくもくハウスでは false */
export const IS_STANDALONE = import.meta.env.MODE === 'nubatama';

/**
 * 固定ヘッダー（Header.tsx の h-20 = 80px）＋ すき間 8px。ゲームの枠をここまでスクロールすると、ヘッダーに隠れない。
 * ぬばたま落とし単独サイト（vite --mode nubatama）にはヘッダーが無いので、すき間 8px だけ
 */
export const HEADER_OFFSET = IS_STANDALONE ? 8 : 88;

/** 対戦・ひとりであそぶ の見出しにある「もどる」の行き先。単独サイトにはゲームえらびが無く、タイトルへ戻る */
export const BACK_TARGET_LABEL = IS_STANDALONE ? 'タイトルに' : 'ゲームえらびに';
