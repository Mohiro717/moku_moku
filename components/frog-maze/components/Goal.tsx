import React from 'react';

interface GoalProps {
  isUnlocked: boolean;
}

export const Goal: React.FC<GoalProps> = ({ isUnlocked }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span 
        className={`text-2xl ${
          isUnlocked 
            ? 'animate-glow' 
            : 'opacity-50 grayscale'
        }`}
      >
        🏰
      </span>
    </div>
  );
};