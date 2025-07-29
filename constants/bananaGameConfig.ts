import type { GameConfig } from '../types/bananaGame';

export const BANANA_GAME_CONFIG: GameConfig = {
  GAME_DURATION: 30,
  GAME_AREA_WIDTH: 500,
  GAME_AREA_HEIGHT: 300,
  GAME_AREA_WIDTH_MOBILE: 280,
  GAME_AREA_HEIGHT_MOBILE: 240,
  BANANA_SIZE: 32,
} as const;