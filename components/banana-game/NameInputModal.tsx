import React, { useState, useEffect, useRef } from 'react';

interface NameInputModalProps {
  isOpen: boolean;
  score: number;
  onSubmit: (name: string) => void;
  onSkip: () => void;
}

export const NameInputModal: React.FC<NameInputModalProps> = ({
  isOpen,
  score,
  onSubmit,
  onSkip,
}) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name.trim() || 'Anonymous');
    setName('');
  };

  const handleSkip = () => {
    onSkip();
    setName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-4 border-yellow-300">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ハイスコア達成！
          </h2>
          <div className="text-3xl font-bold text-orange-600 mb-4">
            {score} points
          </div>
          <p className="text-gray-600">
            ランキングに登録するお名前を入力してください
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="お名前を入力 (省略可)"
              maxLength={20}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg text-center focus:border-yellow-400 focus:outline-none"
            />
            <div className="text-sm text-gray-500 mt-2 text-center">
              {name.length}/20文字
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
            >
              スキップ
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-yellow-400 text-gray-800 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              登録
            </button>
          </div>
        </form>

        <div className="text-xs text-gray-400 text-center mt-4">
          Enterキーで登録、Escapeキーでスキップ
        </div>
      </div>
    </div>
  );
};

// キーボードイベント処理用のカスタムフック
export const useNameInputModal = (
  isOpen: boolean,
  onSubmit: () => void,
  onSkip: () => void
) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onSubmit, onSkip]);
};