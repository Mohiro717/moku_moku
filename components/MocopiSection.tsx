import React, { useState } from 'react';
import { AnimatedSection } from './AnimatedSection';
import { SectionTitle } from './SectionTitle';
import { SITE_CONFIG } from '../constants';

export const MocopiSection: React.FC = () => {
  const [mocopiInteracted, setMocopiInteracted] = useState(false);

  const handleMocopiInteraction = () => {
    setMocopiInteracted(!mocopiInteracted);
  };

  return (
    <section className="py-20 lg:py-32 bg-ivory">
      <div className="max-w-6xl mx-auto px-4">
        <AnimatedSection id="mokopi">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <SectionTitle showLines={false} className="mb-6 lg:text-left text-5xl md:text-6xl">
                {SITE_CONFIG.mokopiTitle}
              </SectionTitle>
              <div className="space-y-4">
                {SITE_CONFIG.mokopiDescription.split('\n\n').map((paragraph, index) => (
                  <p 
                    key={index}
                    className="text-lg text-coffee-dark/80 leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Mocopi Character */}
            <div className="text-center order-1 lg:order-2">
              <div
                className={`relative inline-block transition-all duration-500 cursor-pointer ${
                  mocopiInteracted ? 'transform rotate-0' : 'transform rotate-2'
                }`}
                onMouseEnter={() => setMocopiInteracted(true)}
                onMouseLeave={() => setMocopiInteracted(false)}
                onClick={handleMocopiInteraction}
              >
                {/* Glow effect */}
                <div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none ${
                    mocopiInteracted 
                      ? 'bg-gradient-to-br from-vivid-pink/40 to-vivid-green/40 blur-xl scale-110' 
                      : 'bg-gradient-to-br from-vivid-pink/20 to-vivid-green/20 blur-lg scale-105'
                  }`}
                />
                
                {/* Card */}
                <div className="relative bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
                  <div className="w-48 h-48 lg:w-56 lg:h-56 mx-auto bg-gradient-to-br from-vivid-pink/10 to-vivid-green/10 rounded-full flex items-center justify-center mb-6">
                    <span className="text-7xl lg:text-8xl transition-all duration-300">
                      {mocopiInteracted ? '😉' : '😊'}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl lg:text-3xl font-bold text-coffee-dark">
                    Mocopi
                  </h3>
                  <p className="text-coffee-mid/70 mt-2">
                    Moku Moku House Mascot
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};