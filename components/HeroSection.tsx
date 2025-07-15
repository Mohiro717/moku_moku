import React from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { SITE_CONFIG } from '../constants';
import type { HeroSectionProps } from '../types';

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToNext }) => {
  return (
    <section 
      id="home" 
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/moku_moku/images/latte-art.jpg)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-ivory/70 via-pastel-blue/50 to-coffee-light/60" />
      <div className="absolute inset-0 bg-ivory/30 backdrop-blur-[1px]" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="flex justify-center">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-coffee-dark mb-6 opacity-0 animate-fade-in-up drop-shadow-2xl whitespace-nowrap">
            {SITE_CONFIG.heroTitle}
          </h1>
        </div>
        <p 
          className="text-xl md:text-2xl text-coffee-mid mb-8 opacity-0 animate-fade-in-up leading-relaxed drop-shadow-lg"
          style={{ animationDelay: '0.5s' }}
        >
          {SITE_CONFIG.heroSubtitle}
        </p>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={onScrollToNext}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-coffee-dark/60 hover:text-vivid-pink transition-colors duration-300 animate-bounce-slow"
        aria-label="下にスクロール"
      >
        <ChevronDownIcon className="w-8 h-8" />
      </button>
    </section>
  );
};