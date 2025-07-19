import React from 'react';
import { AnimatedSection } from './AnimatedSection';
import { Blob } from './Blob';
import { SectionTitle } from './SectionTitle';
import { SITE_CONFIG } from '../constants';

export const AboutSection: React.FC = () => {
  return (
    <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 bg-pastel-blue overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Blob />
      </div>
      {/* Bottom slanted edge */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg className="relative block w-full h-20" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <polygon fill="#f8f4e9" points="0,100 1200,100 1200,0 0,60"></polygon>
        </svg>
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <AnimatedSection id="about" className="text-center">
          <SectionTitle className="mb-12">
            {SITE_CONFIG.aboutTitle}
          </SectionTitle>
          
          <div className="max-w-4xl mx-auto">
            {SITE_CONFIG.aboutDescription.split('\n\n').map((paragraph, index) => (
              <p 
                key={index}
                className="text-lg md:text-xl text-coffee-dark/80 leading-relaxed mb-6 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};