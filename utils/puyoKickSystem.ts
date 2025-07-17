import type { PuyoCell, PuyoPair } from '../types/game';
import { GAME_CONFIG, getPairPositions, isValidPosition } from './puyoGameLogic';

/**
 * Kick system for Puyo Puyo rotation mechanics
 * Implements wall kicks and rotation kicks for smoother gameplay
 */

export interface KickResult {
  success: boolean;
  kickedPair: PuyoPair | null;
  kickType: 'none' | 'wall' | 'rotation';
  kickDirection: 'left' | 'right' | 'none';
}

/**
 * Attempts to rotate a pair with kick system
 * @param pair - Current pair to rotate
 * @param grid - Current game grid
 * @param clockwise - Direction of rotation (true = clockwise, false = counter-clockwise)
 * @returns Result of the rotation attempt with kick information
 */
export const attemptRotationWithKick = (
  pair: PuyoPair,
  grid: PuyoCell[][],
  clockwise: boolean = true
): KickResult => {
  const rotationDelta = clockwise ? 1 : -1;
  const newRotation = (pair.rotation + rotationDelta + 4) % 4;
  
  // Try basic rotation first
  const basicRotatedPair: PuyoPair = {
    ...pair,
    rotation: newRotation
  };
  
  const basicPositions = getPairPositions(basicRotatedPair);
  if (isValidPosition(basicPositions.main, grid) && isValidPosition(basicPositions.sub, grid)) {
    return {
      success: true,
      kickedPair: basicRotatedPair,
      kickType: 'none',
      kickDirection: 'none'
    };
  }
  
  // Basic rotation failed, try kick system
  return attemptKickRotation(pair, grid, newRotation, clockwise);
};

/**
 * Attempts kick rotation when basic rotation fails
 */
const attemptKickRotation = (
  pair: PuyoPair,
  grid: PuyoCell[][],
  newRotation: number,
  clockwise: boolean
): KickResult => {
  const rotatedPair: PuyoPair = {
    ...pair,
    rotation: newRotation
  };
  
  // Try wall kicks first (more predictable)
  const wallKickResult = attemptWallKick(rotatedPair, grid, clockwise);
  if (wallKickResult.success) {
    return wallKickResult;
  }
  
  // Try rotation kicks against existing puyos
  const rotationKickResult = attemptRotationKick(rotatedPair, grid, clockwise);
  if (rotationKickResult.success) {
    return rotationKickResult;
  }
  
  return {
    success: false,
    kickedPair: null,
    kickType: 'none',
    kickDirection: 'none'
  };
};

/**
 * Attempts wall kick when rotation hits wall
 */
const attemptWallKick = (
  pair: PuyoPair,
  grid: PuyoCell[][],
  clockwise: boolean
): KickResult => {
  const positions = getPairPositions(pair);
  
  // Check if we're hitting left or right wall
  const hitLeftWall = positions.main.x < 0 || positions.sub.x < 0;
  const hitRightWall = positions.main.x >= GAME_CONFIG.gridWidth || positions.sub.x >= GAME_CONFIG.gridWidth;
  
  if (!hitLeftWall && !hitRightWall) {
    return {
      success: false,
      kickedPair: null,
      kickType: 'none',
      kickDirection: 'none'
    };
  }
  
  // Determine kick direction and amount
  let kickDirection: 'left' | 'right' = 'none' as any;
  let kickAmount = 0;
  
  if (hitLeftWall) {
    // Hit left wall, kick right
    kickDirection = 'right';
    kickAmount = Math.max(
      positions.main.x < 0 ? -positions.main.x : 0,
      positions.sub.x < 0 ? -positions.sub.x : 0
    );
  } else if (hitRightWall) {
    // Hit right wall, kick left  
    kickDirection = 'left';
    kickAmount = Math.max(
      positions.main.x >= GAME_CONFIG.gridWidth ? positions.main.x - GAME_CONFIG.gridWidth + 1 : 0,
      positions.sub.x >= GAME_CONFIG.gridWidth ? positions.sub.x - GAME_CONFIG.gridWidth + 1 : 0
    );
  }
  
  // Apply kick
  const kickedPair: PuyoPair = {
    ...pair,
    x: kickDirection === 'right' ? pair.x + kickAmount : pair.x - kickAmount
  };
  
  // Validate kicked position
  const kickedPositions = getPairPositions(kickedPair);
  if (isValidPosition(kickedPositions.main, grid) && isValidPosition(kickedPositions.sub, grid)) {
    return {
      success: true,
      kickedPair,
      kickType: 'wall',
      kickDirection
    };
  }
  
  return {
    success: false,
    kickedPair: null,
    kickType: 'none',
    kickDirection: 'none'
  };
};

