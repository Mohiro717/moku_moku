import type { Work, FortniteCreator } from './types';

// Theme Colors
export const COLORS = {
  ivory: '#f8f4e9',
  coffeeDark: '#3b2f2f',
  coffeeMid: '#5a3a22',
  coffeeLight: '#d2b48c',
  pastelBlue: '#e0f7fa',
  vividPink: '#ff5d8f',
  vividGreen: '#00c9a7'
} as const;

// Navigation Configuration
export const NAVIGATION_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'mokopi', label: 'Mocopi' },
  { id: 'works', label: 'Works' },
  { id: 'game', label: 'Game' }
] as const;

// Site Content Configuration
export const SITE_CONFIG = {
  title: 'Moku Moku House',
  heroTitle: 'Welcome to Moku Moku House',
  heroSubtitle: 'クリエイターが静かに、もくもくと創作する場所',
  aboutTitle: 'What is Moku Moku House?',
  aboutDescription: `Moku Moku Houseは、 あらゆる分野のクリエイターが集まる特別な場所です。

静かなカフェのような心地よい空間で、それぞれが「もくもく」と集中して 創作活動に取り組むことができるコミュニティです。

一人で作業しながらも、様々な志を持つクリエイター仲間の存在を感じられる、 お互いに刺激し合える、そんな温かくて居心地の良い空間を提供しています。`,






  mokopiTitle: 'Meet Mocopi',


  
  mokopiDescription: `もこもこしてて電波ピピッ🐏☁⚡の「もこぴ」だよ♪




みなさんの創作活動を、ゆる～く見守っていま～す。

集中したいときは、しーっ…て静かに。

ひとやすみしたくなったら、一緒にまったりしましょうねぇ♪




みなさんが、にこにこで過ごせるように、いつでも応援してるよ～`,
  worksTitle: "Fortnite Creators",
  gameTitle: "Game",
  gameDescription: "新しいミニゲームを準備中です！お楽しみに！"
} as const;

