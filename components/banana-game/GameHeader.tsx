import React from 'react';

export const GameHeader: React.FC = () => {
  return (
    <div className="text-center">
      {/* Close decoration */}
      <div className="flex justify-center mb-6">
        <div className="w-12 h-1 bg-yellow-400 rounded-full"></div>
      </div>

      {/* Game icon */}
      <div className="flex justify-center mb-6">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-4 rounded-full">
          <div className="text-3xl">🍌</div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-serif text-coffee-dark mb-6">
        CATCH THE BANANA
      </h3>
    </div>
  );
};