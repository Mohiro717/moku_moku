import type { BananaPosition, GameDimensions } from '../types/bananaGame';
import { BANANA_GAME_CONFIG } from '../constants/bananaGameConfig';

export const generateRandomBananaPosition = (dimensions: GameDimensions): BananaPosition => {
  const maxX = dimensions.width - BANANA_GAME_CONFIG.BANANA_SIZE;
  const maxY = dimensions.height - BANANA_GAME_CONFIG.BANANA_SIZE;
  
  return {
    x: Math.random() * maxX,
    y: Math.random() * maxY,
  };
};

export const getInitialBananaPosition = (dimensions: GameDimensions): BananaPosition => {
  return {
    x: (dimensions.width / 2) - (BANANA_GAME_CONFIG.BANANA_SIZE / 2),
    y: (dimensions.height / 2) - (BANANA_GAME_CONFIG.BANANA_SIZE / 2),
  };
};

export const getGameDimensions = (isMobile: boolean): GameDimensions => {
  return {
    width: isMobile ? BANANA_GAME_CONFIG.GAME_AREA_WIDTH_MOBILE : BANANA_GAME_CONFIG.GAME_AREA_WIDTH,
    height: isMobile ? BANANA_GAME_CONFIG.GAME_AREA_HEIGHT_MOBILE : BANANA_GAME_CONFIG.GAME_AREA_HEIGHT,
  };
};