export const COLORS = {
  ivory: '#f8f4e9',
  coffeeDark: '#3b2f2f',
  coffeeMid: '#5a3a22',
  coffeeLight: '#d2b48c',
  pastelBlue: '#e0f7fa',
  vividPink: '#ff5d8f',
  vividGreen: '#00c9a7'
} as const;

export const NAVIGATION_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'mokopi', label: 'Mocopi' },
  { id: 'works', label: 'Works' },
  { id: 'game', label: 'Game' }
] as const;

export const SITE_CONFIG = {
  title: 'Moku Moku House',
  heroTitle: 'Welcome to Moku Moku House',
  heroSubtitle: 'クリエイターが静かに、もくもくと創作する場所',
  aboutTitle: 'What is Moku Moku House?',
  aboutDescription: `Moku Moku Houseは、デザイナー、イラストレーター、プログラマー、ライターなど、
あらゆる分野のクリエイターが集まる特別な場所です。

静かなカフェのような心地よい空間で、それぞれが「もくもく」と集中して
創作活動に取り組むことができるコミュニティです。

一人で作業しながらも、同じ志を持つクリエイター仲間の存在を感じられる、
そんな温かくて居心地の良い空間を提供しています。`,
  mokopiTitle: 'Meet Mocopi',
  mokopiDescription: `こんにちは！私はもこぴです 🐑

Moku Moku Houseのマスコットとして、
みなさんの創作活動をそっと見守っています。

集中したいときは静かに、
息抜きが必要なときは一緒にほっこりしましょう。

クリエイターのみなさんが心地よく過ごせるよう、
いつでもお手伝いしますよ！`,
  worksTitle: "Creator's Works",
  gameTitle: "A New Game is Coming Soon!",
  gameDescription: "新しいミニゲームを準備中です！お楽しみに！"
} as const;

export const SAMPLE_WORKS = [
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