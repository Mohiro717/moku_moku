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

// Kawaii decoration styles
const DECORATION_STYLES = {
  titleDecorations: {
    sheep: 'absolute -top-6 -left-4 text-2xl animate-bounce',
    lightning: 'absolute -top-4 -right-6 text-xl animate-bounce',
    cloud: 'absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-lg animate-pulse'
  },
  speechBubble: {
    background: 'absolute inset-0 bg-gradient-to-br from-white/80 via-pink-50/70 to-purple-50/60 backdrop-blur-sm rounded-3xl shadow-lg border-2 border-white/50 group-hover:shadow-xl transition-all duration-500',
    tail: 'absolute -bottom-4 left-8 w-6 h-6 bg-gradient-to-br from-white/80 to-pink-50/70 transform rotate-45 border-r border-b border-white/50'
  },
  floatingHearts: {
    heart1: 'absolute -top-4 -left-4 opacity-60 animate-bounce text-pink-300 text-xl',
    heart2: 'absolute -top-2 -right-6 opacity-60 animate-bounce text-purple-300 text-lg',
    sparkle1: 'absolute -bottom-4 -left-6 opacity-60 animate-bounce text-blue-300 text-lg',
    star: 'absolute -bottom-2 -right-4 opacity-60 animate-bounce text-pink-300 text-lg'
  },
  mascotGlow: 'absolute inset-0 bg-gradient-to-br from-pink-100/20 via-purple-100/20 to-blue-100/20 rounded-3xl blur-xl scale-110 opacity-50'
} as const;

// Animation configurations
const ANIMATIONS = {
  titleDecorations: {
    sheep: { animationDelay: '0.5s' },
    lightning: { animationDelay: '1.5s' },
    cloud: {}
  },
  floatingHearts: {
    heart1: { animationDelay: '0s', animationDuration: '3s' },
    heart2: { animationDelay: '1s', animationDuration: '4s' },
    sparkle1: { animationDelay: '2s', animationDuration: '3.5s' },
    star: { animationDelay: '0.5s', animationDuration: '4.5s' }
  },
  hoverEffects: {
    spin: { animationDuration: '3s' },
    bounce: {},
    pulse: {}
  },
  interactionSparkles: {
    sparkle1: {},
    sparkle2: { animationDelay: '0.3s' },
    sparkle3: { animationDelay: '0.6s' }
  }
} as const;

// Title decorations component
const TitleDecorations: React.FC = () => (
  <>
    <span className={DECORATION_STYLES.titleDecorations.sheep} style={ANIMATIONS.titleDecorations.sheep}>🐏</span>
    <span className={DECORATION_STYLES.titleDecorations.lightning} style={ANIMATIONS.titleDecorations.lightning}>⚡</span>
    <span className={DECORATION_STYLES.titleDecorations.cloud} style={ANIMATIONS.titleDecorations.cloud}>☁️</span>
  </>
);

// Speech bubble background component
const SpeechBubbleBackground: React.FC = () => (
  <>
    <div 
      className={DECORATION_STYLES.speechBubble.background}
      style={{
        transform: 'translate(-1rem, -1rem)',
        width: 'calc(100% + 2rem)',
        height: 'calc(100% + 2rem)'
      }}
    >
      {/* もこもこ装飾 */}
      <div className="absolute -top-2 -left-2 w-4 h-4 bg-white/60 rounded-full" />
      <div className="absolute -top-1 left-6 w-3 h-3 bg-pink-100/60 rounded-full" />
      <div className="absolute top-2 -left-1 w-2 h-2 bg-purple-100/60 rounded-full" />
      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white/60 rounded-full" />
      <div className="absolute -bottom-1 right-6 w-3 h-3 bg-pink-100/60 rounded-full" />
      <div className="absolute bottom-2 -right-1 w-2 h-2 bg-purple-100/60 rounded-full" />
      <div className="absolute top-1/3 -left-2 w-3 h-3 bg-blue-100/60 rounded-full" />
      <div className="absolute top-2/3 -right-2 w-3 h-3 bg-blue-100/60 rounded-full" />
    </div>
    <div className={DECORATION_STYLES.speechBubble.tail} />
  </>
);

