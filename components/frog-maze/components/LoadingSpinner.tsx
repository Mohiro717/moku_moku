import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-500"></div>
      <p className="text-pink-600 font-medium" style={{ fontFamily: 'Yomogi, cursive' }}>
        よみこんでいます...
      </p>
    </div>
  );
};