// Fortnite Creators Data
export const FORTNITE_CREATORS: readonly FortniteCreator[] = [
  {
    id: 1,
    name: '柏木まさみ',
    fortniteUrl: 'https://www.fortnite.com/@masami_k?lang=ja',
    category: 'Creative Builder',
    description: 'Fortniteクリエイティブで素晴らしいマップを制作するクリエイター',
    color: 'vivid-pink'
  },
  {
    id: 2,
    name: 'だいすけ',
    fortniteUrl: 'https://www.fortnite.com/@daisukevlad?lang=ja',
    category: 'Map Creator',
    description: '独創的なアイデアでプレイヤーを楽しませるマップクリエイター',
    color: 'vivid-green'
  },
  {
    id: 3,
    name: 'T.GRAPH',
    fortniteUrl: 'https://www.fortnite.com/@t.graph?lang=ja',
    category: 'Visual Designer',
    description: 'ビジュアル重視の美しいクリエイティブマップを手がける',
    color: 'coffee-light'
  },
  {
    id: 4,
    name: 'タカオ',
    fortniteUrl: 'https://www.fortnite.com/@takao417?lang=ja',
    category: 'Game Designer',
    description: '面白いゲームシステムを考案するゲームデザイナー',
    color: 'vivid-pink'
  },
  {
    id: 5,
    name: 'Mohiro',
    fortniteUrl: 'https://www.fortnite.com/@mohiro?lang=ja',
    category: 'Creative Developer',
    description: 'プログラミング的思考でクリエイティブマップを開発',
    color: 'vivid-green'
  },
  {
    id: 6,
    name: 'YusukeN',
    fortniteUrl: 'https://www.fortnite.com/@yusuken?lang=ja',
    category: 'Adventure Creator',
    description: 'アドベンチャー要素満載のマップ制作が得意',
    color: 'coffee-light'
  },
  {
    id: 7,
    name: 'ねずみまる',
    fortniteUrl: 'https://www.fortnite.com/@nezumimaru?lang=ja',
    category: 'Puzzle Master',
    description: '頭を使うパズル系マップのスペシャリスト',
    color: 'vivid-pink'
  },
  {
    id: 8,
    name: 'やまぽん',
    fortniteUrl: 'https://www.fortnite.com/@yama_pon',
    category: 'Action Creator',
    description: 'アクション満載のスリリングなマップを制作',
    color: 'vivid-green'
  },
  {
    id: 9,
    name: 'はこぶ',
    fortniteUrl: 'https://www.fortnite.com/@hakobu?lang=ja',
    category: 'Story Teller',
    description: 'ストーリー性豊かなマップで感動を提供',
    color: 'coffee-light'
  },
  {
    id: 10,
    name: 'moly',
    fortniteUrl: 'https://www.fortnite.com/@bgl/6332-5843-8603',
    category: 'Experimental',
    description: '実験的で革新的なマップコンセプトを追求',
    color: 'vivid-pink'
  },
  {
    id: 11,
    name: 'piyo',
    fortniteUrl: 'https://www.fortnite.com/@piyo1453?lang=ja',
    category: 'Fun Creator',
    description: '楽しさを最優先にしたエンターテイメントマップ',
    color: 'vivid-green'
  },
  {
    id: 12,
    name: 'カバ姫',
    fortniteUrl: 'https://www.fortnite.com/@yokkun?lang=ja',
    category: 'Artistic Builder',
    description: 'アーティスティックで美しいマップ空間をデザイン',
    color: 'coffee-light'
  },
  {
    id: 13,
    name: 'ゆーにん/Younin',
    fortniteUrl: 'https://www.fortnite.com/@bgl/2155-3261-9371?lang=ja',
    category: 'Technical Creator',
    description: '技術的に高度なシステムを駆使したマップ制作',
    color: 'vivid-pink'
  },
  {
    id: 14,
    name: 'TaE',
    fortniteUrl: 'https://www.fortnite.com/@taeeee.u_u?lang=ja',
    category: 'Creative Artist',
    description: 'クリエイティブな発想で独特な世界観を表現',
    color: 'vivid-green'
  },
  {
    id: 15,
    name: 'Kudo',
    fortniteUrl: 'https://www.fortnite.com/@kudogames?lang=ja',
    category: 'Game Creator',
    description: 'ゲーム性重視の完成度の高いマップを開発',
    color: 'coffee-light'
  },
  {
    id: 16,
    name: 'カニいちろう',
    fortniteUrl: 'https://www.fortnite.com/@koichiro?lang=ja',
    category: 'Comedy Creator',
    description: 'ユーモアあふれる楽しいマップでプレイヤーを笑顔に',
    color: 'vivid-pink'
  },
  {
    id: 17,
    name: 'mikkeみっけ',
    fortniteUrl: 'https://www.fortnite.com/@bgl-mikke?lang=ja',
    category: 'Discovery Creator',
    description: '探索要素豊富なマップで新しい発見を提供',
    color: 'vivid-green'
  },
  {
    id: 18,
    name: 'メタメタのぶくん',
    fortniteUrl: 'https://www.fortnite.com/@nobukun?lang=ja',
    category: 'Meta Creator',
    description: 'メタ的な要素を取り入れた斬新なマップコンセプト',
    color: 'coffee-light'
  },
  {
    id: 19,
    name: 'A-HEM(えっへん)',
    fortniteUrl: 'https://www.fortnite.com/@a-hem?lang=ja',
    category: 'Entertainment',
    description: 'エンターテイメント性抜群の盛り上がるマップ',
    color: 'vivid-pink'
  },
  {
    id: 20,
    name: 'エドワイズ',
    fortniteUrl: 'https://www.fortnite.com/@edwise',
    category: 'Educational',
    description: '学びながら楽しめる教育的要素を含むマップ制作',
    color: 'vivid-green'
  }
] as const;

// Backward compatibility - keeping old export for gradual migration
export const SAMPLE_WORKS: readonly Work[] = [] as const;