import React from 'react';

interface MascotCardProps {
  name: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  isInteracted: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

export const MascotCard: React.FC<MascotCardProps> = ({
  name,
  title,
  imageSrc,
  imageAlt,
  isInteracted,
  onMouseEnter,
  onMouseLeave,
  onClick
}) => {
  return (
    <div className="text-center">
      <div
        className={`relative inline-block transition-all duration-500 cursor-pointer ${
          isInteracted ? 'transform rotate-0' : 'transform rotate-2'
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none ${
            isInteracted 
              ? 'bg-gradient-to-br from-vivid-pink/40 to-vivid-green/40 blur-xl scale-110' 
              : 'bg-gradient-to-br from-vivid-pink/20 to-vivid-green/20 blur-lg scale-105'
          }`}
        />
        
        {/* Card */}
        <div className="relative bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
          <div className="w-48 h-48 lg:w-56 lg:h-56 mx-auto bg-gradient-to-br from-vivid-pink/10 to-vivid-green/10 rounded-full flex items-center justify-center mb-6 overflow-hidden">
            <img 
              src={imageSrc}
              alt={imageAlt}
              className={`w-full h-full object-cover transition-all duration-300 ${
                isInteracted ? 'scale-110' : 'scale-100'
              }`}
            />
          </div>
          <h3 className="font-serif text-2xl lg:text-3xl font-bold text-coffee-dark">
            {name}
          </h3>
          <p className="text-coffee-mid/70 mt-2">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
};