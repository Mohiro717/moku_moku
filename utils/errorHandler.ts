import { RankingError, RANKING_ERROR_CODES, type RankingErrorCode } from '../types/ranking';

// エラーログの管理
export class ErrorLogger {
  private static logs: Array<{
    timestamp: number;
    level: 'error' | 'warn' | 'info';
    message: string;
    context?: any;
  }> = [];

  static log(level: 'error' | 'warn' | 'info', message: string, context?: any) {
    this.logs.push({
      timestamp: Date.now(),
      level,
      message,
      context,
    });

    // コンソールにも出力
    const logMethod = console[level] || console.log;
    logMethod(`[${level.toUpperCase()}] ${message}`, context || '');

    // 最大100件まで保持
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  static getLogs() {
    return [...this.logs];
  }

  static clearLogs() {
    this.logs.length = 0;
  }
}

// ランキング関連のエラーハンドリング
export class RankingErrorHandler {
  static handleSaveError(error: unknown, context?: any): RankingError {
    ErrorLogger.log('error', 'Failed to save ranking score', { error, context });

    if (error instanceof RankingError) {
      return error;
    }

    if (error instanceof Error) {
      // ネットワークエラーの判定
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return new RankingError(
          'ネットワークエラーが発生しました。接続を確認してください。',
          RANKING_ERROR_CODES.NETWORK_ERROR,
          error
        );
      }

      return new RankingError(
        'スコアの保存に失敗しました。',
        RANKING_ERROR_CODES.SAVE_FAILED,
        error
      );
    }

    return new RankingError(
      '予期しないエラーが発生しました。',
      RANKING_ERROR_CODES.SAVE_FAILED
    );
  }

  static handleLoadError(error: unknown, context?: any): RankingError {
    ErrorLogger.log('error', 'Failed to load ranking data', { error, context });

    if (error instanceof RankingError) {
      return error;
    }

    if (error instanceof Error) {
      return new RankingError(
        'ランキングの読み込みに失敗しました。',
        RANKING_ERROR_CODES.LOAD_FAILED,
        error
      );
    }

    return new RankingError(
      'ランキングの読み込み中にエラーが発生しました。',
      RANKING_ERROR_CODES.LOAD_FAILED
    );
  }

  static handleValidationError(message: string): RankingError {
    ErrorLogger.log('warn', 'Validation error', { message });
    
    return new RankingError(
      message,
      RANKING_ERROR_CODES.VALIDATION_ERROR
    );
  }
}

// リトライ機能付きの実行関数
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        ErrorLogger.log('error', `Operation failed after ${maxAttempts} attempts`, {
          error: lastError,
          attempts: maxAttempts,
        });
        throw lastError;
      }

      ErrorLogger.log('warn', `Operation failed, retrying... (${attempt}/${maxAttempts})`, {
        error: lastError,
        attempt,
      });

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // 指数バックオフでリトライ間隔を伸ばす
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }

  throw lastError!;
}

// 安全な実行関数（エラーを捕捉してログに記録）
export function safeExecute<T>(
  operation: () => T,
  fallback: T,
  context?: string
): T {
  try {
    return operation();
  } catch (error) {
    ErrorLogger.log('error', `Safe execution failed: ${context || 'Unknown'}`, error);
    return fallback;
  }
}

// 非同期版の安全な実行関数
export async function safeExecuteAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    ErrorLogger.log('error', `Safe async execution failed: ${context || 'Unknown'}`, error);
    return fallback;
  }
}

// ユーザーフレンドリーなエラーメッセージを生成
export function getUserFriendlyErrorMessage(error: RankingError): string {
  switch (error.code) {
    case RANKING_ERROR_CODES.NETWORK_ERROR:
      return 'インターネット接続を確認してください。';
    case RANKING_ERROR_CODES.SAVE_FAILED:
      return 'スコアの保存に失敗しました。再試行してください。';
    case RANKING_ERROR_CODES.LOAD_FAILED:
      return 'ランキングの読み込みに失敗しました。';
    case RANKING_ERROR_CODES.VALIDATION_ERROR:
      return error.message;
    default:
      return '予期しないエラーが発生しました。';
  }
}