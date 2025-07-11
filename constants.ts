
import { NavLink, Work } from './types';

export const navLinks: NavLink[] = [
  { id: 'about', label: 'About' },
  { id: 'mokopi', label: 'Mokopi' },
  { id: 'works', label: 'Works' },
  { id: 'game', label: 'Game' },
];

export const worksData: Work[] = [
  {
    id: 1,
    title: 'Forest Spirit Illustration',
    author: 'Eri',
    description: 'A mystical creature in a magical forest, painted with vibrant watercolors.',
    imageUrl: 'https://picsum.photos/seed/work1/600/400',
  },
  {
    id: 2,
    title: 'Minimalist Portfolio Site',
    author: 'Kenji',
    description: 'A clean and fast portfolio website built with React and Tailwind CSS.',
    imageUrl: 'https://picsum.photos/seed/work2/600/400',
  },
  {
    id: 3,
    title: 'Hand-drawn Logo Set',
    author: 'Yuna',
    description: 'A collection of logos for local cafes, featuring organic shapes and a friendly feel.',
    imageUrl: 'https://picsum.photos/seed/work3/600/400',
  },
  {
    id: 4,
    title: 'City at Night',
    author: 'Takuya',
    description: 'A dramatic photograph capturing the neon lights and motion of Tokyo at night.',
    imageUrl: 'https://picsum.photos/seed/work4/600/400',
  },
  {
    id: 5,
    title: 'Short Story "The Last Leaf"',
    author: 'Airi',
    description: 'A touching story about hope and perseverance in the face of adversity.',
    imageUrl: 'https://picsum.photos/seed/work5/600/400',
  },
  {
    id: 6,
    title: 'iOS Weather App UI',
    author: 'Sota',
    description: 'A concept design for a weather application with delightful animations and a clean interface.',
    imageUrl: 'https://picsum.photos/seed/work6/600/400',
  },
];

export const projectBorderColors: string[] = [
  'border-vivid-pink',
  'border-vivid-green',
  'border-pastel-blue',
  'border-coffee-light',
];