// Paragraph hover effect component
const ParagraphHoverEffect: React.FC<{ index: number }> = ({ index }) => {
  const effects = [
    { icon: '✨', color: 'text-pink-400', animation: 'animate-spin', style: ANIMATIONS.hoverEffects.spin, position: 'absolute -top-2 -right-2' },
    { icon: '💕', color: 'text-purple-400', animation: 'animate-bounce', style: ANIMATIONS.hoverEffects.bounce, position: 'absolute -bottom-2 -left-2' },
    { icon: '🌟', color: 'text-blue-400', animation: 'animate-pulse', style: ANIMATIONS.hoverEffects.pulse, position: 'absolute -top-2 -left-2' }
  ];
  
  const effect = effects[index];
  if (!effect) return null;
  
  return (
    <div className={`${effect.position} opacity-0 group-hover/para:opacity-100 transition-all duration-500`}>
      <span className={`${effect.color} text-sm ${effect.animation}`} style={effect.style}>
        {effect.icon}
      </span>
    </div>
  );
};

// Content component - kawaii version! 💕
const MocopiContent: React.FC = () => {
  return (
    <div className={STYLES.contentArea}>
      <div className="relative">
        <SectionTitle 
          showLines={true} 
          className={STYLES.title}
        >
          <span className="relative">
            {SITE_CONFIG.mokopiTitle}
            <TitleDecorations />
          </span>
        </SectionTitle>
      </div>
      
      <div className={`${STYLES.descriptionContainer} relative group`}>
        <SpeechBubbleBackground />
        
        {/* 説明文コンテンツ */}
        <div className="relative z-10">
          {SITE_CONFIG.mokopiDescription.split('\n\n').map((paragraph, index) => (
            <div key={index} className="relative group/para mb-4 last:mb-0">
              <p className={STYLES.paragraph}>
                {paragraph}
              </p>
              <ParagraphHoverEffect index={index} />
            </div>
          ))}
        </div>
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

// Floating hearts component
const FloatingHearts: React.FC = () => (
  <>
    <div className={DECORATION_STYLES.floatingHearts.heart1} style={ANIMATIONS.floatingHearts.heart1}>
      <span>💖</span>
    </div>
    <div className={DECORATION_STYLES.floatingHearts.heart2} style={ANIMATIONS.floatingHearts.heart2}>
      <span>💕</span>
    </div>
    <div className={DECORATION_STYLES.floatingHearts.sparkle1} style={ANIMATIONS.floatingHearts.sparkle1}>
      <span>✨</span>
    </div>
    <div className={DECORATION_STYLES.floatingHearts.star} style={ANIMATIONS.floatingHearts.star}>
      <span>🌟</span>
    </div>
  </>
);

// Interaction sparkles component
const InteractionSparkles: React.FC<{ isInteracted: boolean }> = ({ isInteracted }) => {
  if (!isInteracted) return null;
  
  return (
    <>
      <div className="absolute top-1/4 left-1/4 animate-ping" style={ANIMATIONS.interactionSparkles.sparkle1}>
        <span className="text-yellow-300 text-sm">✨</span>
      </div>
      <div className="absolute top-3/4 right-1/4 animate-ping" style={ANIMATIONS.interactionSparkles.sparkle2}>
        <span className="text-pink-300 text-sm">💫</span>
      </div>
      <div className="absolute top-1/2 right-1/3 animate-ping" style={ANIMATIONS.interactionSparkles.sparkle3}>
        <span className="text-purple-300 text-sm">⭐</span>
      </div>
    </>
  );
};

// Character component - preserving exact interaction behavior
const MocopiCharacter: React.FC<MocopiCharacterProps> = ({
  isInteracted,
  onMouseEnter,
  onMouseLeave,
  onClick
}) => {
  return (
    <div className={`${STYLES.mascotArea} relative`}>
      <FloatingHearts />
      <div className={DECORATION_STYLES.mascotGlow} />
      
      <div className="relative">
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
      
      <InteractionSparkles isInteracted={isInteracted} />
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