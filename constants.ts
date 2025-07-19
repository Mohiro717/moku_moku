import type { Work } from './types';

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
  worksTitle: "Creator's Works",
  gameTitle: "Game",
  gameDescription: "新しいミニゲームを準備中です！お楽しみに！"
} as const;

// Sample Works Data
export const SAMPLE_WORKS: readonly Work[] = [
  {
    id: 1,
    title: 'Peaceful Workspace Design',
    author: 'Yuki Tanaka',
    category: 'UI/UX Design',
    description: 'クリエイターのための静かで集中できるワークスペースのデザイン提案',
    image: '/api/placeholder/300/200',
    color: 'vivid-pink'
  },
  {
    id: 2,
    title: 'Mokumoku Study App',
    author: 'Hiroshi Sato',
    category: 'App Development',
    description: '集中して学習できるポモドーロタイマー付きアプリケーション',
    image: '/api/placeholder/300/200',
    color: 'vivid-green'
  },
  {
    id: 3,
    title: 'Coffee & Code Illustrations',
    author: 'Emi Watanabe',
    category: 'Illustration',
    description: 'カフェで働くプログラマーをテーマにした温かみのあるイラストシリーズ',
    image: '/api/placeholder/300/200',
    color: 'coffee-light'
  },
  {
    id: 4,
    title: 'Focus Music Collection',
    author: 'Kenji Nakamura',
    category: 'Music',
    description: '集中力を高める環境音楽とアンビエントサウンドのコレクション',
    image: '/api/placeholder/300/200',
    color: 'vivid-pink'
  },
  {
    id: 5,
    title: 'Creative Writing Workshop',
    author: 'Ayaka Yoshida',
    category: 'Writing',
    description: 'クリエイターのためのストーリーテリングとライティング技法',
    image: '/api/placeholder/300/200',
    color: 'vivid-green'
  },
  {
    id: 6,
    title: 'Minimalist Productivity Tools',
    author: 'Takeshi Yamamoto',
    category: 'Product Design',
    description: 'シンプルで美しい生産性向上ツールのデザインコンセプト',
    image: '/api/placeholder/300/200',
    color: 'coffee-light'
  }
] as const;