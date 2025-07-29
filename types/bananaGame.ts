// ゲーム状態の基本型
export interface BaseGameState {
  isPlaying: boolean;
  isGameOver: boolean;
  score: number;
  timeLeft: number;
}

// バナナゲーム固有の状態
export interface GameState extends BaseGameState {
  banana: BananaPosition;
  showNameInput: boolean;
  isHighScore: boolean;
}

// ゲーム状態の種類
export const GAME_STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  HIGH_SCORE_INPUT: 'high_score_input',
} as const;

export type GameStateType = typeof GAME_STATES[keyof typeof GAME_STATES];

// ゲーム状態を判定するヘルパー
export const getGameStateType = (state: GameState): GameStateType => {
  if (state.showNameInput) return GAME_STATES.HIGH_SCORE_INPUT;
  if (state.isPlaying) return GAME_STATES.PLAYING;
  if (state.isGameOver) return GAME_STATES.GAME_OVER;
  return GAME_STATES.IDLE;
};

export interface BananaPosition {
  x: number;
  y: number;
}

export interface GameConfig {
  readonly GAME_DURATION: number;
  readonly GAME_AREA_WIDTH: number;
  readonly GAME_AREA_HEIGHT: number;
  readonly GAME_AREA_WIDTH_MOBILE: number;
  readonly GAME_AREA_HEIGHT_MOBILE: number;
  readonly BANANA_SIZE: number;
}

export interface GameDimensions {
  width: number;
  height: number;
}