import React from 'react';
import { AnimatedSection } from './AnimatedSection';
import { ProjectCard } from './ProjectCard';
import { SectionTitle } from './SectionTitle';
import { SITE_CONFIG, SAMPLE_WORKS } from '../constants';

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
          <p className="text-lg text-coffee-dark/70 max-w-2xl mx-auto">
            Moku Moku Houseのクリエイターたちによる素晴らしい作品をご紹介します
          </p>
        </AnimatedSection>

        <AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SAMPLE_WORKS.map((work, index) => (
              <ProjectCard key={work.id} work={work} index={index} />
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};