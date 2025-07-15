import React, { useState, useEffect } from 'react';
import type { LoadingScreenProps } from '../types';

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (onComplete) {
            setTimeout(() => onComplete(), 300); // 100%表示後300ms待機
          }
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isLoading, onComplete]);

  if (!isLoading) return null;

  const circumference = 2 * Math.PI * 80; // radius 80px
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 bg-ivory flex items-center justify-center z-50">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-coffee-light rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-pastel-blue rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-vivid-pink rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main loading content */}
      <div className="relative z-10 text-center">
        {/* Circular Progress with Mokopi in center */}
        <div className="relative mb-8">
          <div className="relative inline-block">
            {/* Circular Progress Bar */}
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-coffee-light/20"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 ease-out"
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff5d8f" />
                  <stop offset="100%" stopColor="#00c9a7" />
                </linearGradient>
              </defs>
            </svg>

            {/* Percentage display in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-coffee-dark text-2xl font-medium">
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <h2 className="font-serif text-2xl font-bold text-coffee-dark mb-4">
          Moku Moku House
        </h2>
        <p className="text-coffee-mid mb-6">
          もくもくハウスを準備中...
        </p>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-coffee-light rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-coffee-light rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-coffee-light rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};