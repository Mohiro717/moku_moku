import React from 'react';

interface IntroScreenProps {
  story: string;
  onStart: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ story, onStart }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-pink-600 mb-4 text-glow" style={{ fontFamily: 'Yomogi, cursive' }}>
          The Frog Princess's Maze
        </h2>
        <p className="text-lg text-purple-600" style={{ fontFamily: 'Yomogi, cursive' }}>
          かえるのおひめさまのだいぼうけん
        </p>
      </div>
      
      <div className="bg-white/70 rounded-2xl p-6 mb-8 border-2 border-pink-100">
        <div 
          className="text-gray-700 leading-relaxed whitespace-pre-line text-center"
          style={{ fontFamily: 'Yomogi, cursive' }}
        >
          {story}
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={onStart}
          className="px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full font-bold text-lg hover:from-purple-500 hover:to-pink-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          style={{ fontFamily: 'Yomogi, cursive' }}
        >
          🌟 ぼうけんをはじめる 🌟
        </button>
      </div>
    </div>
  );
};