// 基本的なランキングエントリ型
export interface BaseRankingEntry {
  id: string;
  score: number;
  playerName: string;
  timestamp: number;
  gameType: GameType;
}

// ゲームタイプの定数
export const GAME_TYPES = {
  CATCH_THE_BANANA: 'catch-the-banana',
  PUYO_PUYO: 'puyo-puyo',
  FROG_MAZE: 'frog-maze',
} as const;

export type GameType = typeof GAME_TYPES[keyof typeof GAME_TYPES];

// ランキング関連のエラー型
export class RankingError extends Error {
  constructor(
    message: string,
    public readonly code: RankingErrorCode,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'RankingError';
  }
}

export const RANKING_ERROR_CODES = {
  SAVE_FAILED: 'SAVE_FAILED',
  LOAD_FAILED: 'LOAD_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type RankingErrorCode = typeof RANKING_ERROR_CODES[keyof typeof RANKING_ERROR_CODES];

// スコア投稿のためのパラメータ型
export interface SubmitScoreParams {
  score: number;
  playerName: string;
  gameType: GameType;
}

// ランキング取得のためのパラメータ型
export interface GetRankingsParams {
  gameType: GameType;
  limit?: number;
  offset?: number;
}

// ハイスコア判定のためのパラメータ型
export interface IsHighScoreParams {
  score: number;
  gameType: GameType;
}

// ランキングサービスのレスポンス型
export interface RankingServiceResponse<T> {
  data: T;
  success: boolean;
  error?: RankingError;
}

// ランキングの取得結果型
export interface RankingsResult {
  entries: BaseRankingEntry[];
  totalCount: number;
  isGlobal: boolean;
  lastUpdated: number;
}

// ランキングサービスの設定型
export interface RankingServiceConfig {
  maxEntries: number;
  enableFallback: boolean;
  retryAttempts: number;
  retryDelay: number;
}

// デフォルト設定
export const DEFAULT_RANKING_CONFIG: RankingServiceConfig = {
  maxEntries: 10,
  enableFallback: true,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;