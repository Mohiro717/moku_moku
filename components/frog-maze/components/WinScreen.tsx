import React from 'react';

interface WinScreenProps {
  message: string;
  onRestart: () => void;
}

export const WinScreen: React.FC<WinScreenProps> = ({ message, onRestart }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-yellow-600 mb-4 text-glow" style={{ fontFamily: 'Yomogi, cursive' }}>
          🎉 しょうり！ 🎉
        </h2>
        <p className="text-lg text-orange-600" style={{ fontFamily: 'Yomogi, cursive' }}>
          おめでとうございます！
        </p>
      </div>
      
      <div className="bg-white/70 rounded-2xl p-6 mb-8 border-2 border-yellow-100">
        <div 
          className="text-gray-700 leading-relaxed whitespace-pre-line text-center"
          style={{ fontFamily: 'Yomogi, cursive' }}
        >
          {message}
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-bold text-lg hover:from-yellow-500 hover:to-orange-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          style={{ fontFamily: 'Yomogi, cursive' }}
        >
          ✨ もういちどあそぶ ✨
        </button>
      </div>
    </div>
  );
};