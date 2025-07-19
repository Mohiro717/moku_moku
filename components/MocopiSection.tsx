import React from 'react';
import { AnimatedSection } from './AnimatedSection';
import { SectionTitle } from './SectionTitle';
import { MascotCard } from './MascotCard';
import { useInteraction } from '../hooks/useInteraction';
import { SITE_CONFIG } from '../constants';

// Configuration constants - keeping exact same values
const MOCOPI_CONFIG = {
  name: 'Mocopi',
  title: 'Moku Moku House Mascot',
  imageSrc: '/moku_moku/images/mocopi.jpg',
  imageAlt: 'Mocopi mascot character'
} as const;

// Style constants - preserving exact same class names
const STYLES = {
  section: 'pt-32 pb-20 lg:pt-48 lg:pb-32 bg-ivory',
  container: 'max-w-6xl mx-auto px-4',
  grid: 'grid lg:grid-cols-2 gap-12 lg:gap-16 items-center',
  contentArea: 'text-center lg:text-left order-2 lg:order-1',
  title: 'mb-12 lg:text-left text-5xl md:text-6xl',
  descriptionContainer: 'space-y-8 pl-8',
  paragraph: 'text-lg text-coffee-dark/80 leading-relaxed',
  mascotArea: 'order-1 lg:order-2'
} as const;

// Content component - preserving exact functionality
const MocopiContent: React.FC = () => {
  return (
    <div className={STYLES.contentArea}>
      <SectionTitle 
        showLines={true} 
        className={STYLES.title}
      >
        {SITE_CONFIG.mokopiTitle}
      </SectionTitle>
      <div className={STYLES.descriptionContainer}>
        {SITE_CONFIG.mokopiDescription.split('\n\n').map((paragraph, index) => (
          <p 
            key={index}
            className={STYLES.paragraph}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

// Character component - preserving exact interaction behavior
interface MocopiCharacterProps {
  isInteracted: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

const MocopiCharacter: React.FC<MocopiCharacterProps> = ({
  isInteracted,
  onMouseEnter,
  onMouseLeave,
  onClick
}) => {
  return (
    <div className={STYLES.mascotArea}>
      <MascotCard
        name={MOCOPI_CONFIG.name}
        title={MOCOPI_CONFIG.title}
        imageSrc={MOCOPI_CONFIG.imageSrc}
        imageAlt={MOCOPI_CONFIG.imageAlt}
        isInteracted={isInteracted}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      />
    </div>
  );
};

// Main component - keeping exact same structure and behavior
export const MocopiSection: React.FC = () => {
  const { isInteracted, handleMouseEnter, handleMouseLeave, handleClick } = useInteraction();

  return (
    <section className={STYLES.section}>
      <div className={STYLES.container}>
        <AnimatedSection id="mokopi">
          <div className={STYLES.grid}>
            <MocopiContent />
            <MocopiCharacter
              isInteracted={isInteracted}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
            />
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};