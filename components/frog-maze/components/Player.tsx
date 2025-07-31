import React from 'react';

export const Player: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-visible z-10">
      <span 
        className="animate-bounce"
        style={{ 
          fontSize: 'min(1.8rem, 3.5vw)',
          transform: 'scale(0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: '1',
          width: '100%',
          height: '100%'
        }}
      >🐸</span>
    </div>
  );
};