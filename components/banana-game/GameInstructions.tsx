import React from 'react';

interface GameInstructionsProps {
  show: boolean;
}

export const GameInstructions: React.FC<GameInstructionsProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="bg-yellow-50/70 rounded-xl p-4 text-center">
      <div className="text-sm text-coffee-mid font-serif">
        30秒間でバナナをできるだけたくさんクリック！
      </div>
    </div>
  );
};