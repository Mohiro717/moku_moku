export enum GameState {
  LOADING = 'LOADING',
  INTRO = 'INTRO',
  PLAYING = 'PLAYING',
  WON = 'WON',
  ERROR = 'ERROR'
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

export interface PlayerPosition {
  x: number;
  y: number;
}

export interface MonsterPosition {
  x: number;
  y: number;
  id: number;
}

export interface TrapPosition {
  x: number;
  y: number;
  revealed: boolean; // 踏んだことがあるかどうか
}