import React from 'react';
import { AnimatedSection } from './AnimatedSection';
import { SectionTitle } from './SectionTitle';
import { GameControllerIcon } from './icons/GameControllerIcon';
import { SITE_CONFIG } from '../constants';

export const GameSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-32 bg-ivory">
      <div className="max-w-4xl mx-auto px-4">
        <AnimatedSection id="game" className="text-center">
          <div className="border-2 border-dashed border-coffee-light rounded-3xl p-12 lg:p-16">
            <GameControllerIcon className="w-16 h-16 lg:w-20 lg:h-20 mx-auto text-coffee-light mb-8" />
            <SectionTitle showLines={false} className="mb-4 text-3xl md:text-4xl lg:text-5xl">
              {SITE_CONFIG.gameTitle}
            </SectionTitle>
            <p className="text-lg lg:text-xl text-coffee-dark/70 leading-relaxed">
              {SITE_CONFIG.gameDescription}
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};