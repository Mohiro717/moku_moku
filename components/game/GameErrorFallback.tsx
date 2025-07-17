import React from 'react';
import { Button } from '../ui/Button';

interface GameErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

export const GameErrorFallback: React.FC<GameErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-coffee-light/20 rounded-lg">
      <div className="text-coffee-dark text-center">
        <div className="text-4xl mb-4">🎮💥</div>
        <h2 className="text-xl font-bold mb-4">ゲームエラー</h2>
        <p className="text-coffee-mid mb-4">
          ゲームで問題が発生しました。
        </p>
        <div className="space-y-2">
          <Button onClick={resetError} variant="primary" size="md">
            ゲームを再開
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="secondary" 
            size="sm"
          >
            ページを再読み込み
          </Button>
        </div>
        {error && (
          <details className="mt-4 text-left text-xs text-coffee-dark/60">
            <summary className="cursor-pointer">エラー詳細</summary>
            <pre className="mt-2 p-2 bg-coffee-dark/10 rounded text-xs overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};