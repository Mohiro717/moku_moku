import React from 'react';
import { AnimatedSection } from './AnimatedSection';
import { FortniteCreatorCard } from './FortniteCreatorCard';
import { SectionTitle } from './SectionTitle';
import { SITE_CONFIG, FORTNITE_CREATORS } from '../constants';

export const WorksSection: React.FC = () => {
  return (
    <section className="relative py-20 lg:py-32 bg-pastel-blue overflow-hidden">
      {/* Top slanted edge */}
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg className="relative block w-full h-20" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <polygon fill="#f8f4e9" points="0,0 1200,0 1200,100 0,40"></polygon>
        </svg>
      </div>
      {/* Bottom slanted edge */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg className="relative block w-full h-20" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <polygon fill="#f8f4e9" points="0,100 1200,100 1200,0 0,60"></polygon>
        </svg>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <AnimatedSection id="works" className="text-center mb-16">
          <SectionTitle className="mb-4" lineLength="long">
            {SITE_CONFIG.worksTitle}
          </SectionTitle>
          <div className="text-lg text-coffee-dark/70 max-w-3xl mx-auto">
            <p className="mb-2">
              Moku Moku Houseで活動するFortniteクリエイターたちをご紹介します。
            </p>
            <p>
              それぞれが独自の世界観とアイデアで、素晴らしいクリエイティブマップを制作しています。
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
            {FORTNITE_CREATORS.map((creator, index) => (
              <FortniteCreatorCard key={creator.id} creator={creator} index={index} />
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};