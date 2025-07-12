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
  { id: 'mokopi', label: 'Mokopi' },
  { id: 'works', label: 'Works' },
  { id: 'game', label: 'Game' }
] as const;

export const SITE_CONFIG = {
  title: 'Moku Moku House',
  tagline: 'クリエイターが静かに、もくもくと創作する場所',
  description: 'デザイナー、イラストレーター、プログラマー、ライターなど、あらゆる分野のクリエイターが集まって、静かにもくもくと創作活動を行う、居心地の良いコミュニティスペースです。'
} as const;

export const PROJECTS = [
  {
    id: 1,
    title: 'Creative Design Portfolio',
    description: 'モダンなUIデザインとブランディング',
    category: 'Design',
    accentColor: 'vivid-pink'
  },
  {
    id: 2,
    title: 'Interactive Web Experience',
    description: 'React & TypeScriptによるウェブアプリケーション',
    category: 'Development',
    accentColor: 'vivid-green'
  },
  {
    id: 3,
    title: 'Illustration Series',
    description: 'キャラクターデザインとイラストレーション',
    category: 'Art',
    accentColor: 'coffee-light'
  }
] as const;