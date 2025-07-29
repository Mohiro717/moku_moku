import React from 'react';

interface GameStatsProps {
  score: number;
  timeLeft: number;
}

export const GameStats: React.FC<GameStatsProps> = ({ score, timeLeft }) => {
  return (
    <div className="flex justify-around items-center mb-6 bg-yellow-50/70 rounded-xl p-4">
      <div className="text-center">
        <div className="text-sm text-coffee-mid font-serif">Score</div>
        <div className="text-2xl font-serif text-coffee-dark">{score}</div>
      </div>
      <div className="text-center">
        <div className="text-sm text-coffee-mid font-serif">Time</div>
        <div className="text-2xl font-serif text-coffee-dark">{timeLeft}s</div>
      </div>
    </div>
  );
};