/**
 * Attempts rotation kick against existing puyos
 */
const attemptRotationKick = (
  pair: PuyoPair,
  grid: PuyoCell[][],
  clockwise: boolean
): KickResult => {
  const positions = getPairPositions(pair);
  
  // Check if collision is with existing puyos (not walls or out of bounds)
  const mainHitsPuyo = positions.main.x >= 0 && positions.main.x < GAME_CONFIG.gridWidth && 
                       positions.main.y >= 0 && positions.main.y < GAME_CONFIG.gridHeight &&
                       grid[positions.main.y][positions.main.x].color !== null;
  
  const subHitsPuyo = positions.sub.x >= 0 && positions.sub.x < GAME_CONFIG.gridWidth && 
                      positions.sub.y >= 0 && positions.sub.y < GAME_CONFIG.gridHeight &&
                      grid[positions.sub.y][positions.sub.x].color !== null;
  
  if (!mainHitsPuyo && !subHitsPuyo) {
    return {
      success: false,
      kickedPair: null,
      kickType: 'none',
      kickDirection: 'none'
    };
  }
  
  // Determine which direction to kick based on collision
  const kickDirections: Array<'left' | 'right'> = [];
  
  // If main puyo hits, try to kick away from it
  if (mainHitsPuyo) {
    // Try both directions, but prefer the direction that moves away from collision
    kickDirections.push('right', 'left');
  }
  
  // If sub puyo hits, try to kick away from it
  if (subHitsPuyo) {
    // Try both directions, but prefer the direction that moves away from collision
    kickDirections.push('left', 'right');
  }
  
  // Remove duplicates and try each direction
  const uniqueDirections = [...new Set(kickDirections)];
  
  for (const kickDirection of uniqueDirections) {
    const kickAmount = 1;
    const kickedPair: PuyoPair = {
      ...pair,
      x: kickDirection === 'right' ? pair.x + kickAmount : pair.x - kickAmount
    };
    
    // Validate kicked position
    const kickedPositions = getPairPositions(kickedPair);
    
    // Check if kicked position is valid and within bounds
    if (kickedPair.x >= 0 && kickedPair.x < GAME_CONFIG.gridWidth &&
        isValidPosition(kickedPositions.main, grid) && isValidPosition(kickedPositions.sub, grid)) {
      return {
        success: true,
        kickedPair,
        kickType: 'rotation',
        kickDirection
      };
    }
  }
  
  return {
    success: false,
    kickedPair: null,
    kickType: 'none',
    kickDirection: 'none'
  };
};

/**
 * Enhanced rotation function that handles wall kicks and rotation kicks
 * This function will be called by the rotation handler
 */
export const canPlacePairWithKick = (
  pair: PuyoPair,
  grid: PuyoCell[][]
): { canPlace: boolean; kickedPair: PuyoPair | null } => {
  const positions = getPairPositions(pair);
  
  // Check if basic placement is valid
  if (isValidPosition(positions.main, grid) && isValidPosition(positions.sub, grid)) {
    return { canPlace: true, kickedPair: pair };
  }
  
  // Try kick system for placement
  const kickResult = attemptRotationWithKick(pair, grid, true);
  return { 
    canPlace: kickResult.success, 
    kickedPair: kickResult.kickedPair 
  };
};