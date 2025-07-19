import React from 'react';
import type { FortniteCreator } from '../types';

interface FortniteCreatorCardProps {
  creator: FortniteCreator;
  index: number;
}

const getGradientClass = (color: string) => {
  switch (color) {
    case 'vivid-pink':
      return 'from-pink-300 via-pink-400 to-purple-400';
    case 'vivid-green':
      return 'from-emerald-300 via-teal-400 to-cyan-400';
    case 'coffee-light':
      return 'from-amber-300 via-orange-400 to-pink-400';
    default:
      return 'from-blue-300 via-purple-400 to-pink-400';
  }
};

const getPastelBg = (color: string) => {
  switch (color) {
    case 'vivid-pink':
      return 'bg-gradient-to-br from-pink-50 to-purple-50';
    case 'vivid-green':
      return 'bg-gradient-to-br from-emerald-50 to-teal-50';
    case 'coffee-light':
      return 'bg-gradient-to-br from-amber-50 to-orange-50';
    default:
      return 'bg-gradient-to-br from-blue-50 to-purple-50';
  }
};

const getAccentColor = (color: string) => {
  switch (color) {
    case 'vivid-pink':
      return 'text-pink-400';
    case 'vivid-green':
      return 'text-emerald-400';
    case 'coffee-light':
      return 'text-amber-400';
    default:
      return 'text-blue-400';
  }
};

export const FortniteCreatorCard: React.FC<FortniteCreatorCardProps> = ({ 
  creator, 
  index 
}) => {
  const handleCardClick = () => {
    window.open(creator.fortniteUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="group relative cursor-pointer"
      style={{
        animationDelay: `${index * 80}ms`
      }}
      onClick={handleCardClick}
    >
      {/* Floating hearts effect */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
        <div className="text-pink-300 text-xs animate-bounce">💖</div>
      </div>
      <div className="absolute -top-1 -left-1 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-300">
        <div className="text-yellow-300 text-xs animate-pulse">✨</div>
      </div>
      
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(creator.color)} rounded-3xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500 scale-110`} />
      
      {/* Main Card */}
      <div className={`relative ${getPastelBg(creator.color)} rounded-3xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:-translate-y-3 group-hover:scale-105 border-2 border-white/80 group-hover:border-white`}>
        
        {/* Cute Fortnite Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${getGradientClass(creator.color)} rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-12 relative`}>
            <div className="text-white text-xl font-bold">F</div>
            {/* Cute sparkles around icon */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-200 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-ping" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-200 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" />
          </div>
        </div>
        
        {/* Creator Name */}
        <div className="text-center">
          <h3 className={`text-base font-bold text-coffee-dark group-hover:${getAccentColor(creator.color)} transition-all duration-300 font-serif mb-2 leading-tight min-h-[2.5rem] flex items-center justify-center`}>
            <span className="line-clamp-2">
              {creator.name}
            </span>
          </h3>
          
          {/* Cute decoration hearts */}
          <div className="flex justify-center items-center space-x-1 mb-3">
            <div className={`w-6 h-0.5 bg-gradient-to-r ${getGradientClass(creator.color)} rounded-full opacity-60 group-hover:opacity-100 transition-all duration-500`} />
            <div className="text-xs opacity-60 group-hover:opacity-100 transition-all duration-500">💕</div>
            <div className={`w-6 h-0.5 bg-gradient-to-r ${getGradientClass(creator.color)} rounded-full opacity-60 group-hover:opacity-100 transition-all duration-500`} />
          </div>
          
          {/* Cute link text */}
          <div className="text-xs text-coffee-mid/60 group-hover:text-coffee-dark transition-colors duration-300 font-medium">
            Creator Page ✨
          </div>
        </div>
        
        {/* Soft overlay */}
        <div className="absolute inset-0 bg-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Floating bubbles effect */}
        <div className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-200">
          <div className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-400">
          <div className="w-1 h-1 bg-pink-200 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
        <div className="absolute top-1/2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-600">
          <div className="w-1 h-1 bg-purple-200 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>
      
      {/* Bottom cute accent */}
      <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gradient-to-r ${getGradientClass(creator.color)} rounded-full opacity-0 group-hover:opacity-60 transition-all duration-500 blur-sm`} />
    </div>
  );
};