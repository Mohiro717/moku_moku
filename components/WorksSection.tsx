import React from 'react';
import { AnimatedSection } from './AnimatedSection';
import { ProjectCard } from './ProjectCard';
import { SectionTitle } from './SectionTitle';
import { SITE_CONFIG, SAMPLE_WORKS } from '../constants';

export const WorksSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-32 bg-pastel-blue transform skew-y-2">
      <div className="max-w-7xl mx-auto px-4 transform -skew-y-2">
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