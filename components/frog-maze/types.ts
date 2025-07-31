export enum GameState {
  INTRO = 'INTRO',
  PLAYING = 'PLAYING',
  WON = 'WON',
}

export type Occupant = 'orb' | 'trap' | null;

export interface Cell {
  x: number;
  y: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
  occupant: Occupant;
}

export type Grid = Cell[][];

export interface Position {
  x: number;
  y: number;
}

export interface PlayerPosition extends Position {}

export interface MonsterPosition extends Position {
  id: number;
}

export interface TrapPosition extends Position {
  revealed: boolean;
}