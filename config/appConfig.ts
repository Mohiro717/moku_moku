// アプリケーション全体の設定管理

// 環境変数の型安全な取得
interface EnvironmentConfig {
  convexUrl: string | null;
  isDevelopment: boolean;
  isProduction: boolean;
  baseUrl: string;
}

// 環境設定を取得
const getEnvironmentConfig = (): EnvironmentConfig => {
  const convexUrl = import.meta.env.VITE_CONVEX_URL;
  const mode = import.meta.env.MODE;
  
  return {
    convexUrl: convexUrl && !convexUrl.includes('your-deployment') ? convexUrl : null,
    isDevelopment: mode === 'development',
    isProduction: mode === 'production',
    baseUrl: import.meta.env.BASE_URL || '/',
  };
};

// ゲーム共通設定
export interface GameConfig {
  maxPlayerNameLength: number;
  minScoreForRanking: number;
  maxRankingEntries: number;
  autoSaveInterval: number;
}

// バナナゲーム固有設定
export interface BananaGameConfig {
  gameDuration: number;
  gameAreaWidth: number;
  gameAreaHeight: number;
  gameAreaWidthMobile: number;
  gameAreaHeightMobile: number;
  bananaSize: number;
  pointsPerBanana: number;
}

// ランキング設定
export interface RankingConfig {
  maxEntries: number;
  enableFallback: boolean;
  retryAttempts: number;
  retryDelay: number;
  enableGlobalRanking: boolean;
}

// UI設定
export interface UIConfig {
  animationDuration: number;
  toastDuration: number;
  modalZIndex: number;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

// アプリケーション設定のマスタークラス
class AppConfigManager {
  private static instance: AppConfigManager;
  private envConfig: EnvironmentConfig;

  private constructor() {
    this.envConfig = getEnvironmentConfig();
  }

  public static getInstance(): AppConfigManager {
    if (!AppConfigManager.instance) {
      AppConfigManager.instance = new AppConfigManager();
    }
    return AppConfigManager.instance;
  }

  // 環境設定の取得
  public getEnvironment(): EnvironmentConfig {
    return { ...this.envConfig };
  }

  // ゲーム共通設定
  public getGameConfig(): GameConfig {
    return {
      maxPlayerNameLength: 20,
      minScoreForRanking: 1,
      maxRankingEntries: 10,
      autoSaveInterval: 30000, // 30秒
    };
  }

  // バナナゲーム設定
  public getBananaGameConfig(): BananaGameConfig {
    return {
      gameDuration: 30, // 30秒
      gameAreaWidth: 400,
      gameAreaHeight: 300,
      gameAreaWidthMobile: 350,
      gameAreaHeightMobile: 250,
      bananaSize: 40,
      pointsPerBanana: 1,
    };
  }

  // ランキング設定
  public getRankingConfig(): RankingConfig {
    return {
      maxEntries: 10,
      enableFallback: true,
      retryAttempts: 3,
      retryDelay: 1000,
      enableGlobalRanking: this.envConfig.convexUrl !== null,
    };
  }

  // UI設定
  public getUIConfig(): UIConfig {
    return {
      animationDuration: 300,
      toastDuration: 3000,
      modalZIndex: 1000,
      breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1440,
      },
    };
  }

  // Convex設定の確認
  public isConvexConfigured(): boolean {
    return this.envConfig.convexUrl !== null;
  }

  // 開発モードの確認
  public isDevelopment(): boolean {
    return this.envConfig.isDevelopment;
  }

  // プロダクションモードの確認
  public isProduction(): boolean {
    return this.envConfig.isProduction;
  }

  // デバッグログの有効性
  public isDebugEnabled(): boolean {
    return this.envConfig.isDevelopment;
  }

  // 設定の妥当性検証
  public validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 必要な環境変数のチェック
    if (this.envConfig.isProduction && !this.envConfig.convexUrl) {
      errors.push('Production環境でConvex URLが設定されていません');
    }

    // ゲーム設定の妥当性チェック
    const gameConfig = this.getGameConfig();
    if (gameConfig.maxPlayerNameLength <= 0) {
      errors.push('プレイヤー名の最大長が不正です');
    }

    const bananaGameConfig = this.getBananaGameConfig();
    if (bananaGameConfig.gameDuration <= 0) {
      errors.push('ゲーム時間が不正です');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// シングルトンインスタンスをエクスポート
export const appConfig = AppConfigManager.getInstance();

// 便利な関数をエクスポート
export const isConvexConfigured = () => appConfig.isConvexConfigured();
export const isDevelopment = () => appConfig.isDevelopment();
export const isProduction = () => appConfig.isProduction();
export const isDebugEnabled = () => appConfig.isDebugEnabled();