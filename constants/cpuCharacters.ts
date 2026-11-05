import type { GameDifficulty } from '../types/game';

// CPU 対戦の相手キャラ。『月蝕綺譚 -Luna Occulta-』の二次創作ガイドラインに沿って使う（非公式）。
// 絵とカットインは公式の素材蔵から直接読む（素材そのものは同梱しない）。
// 台詞は各キャラの公開設定（一人称・呼び方・口調）に合わせてこのゲーム用に書いたもの。

export type CpuLineKind = 'intro' | 'attack' | 'attacked' | 'win' | 'lose';

export interface CpuCharacter {
  name: string;
  kana: string;
  tagline: string;
  icon: string;
  /** 大きな連鎖のたびに、この順で1本ずつ流す */
  cutins: string[];
  lines: Record<CpuLineKind, string>;
}

const CANON = 'https://vibe.co.jp/luna-occulta/media/img/canon';
const ULT = 'https://kura.vibe.co.jp/ult';

export const FANWORKS_URL = 'https://vibe.co.jp/luna-occulta/fanworks';

/** この連鎖数（消えた回数）に届いたらカットインを出す */
export const CUTIN_MIN_CHAIN = 3;
export const CUTIN_DURATION_MS = 2400;

export const CPU_CHARACTERS: Record<GameDifficulty, CpuCharacter> = {
  easy: {
    name: '於兎',
    kana: 'おと',
    tagline: '甲賀・土',
    icon: `${CANON}/oto_icon.webp`,
    cutins: [1, 2, 3, 4].map(n => `${ULT}/cutin_anim_oto_s${n}_v3.webp`).concat(`${ULT}/cutin_anim_oto_s5_v5.webp`),
    lines: {
      intro: 'あるじどの、いっしょに遊ぼ？ 負けないもん',
      attack: 'えいっ！ 地面ごと、揺らしちゃうよ？',
      attacked: 'わわっ、そんなの、ずるいもん……！',
      win: 'やったぁ！ あるじどの、もう一回やる？',
      lose: 'むぅ……。つぎは、負けない、もん'
    }
  },
  normal: {
    name: '咲耶',
    kana: 'さくや',
    tagline: '甲賀・火',
    icon: `${CANON}/sakuya_icon.webp`,
    cutins: [
      `${ULT}/cutin_anim_sakuya_s1_v3.webp`,
      `${ULT}/cutin_anim_sakuya_s2_v4.webp`,
      `${ULT}/cutin_anim_sakuya_s3_v3.webp`,
      `${ULT}/cutin_anim_sakuya_s4_v3.webp`,
      `${ULT}/cutin_anim_sakuya_s5_v3.webp`
    ],
    lines: {
      intro: 'あんたとの手合わせ、楽しみにしてたんだよね',
      attack: 'いくよっ！ 緋桜、受けてみな！',
      attacked: 'やるじゃん、あんた！ でも、まだまだでしょ',
      win: 'あたしの勝ち！ ……いい勝負だったよ',
      lose: 'くっ……あんたの勝ちだよ。次は負けないからね'
    }
  },
  hard: {
    name: 'ナルカ',
    kana: 'なるか',
    tagline: '伊賀・木',
    icon: `${CANON}/naruka_icon.webp`,
    cutins: [
      `${ULT}/cutin_anim_naruka_s1_v3.webp`,
      `${ULT}/cutin_anim_naruka_s2_v3.webp`,
      `${ULT}/cutin_anim_naruka_s3_v4.webp`,
      `${ULT}/cutin_anim_naruka_s4_v3.webp`,
      `${ULT}/cutin_anim_naruka_s5_v3.webp`
    ],
    lines: {
      intro: 'わたくしに挑むおつもり？ よろしくてよ。上から全部、見えていますわ',
      attack: 'わたくしの空からは、すべて丸見えでしてよ！',
      attacked: 'あら……少しはやりますのね',
      win: '当然の結果ですわ。……コツなら、特別に教えて差し上げてもよろしくてよ？',
      lose: '……っ、み、認めて差し上げますわ。あなた、なかなかでしてよ'
    }
  }
};

