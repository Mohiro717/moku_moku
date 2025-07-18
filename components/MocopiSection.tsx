import React from 'react';
import { AnimatedSection } from './AnimatedSection';
import { SectionTitle } from './SectionTitle';
import { MascotCard } from './MascotCard';
import { useInteraction } from '../hooks/useInteraction';
import { SITE_CONFIG } from '../constants';

const MOCOPI_CONFIG = {
  name: 'Mocopi',
  title: 'Moku Moku House Mascot',
  imageSrc: '/moku_moku/images/mocopi.jpg',
  imageAlt: 'Mocopi mascot character'
};

export const MocopiSection: React.FC = () => {
  const { isInteracted, handleMouseEnter, handleMouseLeave, handleClick } = useInteraction();

  return (
    <section className="py-20 lg:py-32 bg-ivory">
      <div className="max-w-6xl mx-auto px-4">
        <AnimatedSection id="mokopi">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <SectionTitle 
                showLines={false} 
                className="mb-6 lg:text-left text-5xl md:text-6xl"
              >
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
            <div className="order-1 lg:order-2">
              <MascotCard
                name={MOCOPI_CONFIG.name}
                title={MOCOPI_CONFIG.title}
                imageSrc={MOCOPI_CONFIG.imageSrc}
                imageAlt={MOCOPI_CONFIG.imageAlt}
                isInteracted={isInteracted}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
              />
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};