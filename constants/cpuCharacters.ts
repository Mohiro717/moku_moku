import { CPU_CHARACTER_DATA } from './cpuCharacterData';

// CPU 対戦の相手キャラ。『月蝕綺譚 -Luna Occulta-』の二次創作ガイドラインに沿って使う（非公式）。
// 絵とカットインは公式の素材蔵から直接読む（素材そのものは同梱しない）。
// 台詞は各キャラの公開設定（一人称・呼び方・口調）に合わせてこのゲーム用に書いたもの。
// BGM は公式の楽曲（ゲームの BGM に使ってよい）を直接読む。テーマ曲のないキャラはタイトル曲かエンディング曲。
// ボイスは公式の声の見本を参照に Irodori-TTS で作り、public/audio/voice/ に置いた。
// 見本が ElevenLabs などの声 ID だけのキャラは、設定文から声を作った（公式の声ではない）。
// 16人の中身は cpuCharacterData.ts。

export type CpuLineKind = 'intro' | 'attack' | 'attacked' | 'damaged' | 'pinch' | 'win' | 'lose';

export interface CpuCharacter {
  /** ボイスのファイル名の頭 */
  id: string;
  name: string;
  kana: string;
  tagline: string;
  icon: string;
  /** 大きな連鎖のたびに、この順で1本ずつ流す */
  cutins: string[];
  bgm: string;
  /** 場面ごとの台詞。言うたびにこの中から選ぶ */
  lines: Record<CpuLineKind, string[]>;
  /** 連鎖の掛け声。1連鎖目から順に、最後の1本はそれ以上の段でも使う */
  chain: string[];
}

export const FANWORKS_URL = 'https://vibe.co.jp/luna-occulta/fanworks';

/** この連鎖数（消えた回数）に届いたらカットインを出す */
export const CUTIN_MIN_CHAIN = 3;
export const CUTIN_DURATION_MS = 2400;

export const LINE_KINDS: CpuLineKind[] = ['intro', 'attack', 'attacked', 'damaged', 'pinch', 'win', 'lose'];

export const CPU_CHARACTERS: CpuCharacter[] = CPU_CHARACTER_DATA;
export const DEFAULT_CHARACTER_ID = 'sakuya';

export const characterById = (id: string) =>
  CPU_CHARACTERS.find(c => c.id === id) ?? CPU_CHARACTERS[0];

const VOICE_DIR = `${import.meta.env.BASE_URL}audio/voice`;

/** n は lines[kind] の何本目か（0始まり） */
export const voiceOf = (character: CpuCharacter, kind: CpuLineKind, n: number) =>
  `${VOICE_DIR}/${character.id}_${kind}_${n + 1}.mp3`;

/** step は連鎖の段（1始まり）。掛け声の本数を超えた段は最後の1本 */
export const chainVoiceOf = (character: CpuCharacter, step: number) =>
  `${VOICE_DIR}/${character.id}_chain${Math.min(Math.max(step, 1), character.chain.length)}.mp3`;

export const allVoicesOf = (character: CpuCharacter) => [
  ...LINE_KINDS.flatMap(kind => character.lines[kind].map((_, n) => voiceOf(character, kind, n))),
  ...character.chain.map((_, i) => chainVoiceOf(character, i + 1))
];
